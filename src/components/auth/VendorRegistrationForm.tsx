'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Building, CheckCircle2, XCircle } from 'lucide-react'
import { validatePassword, getPasswordRequirements } from '@/lib/validation'
import type { VendorInvitation, Broker } from '@/types/database'

interface VendorRegistrationFormProps {
  invitation: VendorInvitation & { broker: Pick<Broker, 'id' | 'company_name' | 'logo_url'> | null }
  brokerName: string
}

export function VendorRegistrationForm({ invitation, brokerName }: VendorRegistrationFormProps) {
  const [formData, setFormData] = useState({
    email: invitation.email,
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: invitation.company_name || '',
    phone: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error)
      return
    }

    setLoading(true)

    try {
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: 'vendor',
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (!authData.user) {
        setError('Failed to create account')
        return
      }

      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: formData.email,
        role: 'vendor',
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone || null,
      })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        setError('Failed to create profile')
        return
      }

      // Create vendor record linked to broker
      const { error: vendorError } = await supabase.from('vendors').insert({
        profile_id: authData.user.id,
        broker_id: invitation.broker?.id,
        company_name: formData.companyName,
        status: 'active',
      })

      if (vendorError) {
        console.error('Vendor creation error:', vendorError)
        setError('Failed to create vendor account')
        return
      }

      // Mark invitation as accepted
      await supabase
        .from('vendor_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id)

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Building className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Join {brokerName}</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join the Vendor Portal
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                placeholder="Your Company Name"
                value={formData.companyName}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                readOnly
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                This email was specified in your invitation
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
              {formData.password && (
                <div className="text-xs space-y-1 mt-2">
                  {getPasswordRequirements().map((req, idx) => {
                    const checks = [
                      formData.password.length >= 12,
                      /[a-z]/.test(formData.password),
                      /[A-Z]/.test(formData.password),
                      /[0-9]/.test(formData.password),
                      /[^a-zA-Z0-9]/.test(formData.password),
                    ]
                    const passed = checks[idx]
                    return (
                      <div key={req} className={`flex items-center gap-1 ${passed ? 'text-green-600' : 'text-gray-400'}`}>
                        {passed ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        <span>{req}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>

            <p className="text-xs text-center text-gray-500">
              By creating an account, you agree to work with {brokerName} through
              this platform.
            </p>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
