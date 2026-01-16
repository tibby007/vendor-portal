import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Users, Search, Mail, Building, Clock } from 'lucide-react'

export default async function VendorsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get broker profile
  const { data: broker } = await supabase
    .from('brokers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!broker) {
    redirect('/dashboard')
  }

  // Get vendors
  const { data: vendors } = await supabase
    .from('vendors')
    .select(`
      *,
      profile:profiles(first_name, last_name, email, phone)
    `)
    .eq('broker_id', broker.id)
    .order('created_at', { ascending: false })

  // Get pending invitations
  const { data: invitations } = await supabase
    .from('vendor_invitations')
    .select('*')
    .eq('broker_id', broker.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-500 mt-1">
            Manage your vendor relationships
          </p>
        </div>
        <Link href="/dashboard/vendors/invite">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Invite Vendor
          </Button>
        </Link>
      </div>

      {/* Pending Invitations */}
      {invitations && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Clock className="h-5 w-5 mr-2 text-yellow-600" />
              Pending Invitations
            </CardTitle>
            <CardDescription>
              These vendors have been invited but haven&apos;t registered yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{invite.email}</p>
                      {invite.company_name && (
                        <p className="text-sm text-gray-500">{invite.company_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      Invited {formatDate(invite.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Vendors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            Your Vendors
          </CardTitle>
          <CardDescription>
            {vendors?.length || 0} vendor{vendors?.length !== 1 ? 's' : ''} registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!vendors || vendors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No vendors yet</p>
              <p className="text-sm mb-4">Invite your first vendor to get started</p>
              <Link href="/dashboard/vendors/invite">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Vendor
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {vendors.map((vendor) => (
                <Link
                  key={vendor.id}
                  href={`/dashboard/vendors/${vendor.id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{vendor.company_name}</p>
                      <p className="text-sm text-gray-500">
                        {vendor.profile?.first_name} {vendor.profile?.last_name} • {vendor.profile?.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(vendor.status)}>
                      {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      Joined {formatDate(vendor.created_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
