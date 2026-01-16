'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield } from 'lucide-react'
import type { ApplicationData } from './ApplicationForm'

interface OwnerInfoFormProps {
  data: ApplicationData
  onChange: (data: Partial<ApplicationData>) => void
}

export function OwnerInfoForm({ data, onChange }: OwnerInfoFormProps) {
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
  }

  const formatSSN = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 5) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 9)}`
  }

  const formatPercentage = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const num = parseInt(numbers)
    if (isNaN(num)) return ''
    return Math.min(100, num).toString()
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Owner/guarantor information is securely encrypted and only used for credit evaluation purposes.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="owner_full_name">Full Legal Name *</Label>
          <Input
            id="owner_full_name"
            value={data.owner_full_name}
            onChange={(e) => onChange({ owner_full_name: e.target.value })}
            placeholder="John Smith"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner_title">Title/Position</Label>
          <Input
            id="owner_title"
            value={data.owner_title}
            onChange={(e) => onChange({ owner_title: e.target.value })}
            placeholder="Owner, CEO, President, etc."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="owner_ownership_percentage">Ownership Percentage</Label>
          <div className="relative">
            <Input
              id="owner_ownership_percentage"
              value={data.owner_ownership_percentage}
              onChange={(e) => onChange({ owner_ownership_percentage: formatPercentage(e.target.value) })}
              placeholder="100"
              className="pr-8"
              maxLength={3}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner_phone">Phone Number</Label>
          <Input
            id="owner_phone"
            value={data.owner_phone}
            onChange={(e) => onChange({ owner_phone: formatPhone(e.target.value) })}
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="owner_address">Home Address</Label>
        <Input
          id="owner_address"
          value={data.owner_address}
          onChange={(e) => onChange({ owner_address: e.target.value })}
          placeholder="123 Home St, City, State 12345"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="owner_dob">Date of Birth</Label>
          <Input
            id="owner_dob"
            type="date"
            value={data.owner_dob}
            onChange={(e) => onChange({ owner_dob: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner_ssn">Social Security Number</Label>
          <Input
            id="owner_ssn"
            value={data.owner_ssn}
            onChange={(e) => onChange({ owner_ssn: formatSSN(e.target.value) })}
            placeholder="XXX-XX-XXXX"
            maxLength={11}
            type="password"
            autoComplete="off"
          />
          <p className="text-xs text-gray-500">
            SSN is encrypted and never stored in plain text
          </p>
        </div>
      </div>
    </div>
  )
}
