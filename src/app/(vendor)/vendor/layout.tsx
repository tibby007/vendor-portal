import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { PortalShell, type NavIconKey } from '@/components/layout/PortalShell'

const navItems = [
  { href: '/vendor', label: 'Dashboard', icon: 'dashboard' },
  { href: '/vendor/submit-deal', label: 'Submit Deal', icon: 'submitDeal' },
  { href: '/vendor/my-deals', label: 'My Deals', icon: 'myDeals' },
  { href: '/vendor/dealer-tools', label: 'Dealer Tools', icon: 'dealerTools' },
] as const satisfies ReadonlyArray<{ href: string; label: string; icon: NavIconKey }>

const firstRow = <T,>(value: T | T[] | null | undefined): T | undefined =>
  Array.isArray(value) ? value[0] : value || undefined

export default async function VendorLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, first_name, last_name, email')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'vendor') {
    redirect('/login')
  }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, company_name, broker_id')
    .eq('profile_id', user.id)
    .single()

  const [{ data: latestDeal }, { data: prequalLink }] = await Promise.all([
    vendor
      ? supabase
          .from('deals')
          .select('broker_id')
          .eq('vendor_id', vendor.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    vendor
      ? supabase
          .from('vendor_prequal_links')
          .select('broker_id')
          .eq('vendor_id', vendor.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const resolvedBrokerId = vendor?.broker_id || latestDeal?.broker_id || prequalLink?.broker_id || null

  const { data: brokerData } = resolvedBrokerId
    ? await supabase
        .from('brokers')
        .select('company_name, company_phone')
        .eq('id', resolvedBrokerId)
        .single()
    : { data: null }

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email
  const broker = firstRow(brokerData)
  const supportContact = broker?.company_phone || 'Support contact available from your broker'

  return (
    <PortalShell
      title={vendor?.company_name || 'Vendor Portal'}
      roleLabel="Vendor Portal"
      supportLabel={`Your Broker: ${broker?.company_name || 'Broker'} | Support: ${supportContact}`}
      accentColor="#F97316"
      userName={fullName}
      userEmail={profile.email}
      navItems={navItems}
    >
      <div className="mb-4 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
        You were invited by {broker?.company_name || 'your broker'}. Keep financing inside your sales process.
      </div>
      {children}
    </PortalShell>
  )
}
