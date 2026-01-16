import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ApplicationForm } from '@/components/deals/ApplicationForm'

interface EditDealPageProps {
  params: Promise<{ id: string }>
}

interface VendorData {
  id: string
  broker_id: string
}

interface DealData {
  id: string
  vendor_id: string
}

export default async function EditDealPage({ params }: EditDealPageProps) {
  const { id } = await params
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
    redirect('/dashboard')
  }

  // Verify deal belongs to this vendor
  const { data: dealData } = await supabase
    .from('deals')
    .select('id, vendor_id')
    .eq('id', id)
    .eq('vendor_id', vendor.id)
    .single()

  const deal = dealData as DealData | null

  if (!deal) {
    notFound()
  }

  return (
    <ApplicationForm
      vendorId={vendor.id}
      brokerId={vendor.broker_id}
      existingDealId={id}
    />
  )
}
