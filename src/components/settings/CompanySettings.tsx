'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, Building, Globe } from 'lucide-react'
import type { Broker } from '@/types/database'

interface CompanySettingsProps {
  broker: Broker
}

export function CompanySettings({ broker }: CompanySettingsProps) {
  const [formData, setFormData] = useState({
    company_name: broker.company_name || '',
    company_address: broker.company_address || '',
    company_phone: broker.company_phone || '',
    company_website: broker.company_website || '',
    subdomain: broker.subdomain || '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const { error: updateError } = await supabase
        .from('brokers')
        .update({
          company_name: formData.company_name,
          company_address: formData.company_address || null,
          company_phone: formData.company_phone || null,
          company_website: formData.company_website || null,
          subdomain: formData.subdomain || null,
        })
        .eq('id', broker.id)

      if (updateError) throw updateError

      setSuccess(true)
      router.refresh()
    } catch (err) {
      console.error('Error updating company:', err)
      setError(err instanceof Error ? err.message : 'Failed to update company settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Company Information
          </CardTitle>
          <CardDescription>Update your company details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription>Company settings updated successfully!</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_address">Business Address</Label>
              <Input
                id="company_address"
                name="company_address"
                value={formData.company_address}
                onChange={handleChange}
                placeholder="123 Main St, City, State 12345"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_phone">Business Phone</Label>
                <Input
                  id="company_phone"
                  name="company_phone"
                  type="tel"
                  value={formData.company_phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_website">Website</Label>
                <Input
                  id="company_website"
                  name="company_website"
                  type="url"
                  value={formData.company_website}
                  onChange={handleChange}
                  placeholder="https://www.example.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            White-Label Settings
          </CardTitle>
          <CardDescription>
            Customize your vendor portal branding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subdomain">Custom Subdomain</Label>
              <div className="flex items-center">
                <Input
                  id="subdomain"
                  name="subdomain"
                  value={formData.subdomain}
                  onChange={handleChange}
                  placeholder="yourcompany"
                  disabled={loading}
                  className="rounded-r-none"
                />
                <span className="inline-flex items-center px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-500 text-sm">
                  .vendorportal.com
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Your vendors will access the portal at this custom URL
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Coming Soon</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>- Custom logo upload</li>
                <li>- Brand color customization</li>
                <li>- Custom email templates</li>
                <li>- Custom domain mapping</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
