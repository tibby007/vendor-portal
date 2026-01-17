import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { MessageThread } from '@/components/messages/MessageThread'

interface MessagesPageProps {
  params: Promise<{ id: string }>
}

interface Attachment {
  id: string
  file_name: string
  file_path: string
  file_size: number
  file_type: string
}

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  is_read: boolean
  sender: {
    first_name: string | null
    last_name: string | null
    email: string
    role: string
  }
  attachments?: Attachment[]
}

interface Deal {
  id: string
  business_legal_name: string
  vendor_id: string
  broker_id: string
  stage: {
    name: string
  }
  vendor: {
    company_name: string
  }
}

export default async function DealMessagesPage({ params }: MessagesPageProps) {
  const { id } = await params
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

  let deal: Deal | null = null

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

    // Get deal as broker
    const { data: dealData } = await supabase
      .from('deals')
      .select(`
        id,
        business_legal_name,
        vendor_id,
        broker_id,
        stage:kanban_stages(name),
        vendor:vendors(company_name)
      `)
      .eq('id', id)
      .eq('broker_id', brokerData.id)
      .single()

    if (!dealData) {
      notFound()
    }

    deal = dealData as unknown as Deal
  } else {
    // Get vendor profile
    const { data: vendorData } = await supabase
      .from('vendors')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!vendorData) {
      redirect('/dashboard')
    }

    // Get deal as vendor
    const { data: dealData } = await supabase
      .from('deals')
      .select(`
        id,
        business_legal_name,
        vendor_id,
        broker_id,
        stage:kanban_stages(name),
        vendor:vendors(company_name)
      `)
      .eq('id', id)
      .eq('vendor_id', vendorData.id)
      .single()

    if (!dealData) {
      notFound()
    }

    deal = dealData as unknown as Deal
  }

  // Fetch messages with attachments
  const { data: messagesData } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles(first_name, last_name, email, role),
      attachments:message_attachments(id, file_name, file_path, file_size, file_type)
    `)
    .eq('deal_id', id)
    .order('created_at', { ascending: true })

  const messages = (messagesData || []) as unknown as Message[]

  const getStageColor = (stageName: string) => {
    const colors: Record<string, string> = {
      'New Submission': 'bg-blue-100 text-blue-800',
      'Under Review': 'bg-yellow-100 text-yellow-800',
      'Docs Needed': 'bg-orange-100 text-orange-800',
      'Submitted to Lender': 'bg-purple-100 text-purple-800',
      'Approved': 'bg-green-100 text-green-800',
      'Docs Out': 'bg-teal-100 text-teal-800',
      'Funded': 'bg-emerald-100 text-emerald-800',
      'Declined': 'bg-red-100 text-red-800',
      'On Hold': 'bg-gray-100 text-gray-800',
    }
    return colors[stageName] || 'bg-gray-100 text-gray-800'
  }

  const backLink = `/dashboard/deals/${id}`

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link
            href={backLink}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Deal
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{deal.business_legal_name}</h1>
            <Badge className={getStageColor(deal.stage?.name || '')}>
              {deal.stage?.name}
            </Badge>
          </div>
          {isBroker && (
            <p className="text-sm text-gray-500 mt-1">Vendor: {deal.vendor?.company_name}</p>
          )}
        </div>
      </div>

      {/* Message Thread Card */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="py-3 border-b flex-shrink-0">
          <CardTitle className="text-base flex items-center">
            <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <MessageThread
            dealId={id}
            currentUserId={user.id}
            initialMessages={messages}
          />
        </CardContent>
      </Card>
    </div>
  )
}
