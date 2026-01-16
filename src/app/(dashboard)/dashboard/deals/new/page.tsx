import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ApplicationForm } from '@/components/deals/ApplicationForm'

interface VendorData {
  id: string
  broker_id: string
}

export default async function NewDealPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get vendor profile
  const { data: vendorData } = await supabase
    .from('vendors')
    .select('id, broker_id')
    .eq('profile_id', user.id)
    .single()

  const vendor = vendorData as VendorData | null

  if (!vendor) {
    // Not a vendor, redirect to dashboard
    redirect('/dashboard')
  }

  return (
    <ApplicationForm
      vendorId={vendor.id}
      brokerId={vendor.broker_id}
    />
  )
}
