import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ResourceForm } from '@/components/resources/ResourceForm'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditTemplatePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: broker } = await supabase.from('brokers').select('id').eq('profile_id', user.id).single()
  if (!broker) redirect('/broker')

  const { data: resource } = await supabase
    .from('resources')
    .select('id, title, description, content, file_path, category, is_published')
    .eq('id', id)
    .eq('broker_id', broker.id)
    .single()

  if (!resource) notFound()

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/broker/templates" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Templates
      </Link>
      <ResourceForm brokerId={broker.id} existingResource={resource} basePath="/broker/templates" />
    </div>
  )
}
