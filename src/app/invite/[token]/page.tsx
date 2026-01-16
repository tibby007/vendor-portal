import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { VendorRegistrationForm } from '@/components/auth/VendorRegistrationForm'

interface InvitePageProps {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params
  const supabase = await createClient()

  // Fetch invitation details
  const { data: invitation, error } = await supabase
    .from('vendor_invitations')
    .select(`
      *,
      broker:brokers(
        id,
        company_name,
        logo_url
      )
    `)
    .eq('token', token)
    .single()

  // Check if invitation is valid (exists, not expired, not used)
  // Use generic error message to prevent enumeration attacks
  const isInvalid = error || !invitation
  const isExpired = invitation && new Date(invitation.expires_at) < new Date()
  const isUsed = invitation && invitation.status === 'accepted'

  if (isInvalid || isExpired || isUsed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invalid Invitation
          </h1>
          <p className="text-gray-500 mb-4">
            This invitation link is invalid or has expired. Please contact your broker for a new invitation.
          </p>
          <a
            href="/login"
            className="text-blue-600 hover:underline"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <VendorRegistrationForm
      invitation={invitation}
      brokerName={invitation.broker?.company_name || 'Your Broker'}
    />
  )
}
