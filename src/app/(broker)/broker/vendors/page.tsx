import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'

const firstRow = <T,>(value: T | T[] | null | undefined): T | undefined =>
  Array.isArray(value) ? value[0] : value || undefined

export default async function BrokerVendorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: broker } = await supabase.from('brokers').select('id').eq('profile_id', user.id).single()
  if (!broker) redirect('/login')

  const { data: vendors } = await supabase
    .from('vendors')
    .select('id, company_name, status, created_at, profile:profiles(first_name, last_name, email)')
    .eq('broker_id', broker.id)
    .order('created_at', { ascending: false })

  const { data: invitations } = await supabase
    .from('vendor_invitations')
    .select('id, email, company_name, created_at')
    .eq('broker_id', broker.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-600">Invite vendors and manage active dealer relationships.</p>
        </div>
        <Link href="/broker/vendors/invite"><Button><Plus className="h-4 w-4 mr-2" />Invite Vendor</Button></Link>
      </div>

      {invitations && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>Invites sent but not yet accepted</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {invitations.map((invite) => (
              <div key={invite.id} className="rounded-md border p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{invite.company_name || invite.email}</p>
                  <p className="text-sm text-gray-500">{invite.email}</p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Vendor List</CardTitle>
          <CardDescription>{vendors?.length || 0} vendor(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {!vendors?.length ? (
            <p className="text-sm text-gray-500">No vendors yet. Invite your first vendor to start your pipeline.</p>
          ) : (
            <div className="space-y-3">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="rounded-md border p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{vendor.company_name}</p>
                    <p className="text-sm text-gray-500">
                      {firstRow(vendor.profile)?.first_name} {firstRow(vendor.profile)?.last_name} {firstRow(vendor.profile)?.email ? `• ${firstRow(vendor.profile)?.email}` : ''}
                    </p>
                  </div>
                  <Badge variant="outline">{vendor.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
