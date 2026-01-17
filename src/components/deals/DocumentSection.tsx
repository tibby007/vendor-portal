'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DocumentReviewPanel } from './DocumentReviewPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Document {
  id: string
  file_name: string
  file_path: string
  document_category: string
  status: string
  notes: string | null
  created_at: string
  reviewed_at: string | null
}

interface DocumentSectionProps {
  dealId: string
  isBroker: boolean
  initialDocuments: Document[]
}

const documentCategoryLabels: Record<string, string> = {
  invoice: 'Invoice/Quote',
  bank_statements: 'Bank Statements',
  tax_returns: 'Business Tax Returns',
  drivers_license: "Driver's License",
  voided_check: 'Voided Check',
  financial_statements: 'Financial Statements',
  other: 'Other',
}

const getDocStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    reviewed: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    needs_revision: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function DocumentSection({ dealId, isBroker, initialDocuments }: DocumentSectionProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const supabase = createClient()

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('deal_documents')
      .select('id, file_name, file_path, document_category, status, notes, created_at, reviewed_at')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setDocuments(data)
    }
  }

  const handleDownload = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('deal-documents')
        .createSignedUrl(doc.file_path, 60)

      if (error) throw error
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank')
      }
    } catch (error) {
      console.error('Error downloading document:', error)
      toast.error('Failed to download document')
    }
  }

  // Set up real-time subscription for document updates
  useEffect(() => {
    const channel = supabase
      .channel(`documents-${dealId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deal_documents',
          filter: `deal_id=eq.${dealId}`,
        },
        () => {
          fetchDocuments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dealId])

  if (isBroker) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2 text-orange-500" />
            Document Review ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentReviewPanel
            documents={documents}
            dealId={dealId}
            onDocumentUpdated={fetchDocuments}
          />
        </CardContent>
      </Card>
    )
  }

  // Vendor view - simple document list
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <FileText className="h-5 w-5 mr-2 text-orange-500" />
          Documents ({documents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-sm text-gray-500">No documents uploaded</p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{doc.file_name}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {documentCategoryLabels[doc.document_category] || doc.document_category}
                    </span>
                    <Badge className={`text-xs ${getDocStatusColor(doc.status)}`}>
                      {doc.status === 'needs_revision' ? 'Needs Revision' : doc.status}
                    </Badge>
                  </div>
                  {doc.status === 'needs_revision' && doc.notes && (
                    <p className="text-xs text-red-600 mt-1">
                      {doc.notes}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(doc)}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Link href={`/dashboard/deals/${dealId}/edit`}>
          <Button variant="outline" size="sm" className="w-full mt-4">
            <FileText className="h-4 w-4 mr-2" />
            Manage Documents
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
