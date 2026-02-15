'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface PendingInviteActionsProps {
  invitationId: string
}

export function PendingInviteActions({ invitationId }: PendingInviteActionsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCancel = async () => {
    if (!confirm('Cancel this invitation?')) return

    setLoading(true)

    await supabase
      .from('vendor_invitations')
      .delete()
      .eq('id', invitationId)

    setLoading(false)
    router.refresh()
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading}>
      {loading ? 'Canceling...' : 'Cancel invite'}
    </Button>
  )
}
