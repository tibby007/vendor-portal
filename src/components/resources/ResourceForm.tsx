'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Loader2, Save, Eye, Trash2 } from 'lucide-react'

interface Resource {
  id: string
  title: string
  description: string | null
  content: string | null
  file_path: string | null
  category: string
  is_published: boolean
}

interface ResourceFormProps {
  brokerId: string
  existingResource?: Resource | null
}

const CATEGORIES = [
  'Getting Started',
  'Documents',
  'Videos',
  'Links',
  'FAQs',
  'Training',
  'Templates',
  'Other',
]

export function ResourceForm({ brokerId, existingResource }: ResourceFormProps) {
  const [formData, setFormData] = useState({
    title: existingResource?.title || '',
    description: existingResource?.description || '',
    content: existingResource?.content || '',
    category: existingResource?.category || 'Getting Started',
    is_published: existingResource?.is_published || false,
  })
  const [loading, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const isEditing = !!existingResource

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const resourceData = {
        broker_id: brokerId,
        title: formData.title,
        description: formData.description || null,
        content: formData.content || null,
        category: formData.category,
        is_published: publish ? true : formData.is_published,
        published_at: publish ? new Date().toISOString() : existingResource?.is_published ? undefined : null,
      }

      if (isEditing) {
        const { error: updateError } = await supabase
          .from('resources')
          .update(resourceData)
          .eq('id', existingResource.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('resources')
          .insert(resourceData)

        if (insertError) throw insertError
      }

      router.push('/dashboard/resources')
      router.refresh()
    } catch (err) {
      console.error('Error saving resource:', err)
      setError(err instanceof Error ? err.message : 'Failed to save resource')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!existingResource || !confirm('Are you sure you want to delete this resource?')) {
      return
    }

    setDeleting(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('resources')
        .delete()
        .eq('id', existingResource.id)

      if (deleteError) throw deleteError

      router.push('/dashboard/resources')
      router.refresh()
    } catch (err) {
      console.error('Error deleting resource:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete resource')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={(e) => handleSubmit(e, false)}>
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Resource Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., How to Submit a Financing Application"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of this resource..."
                rows={2}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="content">Resource Content</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your resource content here. You can include instructions, tips, or any helpful information..."
                rows={12}
                disabled={loading}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Tip: You can use markdown formatting for better readability.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="is_published">Published</Label>
                <p className="text-sm text-gray-500">
                  {formData.is_published
                    ? 'This resource is visible to your vendors'
                    : 'This resource is saved as a draft'}
                </p>
              </div>
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_published: checked }))
                }
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div>
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading || deleting}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.title}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditing ? 'Save Changes' : 'Save Draft'}
            </Button>
            {!formData.is_published && (
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading || !formData.title}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Save & Publish
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
