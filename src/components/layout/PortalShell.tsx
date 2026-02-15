'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentType, ReactNode } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Menu, X, Building2 } from 'lucide-react'
import { SignOutButton } from '@/components/layout/SignOutButton'

type NavItem = {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
}

type PortalShellProps = {
  title: string
  roleLabel: string
  supportLabel?: string
  userName: string
  userEmail: string
  navItems: NavItem[]
  children: ReactNode
}

export function PortalShell({
  title,
  roleLabel,
  supportLabel,
  userName,
  userEmail,
  navItems,
  children,
}: PortalShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || userEmail[0]?.toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 border-b px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="h-5 w-5 text-blue-700" />
            <span className="font-semibold truncate">{title}</span>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="h-16 px-4 border-b bg-white flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <Badge variant="outline">{roleLabel}</Badge>
            {supportLabel && <span className="text-sm text-gray-600 hidden md:block">{supportLabel}</span>}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-gray-500">{userEmail}</p>
            </div>
            <Avatar>
              <AvatarFallback className="bg-blue-100 text-blue-700">{initials}</AvatarFallback>
            </Avatar>
            <SignOutButton />
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
