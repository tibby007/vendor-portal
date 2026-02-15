-- Vendor-safe broker profile surface for vendor portal copy/support labels
CREATE TABLE IF NOT EXISTS broker_public (
  broker_id UUID PRIMARY KEY REFERENCES brokers(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  display_name TEXT,
  support_email TEXT,
  support_phone TEXT,
  logo_url TEXT,
  accent_color TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_broker_public_company_name ON broker_public(company_name);

ALTER TABLE broker_public ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Brokers can view their own public broker profile" ON broker_public;
CREATE POLICY "Brokers can view their own public broker profile"
  ON broker_public FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM brokers
      WHERE brokers.id = broker_public.broker_id
      AND brokers.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Vendors can view their broker public profile" ON broker_public;
CREATE POLICY "Vendors can view their broker public profile"
  ON broker_public FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM vendors
      WHERE vendors.profile_id = auth.uid()
      AND vendors.broker_id = broker_public.broker_id
    )
  );

CREATE OR REPLACE FUNCTION sync_broker_public_row(target_broker_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO broker_public (
    broker_id,
    company_name,
    display_name,
    support_email,
    support_phone,
    logo_url,
    accent_color,
    updated_at
  )
  SELECT
    b.id,
    b.company_name,
    NULLIF(TRIM(CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, ''))), ''),
    p.email,
    COALESCE(NULLIF(TRIM(b.company_phone), ''), NULLIF(TRIM(p.phone), '')),
    b.logo_url,
    '#F97316',
    NOW()
  FROM brokers b
  LEFT JOIN profiles p ON p.id = b.profile_id
  WHERE b.id = target_broker_id
  ON CONFLICT (broker_id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    display_name = EXCLUDED.display_name,
    support_email = EXCLUDED.support_email,
    support_phone = EXCLUDED.support_phone,
    logo_url = EXCLUDED.logo_url,
    accent_color = EXCLUDED.accent_color,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION sync_broker_public_from_brokers_trigger()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM sync_broker_public_row(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_broker_public_from_brokers ON brokers;
CREATE TRIGGER sync_broker_public_from_brokers
  AFTER INSERT OR UPDATE OF company_name, company_phone, logo_url, profile_id ON brokers
  FOR EACH ROW EXECUTE FUNCTION sync_broker_public_from_brokers_trigger();

CREATE OR REPLACE FUNCTION sync_broker_public_from_profiles_trigger()
RETURNS TRIGGER AS $$
DECLARE
  broker_record RECORD;
BEGIN
  FOR broker_record IN
    SELECT id
    FROM brokers
    WHERE profile_id = NEW.id
  LOOP
    PERFORM sync_broker_public_row(broker_record.id);
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS sync_broker_public_from_profiles ON profiles;
CREATE TRIGGER sync_broker_public_from_profiles
  AFTER UPDATE OF first_name, last_name, email, phone ON profiles
  FOR EACH ROW EXECUTE FUNCTION sync_broker_public_from_profiles_trigger();

-- Backfill all broker public rows
INSERT INTO broker_public (
  broker_id,
  company_name,
  display_name,
  support_email,
  support_phone,
  logo_url,
  accent_color,
  updated_at
)
SELECT
  b.id,
  b.company_name,
  NULLIF(TRIM(CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, ''))), ''),
  p.email,
  COALESCE(NULLIF(TRIM(b.company_phone), ''), NULLIF(TRIM(p.phone), '')),
  b.logo_url,
  '#F97316',
  NOW()
FROM brokers b
LEFT JOIN profiles p ON p.id = b.profile_id
ON CONFLICT (broker_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  display_name = EXCLUDED.display_name,
  support_email = EXCLUDED.support_email,
  support_phone = EXCLUDED.support_phone,
  logo_url = EXCLUDED.logo_url,
  accent_color = EXCLUDED.accent_color,
  updated_at = NOW();
