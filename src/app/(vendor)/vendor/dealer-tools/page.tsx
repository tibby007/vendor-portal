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
  title: string | null
  phone: string
  email: string | null
  photo_url: string | null
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

const makeSlug = () => `v${Math.random().toString(36).slice(2, 8)}`

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

  const [{ data: broker }, { data: profile }, { data: reps }, { data: resources }, { data: existingLink }] = await Promise.all([
    supabase
      .from('brokers')
      .select('id, company_name, company_phone, logo_url')
      .eq('id', vendor.broker_id)
      .single(),
    supabase
      .from('vendor_profiles')
      .select('vendor_id, dealership_name, city, state, phone, website, logo_url')
      .eq('vendor_id', vendor.id)
      .maybeSingle(),
    supabase
      .from('vendor_sales_reps')
      .select('id, vendor_id, first_name, last_name, title, phone, email, photo_url, is_default')
      .eq('vendor_id', vendor.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true }),
    supabase
      .from('resources')
      .select('id, title, category, description, content, file_path')
      .eq('broker_id', vendor.broker_id)
      .eq('is_published', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('vendor_prequal_links')
      .select('slug')
      .eq('vendor_id', vendor.id)
      .maybeSingle(),
  ])

  let shortSlug = existingLink?.slug || ''

  if (!shortSlug) {
    for (let i = 0; i < 5; i += 1) {
      const slug = makeSlug()
      const { data: inserted, error: insertError } = await supabase
        .from('vendor_prequal_links')
        .insert({ vendor_id: vendor.id, broker_id: vendor.broker_id, slug })
        .select('slug')
        .single()

      if (!insertError && inserted?.slug) {
        shortSlug = inserted.slug
        break
      }
    }
  }

  if (!shortSlug) {
    shortSlug = `vendor-${vendor.id.slice(0, 8)}`
  }

  return (
    <DealerToolsManager
      vendorId={vendor.id}
      brokerName={broker?.company_name || 'Your Broker'}
      brokerLogoUrl={broker?.logo_url || null}
      brandColor="#F97316"
      shortSlug={shortSlug}
      initialProfile={(profile as VendorProfile | null) || null}
      initialReps={(reps as SalesRep[]) || []}
      resources={(resources as BrokerResource[]) || []}
    />
  )
}
