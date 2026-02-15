import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PrequalLandingForm } from '@/components/prequal/PrequalLandingForm'

interface PageProps {
  params: Promise<{ slug: string }>
}

const firstRow = <T,>(value: T | T[] | null | undefined): T | undefined =>
  Array.isArray(value) ? value[0] : value || undefined

export default async function PrequalLinkPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: prequal } = await supabase
    .from('vendor_prequal_links')
    .select('slug, vendor_id, broker_id, default_rep_id')
    .eq('slug', slug)
    .single()

  if (!prequal) notFound()

  const [{ data: vendor }, { data: broker }, { data: vendorProfile }, { data: rep }] = await Promise.all([
    supabase
      .from('vendors')
      .select('id, company_name')
      .eq('id', prequal.vendor_id)
      .single(),
    supabase
      .from('brokers')
      .select('id, company_name')
      .eq('id', prequal.broker_id)
      .single(),
    supabase
      .from('vendor_profiles')
      .select('city, state, logo_url')
      .eq('vendor_id', prequal.vendor_id)
      .maybeSingle(),
    prequal.default_rep_id
      ? supabase
          .from('vendor_sales_reps')
          .select('id, first_name, last_name, title, phone, email, photo_url')
          .eq('id', prequal.default_rep_id)
          .eq('vendor_id', prequal.vendor_id)
          .maybeSingle()
      : supabase
          .from('vendor_sales_reps')
          .select('id, first_name, last_name, title, phone, email, photo_url')
          .eq('vendor_id', prequal.vendor_id)
          .eq('is_default', true)
          .maybeSingle(),
  ])

  const resolvedRep = firstRow(rep)

  return (
    <PrequalLandingForm
      slug={slug}
      dealerName={vendor?.company_name || 'Dealer'}
      dealerCityState={[vendorProfile?.city, vendorProfile?.state].filter(Boolean).join(', ') || 'Your Area'}
      brokerName={broker?.company_name || 'Broker'}
      dealerLogoUrl={vendorProfile?.logo_url || null}
      defaultRep={resolvedRep
        ? {
            name: `${resolvedRep.first_name} ${resolvedRep.last_name}`,
            title: resolvedRep.title,
            phone: resolvedRep.phone,
            email: resolvedRep.email,
            photo_url: resolvedRep.photo_url,
          }
        : null}
    />
  )
}
