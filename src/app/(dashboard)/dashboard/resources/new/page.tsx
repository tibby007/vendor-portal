import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ResourceForm } from '@/components/resources/ResourceForm'

export default async function NewResourcePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Verify user is a broker
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'broker') {
    redirect('/dashboard/resources')
  }

  // Get broker ID
  const { data: brokerData } = await supabase
    .from('brokers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!brokerData) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/resources"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Resources
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Resource</h1>
        <p className="text-gray-600">Add a new educational resource for your vendors</p>
      </div>

      <ResourceForm brokerId={brokerData.id} />
    </div>
  )
}
