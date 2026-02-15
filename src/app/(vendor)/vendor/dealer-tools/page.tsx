import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DealerToolsManager } from '@/components/vendor/DealerToolsManager'

interface VendorProfile {
  vendor_id: string
  dealership_name: string | null
  city: string | null
  state: string | null
  phone: string | null
  website: string | null
  logo_url: string | null
}

interface SalesRep {
  id: string
  vendor_id: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
  is_default: boolean
}

interface BrokerResource {
  id: string
  title: string
  category: string | null
  description: string | null
  content: string | null
  file_path: string | null
}

export default async function DealerToolsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, broker_id')
    .eq('profile_id', user.id)
    .single()

  if (!vendor) redirect('/vendor')

  const [{ data: broker }, { data: profile }, { data: reps }, { data: resources }] = await Promise.all([
    supabase
      .from('brokers')
      .select('id, company_name')
      .eq('id', vendor.broker_id)
      .single(),
    supabase
      .from('vendor_profiles')
      .select('vendor_id, dealership_name, city, state, phone, website, logo_url')
      .eq('vendor_id', vendor.id)
      .maybeSingle(),
    supabase
      .from('vendor_sales_reps')
      .select('id, vendor_id, first_name, last_name, phone, email, is_default')
      .eq('vendor_id', vendor.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true }),
    supabase
      .from('resources')
      .select('id, title, category, description, content, file_path')
      .eq('broker_id', vendor.broker_id)
      .eq('is_published', true)
      .order('created_at', { ascending: false }),
  ])

  return (
    <DealerToolsManager
      vendorId={vendor.id}
      brokerId={vendor.broker_id}
      brokerName={broker?.company_name || 'Your Broker'}
      initialProfile={(profile as VendorProfile | null) || null}
      initialReps={(reps as SalesRep[]) || []}
      resources={(resources as BrokerResource[]) || []}
    />
  )
}
