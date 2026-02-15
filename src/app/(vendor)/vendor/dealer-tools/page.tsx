import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolveBrokerName } from '@/lib/broker-public'
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

  const [{ data: latestDeal }, { data: existingLink }] = await Promise.all([
    supabase
      .from('deals')
      .select('broker_id')
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('vendor_prequal_links')
      .select('slug, default_rep_id, broker_id')
      .eq('vendor_id', vendor.id)
      .maybeSingle(),
  ])

  const resolvedBrokerId = vendor.broker_id || latestDeal?.broker_id || existingLink?.broker_id || null

  const [{ data: broker }, { data: profile }, { data: reps }, { data: resources }] = await Promise.all([
    resolvedBrokerId
      ? supabase
          .from('broker_public')
          .select('broker_id, company_name, display_name, support_email, support_phone, logo_url')
          .eq('broker_id', resolvedBrokerId)
          .single()
      : Promise.resolve({ data: null }),
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
      .eq('broker_id', resolvedBrokerId || '')
      .eq('is_published', true)
      .order('created_at', { ascending: false }),
  ])

  const typedReps = (reps as SalesRep[]) || []
  const defaultRepId = typedReps.find((rep) => rep.is_default)?.id || typedReps[0]?.id || null

  let shortSlug = existingLink?.slug || ''

  if (!shortSlug) {
    for (let i = 0; i < 5; i += 1) {
      const slug = makeSlug()
      const { data: inserted, error: insertError } = await supabase
        .from('vendor_prequal_links')
        .insert({ vendor_id: vendor.id, broker_id: resolvedBrokerId, slug, default_rep_id: defaultRepId })
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

  if (existingLink?.slug && existingLink.default_rep_id !== defaultRepId) {
    await supabase
      .from('vendor_prequal_links')
      .update({ default_rep_id: defaultRepId })
      .eq('vendor_id', vendor.id)
  }

  return (
    <DealerToolsManager
      vendorId={vendor.id}
      brokerName={resolveBrokerName(broker)}
      brokerLogoUrl={broker?.logo_url || null}
      brandColor="#F97316"
      shortSlug={shortSlug}
      initialProfile={(profile as VendorProfile | null) || null}
      initialReps={typedReps}
      resources={(resources as BrokerResource[]) || []}
    />
  )
}
