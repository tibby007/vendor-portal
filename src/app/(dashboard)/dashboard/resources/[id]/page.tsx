import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Calendar, Eye, Clock } from 'lucide-react'
import { ResourceForm } from '@/components/resources/ResourceForm'

interface ResourcePageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}

interface Resource {
  id: string
  broker_id: string
  title: string
  description: string | null
  content: string | null
  file_path: string | null
  category: string
  is_published: boolean
  published_at: string | null
  view_count: number
  created_at: string
  updated_at: string
}

export default async function ResourcePage({ params, searchParams }: ResourcePageProps) {
  const { id } = await params
  const { edit } = await searchParams
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
  const isEditMode = edit === 'true' && isBroker

  let resource: Resource | null = null
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

    // Get resource (broker can see all their resources)
    const { data: resourceData } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .eq('broker_id', brokerId)
      .single()

    resource = resourceData as Resource | null
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

    // Get resource (vendor can only see published)
    const { data: resourceData } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .eq('broker_id', vendorData.broker_id)
      .eq('is_published', true)
      .single()

    resource = resourceData as Resource | null
  }

  if (!resource) {
    notFound()
  }

  // Increment view count (only for published resources viewed by vendors)
  if (!isBroker && resource.is_published) {
    await supabase
      .from('resources')
      .update({ view_count: resource.view_count + 1 })
      .eq('id', id)
  }

  // Show edit form if in edit mode
  if (isEditMode && brokerId) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            href={`/dashboard/resources/${id}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Resource
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Resource</h1>
          <p className="text-gray-600">Update this resource</p>
        </div>

        <ResourceForm brokerId={brokerId} existingResource={resource} />
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/dashboard/resources"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Resources
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{resource.title}</h1>
            {isBroker && !resource.is_published && (
              <Badge variant="outline">Draft</Badge>
            )}
          </div>
          {resource.description && (
            <p className="text-gray-600 mt-1">{resource.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(resource.created_at)}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {resource.view_count} views
            </div>
            {resource.updated_at !== resource.created_at && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Updated {formatDate(resource.updated_at)}
              </div>
            )}
          </div>
        </div>
        {isBroker && (
          <Link href={`/dashboard/resources/${id}?edit=true`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
        )}
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <Badge variant="secondary">{resource.category}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {resource.content ? (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap">{resource.content}</div>
            </div>
          ) : (
            <p className="text-gray-500 italic">No content available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
