'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Upload,
  File,
  FileText,
  Image,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'

interface UploadedDoc {
  id: string
  name: string
  category: string
}

interface DocumentUploadProps {
  dealId: string | null
  uploadedDocs: UploadedDoc[]
  onDocsChange: (docs: UploadedDoc[]) => void
}

const documentCategories = [
  { value: 'invoice', label: 'Invoice/Quote', required: true },
  { value: 'bank_statements', label: 'Bank Statements (3 months)', required: true },
  { value: 'tax_returns', label: 'Business Tax Returns', required: false },
  { value: 'drivers_license', label: "Driver's License", required: false },
  { value: 'voided_check', label: 'Voided Check', required: false },
  { value: 'financial_statements', label: 'Financial Statements', required: false },
  { value: 'other', label: 'Other', required: false },
]

const allowedTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

const maxFileSize = 25 * 1024 * 1024 // 25MB

export function DocumentUpload({ dealId, uploadedDocs, onDocsChange }: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('invoice')
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `File type not supported: ${file.name}`
    }
    if (file.size > maxFileSize) {
      return `File too large (max 25MB): ${file.name}`
    }
    return null
  }

  const uploadFile = async (file: File, category: string) => {
    if (!dealId) {
      setError('Please complete previous steps first to save the application')
      return null
    }

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return null
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${dealId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    try {
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('deal-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw new Error('Failed to upload file')
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      // Create document record
      const { data: docRecord, error: dbError } = await supabase
        .from('deal_documents')
        .insert({
          deal_id: dealId,
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          file_type: file.type,
          document_category: category,
          uploaded_by: user?.id,
        })
        .select('id')
        .single()

      if (dbError) {
        console.error('Database insert error:', dbError)
        throw new Error('Failed to save document record')
      }

      return {
        id: docRecord.id,
        name: file.name,
        category,
      }
    } catch (err) {
      console.error('Upload error:', err)
      return null
    }
  }

  const handleFiles = async (files: FileList | File[]) => {
    setError(null)
    setUploading(true)
    setUploadProgress(0)

    const fileArray = Array.from(files)
    const totalFiles = fileArray.length
    const newDocs: UploadedDoc[] = []

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      const result = await uploadFile(file, selectedCategory)
      if (result) {
        newDocs.push(result)
      }
      setUploadProgress(((i + 1) / totalFiles) * 100)
    }

    if (newDocs.length > 0) {
      onDocsChange([...uploadedDocs, ...newDocs])
    }

    setUploading(false)
    setUploadProgress(0)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [selectedCategory, dealId])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const removeDocument = async (docId: string) => {
    try {
      await supabase
        .from('deal_documents')
        .delete()
        .eq('id', docId)

      onDocsChange(uploadedDocs.filter(d => d.id !== docId))
    } catch (err) {
      console.error('Error removing document:', err)
    }
  }

  const getFileIcon = (category: string) => {
    switch (category) {
      case 'invoice':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'bank_statements':
        return <FileText className="h-5 w-5 text-green-500" />
      case 'drivers_license':
        return <Image className="h-5 w-5 text-purple-500" />
      default:
        return <File className="h-5 w-5 text-gray-500" />
    }
  }

  const getCategoryLabel = (value: string) => {
    return documentCategories.find(c => c.value === value)?.label || value
  }

  const getDocCountByCategory = (category: string) => {
    return uploadedDocs.filter(d => d.category === category).length
  }

  return (
    <div className="space-y-6">
      {/* Document Checklist */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-3">Document Checklist</h3>
        <div className="space-y-2">
          {documentCategories.map((cat) => {
            const count = getDocCountByCategory(cat.value)
            const hasDoc = count > 0
            return (
              <div
                key={cat.value}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center space-x-2">
                  {hasDoc ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : cat.required ? (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span className={hasDoc ? 'text-gray-900' : 'text-gray-600'}>
                    {cat.label}
                    {cat.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                </div>
                {count > 0 && (
                  <span className="text-xs text-gray-500">{count} file(s)</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Category Selection */}
      <div className="space-y-2">
        <Label>Document Type</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {documentCategories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-4">
            <Loader2 className="h-10 w-10 mx-auto text-blue-500 animate-spin" />
            <p className="text-gray-600">Uploading...</p>
            <Progress value={uploadProgress} className="max-w-xs mx-auto" />
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-gray-500">
              PDF, JPG, PNG, DOC, DOCX, XLS, XLSX (max 25MB per file)
            </p>
          </>
        )}
      </div>

      {/* Uploaded Documents */}
      {uploadedDocs.length > 0 && (
        <div className="space-y-2">
          <Label>Uploaded Documents ({uploadedDocs.length})</Label>
          <div className="space-y-2">
            {uploadedDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(doc.category)}
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getCategoryLabel(doc.category)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(doc.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
