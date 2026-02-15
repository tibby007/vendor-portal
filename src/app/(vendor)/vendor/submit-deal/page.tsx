import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ApplicationForm } from '@/components/deals/ApplicationForm'

interface VendorData {
  id: string
  broker_id: string
}

export default async function SubmitDealPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: vendorData } = await supabase
    .from('vendors')
    .select('id, broker_id')
    .eq('profile_id', user.id)
    .single()

  const vendor = vendorData as VendorData | null

  if (!vendor) {
    redirect('/vendor')
  }

  return <ApplicationForm vendorId={vendor.id} brokerId={vendor.broker_id} redirectBasePath="/vendor/my-deals" />
}
