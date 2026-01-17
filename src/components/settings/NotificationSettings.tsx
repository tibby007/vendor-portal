'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Bell, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationSettingsProps {
  userId: string
}

interface NotificationPreferences {
  email_new_deal: boolean
  email_deal_update: boolean
  email_new_message: boolean
  email_document_uploaded: boolean
  email_weekly_digest: boolean
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationPreferences>({
    email_new_deal: true,
    email_deal_update: true,
    email_new_message: true,
    email_document_uploaded: true,
    email_weekly_digest: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function fetchPreferences() {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (data && !error) {
        setSettings({
          email_new_deal: data.email_new_deal,
          email_deal_update: data.email_deal_update,
          email_new_message: data.email_new_message,
          email_document_uploaded: data.email_document_uploaded,
          email_weekly_digest: data.email_weekly_digest,
        })
      }
      setLoading(false)
    }

    fetchPreferences()
  }, [userId])

  const handleToggle = async (key: keyof NotificationPreferences) => {
    const newValue = !settings[key]
    setSettings((prev) => ({ ...prev, [key]: newValue }))
    setSaving(true)

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        [key]: newValue,
      }, { onConflict: 'user_id' })

    if (error) {
      // Revert on error
      setSettings((prev) => ({ ...prev, [key]: !newValue }))
      toast.error('Failed to save preference')
    } else {
      toast.success('Preference saved')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Email Notifications
        </CardTitle>
        <CardDescription>
          Choose which email notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_new_deal">New Deal Submissions</Label>
              <p className="text-sm text-gray-500">
                Receive an email when a vendor submits a new deal
              </p>
            </div>
            <Switch
              id="email_new_deal"
              checked={settings.email_new_deal}
              onCheckedChange={() => handleToggle('email_new_deal')}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_deal_update">Deal Status Updates</Label>
              <p className="text-sm text-gray-500">
                Receive an email when a deal status changes
              </p>
            </div>
            <Switch
              id="email_deal_update"
              checked={settings.email_deal_update}
              onCheckedChange={() => handleToggle('email_deal_update')}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_new_message">New Messages</Label>
              <p className="text-sm text-gray-500">
                Receive an email when you get a new message
              </p>
            </div>
            <Switch
              id="email_new_message"
              checked={settings.email_new_message}
              onCheckedChange={() => handleToggle('email_new_message')}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_document_uploaded">Document Uploads</Label>
              <p className="text-sm text-gray-500">
                Receive an email when documents are uploaded
              </p>
            </div>
            <Switch
              id="email_document_uploaded"
              checked={settings.email_document_uploaded}
              onCheckedChange={() => handleToggle('email_document_uploaded')}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_weekly_digest">Weekly Digest</Label>
              <p className="text-sm text-gray-500">
                Receive a weekly summary of all activity
              </p>
            </div>
            <Switch
              id="email_weekly_digest"
              checked={settings.email_weekly_digest}
              onCheckedChange={() => handleToggle('email_weekly_digest')}
              disabled={saving}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
