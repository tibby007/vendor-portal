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
    .select('company_name, broker_id')
    .eq('profile_id', user.id)
    .single()

  const { data: brokerData } = vendor?.broker_id
    ? await supabase
        .from('brokers')
        .select('company_name, company_phone, profile:profiles(email)')
        .eq('id', vendor.broker_id)
        .single()
    : { data: null }

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email
  const broker = firstRow(brokerData)
  const brokerProfile = firstRow(broker?.profile)
  const brokerEmail = brokerProfile?.email
  const supportContact = broker?.company_phone || brokerEmail || 'Support contact available from your broker'

  return (
    <PortalShell
      title={vendor?.company_name || 'Vendor Portal'}
      roleLabel="Vendor Portal"
      supportLabel={`Your Broker: ${broker?.company_name || 'Broker'} | Support: ${supportContact}`}
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
