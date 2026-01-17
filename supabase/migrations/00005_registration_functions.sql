-- Registration helper functions with SECURITY DEFINER to bypass RLS
-- These are needed because after signUp(), the session isn't fully established
-- so auth.uid() returns NULL and RLS policies block the inserts.

-- Remove old trigger if it exists (was causing issues)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Function to create profile (bypasses RLS)
CREATE OR REPLACE FUNCTION create_profile_for_user(
  user_id UUID,
  user_email TEXT,
  user_role user_role,
  user_first_name TEXT DEFAULT NULL,
  user_last_name TEXT DEFAULT NULL,
  user_phone TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, role, first_name, last_name, phone)
  VALUES (user_id, user_email, user_role, user_first_name, user_last_name, user_phone);
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION create_profile_for_user TO authenticated;

-- Function to create broker (bypasses RLS)
CREATE OR REPLACE FUNCTION create_broker_for_user(
  user_profile_id UUID,
  broker_company_name TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO brokers (profile_id, company_name)
  VALUES (user_profile_id, broker_company_name);
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION create_broker_for_user TO authenticated;
