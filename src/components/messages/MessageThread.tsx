'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Loader2, Send, Paperclip, X, FileText, Image, File, Download } from 'lucide-react'
import { toast } from 'sonner'

interface Attachment {
  id: string
  file_name: string
  file_path: string
  file_size: number
  file_type: string
}

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  is_read: boolean
  sender: {
    first_name: string | null
    last_name: string | null
    email: string
    role: string
  }
  attachments?: Attachment[]
}

interface MessageThreadProps {
  dealId: string
  currentUserId: string
  initialMessages: Message[]
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

export function MessageThread({ dealId, currentUserId, initialMessages }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Subscribe to real-time messages
  useEffect(() => {
    const channel = supabase
      .channel(`messages-${dealId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `deal_id=eq.${dealId}`,
        },
        async (payload) => {
          // Fetch the full message with sender info and attachments
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles(first_name, last_name, email, role),
              attachments:message_attachments(id, file_name, file_path, file_size, file_type)
            `)
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === data.id)) return prev
              return [...prev, data as unknown as Message]
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dealId, supabase])

  // Mark messages as read
  useEffect(() => {
    const unreadMessages = messages.filter(
      (m) => !m.is_read && m.sender_id !== currentUserId
    )

    if (unreadMessages.length > 0) {
      supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in(
          'id',
          unreadMessages.map((m) => m.id)
        )
        .then()
    }
  }, [messages, currentUserId, supabase])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles: File[] = []

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Max size is 10MB.`)
        continue
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} has an unsupported file type.`)
        continue
      }
      validFiles.push(file)
    }

    setSelectedFiles((prev) => [...prev, ...validFiles])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSend = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || sending) return

    setSending(true)
    const messageContent = newMessage.trim()
    const filesToUpload = [...selectedFiles]
    setNewMessage('')
    setSelectedFiles([])

    try {
      // Create the message first
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert({
          deal_id: dealId,
          sender_id: currentUserId,
          content: messageContent || '(Attachment)',
        })
        .select('id')
        .single()

      if (messageError) throw messageError

      // Upload files and create attachment records
      if (filesToUpload.length > 0 && messageData) {
        for (const file of filesToUpload) {
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          const filePath = `${dealId}/messages/${messageData.id}/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('deal-documents')
            .upload(filePath, file)

          if (uploadError) {
            console.error('Failed to upload file:', uploadError)
            toast.error(`Failed to upload ${file.name}`)
            continue
          }

          // Create attachment record
          const { error: attachmentError } = await supabase
            .from('message_attachments')
            .insert({
              message_id: messageData.id,
              file_name: file.name,
              file_path: filePath,
              file_size: file.size,
              file_type: file.type,
            })

          if (attachmentError) {
            console.error('Failed to create attachment record:', attachmentError)
          }
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setNewMessage(messageContent)
      setSelectedFiles(filesToUpload)
      toast.error('Failed to send message')
    }

    setSending(false)
  }

  const handleDownloadAttachment = async (attachment: Attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('deal-documents')
        .createSignedUrl(attachment.file_path, 60)

      if (error) throw error
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank')
      }
    } catch (error) {
      console.error('Error downloading attachment:', error)
      toast.error('Failed to download attachment')
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4" />
    }
    if (fileType === 'application/pdf') {
      return <FileText className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' +
        date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
        date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }
  }

  const getInitials = (firstName: string | null, lastName: string | null, email: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    return email[0].toUpperCase()
  }

  const getSenderName = (sender: Message['sender']) => {
    if (sender.first_name && sender.last_name) {
      return `${sender.first_name} ${sender.last_name}`
    }
    return sender.email
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserId
            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback
                    className={
                      isOwn
                        ? 'bg-blue-100 text-blue-700'
                        : message.sender.role === 'broker'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'
                    }
                  >
                    {getInitials(message.sender.first_name, message.sender.last_name, message.sender.email)}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-700">
                      {isOwn ? 'You' : getSenderName(message.sender)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.content && message.content !== '(Attachment)' && (
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    )}
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className={`${message.content && message.content !== '(Attachment)' ? 'mt-2 pt-2 border-t' : ''} ${isOwn ? 'border-blue-500' : 'border-gray-200'}`}>
                        {message.attachments.map((attachment) => (
                          <button
                            key={attachment.id}
                            onClick={() => handleDownloadAttachment(attachment)}
                            className={`flex items-center gap-2 p-2 rounded mt-1 w-full text-left transition-colors ${
                              isOwn
                                ? 'bg-blue-500 hover:bg-blue-400'
                                : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                          >
                            {getFileIcon(attachment.file_type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{attachment.file_name}</p>
                              <p className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                                {formatFileSize(attachment.file_size)}
                              </p>
                            </div>
                            <Download className="h-3 w-3 flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4 bg-white">
        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2"
              >
                {getFileIcon(file.type)}
                <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            title="Attach files"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            className="min-h-[60px] max-h-[120px] resize-none"
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={(!newMessage.trim() && selectedFiles.length === 0) || sending}
            className="h-auto"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
