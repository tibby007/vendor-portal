import Link from 'next/link'

interface InviteLandingProps {
  searchParams: Promise<{ broker_name?: string; token?: string }>
}

export default async function InviteLandingPage({ searchParams }: InviteLandingProps) {
  const params = await searchParams
  const brokerName = params.broker_name || 'your broker'
  const token = params.token

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-lg rounded-xl border bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">You were invited by {brokerName}</h1>
        <p className="mt-3 text-gray-600">
          Create your dealer account to submit financing requests and track deal status.
        </p>

        <div className="mt-6">
          {token ? (
            <Link
              href={`/invite/${token}`}
              className="inline-flex items-center justify-center rounded-lg bg-[#111827] text-white px-6 py-3 font-semibold hover:bg-[#1F2937]"
            >
              Create account
            </Link>
          ) : (
            <p className="text-sm text-gray-500">
              Use the invitation link from your broker email to create your account.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
