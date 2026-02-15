-- Pre-qual flow schema + workflow
ALTER TABLE vendor_prequal_links
  ADD COLUMN IF NOT EXISTS default_rep_id UUID REFERENCES vendor_sales_reps(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS prequal_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
  rep_contact_id UUID REFERENCES vendor_sales_reps(id) ON DELETE SET NULL,
  buyer_name TEXT NOT NULL,
  buyer_mobile TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  estimated_amount NUMERIC,
  timeframe TEXT NOT NULL,
  sms_consent BOOLEAN DEFAULT FALSE NOT NULL,
  source TEXT DEFAULT 'prequal_qr' NOT NULL,
  status TEXT DEFAULT 'New' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT prequal_leads_status_check CHECK (status IN ('New', 'Contacted', 'Qualified', 'Not Fit', 'Converted')),
  CONSTRAINT prequal_leads_source_check CHECK (source IN ('prequal_qr'))
);

CREATE INDEX IF NOT EXISTS idx_prequal_leads_vendor_id ON prequal_leads(vendor_id);
CREATE INDEX IF NOT EXISTS idx_prequal_leads_broker_id ON prequal_leads(broker_id);
CREATE INDEX IF NOT EXISTS idx_prequal_leads_rep_contact_id ON prequal_leads(rep_contact_id);
CREATE INDEX IF NOT EXISTS idx_prequal_leads_created_at ON prequal_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prequal_leads_status ON prequal_leads(status);

ALTER TABLE prequal_leads ENABLE ROW LEVEL SECURITY;

-- Public insert allowed for portal pre-qual flow
CREATE POLICY "Public can create prequal leads"
  ON prequal_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    source = 'prequal_qr' AND
    EXISTS (
      SELECT 1 FROM vendor_prequal_links vpl
      WHERE vpl.vendor_id = prequal_leads.vendor_id
      AND vpl.broker_id = prequal_leads.broker_id
    )
  );

-- Vendors can view/update their own leads
CREATE POLICY "Vendors can view their own prequal leads"
  ON prequal_leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = prequal_leads.vendor_id
      AND vendors.profile_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can update their own prequal leads"
  ON prequal_leads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = prequal_leads.vendor_id
      AND vendors.profile_id = auth.uid()
    )
  );

-- Brokers can view/update leads for their vendors
CREATE POLICY "Brokers can view prequal leads for their vendors"
  ON prequal_leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM brokers
      WHERE brokers.id = prequal_leads.broker_id
      AND brokers.profile_id = auth.uid()
    )
  );

CREATE POLICY "Brokers can update prequal leads for their vendors"
  ON prequal_leads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM brokers
      WHERE brokers.id = prequal_leads.broker_id
      AND brokers.profile_id = auth.uid()
    )
  );

-- Trigger to keep updated_at fresh
DROP TRIGGER IF EXISTS update_prequal_leads_updated_at ON prequal_leads;
CREATE TRIGGER update_prequal_leads_updated_at
  BEFORE UPDATE ON prequal_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Queue broker/vendor notifications on new lead
CREATE OR REPLACE FUNCTION queue_prequal_lead_notifications()
RETURNS TRIGGER AS $$
DECLARE
  broker_profile_id UUID;
  broker_email TEXT;
  vendor_profile_id UUID;
  vendor_email TEXT;
BEGIN
  SELECT b.profile_id, bp.email
  INTO broker_profile_id, broker_email
  FROM brokers b
  JOIN profiles bp ON bp.id = b.profile_id
  WHERE b.id = NEW.broker_id;

  SELECT v.profile_id, vp.email
  INTO vendor_profile_id, vendor_email
  FROM vendors v
  JOIN profiles vp ON vp.id = v.profile_id
  WHERE v.id = NEW.vendor_id;

  IF broker_profile_id IS NOT NULL AND broker_email IS NOT NULL THEN
    INSERT INTO email_notifications_queue (
      recipient_id,
      recipient_email,
      notification_type,
      subject,
      body,
      metadata
    ) VALUES (
      broker_profile_id,
      broker_email,
      'new_deal',
      'New pre-qual lead: ' || NEW.buyer_name,
      'A new pre-qualification lead was submitted. Buyer: ' || NEW.buyer_name || ', Equipment: ' || NEW.equipment_type || '.',
      jsonb_build_object('lead_id', NEW.id, 'vendor_id', NEW.vendor_id, 'broker_id', NEW.broker_id)
    );
  END IF;

  IF vendor_profile_id IS NOT NULL AND vendor_email IS NOT NULL THEN
    INSERT INTO email_notifications_queue (
      recipient_id,
      recipient_email,
      notification_type,
      subject,
      body,
      metadata
    ) VALUES (
      vendor_profile_id,
      vendor_email,
      'new_deal',
      'New buyer lead: ' || NEW.buyer_name,
      'A new buyer pre-qualification lead was captured and is ready for follow-up.',
      jsonb_build_object('lead_id', NEW.id, 'vendor_id', NEW.vendor_id, 'broker_id', NEW.broker_id)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS queue_prequal_lead_notifications_trigger ON prequal_leads;
CREATE TRIGGER queue_prequal_lead_notifications_trigger
  AFTER INSERT ON prequal_leads
  FOR EACH ROW EXECUTE FUNCTION queue_prequal_lead_notifications();
