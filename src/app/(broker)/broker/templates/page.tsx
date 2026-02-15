import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'

export default async function BrokerTemplatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: broker } = await supabase.from('brokers').select('id').eq('profile_id', user.id).single()
  if (!broker) redirect('/login')

  const { data: resources } = await supabase
    .from('resources')
    .select('id, title, description, category, is_published, created_at')
    .eq('broker_id', broker.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates & Resources</h1>
          <p className="text-gray-600">Manage what vendors see in Dealer Tools.</p>
        </div>
        <Link href="/broker/templates/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resource Library</CardTitle>
          <CardDescription>{resources?.length || 0} item(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {!resources?.length ? (
            <p className="text-sm text-gray-500">No resources yet.</p>
          ) : (
            <div className="space-y-3">
              {resources.map((resource) => (
                <Link key={resource.id} href={`/broker/templates/${resource.id}`} className="block rounded-md border p-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{resource.title}</p>
                      <p className="text-sm text-gray-500">{resource.category || 'Uncategorized'}{resource.description ? ` • ${resource.description}` : ''}</p>
                    </div>
                    <Badge variant={resource.is_published ? 'default' : 'outline'}>
                      {resource.is_published ? 'Published' : 'Draft'}
                    </Badge>
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
