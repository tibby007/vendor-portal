'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ApplicationData } from './ApplicationForm'

interface BusinessInfoFormProps {
  data: ApplicationData
  onChange: (data: Partial<ApplicationData>) => void
}

const entityTypes = [
  { value: 'llc', label: 'LLC' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'other', label: 'Other' },
]

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
]

const industries = [
  'Agriculture', 'Automotive', 'Construction', 'Education', 'Energy', 'Entertainment',
  'Financial Services', 'Food & Beverage', 'Healthcare', 'Hospitality', 'Information Technology',
  'Manufacturing', 'Professional Services', 'Real Estate', 'Retail', 'Transportation',
  'Wholesale', 'Other'
]

export function BusinessInfoForm({ data, onChange }: BusinessInfoFormProps) {
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
  }

  const formatEIN = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 2) return numbers
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 9)}`
  }

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (!numbers) return ''
    return parseInt(numbers).toLocaleString()
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="business_legal_name">Legal Business Name *</Label>
          <Input
            id="business_legal_name"
            value={data.business_legal_name}
            onChange={(e) => onChange({ business_legal_name: e.target.value })}
            placeholder="ABC Company LLC"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="business_dba">DBA (if applicable)</Label>
          <Input
            id="business_dba"
            value={data.business_dba}
            onChange={(e) => onChange({ business_dba: e.target.value })}
            placeholder="Doing Business As"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="business_address">Business Address *</Label>
        <Input
          id="business_address"
          value={data.business_address}
          onChange={(e) => onChange({ business_address: e.target.value })}
          placeholder="123 Main St, City, State 12345"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="business_phone">Business Phone *</Label>
          <Input
            id="business_phone"
            value={data.business_phone}
            onChange={(e) => onChange({ business_phone: formatPhone(e.target.value) })}
            placeholder="(555) 123-4567"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="business_email">Business Email *</Label>
          <Input
            id="business_email"
            type="email"
            value={data.business_email}
            onChange={(e) => onChange({ business_email: e.target.value })}
            placeholder="contact@company.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="business_ein">Federal Tax ID (EIN) *</Label>
          <Input
            id="business_ein"
            value={data.business_ein}
            onChange={(e) => onChange({ business_ein: formatEIN(e.target.value) })}
            placeholder="XX-XXXXXXX"
            maxLength={10}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="business_established_date">Date Business Established</Label>
          <Input
            id="business_established_date"
            type="date"
            value={data.business_established_date}
            onChange={(e) => onChange({ business_established_date: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="entity_type">Entity Type *</Label>
          <Select
            value={data.entity_type}
            onValueChange={(value) => onChange({ entity_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select entity type" />
            </SelectTrigger>
            <SelectContent>
              {entityTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="state_of_incorporation">State of Incorporation</Label>
          <Select
            value={data.state_of_incorporation}
            onValueChange={(value) => onChange({ state_of_incorporation: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="industry">Industry/Business Type</Label>
          <Select
            value={data.industry}
            onValueChange={(value) => onChange({ industry: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="annual_revenue">Annual Revenue</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <Input
              id="annual_revenue"
              value={data.annual_revenue}
              onChange={(e) => onChange({ annual_revenue: formatCurrency(e.target.value) })}
              placeholder="0"
              className="pl-7"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
