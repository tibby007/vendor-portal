import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  FileText,
  Video,
  Link as LinkIcon,
  Plus,
  Eye,
  Calendar,
  FolderOpen,
} from 'lucide-react'

interface Resource {
  id: string
  title: string
  description: string | null
  content: string | null
  file_path: string | null
  category: string
  is_published: boolean
  published_at: string | null
  view_count: number
  created_at: string
}

export default async function ResourcesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get user's profile and role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isBroker = profile?.role === 'broker'

  let resources: Resource[] = []
  let brokerId: string | null = null

  if (isBroker) {
    // Get broker ID
    const { data: brokerData } = await supabase
      .from('brokers')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!brokerData) {
      redirect('/dashboard')
    }

    brokerId = brokerData.id

    // Get all resources for broker (including unpublished)
    const { data: resourcesData } = await supabase
      .from('resources')
      .select('*')
      .eq('broker_id', brokerId)
      .order('created_at', { ascending: false })

    resources = (resourcesData || []) as Resource[]
  } else {
    // Get vendor's broker
    const { data: vendorData } = await supabase
      .from('vendors')
      .select('broker_id')
      .eq('profile_id', user.id)
      .single()

    if (!vendorData) {
      redirect('/dashboard')
    }

    // Get only published resources for vendor
    const { data: resourcesData } = await supabase
      .from('resources')
      .select('*')
      .eq('broker_id', vendorData.broker_id)
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    resources = (resourcesData || []) as Resource[]
  }

  // Group resources by category
  const resourcesByCategory = resources.reduce((acc, resource) => {
    const category = resource.category || 'Uncategorized'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(resource)
    return acc
  }, {} as Record<string, Resource[]>)

  const categories = Object.keys(resourcesByCategory).sort()

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, typeof FileText> = {
      'Getting Started': BookOpen,
      'Documents': FileText,
      'Videos': Video,
      'Links': LinkIcon,
    }
    return icons[category] || FolderOpen
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-600">
            {isBroker
              ? 'Manage educational materials for your vendors'
              : 'Educational materials and documents from your broker'}
          </p>
        </div>
        {isBroker && (
          <Link href="/dashboard/resources/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </Link>
        )}
      </div>

      {resources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources yet</h3>
            <p className="text-gray-500 mb-4">
              {isBroker
                ? 'Create resources to help your vendors with the financing process'
                : 'Your broker has not published any resources yet'}
            </p>
            {isBroker && (
              <Link href="/dashboard/resources/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Resource
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => {
            const CategoryIcon = getCategoryIcon(category)
            const categoryResources = resourcesByCategory[category]

            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-4">
                  <CategoryIcon className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{category}</h2>
                  <Badge variant="secondary" className="text-xs">
                    {categoryResources.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryResources.map((resource) => (
                    <Link
                      key={resource.id}
                      href={`/dashboard/resources/${resource.id}`}
                    >
                      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base line-clamp-2">
                              {resource.title}
                            </CardTitle>
                            {isBroker && !resource.is_published && (
                              <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                                Draft
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {resource.description && (
                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                              {resource.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(resource.created_at)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {resource.view_count} views
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
