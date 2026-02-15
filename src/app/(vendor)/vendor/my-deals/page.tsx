import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface DealRow {
  id: string
  business_legal_name: string
  amount_requested: number
  submitted_at: string | null
  created_at: string
  stage?: {
    name?: string
    is_visible_to_vendor?: boolean
  } | null
}

export default async function VendorMyDealsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vendor } = await supabase.from('vendors').select('id').eq('profile_id', user.id).single()
  if (!vendor) redirect('/vendor')

  const { data: dealsData } = await supabase
    .from('deals')
    .select('id, business_legal_name, amount_requested, submitted_at, created_at, stage:kanban_stages(name, is_visible_to_vendor)')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })

  const deals = (dealsData || []) as unknown as DealRow[]

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Deals</h1>
          <p className="text-gray-600">Track status and document progress for your submitted financing deals.</p>
        </div>
        <Link href="/vendor/submit-deal"><Button><Plus className="h-4 w-4 mr-2" />Submit Deal</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deals</CardTitle>
          <CardDescription>{deals.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          {!deals.length ? (
            <p className="text-sm text-gray-500">No deals yet. Submit your first deal to begin.</p>
          ) : (
            <div className="space-y-3">
              {deals.map((deal) => {
                const visibleStage = deal.stage?.is_visible_to_vendor ? deal.stage?.name : 'In Progress'
                return (
                  <Link key={deal.id} href={`/vendor/my-deals/${deal.id}`} className="block rounded-md border p-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{deal.business_legal_name || 'Untitled Deal'}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(Number(deal.amount_requested || 0))}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{visibleStage || 'In Progress'}</Badge>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
