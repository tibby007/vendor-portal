'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Bell } from 'lucide-react'

interface NotificationSettingsProps {
  userId: string
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    emailNewDeal: true,
    emailDealUpdate: true,
    emailNewMessage: true,
    emailDocumentUploaded: true,
    emailWeeklyDigest: false,
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
    // In a real app, you'd save this to the database
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
              <Label htmlFor="emailNewDeal">New Deal Submissions</Label>
              <p className="text-sm text-gray-500">
                Receive an email when a vendor submits a new deal
              </p>
            </div>
            <Switch
              id="emailNewDeal"
              checked={settings.emailNewDeal}
              onCheckedChange={() => handleToggle('emailNewDeal')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailDealUpdate">Deal Status Updates</Label>
              <p className="text-sm text-gray-500">
                Receive an email when a deal status changes
              </p>
            </div>
            <Switch
              id="emailDealUpdate"
              checked={settings.emailDealUpdate}
              onCheckedChange={() => handleToggle('emailDealUpdate')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNewMessage">New Messages</Label>
              <p className="text-sm text-gray-500">
                Receive an email when you get a new message
              </p>
            </div>
            <Switch
              id="emailNewMessage"
              checked={settings.emailNewMessage}
              onCheckedChange={() => handleToggle('emailNewMessage')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailDocumentUploaded">Document Uploads</Label>
              <p className="text-sm text-gray-500">
                Receive an email when documents are uploaded
              </p>
            </div>
            <Switch
              id="emailDocumentUploaded"
              checked={settings.emailDocumentUploaded}
              onCheckedChange={() => handleToggle('emailDocumentUploaded')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailWeeklyDigest">Weekly Digest</Label>
              <p className="text-sm text-gray-500">
                Receive a weekly summary of all activity
              </p>
            </div>
            <Switch
              id="emailWeeklyDigest"
              checked={settings.emailWeeklyDigest}
              onCheckedChange={() => handleToggle('emailWeeklyDigest')}
            />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Note: Email notification delivery requires email service configuration.
            These settings will take effect once email services are enabled.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
