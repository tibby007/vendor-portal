'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Building, User, DollarSign, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import type { ApplicationData } from './ApplicationForm'

interface UploadedDoc {
  id: string
  name: string
  category: string
}

interface ApplicationReviewProps {
  data: ApplicationData
  documents: UploadedDoc[]
}

const documentCategories = [
  { value: 'invoice', label: 'Invoice/Quote', required: true },
  { value: 'bank_statements', label: 'Bank Statements', required: true },
  { value: 'tax_returns', label: 'Business Tax Returns', required: false },
  { value: 'drivers_license', label: "Driver's License", required: false },
  { value: 'voided_check', label: 'Voided Check', required: false },
  { value: 'financial_statements', label: 'Financial Statements', required: false },
  { value: 'other', label: 'Other', required: false },
]

const entityTypeLabels: Record<string, string> = {
  llc: 'LLC',
  corporation: 'Corporation',
  sole_proprietorship: 'Sole Proprietorship',
  partnership: 'Partnership',
  other: 'Other',
}

const financingTypeLabels: Record<string, string> = {
  equipment: 'Equipment Financing',
  working_capital: 'Working Capital',
  both: 'Both',
}

export function ApplicationReview({ data, documents }: ApplicationReviewProps) {
  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value
    if (isNaN(num)) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(num)
  }

  const getCategoryLabel = (value: string) => {
    return documentCategories.find(c => c.value === value)?.label || value
  }

  const requiredDocs = documentCategories.filter(c => c.required)
  const missingRequiredDocs = requiredDocs.filter(
    cat => !documents.some(d => d.category === cat.value)
  )

  return (
    <div className="space-y-6">
      {/* Summary Alert */}
      {missingRequiredDocs.length > 0 ? (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <p className="font-medium text-orange-800">Missing Documents</p>
              <p className="text-sm text-orange-700 mt-1">
                The following documents are recommended: {missingRequiredDocs.map(d => d.label).join(', ')}
              </p>
              <p className="text-xs text-orange-600 mt-2">
                You can still submit, but this may delay processing
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium text-green-800">Application Ready</p>
              <p className="text-sm text-green-700">
                All required information and documents have been provided
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Business Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Building className="h-5 w-5 mr-2 text-blue-500" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500">Legal Name:</span>
              <p className="font-medium">{data.business_legal_name || '-'}</p>
            </div>
            {data.business_dba && (
              <div>
                <span className="text-gray-500">DBA:</span>
                <p className="font-medium">{data.business_dba}</p>
              </div>
            )}
            <div className="col-span-2">
              <span className="text-gray-500">Address:</span>
              <p className="font-medium">{data.business_address || '-'}</p>
            </div>
            <div>
              <span className="text-gray-500">Phone:</span>
              <p className="font-medium">{data.business_phone || '-'}</p>
            </div>
            <div>
              <span className="text-gray-500">Email:</span>
              <p className="font-medium">{data.business_email || '-'}</p>
            </div>
            <div>
              <span className="text-gray-500">EIN:</span>
              <p className="font-medium">{data.business_ein || '-'}</p>
            </div>
            <div>
              <span className="text-gray-500">Entity Type:</span>
              <p className="font-medium">{entityTypeLabels[data.entity_type] || '-'}</p>
            </div>
            {data.state_of_incorporation && (
              <div>
                <span className="text-gray-500">State:</span>
                <p className="font-medium">{data.state_of_incorporation}</p>
              </div>
            )}
            {data.industry && (
              <div>
                <span className="text-gray-500">Industry:</span>
                <p className="font-medium">{data.industry}</p>
              </div>
            )}
            {data.annual_revenue && (
              <div>
                <span className="text-gray-500">Annual Revenue:</span>
                <p className="font-medium">{formatCurrency(data.annual_revenue)}</p>
              </div>
            )}
            {data.business_established_date && (
              <div>
                <span className="text-gray-500">Established:</span>
                <p className="font-medium">{new Date(data.business_established_date).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Owner Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <User className="h-5 w-5 mr-2 text-purple-500" />
            Owner/Guarantor Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500">Full Name:</span>
              <p className="font-medium">{data.owner_full_name || '-'}</p>
            </div>
            {data.owner_title && (
              <div>
                <span className="text-gray-500">Title:</span>
                <p className="font-medium">{data.owner_title}</p>
              </div>
            )}
            {data.owner_ownership_percentage && (
              <div>
                <span className="text-gray-500">Ownership:</span>
                <p className="font-medium">{data.owner_ownership_percentage}%</p>
              </div>
            )}
            {data.owner_phone && (
              <div>
                <span className="text-gray-500">Phone:</span>
                <p className="font-medium">{data.owner_phone}</p>
              </div>
            )}
            {data.owner_address && (
              <div className="col-span-2">
                <span className="text-gray-500">Address:</span>
                <p className="font-medium">{data.owner_address}</p>
              </div>
            )}
            {data.owner_dob && (
              <div>
                <span className="text-gray-500">Date of Birth:</span>
                <p className="font-medium">{new Date(data.owner_dob).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <span className="text-gray-500">SSN:</span>
              <p className="font-medium">{data.owner_ssn ? '***-**-' + data.owner_ssn.slice(-4) : '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financing Request */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-500" />
            Financing Request
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500">Amount Requested:</span>
              <p className="font-medium text-lg">{formatCurrency(data.amount_requested)}</p>
            </div>
            <div>
              <span className="text-gray-500">Financing Type:</span>
              <p className="font-medium">
                <Badge variant="secondary">
                  {financingTypeLabels[data.financing_type] || '-'}
                </Badge>
              </p>
            </div>
            {data.preferred_term_months && (
              <div>
                <span className="text-gray-500">Preferred Term:</span>
                <p className="font-medium">{data.preferred_term_months} months</p>
              </div>
            )}
          </div>

          {(data.financing_type === 'equipment' || data.financing_type === 'both') && data.equipment_description && (
            <>
              <Separator className="my-3" />
              <div className="space-y-2">
                <span className="text-sm text-gray-500">Equipment Details:</span>
                <p className="text-sm">{data.equipment_description}</p>
                {data.equipment_vendor_name && (
                  <p className="text-sm">
                    <span className="text-gray-500">Vendor:</span> {data.equipment_vendor_name}
                  </p>
                )}
                {data.is_new_equipment && (
                  <p className="text-sm">
                    <span className="text-gray-500">Condition:</span> {data.is_new_equipment === 'true' ? 'New' : 'Used'}
                  </p>
                )}
              </div>
            </>
          )}

          {(data.financing_type === 'working_capital' || data.financing_type === 'both') && data.use_of_funds && (
            <>
              <Separator className="my-3" />
              <div className="space-y-2">
                <span className="text-sm text-gray-500">Use of Funds:</span>
                <p className="text-sm">{data.use_of_funds}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2 text-orange-500" />
            Uploaded Documents ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-gray-500">No documents uploaded</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between text-sm py-2 px-3 bg-gray-50 rounded"
                >
                  <span className="font-medium truncate max-w-[200px]">{doc.name}</span>
                  <Badge variant="outline">{getCategoryLabel(doc.category)}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Notice */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm">
        <p className="font-medium text-blue-800 mb-2">What happens next?</p>
        <ol className="list-decimal list-inside text-blue-700 space-y-1">
          <li>Your application will be reviewed by your broker</li>
          <li>You may be contacted for additional information</li>
          <li>You&apos;ll receive updates on your application status</li>
          <li>Once approved, funding documents will be prepared</li>
        </ol>
      </div>
    </div>
  )
}
