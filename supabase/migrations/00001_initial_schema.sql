-- Vendor Portal Initial Schema
-- This migration creates all tables needed for Phase 1

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('broker', 'vendor');
CREATE TYPE vendor_status AS ENUM ('pending', 'active', 'inactive');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired');
CREATE TYPE document_status AS ENUM ('pending', 'reviewed', 'accepted', 'needs_revision');
CREATE TYPE entity_type AS ENUM ('llc', 'corporation', 'sole_proprietorship', 'partnership', 'other');
CREATE TYPE financing_type AS ENUM ('equipment', 'working_capital', 'both');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role user_role NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Brokers table
CREATE TABLE brokers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    company_address TEXT,
    company_phone TEXT,
    company_website TEXT,
    logo_url TEXT,
    subdomain TEXT UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Vendors table
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    company_address TEXT,
    company_phone TEXT,
    status vendor_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Vendor invitations table
CREATE TABLE vendor_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    company_name TEXT,
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    status invitation_status DEFAULT 'pending' NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days') NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(broker_id, email)
);

-- Kanban stages table
CREATE TABLE kanban_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    position INTEGER NOT NULL,
    is_visible_to_vendor BOOLEAN DEFAULT TRUE NOT NULL,
    is_default BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(broker_id, position)
);

-- Deals table
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
    stage_id UUID NOT NULL REFERENCES kanban_stages(id),
    -- Business Information
    business_legal_name TEXT NOT NULL,
    business_dba TEXT,
    business_address TEXT NOT NULL,
    business_phone TEXT NOT NULL,
    business_email TEXT NOT NULL,
    business_ein TEXT NOT NULL,
    business_established_date DATE,
    entity_type entity_type NOT NULL,
    state_of_incorporation TEXT,
    industry TEXT,
    annual_revenue NUMERIC(15, 2),
    -- Owner/Guarantor Information
    owner_full_name TEXT NOT NULL,
    owner_title TEXT,
    owner_ownership_percentage NUMERIC(5, 2),
    owner_address TEXT,
    owner_dob DATE,
    owner_ssn_encrypted TEXT,
    owner_phone TEXT,
    -- Financing Request
    amount_requested NUMERIC(15, 2) NOT NULL,
    financing_type financing_type NOT NULL,
    equipment_description TEXT,
    equipment_vendor_name TEXT,
    is_new_equipment BOOLEAN,
    preferred_term_months INTEGER,
    use_of_funds TEXT,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    submitted_at TIMESTAMPTZ
);

-- Deal documents table
CREATE TABLE deal_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    document_category TEXT NOT NULL,
    status document_status DEFAULT 'pending' NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES profiles(id),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Deal notes table (internal broker notes)
CREATE TABLE deal_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Message attachments table
CREATE TABLE message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Resource categories table
CREATE TABLE resource_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(broker_id, name)
);

-- Resources table
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    file_path TEXT,
    category TEXT NOT NULL,
    is_published BOOLEAN DEFAULT FALSE NOT NULL,
    published_at TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Activity log table
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_vendors_broker_id ON vendors(broker_id);
CREATE INDEX idx_vendor_invitations_broker_id ON vendor_invitations(broker_id);
CREATE INDEX idx_vendor_invitations_token ON vendor_invitations(token);
CREATE INDEX idx_vendor_invitations_email ON vendor_invitations(email);
CREATE INDEX idx_kanban_stages_broker_id ON kanban_stages(broker_id);
CREATE INDEX idx_deals_vendor_id ON deals(vendor_id);
CREATE INDEX idx_deals_broker_id ON deals(broker_id);
CREATE INDEX idx_deals_stage_id ON deals(stage_id);
CREATE INDEX idx_deal_documents_deal_id ON deal_documents(deal_id);
CREATE INDEX idx_deal_notes_deal_id ON deal_notes(deal_id);
CREATE INDEX idx_messages_deal_id ON messages(deal_id);
CREATE INDEX idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX idx_resources_broker_id ON resources(broker_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brokers_updated_at
    BEFORE UPDATE ON brokers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at
    BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deal_notes_updated_at
    BEFORE UPDATE ON deal_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create default kanban stages for a new broker
CREATE OR REPLACE FUNCTION create_default_kanban_stages()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO kanban_stages (broker_id, name, description, position, is_visible_to_vendor, is_default) VALUES
        (NEW.id, 'New Submission', 'Deal just submitted by vendor', 1, true, true),
        (NEW.id, 'Under Review', 'Broker is reviewing application', 2, true, true),
        (NEW.id, 'Docs Needed', 'Additional documents required', 3, true, true),
        (NEW.id, 'Submitted to Lender', 'Package sent to funding source', 4, true, true),
        (NEW.id, 'Approved', 'Financing approved, pending docs', 5, true, true),
        (NEW.id, 'Docs Out', 'Contracts sent for signature', 6, true, true),
        (NEW.id, 'Funded', 'Deal complete, funds disbursed', 7, true, true),
        (NEW.id, 'Declined', 'Application not approved', 8, true, true),
        (NEW.id, 'On Hold', 'Paused at customer request', 9, true, true);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default stages when broker is created
CREATE TRIGGER create_broker_default_stages
    AFTER INSERT ON brokers
    FOR EACH ROW EXECUTE FUNCTION create_default_kanban_stages();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Brokers policies
CREATE POLICY "Brokers can view their own broker record"
    ON brokers FOR SELECT
    USING (profile_id = auth.uid());

CREATE POLICY "Brokers can update their own broker record"
    ON brokers FOR UPDATE
    USING (profile_id = auth.uid());

CREATE POLICY "Enable insert for broker profiles"
    ON brokers FOR INSERT
    WITH CHECK (profile_id = auth.uid());

-- Vendors can view their broker
CREATE POLICY "Vendors can view their broker"
    ON brokers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM vendors
            WHERE vendors.broker_id = brokers.id
            AND vendors.profile_id = auth.uid()
        )
    );

-- Vendors policies
CREATE POLICY "Vendors can view their own vendor record"
    ON vendors FOR SELECT
    USING (profile_id = auth.uid());

CREATE POLICY "Vendors can update their own vendor record"
    ON vendors FOR UPDATE
    USING (profile_id = auth.uid());

CREATE POLICY "Brokers can view their vendors"
    ON vendors FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM brokers
            WHERE brokers.id = vendors.broker_id
            AND brokers.profile_id = auth.uid()
        )
    );

CREATE POLICY "Brokers can update their vendors"
    ON vendors FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM brokers
            WHERE brokers.id = vendors.broker_id
            AND brokers.profile_id = auth.uid()
        )
    );

CREATE POLICY "Enable vendor insert during registration"
    ON vendors FOR INSERT
    WITH CHECK (profile_id = auth.uid());

-- Vendor invitations policies
CREATE POLICY "Brokers can manage their invitations"
    ON vendor_invitations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM brokers
            WHERE brokers.id = vendor_invitations.broker_id
            AND brokers.profile_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view invitation by token"
    ON vendor_invitations FOR SELECT
    USING (true);

-- Kanban stages policies
CREATE POLICY "Brokers can manage their stages"
    ON kanban_stages FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM brokers
            WHERE brokers.id = kanban_stages.broker_id
            AND brokers.profile_id = auth.uid()
        )
    );

CREATE POLICY "Vendors can view visible stages"
    ON kanban_stages FOR SELECT
    USING (
        is_visible_to_vendor = true AND
        EXISTS (
            SELECT 1 FROM vendors
            WHERE vendors.broker_id = kanban_stages.broker_id
            AND vendors.profile_id = auth.uid()
        )
    );

-- Deals policies
CREATE POLICY "Vendors can view their own deals"
    ON deals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM vendors
            WHERE vendors.id = deals.vendor_id
            AND vendors.profile_id = auth.uid()
        )
    );

CREATE POLICY "Vendors can create deals"
    ON deals FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM vendors
            WHERE vendors.id = deals.vendor_id
            AND vendors.profile_id = auth.uid()
        )
    );

CREATE POLICY "Vendors can update their own deals"
    ON deals FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM vendors
            WHERE vendors.id = deals.vendor_id
            AND vendors.profile_id = auth.uid()
        )
    );

CREATE POLICY "Brokers can view their deals"
    ON deals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM brokers
            WHERE brokers.id = deals.broker_id
            AND brokers.profile_id = auth.uid()
        )
    );

CREATE POLICY "Brokers can update their deals"
    ON deals FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM brokers
            WHERE brokers.id = deals.broker_id
            AND brokers.profile_id = auth.uid()
        )
    );

-- Deal documents policies
CREATE POLICY "Users can view deal documents for their deals"
    ON deal_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM deals
            WHERE deals.id = deal_documents.deal_id
            AND (
                EXISTS (SELECT 1 FROM vendors WHERE vendors.id = deals.vendor_id AND vendors.profile_id = auth.uid())
                OR EXISTS (SELECT 1 FROM brokers WHERE brokers.id = deals.broker_id AND brokers.profile_id = auth.uid())
            )
        )
    );

CREATE POLICY "Users can upload documents to their deals"
    ON deal_documents FOR INSERT
    WITH CHECK (
        uploaded_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM deals
            WHERE deals.id = deal_documents.deal_id
            AND (
                EXISTS (SELECT 1 FROM vendors WHERE vendors.id = deals.vendor_id AND vendors.profile_id = auth.uid())
                OR EXISTS (SELECT 1 FROM brokers WHERE brokers.id = deals.broker_id AND brokers.profile_id = auth.uid())
            )
        )
    );

CREATE POLICY "Brokers can update document status"
    ON deal_documents FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM deals
            JOIN brokers ON brokers.id = deals.broker_id
            WHERE deals.id = deal_documents.deal_id
            AND brokers.profile_id = auth.uid()
        )
    );

-- Deal notes policies
CREATE POLICY "Brokers can manage deal notes"
    ON deal_notes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM deals
            JOIN brokers ON brokers.id = deals.broker_id
            WHERE deals.id = deal_notes.deal_id
            AND brokers.profile_id = auth.uid()
        )
    );

CREATE POLICY "Vendors can view non-internal notes"
    ON deal_notes FOR SELECT
    USING (
        is_internal = false AND
        EXISTS (
            SELECT 1 FROM deals
            JOIN vendors ON vendors.id = deals.vendor_id
            WHERE deals.id = deal_notes.deal_id
            AND vendors.profile_id = auth.uid()
        )
    );

-- Messages policies
CREATE POLICY "Users can view messages for their deals"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM deals
            WHERE deals.id = messages.deal_id
            AND (
                EXISTS (SELECT 1 FROM vendors WHERE vendors.id = deals.vendor_id AND vendors.profile_id = auth.uid())
                OR EXISTS (SELECT 1 FROM brokers WHERE brokers.id = deals.broker_id AND brokers.profile_id = auth.uid())
            )
        )
    );

CREATE POLICY "Users can send messages to their deals"
    ON messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM deals
            WHERE deals.id = messages.deal_id
            AND (
                EXISTS (SELECT 1 FROM vendors WHERE vendors.id = deals.vendor_id AND vendors.profile_id = auth.uid())
                OR EXISTS (SELECT 1 FROM brokers WHERE brokers.id = deals.broker_id AND brokers.profile_id = auth.uid())
            )
        )
    );

CREATE POLICY "Users can update message read status"
    ON messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM deals
            WHERE deals.id = messages.deal_id
            AND (
                EXISTS (SELECT 1 FROM vendors WHERE vendors.id = deals.vendor_id AND vendors.profile_id = auth.uid())
                OR EXISTS (SELECT 1 FROM brokers WHERE brokers.id = deals.broker_id AND brokers.profile_id = auth.uid())
            )
        )
    );

-- Message attachments policies
CREATE POLICY "Users can view attachments for their messages"
    ON message_attachments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM messages
            JOIN deals ON deals.id = messages.deal_id
            WHERE messages.id = message_attachments.message_id
            AND (
                EXISTS (SELECT 1 FROM vendors WHERE vendors.id = deals.vendor_id AND vendors.profile_id = auth.uid())
                OR EXISTS (SELECT 1 FROM brokers WHERE brokers.id = deals.broker_id AND brokers.profile_id = auth.uid())
            )
        )
    );

CREATE POLICY "Users can add attachments to their messages"
    ON message_attachments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM messages
            WHERE messages.id = message_attachments.message_id
            AND messages.sender_id = auth.uid()
        )
    );

-- Resources policies
CREATE POLICY "Brokers can manage their resources"
    ON resources FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM brokers
            WHERE brokers.id = resources.broker_id
            AND brokers.profile_id = auth.uid()
        )
    );

CREATE POLICY "Vendors can view published resources"
    ON resources FOR SELECT
    USING (
        is_published = true AND
        EXISTS (
            SELECT 1 FROM vendors
            WHERE vendors.broker_id = resources.broker_id
            AND vendors.profile_id = auth.uid()
        )
    );

-- Resource categories policies
CREATE POLICY "Brokers can manage their categories"
    ON resource_categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM brokers
            WHERE brokers.id = resource_categories.broker_id
            AND brokers.profile_id = auth.uid()
        )
    );

CREATE POLICY "Vendors can view resource categories"
    ON resource_categories FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM vendors
            WHERE vendors.broker_id = resource_categories.broker_id
            AND vendors.profile_id = auth.uid()
        )
    );

-- Activity log policies
CREATE POLICY "Users can view their own activity"
    ON activity_log FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create activity logs"
    ON activity_log FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Brokers can view activity for their deals/vendors
CREATE POLICY "Brokers can view related activity"
    ON activity_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM brokers
            WHERE brokers.profile_id = auth.uid()
        )
    );
