// Supabase Edge Function for sending email notifications
// This function processes the email_notifications_queue table
//
// To deploy:
// 1. Set up a Resend account and get an API key
// 2. Add RESEND_API_KEY to your Supabase project secrets
// 3. Deploy: supabase functions deploy send-notification
//
// To invoke (via cron or webhook):
// curl -i --location --request POST 'https://[PROJECT_REF].supabase.co/functions/v1/send-notification' \
//   --header 'Authorization: Bearer [ANON_KEY]'

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'VendorBuddy <notifications@vendorbuddy.com>'
const APP_URL = Deno.env.get('APP_URL') || 'https://vendorbuddy.com'

interface EmailNotification {
  id: string
  recipient_id: string
  recipient_email: string
  notification_type: string
  subject: string
  body: string
  metadata: {
    deal_id?: string
    message_id?: string
    sender_id?: string
  }
}

Deno.serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // Check for required environment variables
    if (!RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured - skipping email send')
      return new Response(JSON.stringify({
        success: true,
        message: 'Email sending not configured',
        sent: 0
      }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured')
    }

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Fetch pending notifications (limit to 10 at a time)
    const { data: notifications, error: fetchError } = await supabase
      .from('email_notifications_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10)

    if (fetchError) {
      throw fetchError
    }

    if (!notifications || notifications.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No pending notifications',
        sent: 0
      }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    let sentCount = 0
    const errors: string[] = []

    // Process each notification
    for (const notification of notifications as EmailNotification[]) {
      try {
        // Build email HTML
        const htmlBody = buildEmailHtml(notification)

        // Send via Resend
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: notification.recipient_email,
            subject: notification.subject,
            html: htmlBody,
          }),
        })

        if (!response.ok) {
          const errorData = await response.text()
          throw new Error(`Resend API error: ${errorData}`)
        }

        // Mark as sent
        await supabase
          .from('email_notifications_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', notification.id)

        sentCount++
      } catch (sendError) {
        const errorMessage = sendError instanceof Error ? sendError.message : 'Unknown error'
        errors.push(`${notification.id}: ${errorMessage}`)

        // Mark as failed
        await supabase
          .from('email_notifications_queue')
          .update({
            status: 'failed',
            error_message: errorMessage
          })
          .eq('id', notification.id)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      sent: sentCount,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error processing notifications:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

function buildEmailHtml(notification: EmailNotification): string {
  const dealLink = notification.metadata?.deal_id
    ? `${APP_URL}/dashboard/deals/${notification.metadata.deal_id}/messages`
    : `${APP_URL}/dashboard`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${notification.subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1F2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); padding: 30px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">VendorBuddy</h1>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #111827; margin-top: 0;">${notification.subject}</h2>

    <p style="color: #4B5563; font-size: 16px;">
      ${notification.body}
    </p>

    <div style="margin: 30px 0;">
      <a href="${dealLink}"
         style="display: inline-block; background: #F97316; color: white; padding: 12px 24px;
                text-decoration: none; border-radius: 8px; font-weight: 600;">
        View in VendorBuddy
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

    <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
      You received this email because you have notifications enabled for ${notification.notification_type.replace('_', ' ')}s.
      <a href="${APP_URL}/dashboard/settings" style="color: #F97316;">Manage your notification preferences</a>
    </p>
  </div>
</body>
</html>
`
}
