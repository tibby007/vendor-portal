'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Check, Building, User, DollarSign, FileText, ArrowLeft, ArrowRight } from 'lucide-react'
import { BusinessInfoForm } from './BusinessInfoForm'
import { OwnerInfoForm } from './OwnerInfoForm'
import { FinancingRequestForm } from './FinancingRequestForm'
import { DocumentUpload } from './DocumentUpload'
import { ApplicationReview } from './ApplicationReview'

export interface ApplicationData {
  // Business Information
  business_legal_name: string
  business_dba: string
  business_address: string
  business_phone: string
  business_email: string
  business_ein: string
  business_established_date: string
  entity_type: string
  state_of_incorporation: string
  industry: string
  annual_revenue: string
  // Owner/Guarantor Information
  owner_full_name: string
  owner_title: string
  owner_ownership_percentage: string
  owner_address: string
  owner_dob: string
  owner_ssn: string
  owner_phone: string
  // Financing Request
  amount_requested: string
  financing_type: string
  equipment_description: string
  equipment_vendor_name: string
  is_new_equipment: string
  preferred_term_months: string
  use_of_funds: string
}

const initialData: ApplicationData = {
  business_legal_name: '',
  business_dba: '',
  business_address: '',
  business_phone: '',
  business_email: '',
  business_ein: '',
  business_established_date: '',
  entity_type: '',
  state_of_incorporation: '',
  industry: '',
  annual_revenue: '',
  owner_full_name: '',
  owner_title: '',
  owner_ownership_percentage: '',
  owner_address: '',
  owner_dob: '',
  owner_ssn: '',
  owner_phone: '',
  amount_requested: '',
  financing_type: '',
  equipment_description: '',
  equipment_vendor_name: '',
  is_new_equipment: '',
  preferred_term_months: '',
  use_of_funds: '',
}

interface ApplicationFormProps {
  vendorId: string
  brokerId: string
  existingDealId?: string
  redirectBasePath?: string
}

export function ApplicationForm({
  vendorId,
  brokerId,
  existingDealId,
  redirectBasePath = '/dashboard/deals',
}: ApplicationFormProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<ApplicationData>(initialData)
  const [uploadedDocs, setUploadedDocs] = useState<Array<{ id: string; name: string; category: string }>>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dealId, setDealId] = useState<string | null>(existingDealId || null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const steps = [
    { number: 1, title: 'Business Info', icon: Building },
    { number: 2, title: 'Owner Info', icon: User },
    { number: 3, title: 'Financing', icon: DollarSign },
    { number: 4, title: 'Documents', icon: FileText },
    { number: 5, title: 'Review', icon: Check },
  ]

  const progress = (step / steps.length) * 100

  // Load existing deal data if editing
  useEffect(() => {
    if (existingDealId) {
      loadExistingDeal()
    }
  }, [existingDealId])

  const loadExistingDeal = async () => {
    if (!existingDealId) return

    const { data: deal } = await supabase
      .from('deals')
      .select('*')
      .eq('id', existingDealId)
      .single()

    if (deal) {
      setFormData({
        business_legal_name: deal.business_legal_name || '',
        business_dba: deal.business_dba || '',
        business_address: deal.business_address || '',
        business_phone: deal.business_phone || '',
        business_email: deal.business_email || '',
        business_ein: deal.business_ein || '',
        business_established_date: deal.business_established_date || '',
        entity_type: deal.entity_type || '',
        state_of_incorporation: deal.state_of_incorporation || '',
        industry: deal.industry || '',
        annual_revenue: deal.annual_revenue?.toString() || '',
        owner_full_name: deal.owner_full_name || '',
        owner_title: deal.owner_title || '',
        owner_ownership_percentage: deal.owner_ownership_percentage?.toString() || '',
        owner_address: deal.owner_address || '',
        owner_dob: deal.owner_dob || '',
        owner_ssn: '',
        owner_phone: deal.owner_phone || '',
        amount_requested: deal.amount_requested?.toString() || '',
        financing_type: deal.financing_type || '',
        equipment_description: deal.equipment_description || '',
        equipment_vendor_name: deal.equipment_vendor_name || '',
        is_new_equipment: deal.is_new_equipment?.toString() || '',
        preferred_term_months: deal.preferred_term_months?.toString() || '',
        use_of_funds: deal.use_of_funds || '',
      })
      setDealId(existingDealId)
    }

    // Load existing documents
    const { data: docs } = await supabase
      .from('deal_documents')
      .select('id, file_name, document_category')
      .eq('deal_id', existingDealId)

    if (docs) {
      setUploadedDocs(docs.map(d => ({
        id: d.id,
        name: d.file_name,
        category: d.document_category,
      })))
    }
  }

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!formData.business_legal_name) return

    setSaving(true)
    try {
      // Get the first stage (New Submission) for this broker
      const { data: stages } = await supabase
        .from('kanban_stages')
        .select('id')
        .eq('broker_id', brokerId)
        .eq('name', 'New Submission')
        .single()

      if (!stages) return

      const dealData = {
        vendor_id: vendorId,
        broker_id: brokerId,
        stage_id: stages.id,
        business_legal_name: formData.business_legal_name,
        business_dba: formData.business_dba || null,
        business_address: formData.business_address,
        business_phone: formData.business_phone,
        business_email: formData.business_email,
        business_ein: formData.business_ein,
        business_established_date: formData.business_established_date || null,
        entity_type: formData.entity_type || 'other',
        state_of_incorporation: formData.state_of_incorporation || null,
        industry: formData.industry || null,
        annual_revenue: formData.annual_revenue ? parseFloat(formData.annual_revenue) : null,
        owner_full_name: formData.owner_full_name,
        owner_title: formData.owner_title || null,
        owner_ownership_percentage: formData.owner_ownership_percentage ? parseFloat(formData.owner_ownership_percentage) : null,
        owner_address: formData.owner_address || null,
        owner_dob: formData.owner_dob || null,
        owner_phone: formData.owner_phone || null,
        amount_requested: formData.amount_requested ? parseFloat(formData.amount_requested) : 0,
        financing_type: formData.financing_type || 'equipment',
        equipment_description: formData.equipment_description || null,
        equipment_vendor_name: formData.equipment_vendor_name || null,
        is_new_equipment: formData.is_new_equipment === 'true' ? true : formData.is_new_equipment === 'false' ? false : null,
        preferred_term_months: formData.preferred_term_months ? parseInt(formData.preferred_term_months) : null,
        use_of_funds: formData.use_of_funds || null,
      }

      if (dealId) {
        await supabase
          .from('deals')
          .update(dealData)
          .eq('id', dealId)
      } else {
        const { data: newDeal } = await supabase
          .from('deals')
          .insert(dealData)
          .select('id')
          .single()

        if (newDeal) {
          setDealId(newDeal.id)
        }
      }

      setLastSaved(new Date())
    } catch (err) {
      console.error('Auto-save error:', err)
    } finally {
      setSaving(false)
    }
  }, [formData, dealId, vendorId, brokerId, supabase])

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (formData.business_legal_name) {
        autoSave()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [autoSave, formData.business_legal_name])

  const updateFormData = (data: Partial<ApplicationData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleNext = async () => {
    if (step < steps.length) {
      await autoSave()
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      await autoSave()

      // Mark as submitted
      if (dealId) {
        await supabase
          .from('deals')
          .update({ submitted_at: new Date().toISOString() })
          .eq('id', dealId)
      }

      router.push(redirectBasePath)
      router.refresh()
    } catch {
      setError('Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!(
          formData.business_legal_name &&
          formData.business_address &&
          formData.business_phone &&
          formData.business_email &&
          formData.business_ein &&
          formData.entity_type
        )
      case 2:
        return !!(formData.owner_full_name)
      case 3:
        return !!(formData.amount_requested && formData.financing_type)
      case 4:
        return true // Documents are optional but encouraged
      case 5:
        return true
      default:
        return false
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">New Financing Application</h1>
          {saving && (
            <span className="text-sm text-gray-500 flex items-center">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Saving...
            </span>
          )}
          {!saving && lastSaved && (
            <span className="text-sm text-gray-500">
              Last saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>

        <Progress value={progress} className="h-2 mb-4" />

        <div className="flex justify-between">
          {steps.map((s) => (
            <div
              key={s.number}
              className={`flex flex-col items-center ${
                step >= s.number ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 mb-1 ${
                  step > s.number
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : step === s.number
                    ? 'border-blue-600 text-blue-600'
                    : 'border-gray-300'
                }`}
              >
                {step > s.number ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <s.icon className="h-5 w-5" />
                )}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form Steps */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[step - 1].title}</CardTitle>
          <CardDescription>
            {step === 1 && 'Enter the business details for this financing application'}
            {step === 2 && 'Provide information about the primary owner or guarantor'}
            {step === 3 && 'Specify the financing amount and terms you are requesting'}
            {step === 4 && 'Upload supporting documents for your application'}
            {step === 5 && 'Review your application before submitting'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <BusinessInfoForm data={formData} onChange={updateFormData} />
          )}
          {step === 2 && (
            <OwnerInfoForm data={formData} onChange={updateFormData} />
          )}
          {step === 3 && (
            <FinancingRequestForm data={formData} onChange={updateFormData} />
          )}
          {step === 4 && (
            <DocumentUpload
              dealId={dealId}
              uploadedDocs={uploadedDocs}
              onDocsChange={setUploadedDocs}
            />
          )}
          {step === 5 && (
            <ApplicationReview data={formData} documents={uploadedDocs} />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {step < steps.length ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed() || loading}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Submit Application
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
