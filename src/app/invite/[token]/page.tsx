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

  if (error || !invitation) {
    notFound()
  }

  // Check if invitation is expired
  const isExpired = new Date(invitation.expires_at) < new Date()

  // Check if invitation is already used
  const isUsed = invitation.status === 'accepted'

  if (isExpired || isUsed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isExpired ? 'Invitation Expired' : 'Invitation Already Used'}
          </h1>
          <p className="text-gray-500 mb-4">
            {isExpired
              ? 'This invitation link has expired. Please contact your broker for a new invitation.'
              : 'This invitation has already been used to create an account.'}
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
