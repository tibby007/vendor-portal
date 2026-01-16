'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { ApplicationData } from './ApplicationForm'

interface FinancingRequestFormProps {
  data: ApplicationData
  onChange: (data: Partial<ApplicationData>) => void
}

const financingTypes = [
  { value: 'equipment', label: 'Equipment Financing' },
  { value: 'working_capital', label: 'Working Capital' },
  { value: 'both', label: 'Both' },
]

const termOptions = [
  { value: '12', label: '12 months' },
  { value: '24', label: '24 months' },
  { value: '36', label: '36 months' },
  { value: '48', label: '48 months' },
  { value: '60', label: '60 months' },
  { value: '72', label: '72 months' },
]

export function FinancingRequestForm({ data, onChange }: FinancingRequestFormProps) {
  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (!numbers) return ''
    return parseInt(numbers).toLocaleString()
  }

  const showEquipmentFields = data.financing_type === 'equipment' || data.financing_type === 'both'
  const showWorkingCapitalFields = data.financing_type === 'working_capital' || data.financing_type === 'both'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount_requested">Amount Requested *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <Input
              id="amount_requested"
              value={data.amount_requested}
              onChange={(e) => onChange({ amount_requested: formatCurrency(e.target.value) })}
              placeholder="0"
              className="pl-7"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="financing_type">Financing Type *</Label>
          <Select
            value={data.financing_type}
            onValueChange={(value) => onChange({ financing_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select financing type" />
            </SelectTrigger>
            <SelectContent>
              {financingTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {showEquipmentFields && (
        <>
          <div className="p-4 bg-blue-50 rounded-lg space-y-4">
            <h3 className="font-medium text-blue-900">Equipment Details</h3>

            <div className="space-y-2">
              <Label htmlFor="equipment_description">Equipment Description</Label>
              <Textarea
                id="equipment_description"
                value={data.equipment_description}
                onChange={(e) => onChange({ equipment_description: e.target.value })}
                placeholder="Describe the equipment (make, model, year, specifications)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipment_vendor_name">Equipment Vendor/Seller</Label>
                <Input
                  id="equipment_vendor_name"
                  value={data.equipment_vendor_name}
                  onChange={(e) => onChange({ equipment_vendor_name: e.target.value })}
                  placeholder="Vendor company name"
                />
              </div>

              <div className="space-y-2">
                <Label>Equipment Condition</Label>
                <RadioGroup
                  value={data.is_new_equipment}
                  onValueChange={(value) => onChange({ is_new_equipment: value })}
                  className="flex space-x-4 pt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="new" />
                    <Label htmlFor="new" className="font-normal">New</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="used" />
                    <Label htmlFor="used" className="font-normal">Used</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </>
      )}

      {showWorkingCapitalFields && (
        <div className="p-4 bg-green-50 rounded-lg space-y-4">
          <h3 className="font-medium text-green-900">Working Capital Details</h3>

          <div className="space-y-2">
            <Label htmlFor="use_of_funds">Use of Funds</Label>
            <Textarea
              id="use_of_funds"
              value={data.use_of_funds}
              onChange={(e) => onChange({ use_of_funds: e.target.value })}
              placeholder="Describe how the funds will be used (inventory, payroll, expansion, etc.)"
              rows={3}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="preferred_term_months">Preferred Term Length</Label>
        <Select
          value={data.preferred_term_months}
          onValueChange={(value) => onChange({ preferred_term_months: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select preferred term" />
          </SelectTrigger>
          <SelectContent>
            {termOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Final term will be determined based on approval
        </p>
      </div>
    </div>
  )
}
