-- Vendor Dealer Tools tables
CREATE TABLE IF NOT EXISTS vendor_profiles (
  vendor_id UUID PRIMARY KEY REFERENCES vendors(id) ON DELETE CASCADE,
  dealership_name TEXT,
  city TEXT,
  state TEXT,
  phone TEXT,
  website TEXT,
  logo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendor_sales_reps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_sales_reps_vendor_id ON vendor_sales_reps(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_sales_reps_vendor_default ON vendor_sales_reps(vendor_id, is_default);

ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_sales_reps ENABLE ROW LEVEL SECURITY;

-- Vendors can manage their own profile
CREATE POLICY "Vendors can view their own dealer profile"
  ON vendor_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = vendor_profiles.vendor_id
      AND vendors.profile_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can upsert their own dealer profile"
  ON vendor_profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = vendor_profiles.vendor_id
      AND vendors.profile_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can update their own dealer profile"
  ON vendor_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = vendor_profiles.vendor_id
      AND vendors.profile_id = auth.uid()
    )
  );

-- Brokers can view dealer profiles for their vendors
CREATE POLICY "Brokers can view dealer profiles for their vendors"
  ON vendor_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM vendors
      JOIN brokers ON brokers.id = vendors.broker_id
      WHERE vendors.id = vendor_profiles.vendor_id
      AND brokers.profile_id = auth.uid()
    )
  );

-- Vendors can manage their own sales reps
CREATE POLICY "Vendors can view their own sales reps"
  ON vendor_sales_reps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = vendor_sales_reps.vendor_id
      AND vendors.profile_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can insert their own sales reps"
  ON vendor_sales_reps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = vendor_sales_reps.vendor_id
      AND vendors.profile_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can update their own sales reps"
  ON vendor_sales_reps FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = vendor_sales_reps.vendor_id
      AND vendors.profile_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can delete their own sales reps"
  ON vendor_sales_reps FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM vendors
      WHERE vendors.id = vendor_sales_reps.vendor_id
      AND vendors.profile_id = auth.uid()
    )
  );

-- Brokers can view sales reps for their vendors
CREATE POLICY "Brokers can view sales reps for their vendors"
  ON vendor_sales_reps FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM vendors
      JOIN brokers ON brokers.id = vendors.broker_id
      WHERE vendors.id = vendor_sales_reps.vendor_id
      AND brokers.profile_id = auth.uid()
    )
  );

-- Keep timestamps fresh
DROP TRIGGER IF EXISTS update_vendor_profiles_updated_at ON vendor_profiles;
CREATE TRIGGER update_vendor_profiles_updated_at
  BEFORE UPDATE ON vendor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendor_sales_reps_updated_at ON vendor_sales_reps;
CREATE TRIGGER update_vendor_sales_reps_updated_at
  BEFORE UPDATE ON vendor_sales_reps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
