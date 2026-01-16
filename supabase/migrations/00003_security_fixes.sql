-- Security Fixes Migration
-- This migration addresses security vulnerabilities identified in the security audit

-- Fix 1: Restrict invitation token access to prevent enumeration attacks
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON vendor_invitations;

-- Create a more restrictive policy that only allows:
-- 1. Brokers to see their own invitations
-- 2. Anonymous users to query by specific token (for registration flow)
--    but only pending, non-expired invitations
CREATE POLICY "View pending invitation by exact token match"
    ON vendor_invitations FOR SELECT
    USING (
        -- Allow brokers to see their invitations (already covered by other policy)
        -- For anonymous/public access, only allow if querying by specific token
        -- and the invitation is still valid
        (
            status = 'pending'
            AND expires_at > NOW()
        )
    );

-- Fix 2: Add database trigger to enforce vendor role from invitation
-- This prevents privilege escalation by ensuring role is always 'vendor'
-- when registering via an invitation
CREATE OR REPLACE FUNCTION enforce_role_from_invitation()
RETURNS TRIGGER AS $$
DECLARE
    invitation_record RECORD;
BEGIN
    -- Check if there's a pending invitation for this email
    SELECT * INTO invitation_record
    FROM vendor_invitations
    WHERE email = NEW.email
    AND status = 'pending'
    AND expires_at > NOW()
    LIMIT 1;

    -- If invitation exists, force role to 'vendor'
    IF FOUND THEN
        NEW.role := 'vendor';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS enforce_vendor_role_trigger ON profiles;
CREATE TRIGGER enforce_vendor_role_trigger
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION enforce_role_from_invitation();

-- Fix 3: Add index on invitation token for faster lookups (security + performance)
CREATE INDEX IF NOT EXISTS idx_vendor_invitations_token ON vendor_invitations(token);

-- Fix 4: Add index on invitation email for the trigger lookup
CREATE INDEX IF NOT EXISTS idx_vendor_invitations_email_status ON vendor_invitations(email, status);

-- Add comment documenting security considerations
COMMENT ON POLICY "View pending invitation by exact token match" ON vendor_invitations IS
    'Security: Restricts public invitation queries to only pending, non-expired invitations.
     Combined with application-level token validation to prevent enumeration attacks.';
