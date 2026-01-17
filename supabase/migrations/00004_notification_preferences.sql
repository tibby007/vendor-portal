-- Notification preferences table
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    email_new_deal BOOLEAN DEFAULT TRUE NOT NULL,
    email_deal_update BOOLEAN DEFAULT TRUE NOT NULL,
    email_new_message BOOLEAN DEFAULT TRUE NOT NULL,
    email_document_uploaded BOOLEAN DEFAULT TRUE NOT NULL,
    email_weekly_digest BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own notification preferences
CREATE POLICY "Users can view their own notification preferences"
    ON notification_preferences FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notification preferences"
    ON notification_preferences FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own notification preferences"
    ON notification_preferences FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Function to create default notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default preferences when profile is created
CREATE TRIGGER create_profile_notification_preferences
    AFTER INSERT ON profiles
    FOR EACH ROW EXECUTE FUNCTION create_default_notification_preferences();

-- Pending email notifications queue table
CREATE TABLE email_notifications_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    notification_type TEXT NOT NULL, -- 'new_message', 'new_deal', 'deal_update', 'document_uploaded'
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    metadata JSONB,
    status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'sent', 'failed'
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE email_notifications_queue ENABLE ROW LEVEL SECURITY;

-- Only service role can manage the queue
CREATE POLICY "Service role can manage email queue"
    ON email_notifications_queue FOR ALL
    USING (auth.role() = 'service_role');

-- Create index
CREATE INDEX idx_email_notifications_queue_status ON email_notifications_queue(status);
CREATE INDEX idx_email_notifications_queue_recipient ON email_notifications_queue(recipient_id);

-- Function to queue message notification
CREATE OR REPLACE FUNCTION queue_message_notification()
RETURNS TRIGGER AS $$
DECLARE
    recipient_id UUID;
    recipient_email TEXT;
    sender_name TEXT;
    deal_name TEXT;
    should_notify BOOLEAN;
BEGIN
    -- Get the deal info
    SELECT business_legal_name INTO deal_name
    FROM deals WHERE id = NEW.deal_id;

    -- Get sender name
    SELECT COALESCE(first_name || ' ' || last_name, email) INTO sender_name
    FROM profiles WHERE id = NEW.sender_id;

    -- Determine recipient (the other party in the deal)
    -- If sender is vendor, recipient is broker; if sender is broker, recipient is vendor
    SELECT
        CASE
            WHEN v.profile_id = NEW.sender_id THEN b.profile_id
            ELSE v.profile_id
        END,
        CASE
            WHEN v.profile_id = NEW.sender_id THEN bp.email
            ELSE vp.email
        END
    INTO recipient_id, recipient_email
    FROM deals d
    JOIN vendors v ON d.vendor_id = v.id
    JOIN brokers b ON d.broker_id = b.id
    JOIN profiles vp ON v.profile_id = vp.id
    JOIN profiles bp ON b.profile_id = bp.id
    WHERE d.id = NEW.deal_id;

    -- Check if recipient wants email notifications for new messages
    SELECT email_new_message INTO should_notify
    FROM notification_preferences
    WHERE user_id = recipient_id;

    -- Default to true if no preferences exist
    IF should_notify IS NULL THEN
        should_notify := TRUE;
    END IF;

    -- Queue the notification if recipient wants it
    IF should_notify AND recipient_id IS NOT NULL THEN
        INSERT INTO email_notifications_queue (
            recipient_id,
            recipient_email,
            notification_type,
            subject,
            body,
            metadata
        ) VALUES (
            recipient_id,
            recipient_email,
            'new_message',
            'New message on ' || deal_name,
            'You have a new message from ' || sender_name || ' regarding ' || deal_name || '.',
            jsonb_build_object(
                'deal_id', NEW.deal_id,
                'message_id', NEW.id,
                'sender_id', NEW.sender_id
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to queue notification when message is inserted
CREATE TRIGGER queue_new_message_notification
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION queue_message_notification();
