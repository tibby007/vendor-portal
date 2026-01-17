'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StickyNote, Plus, Trash2, User } from 'lucide-react'
import { toast } from 'sonner'

interface Note {
  id: string
  content: string
  is_internal: boolean
  created_at: string
  author: {
    first_name: string | null
    last_name: string | null
    email: string
  }
}

interface DealNotesProps {
  dealId: string
  isBroker: boolean
}

export function DealNotes({ dealId, isBroker }: DealNotesProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const supabase = createClient()

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('deal_notes')
        .select(`
          id,
          content,
          is_internal,
          created_at,
          author:profiles!author_id(first_name, last_name, email)
        `)
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setNotes(data as unknown as Note[])
    } catch (error) {
      console.error('Error fetching notes:', error)
      toast.error('Failed to load notes')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [dealId])

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('deal_notes')
        .insert({
          deal_id: dealId,
          author_id: user.id,
          content: newNote.trim(),
          is_internal: true, // Broker notes are internal by default
        })

      if (error) throw error

      toast.success('Note added successfully')
      setNewNote('')
      setShowForm(false)
      fetchNotes()
    } catch (error) {
      console.error('Error adding note:', error)
      toast.error('Failed to add note')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      const { error } = await supabase
        .from('deal_notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error

      toast.success('Note deleted')
      fetchNotes()
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('Failed to delete note')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getAuthorName = (author: Note['author']) => {
    if (author.first_name && author.last_name) {
      return `${author.first_name} ${author.last_name}`
    }
    return author.email
  }

  if (!isBroker) {
    // Vendors can only see non-internal notes
    const publicNotes = notes.filter((n) => !n.is_internal)
    if (publicNotes.length === 0) return null

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <StickyNote className="h-5 w-5 mr-2 text-yellow-500" />
            Notes from Broker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {publicNotes.map((note) => (
              <div key={note.id} className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                <p className="text-xs text-gray-500 mt-2">{formatDate(note.created_at)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <StickyNote className="h-5 w-5 mr-2 text-yellow-500" />
            Internal Notes ({notes.length})
          </CardTitle>
          {!showForm && (
            <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Note
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
            <Textarea
              placeholder="Add an internal note about this deal..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
              className="mb-2"
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setNewNote('')
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddNote}
                disabled={isSubmitting || !newNote.trim()}
              >
                {isSubmitting ? 'Adding...' : 'Add Note'}
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <StickyNote className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No notes yet</p>
            <p className="text-xs">Add internal notes to track important details</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`rounded-lg p-3 border ${
                  note.is_internal
                    ? 'bg-yellow-50 border-yellow-100'
                    : 'bg-blue-50 border-blue-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <User className="h-3 w-3" />
                      <span>{getAuthorName(note.author)}</span>
                      <span>-</span>
                      <span>{formatDate(note.created_at)}</span>
                      {note.is_internal && (
                        <span className="text-yellow-600 font-medium">(Internal)</span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-red-600 h-6 w-6 p-0"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
