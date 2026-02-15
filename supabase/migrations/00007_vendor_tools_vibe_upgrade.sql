-- Vendor Tools vibe/data upgrades
ALTER TABLE vendor_sales_reps
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

CREATE TABLE IF NOT EXISTS vendor_prequal_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL UNIQUE REFERENCES vendors(id) ON DELETE CASCADE,
  broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_prequal_links_slug ON vendor_prequal_links(slug);
CREATE INDEX IF NOT EXISTS idx_vendor_prequal_links_vendor_id ON vendor_prequal_links(vendor_id);

ALTER TABLE vendor_prequal_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view their own prequal link"
  ON vendor_prequal_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = vendor_prequal_links.vendor_id
      AND vendors.profile_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can insert their own prequal link"
  ON vendor_prequal_links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = vendor_prequal_links.vendor_id
      AND vendors.profile_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can update their own prequal link"
  ON vendor_prequal_links FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = vendor_prequal_links.vendor_id
      AND vendors.profile_id = auth.uid()
    )
  );

CREATE POLICY "Brokers can view prequal links for their vendors"
  ON vendor_prequal_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM vendors
      JOIN brokers ON brokers.id = vendors.broker_id
      WHERE vendors.id = vendor_prequal_links.vendor_id
      AND brokers.profile_id = auth.uid()
    )
  );

-- Public lookup by slug for shared short links
CREATE POLICY "Public can view prequal links by slug"
  ON vendor_prequal_links FOR SELECT
  TO anon, authenticated
  USING (true);

DROP TRIGGER IF EXISTS update_vendor_prequal_links_updated_at ON vendor_prequal_links;
CREATE TRIGGER update_vendor_prequal_links_updated_at
  BEFORE UPDATE ON vendor_prequal_links
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
