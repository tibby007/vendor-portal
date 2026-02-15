import { redirect } from 'next/navigation'
import { LayoutDashboard, Users, KanbanSquare, BookOpen, BarChart3 } from 'lucide-react'
import type { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { PortalShell } from '@/components/layout/PortalShell'

const navItems = [
  { href: '/broker', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/broker/vendors', label: 'Vendors', icon: Users },
  { href: '/broker/pipeline', label: 'Pipeline', icon: KanbanSquare },
  { href: '/broker/templates', label: 'Templates/Resources', icon: BookOpen },
  { href: '/broker/reports', label: 'Reports', icon: BarChart3 },
]

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
