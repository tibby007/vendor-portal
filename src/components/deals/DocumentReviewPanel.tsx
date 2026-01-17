'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Clock,
  AlertCircle,
} from 'lucide-react'
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

interface DocumentReviewPanelProps {
  documents: Document[]
  dealId: string
  onDocumentUpdated: () => void
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

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending: {
    color: 'bg-gray-100 text-gray-800',
    icon: <Clock className="h-3 w-3" />,
    label: 'Pending Review',
  },
  reviewed: {
    color: 'bg-blue-100 text-blue-800',
    icon: <Eye className="h-3 w-3" />,
    label: 'Reviewed',
  },
  accepted: {
    color: 'bg-green-100 text-green-800',
    icon: <CheckCircle className="h-3 w-3" />,
    label: 'Accepted',
  },
  needs_revision: {
    color: 'bg-red-100 text-red-800',
    icon: <AlertCircle className="h-3 w-3" />,
    label: 'Needs Revision',
  },
}

export function DocumentReviewPanel({
  documents,
  dealId,
  onDocumentUpdated,
}: DocumentReviewPanelProps) {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'accept' | 'reject' | null>(null)

  const supabase = createClient()

  const handleOpenReview = (doc: Document, action: 'accept' | 'reject') => {
    setSelectedDoc(doc)
    setReviewNotes(doc.notes || '')
    setActionType(action)
    setDialogOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedDoc || !actionType) return

    setIsUpdating(true)
    try {
      const newStatus = actionType === 'accept' ? 'accepted' : 'needs_revision'

      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('deal_documents')
        .update({
          status: newStatus,
          notes: reviewNotes || null,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', selectedDoc.id)

      if (error) throw error

      toast.success(
        actionType === 'accept'
          ? 'Document accepted successfully'
          : 'Document marked as needs revision'
      )

      setDialogOpen(false)
      setSelectedDoc(null)
      setReviewNotes('')
      setActionType(null)
      onDocumentUpdated()
    } catch (error) {
      console.error('Error updating document:', error)
      toast.error('Failed to update document status')
    } finally {
      setIsUpdating(false)
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

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>No documents uploaded</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {documents.map((doc) => {
          const status = statusConfig[doc.status] || statusConfig.pending

          return (
            <div
              key={doc.id}
              className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <p className="text-sm font-medium truncate">{doc.file_name}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500">
                      {documentCategoryLabels[doc.document_category] || doc.document_category}
                    </span>
                    <Badge className={`text-xs flex items-center gap-1 ${status.color}`}>
                      {status.icon}
                      {status.label}
                    </Badge>
                  </div>
                  {doc.notes && (
                    <p className="text-xs text-gray-600 mt-2 italic">
                      Note: {doc.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    title="View/Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {doc.status !== 'accepted' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleOpenReview(doc, 'accept')}
                      title="Accept"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  {doc.status !== 'needs_revision' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleOpenReview(doc, 'reject')}
                      title="Request Revision"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'accept' ? 'Accept Document' : 'Request Revision'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'accept'
                ? 'Confirm that this document meets the requirements.'
                : 'Explain what changes or additional information is needed.'}
            </DialogDescription>
          </DialogHeader>

          {selectedDoc && (
            <div className="py-4">
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="font-medium text-sm">{selectedDoc.file_name}</p>
                <p className="text-xs text-gray-500">
                  {documentCategoryLabels[selectedDoc.document_category] || selectedDoc.document_category}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {actionType === 'accept' ? 'Notes (optional)' : 'Revision Notes (required)'}
                </label>
                <Textarea
                  placeholder={
                    actionType === 'accept'
                      ? 'Add any notes about this document...'
                      : 'Describe what needs to be corrected or provided...'
                  }
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={isUpdating || (actionType === 'reject' && !reviewNotes.trim())}
              className={
                actionType === 'accept'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {isUpdating
                ? 'Updating...'
                : actionType === 'accept'
                ? 'Accept Document'
                : 'Request Revision'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
