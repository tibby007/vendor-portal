import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { PortalShell, type NavIconKey } from '@/components/layout/PortalShell'

const navItems = [
  { href: '/broker', label: 'Dashboard', icon: 'dashboard' },
  { href: '/broker/vendors', label: 'Vendors', icon: 'vendors' },
  { href: '/broker/pipeline', label: 'Pipeline', icon: 'pipeline' },
  { href: '/broker/templates', label: 'Templates/Resources', icon: 'templates' },
  { href: '/broker/reports', label: 'Reports', icon: 'reports' },
] as const satisfies ReadonlyArray<{ href: string; label: string; icon: NavIconKey }>

export default async function BrokerLayout({ children }: { children: ReactNode }) {
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

  if (!profile || profile.role !== 'broker') {
    redirect('/login')
  }

  const { data: broker } = await supabase
    .from('brokers')
    .select('company_name')
    .eq('profile_id', user.id)
    .single()

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email

  return (
    <PortalShell
      title={broker?.company_name || 'Broker Console'}
      roleLabel="Broker Console"
      userName={fullName}
      userEmail={profile.email}
      navItems={navItems}
    >
      {children}
    </PortalShell>
  )
}
