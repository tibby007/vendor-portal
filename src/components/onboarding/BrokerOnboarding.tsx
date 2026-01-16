'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Building, Check } from 'lucide-react'
import type { Broker } from '@/types/database'

interface BrokerOnboardingProps {
  broker: Broker | null
}

export function BrokerOnboarding({ broker }: BrokerOnboardingProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    company_name: broker?.company_name || '',
    company_address: broker?.company_address || '',
    company_phone: broker?.company_phone || '',
    company_website: broker?.company_website || '',
  })
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error: updateError } = await supabase
        .from('brokers')
        .update({
          ...formData,
          onboarding_completed: true,
        })
        .eq('id', broker?.id)

      if (updateError) {
        setError(updateError.message)
        return
      }

      router.refresh()
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { number: 1, title: 'Company Info' },
    { number: 2, title: 'Contact Details' },
    { number: 3, title: 'Review' },
  ]

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Let&apos;s set up your broker account to get started
          </CardDescription>
        </CardHeader>

        {/* Progress Steps */}
        <div className="px-6 pb-4">
          <div className="flex justify-between">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step > s.number
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : step === s.number
                      ? 'border-blue-600 text-blue-600'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {step > s.number ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    s.number
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${
                      step > s.number ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((s) => (
              <span
                key={s.number}
                className={`text-xs ${
                  step >= s.number ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                {s.title}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="ABC Finance"
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
                <Button
                  type="button"
                  className="w-full mt-4"
                  onClick={() => setStep(2)}
                  disabled={!formData.company_name}
                >
                  Continue
                </Button>
              </>
            )}

            {step === 2 && (
              <>
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
                  <Label htmlFor="company_website">Website (optional)</Label>
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
                <div className="flex space-x-3 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={() => setStep(3)}
                  >
                    Continue
                  </Button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium text-gray-900">Review Your Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Company Name</span>
                      <span className="font-medium">{formData.company_name}</span>
                    </div>
                    {formData.company_address && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Address</span>
                        <span className="font-medium">{formData.company_address}</span>
                      </div>
                    )}
                    {formData.company_phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone</span>
                        <span className="font-medium">{formData.company_phone}</span>
                      </div>
                    )}
                    {formData.company_website && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Website</span>
                        <span className="font-medium">{formData.company_website}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-3 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(2)}
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Complete Setup
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
