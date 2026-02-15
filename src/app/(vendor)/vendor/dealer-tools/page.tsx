import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function DealerToolsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, broker_id, broker:brokers(company_name, company_phone, profile:profiles(email))')
    .eq('profile_id', user.id)
    .single()

  if (!vendor) redirect('/vendor')

  const { data: resources } = await supabase
    .from('resources')
    .select('id, title, description, category')
    .eq('broker_id', vendor.broker_id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const support = vendor.broker?.company_phone || (vendor.broker as { profile?: { email?: string } } | null)?.profile?.email || 'Contact your broker'

  const buyerText = `Hi [Buyer Name], we offer financing options to keep your purchase moving without heavy upfront cash. I can send a quick pre-qual link if you want to check options today.`
  const buyerEmail = `Subject: Financing Option for Your Purchase\n\nHi [Buyer Name],\n\nWe can offer financing so you can move forward without delaying your purchase. If you'd like, I can share a quick pre-qualification link.\n\nBest,\n[Your Name]`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dealer Tools</h1>
        <p className="text-gray-600">Financing tools for your sales team and buyer conversations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buyer Text Script</CardTitle>
          <CardDescription>Use this script to keep financing inside your sales process.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-gray-50 p-3 text-sm whitespace-pre-wrap">{buyerText}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Buyer Email Script</CardTitle>
          <CardDescription>Copy and personalize before sending.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-gray-50 p-3 text-sm whitespace-pre-wrap">{buyerEmail}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financing Available One-Pager</CardTitle>
          <CardDescription>Download and share with buyers. Placeholder asset for MVP.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" disabled>Download One-Pager (Coming Soon)</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shareable Pre-Qual Link + QR</CardTitle>
          <CardDescription>Placeholder until pre-qual flow is implemented.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="rounded-md border bg-gray-50 p-3">Pre-Qual Link: https://portal.example.com/prequal/[vendor-id]</p>
          <div className="h-32 w-32 border rounded-md flex items-center justify-center text-xs text-gray-500">QR Placeholder</div>
          <p className="text-gray-600">Support: {support}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Broker Resources</CardTitle>
          <CardDescription>Published templates and resources from your broker.</CardDescription>
        </CardHeader>
        <CardContent>
          {!resources?.length ? (
            <p className="text-sm text-gray-500">No published resources yet.</p>
          ) : (
            <div className="space-y-3">
              {resources.map((resource) => (
                <div key={resource.id} className="rounded-md border p-3">
                  <p className="font-medium">{resource.title}</p>
                  <p className="text-sm text-gray-500">
                    {resource.category || 'General'}{resource.description ? ` • ${resource.description}` : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
