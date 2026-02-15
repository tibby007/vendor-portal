'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface BrokerData {
  id: string
}

interface InvitationData {
  id: string
  status: string
}

interface CreatedInvitation {
  id: string
  token: string
}

export default function InviteVendorPage() {
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const supabase = createClient()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in')
        return
      }

      const { data: brokerData, error: brokerError } = await supabase
        .from('brokers')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      const broker = brokerData as BrokerData | null

      if (brokerError || !broker) {
        setError('Broker profile not found')
        return
      }

      const { data: existingInviteData } = await supabase
        .from('vendor_invitations')
        .select('id, status')
        .eq('broker_id', broker.id)
        .eq('email', email.toLowerCase())
        .single()

      const existingInvite = existingInviteData as InvitationData | null

      if (existingInvite) {
        if (existingInvite.status === 'pending') {
          setError('An invitation has already been sent to this email')
          return
        }
        if (existingInvite.status === 'accepted') {
          setError('This vendor has already registered')
          return
        }
      }

      const { data: invitationData, error: inviteError } = await supabase
        .from('vendor_invitations')
        .insert({
          broker_id: broker.id,
          email: email.toLowerCase(),
          company_name: companyName || null,
        })
        .select()
        .single()

      const invitation = invitationData as CreatedInvitation | null

      if (inviteError || !invitation) {
        setError('Failed to create invitation')
        return
      }

      const baseUrl = window.location.origin
      setInviteLink(`${baseUrl}/invite/${invitation.token}`)
      setSuccess(true)
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Invitation Created</CardTitle>
            <CardDescription>Share this link with your vendor.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Invite Link</Label>
              <Input value={inviteLink || ''} readOnly className="bg-gray-50" />
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="flex-1" onClick={() => navigator.clipboard.writeText(inviteLink || '')}>Copy Link</Button>
              <Link href="/broker/vendors" className="flex-1"><Button className="w-full">Back to Vendors</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <Link href="/broker/vendors" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Vendors
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Invite Vendor</CardTitle>
              <CardDescription>Send an invitation to add a vendor to your broker console.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleInvite}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Vendor Email *</Label>
              <Input id="email" type="email" placeholder="dealer@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name (optional)</Label>
              <Input id="companyName" placeholder="ABC Equipment Co." value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={loading} />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Invitation
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
