import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { CompanySettings } from '@/components/settings/CompanySettings'
import { NotificationSettings } from '@/components/settings/NotificationSettings'
import type { Profile, Broker, Vendor } from '@/types/database'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get profile
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const profile = profileData as Profile | null

  if (!profile) {
    redirect('/login')
  }

  const isBroker = profile.role === 'broker'
  let broker: Broker | null = null
  let vendor: (Vendor & { broker: Broker }) | null = null

  if (isBroker) {
    const { data: brokerData } = await supabase
      .from('brokers')
      .select('*')
      .eq('profile_id', user.id)
      .single()
    broker = brokerData as Broker | null
  } else {
    const { data: vendorData } = await supabase
      .from('vendors')
      .select('*, broker:brokers(*)')
      .eq('profile_id', user.id)
      .single()
    vendor = vendorData as (Vendor & { broker: Broker }) | null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {isBroker && <TabsTrigger value="company">Company</TabsTrigger>}
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileSettings profile={profile} />
        </TabsContent>

        {isBroker && broker && (
          <TabsContent value="company">
            <CompanySettings broker={broker} />
          </TabsContent>
        )}

        <TabsContent value="notifications">
          <NotificationSettings userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
