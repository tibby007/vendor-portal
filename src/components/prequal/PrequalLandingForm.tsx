'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface RepContact {
  name: string
  title?: string | null
  phone: string
  email?: string | null
  photo_url?: string | null
}

interface PrequalLandingFormProps {
  slug: string
  dealerName: string
  dealerCityState: string
  brokerName: string
  dealerLogoUrl?: string | null
  accentColor?: string
  defaultRep: RepContact | null
}

const equipmentOptions = [
  'Construction equipment',
  'Heavy machinery',
  'Commercial vehicles',
  'Agriculture equipment',
  'Manufacturing equipment',
  'Other',
]

const timeframeOptions = ['Today', 'This week', '30 days']

export function PrequalLandingForm({
  slug,
  dealerName,
  dealerCityState,
  brokerName,
  dealerLogoUrl,
  accentColor = '#F97316',
  defaultRep,
}: PrequalLandingFormProps) {
  const [form, setForm] = useState({
    buyer_name: '',
    buyer_mobile: '',
    buyer_email: '',
    equipment_type: '',
    estimated_amount: '',
    timeframe: 'Today',
    sms_consent: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [rep, setRep] = useState<RepContact | null>(defaultRep)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.buyer_name || !form.buyer_mobile || !form.buyer_email || !form.equipment_type || !form.timeframe) {
      setError('Please fill all required fields.')
      return
    }

    setSubmitting(true)

    const res = await fetch('/api/prequal/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        ...form,
        estimated_amount: form.estimated_amount ? Number(form.estimated_amount) : null,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Failed to submit pre-qualification request.')
      setSubmitting(false)
      return
    }

    setRep(data.rep || defaultRep)
    setSubmitted(true)
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="max-w-xl w-full space-y-4">
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <p className="text-sm text-gray-500">Pre-Qualification Submitted</p>
              <h1 className="text-2xl font-bold text-gray-900">Thanks, {form.buyer_name}.</h1>
              <p className="text-gray-600">
                {rep?.name || 'Our team'} will follow up shortly with next steps.
              </p>

              {rep && (
                <div className="rounded-lg border p-4 text-left max-w-sm mx-auto">
                  <div className="flex items-center gap-3">
                    {rep.photo_url ? (
                      <img src={rep.photo_url} alt={rep.name} className="h-12 w-12 rounded-full object-cover border" />
                    ) : (
                      <div className="h-12 w-12 rounded-full border flex items-center justify-center text-xs text-gray-500">Rep</div>
                    )}
                    <div>
                      <p className="font-semibold">{rep.name}</p>
                      {rep.title && <p className="text-sm text-gray-600">{rep.title}</p>}
                    </div>
                  </div>
                  <p className="text-sm mt-3">{rep.phone}</p>
                  {rep.email && <p className="text-sm">{rep.email}</p>}
                </div>
              )}

              <p className="text-xs text-gray-500">Powered by {brokerName}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto space-y-4">
        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="h-2" style={{ backgroundColor: accentColor }} />
          <div className="p-6 space-y-2">
            <div className="flex items-center gap-3">
              {dealerLogoUrl && (
                <img src={dealerLogoUrl} alt={dealerName} className="h-10 w-10 object-contain border rounded" />
              )}
              <div>
                <p className="font-semibold text-gray-900">{dealerName}</p>
                <p className="text-sm text-gray-600">{dealerCityState}</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-900">Financing options available</p>
            <p className="text-xs text-gray-500">Powered by {brokerName}</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={form.buyer_name} onChange={(e) => setForm((s) => ({ ...s, buyer_name: e.target.value }))} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Mobile *</Label>
                  <Input value={form.buyer_mobile} onChange={(e) => setForm((s) => ({ ...s, buyer_mobile: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={form.buyer_email} onChange={(e) => setForm((s) => ({ ...s, buyer_email: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Equipment Type *</Label>
                <select
                  className="h-10 rounded-md border px-3 text-sm w-full"
                  value={form.equipment_type}
                  onChange={(e) => setForm((s) => ({ ...s, equipment_type: e.target.value }))}
                >
                  <option value="">Select equipment type</option>
                  {equipmentOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Estimated Amount</Label>
                  <Input
                    type="number"
                    value={form.estimated_amount}
                    onChange={(e) => setForm((s) => ({ ...s, estimated_amount: e.target.value }))}
                    placeholder="50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timeframe *</Label>
                  <select
                    className="h-10 rounded-md border px-3 text-sm w-full"
                    value={form.timeframe}
                    onChange={(e) => setForm((s) => ({ ...s, timeframe: e.target.value }))}
                  >
                    {timeframeOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-start gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={form.sms_consent}
                  onChange={(e) => setForm((s) => ({ ...s, sms_consent: e.target.checked }))}
                  className="mt-1"
                />
                I agree to receive text messages about my financing request.
              </label>

              <Button type="submit" disabled={submitting} className="w-full" style={{ backgroundColor: accentColor }}>
                {submitting ? 'Submitting...' : 'Submit Pre-Qual Request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
