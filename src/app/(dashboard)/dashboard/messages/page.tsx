import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Clock, Building2, ChevronRight } from 'lucide-react'

interface DealWithMessages {
  id: string
  business_legal_name: string
  stage: {
    name: string
  }
  vendor: {
    company_name: string
  }
  messages: {
    id: string
    content: string
    created_at: string
    is_read: boolean
    sender_id: string
    sender: {
      first_name: string | null
      last_name: string | null
    }
  }[]
  _unreadCount: number
  _latestMessage: {
    content: string
    created_at: string
    sender: {
      first_name: string | null
      last_name: string | null
    }
  } | null
}

export default async function MessagesPage() {
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

  let deals: DealWithMessages[] = []

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

    // Get all deals with their messages for broker
    const { data: dealsData } = await supabase
      .from('deals')
      .select(`
        id,
        business_legal_name,
        stage:kanban_stages(name),
        vendor:vendors(company_name),
        messages(
          id,
          content,
          created_at,
          is_read,
          sender_id,
          sender:profiles(first_name, last_name)
        )
      `)
      .eq('broker_id', brokerData.id)
      .order('created_at', { ascending: false })

    deals = (dealsData || []) as unknown as DealWithMessages[]
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

    // Get all deals with their messages for vendor
    const { data: dealsData } = await supabase
      .from('deals')
      .select(`
        id,
        business_legal_name,
        stage:kanban_stages(name),
        vendor:vendors(company_name),
        messages(
          id,
          content,
          created_at,
          is_read,
          sender_id,
          sender:profiles(first_name, last_name)
        )
      `)
      .eq('vendor_id', vendorData.id)
      .order('created_at', { ascending: false })

    deals = (dealsData || []) as unknown as DealWithMessages[]
  }

  // Process deals to add unread count and latest message
  const processedDeals = deals
    .map((deal) => {
      const sortedMessages = [...deal.messages].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      const unreadCount = deal.messages.filter(
        (m) => !m.is_read && m.sender_id !== user.id
      ).length

      return {
        ...deal,
        _unreadCount: unreadCount,
        _latestMessage: sortedMessages[0] || null,
      }
    })
    .filter((deal) => deal.messages.length > 0 || true) // Show all deals for now
    .sort((a, b) => {
      // Sort by latest message date, then by deal creation
      const aDate = a._latestMessage?.created_at || '1970-01-01'
      const bDate = b._latestMessage?.created_at || '1970-01-01'
      return new Date(bDate).getTime() - new Date(aDate).getTime()
    })

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

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

  const totalUnread = processedDeals.reduce((sum, deal) => sum + deal._unreadCount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">
            {totalUnread > 0
              ? `${totalUnread} unread message${totalUnread > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
      </div>

      {processedDeals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-500">
              {isBroker
                ? 'Messages will appear here when vendors submit deals'
                : 'Start a conversation by submitting a deal application'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {processedDeals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/dashboard/deals/${deal.id}/messages`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium truncate ${deal._unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                        {deal.business_legal_name}
                      </h3>
                      {deal._unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {deal._unreadCount}
                        </Badge>
                      )}
                      <Badge className={`text-xs ${getStageColor(deal.stage?.name || '')}`}>
                        {deal.stage?.name}
                      </Badge>
                    </div>
                    {isBroker && (
                      <div className="flex items-center text-xs text-gray-500 mb-1">
                        <Building2 className="h-3 w-3 mr-1" />
                        {deal.vendor?.company_name}
                      </div>
                    )}
                    {deal._latestMessage ? (
                      <p className={`text-sm truncate ${deal._unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {deal._latestMessage.sender?.first_name || 'Unknown'}:{' '}
                        {deal._latestMessage.content}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No messages yet</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    {deal._latestMessage && (
                      <div className="flex items-center text-xs text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(deal._latestMessage.created_at)}
                      </div>
                    )}
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
