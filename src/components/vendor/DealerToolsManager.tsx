'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'

type VendorProfile = {
  vendor_id: string
  dealership_name: string | null
  city: string | null
  state: string | null
  phone: string | null
  website: string | null
  logo_url: string | null
}

type SalesRep = {
  id: string
  vendor_id: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
  is_default: boolean
}

type BrokerResource = {
  id: string
  title: string
  category: string | null
  description: string | null
  content: string | null
  file_path: string | null
}

interface DealerToolsManagerProps {
  vendorId: string
  brokerName: string
  brokerId: string
  initialProfile: VendorProfile | null
  initialReps: SalesRep[]
  resources: BrokerResource[]
}

export function DealerToolsManager({
  vendorId,
  brokerName,
  brokerId,
  initialProfile,
  initialReps,
  resources,
}: DealerToolsManagerProps) {
  const supabase = createClient()

  const [profile, setProfile] = useState({
    dealership_name: initialProfile?.dealership_name || '',
    city: initialProfile?.city || '',
    state: initialProfile?.state || '',
    phone: initialProfile?.phone || '',
    website: initialProfile?.website || '',
    logo_url: initialProfile?.logo_url || '',
  })

  const [reps, setReps] = useState<SalesRep[]>(initialReps)
  const [selectedRepId, setSelectedRepId] = useState<string>(
    () => initialReps.find((rep) => rep.is_default)?.id || initialReps[0]?.id || ''
  )
  const [buyerName, setBuyerName] = useState('')
  const [showRepForm, setShowRepForm] = useState(false)
  const [editingRepId, setEditingRepId] = useState<string | null>(null)
  const [repForm, setRepForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    is_default: false,
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingRep, setSavingRep] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showOnePagerPreview, setShowOnePagerPreview] = useState(false)
  const [openResourceId, setOpenResourceId] = useState<string | null>(null)

  const requiredProfileFields = [profile.dealership_name, profile.city, profile.state, profile.phone]
  const requiredFilled = requiredProfileFields.filter((value) => value.trim().length > 0).length
  const completenessPercent = Math.round((requiredFilled / requiredProfileFields.length) * 100)
  const profileReady = completenessPercent === 100
  const hasRep = reps.length > 0

  const selectedRep = useMemo(() => {
    return reps.find((rep) => rep.id === selectedRepId) || reps.find((rep) => rep.is_default) || reps[0] || null
  }, [reps, selectedRepId])

  const prequalBase = typeof window !== 'undefined' ? window.location.origin : 'https://portal.example.com'
  const prequalLink = `${prequalBase}/prequal?vendor=${vendorId}&broker=${brokerId}`
  const prequalQr = `https://quickchart.io/qr?size=220&text=${encodeURIComponent(prequalLink)}`

  const personalize = (template: string) => {
    const buyer = buyerName.trim() || 'there'
    const repName = selectedRep ? `${selectedRep.first_name} ${selectedRep.last_name}` : 'Your sales rep'

    return template
      .replaceAll('{{buyer_name}}', buyer)
      .replaceAll('{{dealer_name}}', profile.dealership_name || 'Our dealership')
      .replaceAll('{{rep_name}}', repName)
      .replaceAll('{{rep_phone}}', selectedRep?.phone || 'N/A')
      .replaceAll('{{rep_email}}', selectedRep?.email || 'N/A')
      .replaceAll('{{broker_name}}', brokerName)
  }

  const textScript = personalize(
    'Hi {{buyer_name}}, we can offer financing options so you can move forward without tying up cash. Want me to send a quick pre-qual link?'
  )

  const emailScript = personalize(
    [
      'Subject: Financing Options for Your Purchase',
      '',
      'Hi {{buyer_name}},',
      '',
      '{{dealer_name}} can offer financing options so you can keep your cash available and still move forward quickly.',
      'If you want, I can send a quick pre-qual link to get started.',
      '',
      'Thanks,',
      '{{rep_name}}',
      '{{rep_phone}}',
      '{{rep_email}}',
    ].join('\n')
  )

  const refreshReps = async () => {
    const { data, error: repsError } = await supabase
      .from('vendor_sales_reps')
      .select('id, vendor_id, first_name, last_name, phone, email, is_default')
      .eq('vendor_id', vendorId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })

    if (repsError) {
      setError(repsError.message)
      return
    }

    setReps((data || []) as SalesRep[])
  }

  const handleProfileSave = async () => {
    setSavingProfile(true)
    setError(null)
    setSuccess(null)

    const { error: saveError } = await supabase
      .from('vendor_profiles')
      .upsert(
        {
          vendor_id: vendorId,
          dealership_name: profile.dealership_name || null,
          city: profile.city || null,
          state: profile.state || null,
          phone: profile.phone || null,
          website: profile.website || null,
          logo_url: profile.logo_url || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'vendor_id' }
      )

    if (saveError) {
      setError(saveError.message)
    } else {
      setSuccess('Dealer profile saved.')
    }

    setSavingProfile(false)
  }

  const handleLogoUpload = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setProfile((prev) => ({ ...prev, logo_url: result }))
    }
    reader.readAsDataURL(file)
  }

  const startAddRep = () => {
    setEditingRepId(null)
    setRepForm({ first_name: '', last_name: '', phone: '', email: '', is_default: reps.length === 0 })
    setShowRepForm(true)
  }

  const startEditRep = (rep: SalesRep) => {
    setEditingRepId(rep.id)
    setRepForm({
      first_name: rep.first_name,
      last_name: rep.last_name,
      phone: rep.phone,
      email: rep.email || '',
      is_default: rep.is_default,
    })
    setShowRepForm(true)
  }

  const saveRep = async () => {
    if (!repForm.first_name.trim() || !repForm.last_name.trim() || !repForm.phone.trim()) {
      setError('Sales rep first name, last name, and phone are required.')
      return
    }

    setSavingRep(true)
    setError(null)
    setSuccess(null)

    let savedRepId: string | null = null

    if (editingRepId) {
      const { error: updateError } = await supabase
        .from('vendor_sales_reps')
        .update({
          first_name: repForm.first_name.trim(),
          last_name: repForm.last_name.trim(),
          phone: repForm.phone.trim(),
          email: repForm.email.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingRepId)
        .eq('vendor_id', vendorId)

      if (updateError) {
        setError(updateError.message)
        setSavingRep(false)
        return
      }

      savedRepId = editingRepId
    } else {
      const { data, error: insertError } = await supabase
        .from('vendor_sales_reps')
        .insert({
          vendor_id: vendorId,
          first_name: repForm.first_name.trim(),
          last_name: repForm.last_name.trim(),
          phone: repForm.phone.trim(),
          email: repForm.email.trim() || null,
          is_default: false,
        })
        .select('id')
        .single()

      if (insertError) {
        setError(insertError.message)
        setSavingRep(false)
        return
      }

      savedRepId = data.id
    }

    if (repForm.is_default && savedRepId) {
      await supabase
        .from('vendor_sales_reps')
        .update({ is_default: false, updated_at: new Date().toISOString() })
        .eq('vendor_id', vendorId)

      await supabase
        .from('vendor_sales_reps')
        .update({ is_default: true, updated_at: new Date().toISOString() })
        .eq('id', savedRepId)
    }

    await refreshReps()
    setSuccess(editingRepId ? 'Sales rep updated.' : 'Sales rep added.')
    setShowRepForm(false)
    setSavingRep(false)
  }

  const deleteRep = async (id: string) => {
    setError(null)
    setSuccess(null)

    const { error: deleteError } = await supabase
      .from('vendor_sales_reps')
      .delete()
      .eq('id', id)
      .eq('vendor_id', vendorId)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    await refreshReps()
    if (selectedRepId === id) {
      setSelectedRepId('')
    }
    setSuccess('Sales rep deleted.')
  }

  const setDefaultRep = async (id: string) => {
    setError(null)
    setSuccess(null)

    await supabase
      .from('vendor_sales_reps')
      .update({ is_default: false, updated_at: new Date().toISOString() })
      .eq('vendor_id', vendorId)

    const { error: defaultError } = await supabase
      .from('vendor_sales_reps')
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('vendor_id', vendorId)

    if (defaultError) {
      setError(defaultError.message)
      return
    }

    await refreshReps()
    setSelectedRepId(id)
    setSuccess('Default rep updated.')
  }

  const copyText = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setSuccess(successMessage)
      setError(null)
    } catch {
      setError('Could not copy to clipboard.')
    }
  }

  const printOnePager = () => {
    if (!profileReady || !selectedRep) return

    const repName = `${selectedRep.first_name} ${selectedRep.last_name}`
    const popup = window.open('', '_blank', 'width=900,height=1200')
    if (!popup) return

    popup.document.write(`
      <html>
        <head>
          <title>Financing Available - ${profile.dealership_name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #111827; }
            .headline { font-size: 40px; font-weight: 700; margin: 12px 0; }
            .sub { color: #4B5563; margin: 8px 0 24px; }
            .brand { display: flex; align-items: center; gap: 16px; }
            .logo { width: 80px; height: 80px; object-fit: contain; border-radius: 8px; border: 1px solid #E5E7EB; }
            .grid { display: grid; grid-template-columns: 1fr 220px; gap: 24px; margin-top: 24px; }
            .card { border: 1px solid #E5E7EB; border-radius: 10px; padding: 16px; }
            .bullet { margin: 10px 0; }
            .footer { margin-top: 24px; color: #6B7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="brand">
            ${profile.logo_url ? `<img src="${profile.logo_url}" class="logo" />` : ''}
            <div>
              <div style="font-size: 24px; font-weight: 700;">${profile.dealership_name}</div>
              <div class="sub">${profile.city}, ${profile.state}</div>
            </div>
          </div>

          <div class="headline">Financing Available</div>
          <div class="sub">Fast decisions, flexible options, keep your cash for operations.</div>

          <div class="grid">
            <div class="card">
              <div class="bullet">• Fast credit decisions</div>
              <div class="bullet">• Flexible terms and structures</div>
              <div class="bullet">• Keep cash available for growth</div>
            </div>
            <div class="card">
              <div style="font-weight: 700; margin-bottom: 8px;">Contact</div>
              <div>${repName}</div>
              <div>${selectedRep.phone}</div>
              <div>${selectedRep.email || ''}</div>
              <img src="${prequalQr}" style="width: 180px; height: 180px; margin-top: 12px;" />
            </div>
          </div>

          <div class="footer">Powered by ${brokerName}</div>
        </body>
      </html>
    `)

    popup.document.close()
    popup.focus()
    popup.print()
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Complete these steps to activate dealer tools.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-md border p-3 flex items-center justify-between">
            <span>Add dealership info</span>
            <Badge variant={profileReady ? 'default' : 'outline'}>{profileReady ? 'Done' : 'Pending'}</Badge>
          </div>
          <div className="rounded-md border p-3 flex items-center justify-between">
            <span>Add at least 1 sales rep</span>
            <Badge variant={hasRep ? 'default' : 'outline'}>{hasRep ? 'Done' : 'Pending'}</Badge>
          </div>
          <div className="rounded-md border p-3 flex items-center justify-between">
            <span>Generate one-pager</span>
            <Badge variant={profileReady && hasRep ? 'default' : 'outline'}>{profileReady && hasRep ? 'Ready' : 'Blocked'}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card id="dealer-profile">
        <CardHeader>
          <CardTitle>Dealer Profile</CardTitle>
          <CardDescription>Profile completeness: {completenessPercent}%</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!profileReady && (
            <Badge className="bg-amber-100 text-amber-800">Complete profile to generate one-pager</Badge>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dealership Name *</Label>
              <Input value={profile.dealership_name} onChange={(e) => setProfile((p) => ({ ...p, dealership_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>City *</Label>
              <Input value={profile.city} onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>State *</Label>
              <Input value={profile.state} onChange={(e) => setProfile((p) => ({ ...p, state: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={profile.website} onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Logo Upload (optional)</Label>
              <Input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e.target.files?.[0] || null)} />
            </div>
          </div>

          {profile.logo_url && (
            <div className="border rounded-md p-3 w-fit">
              <img src={profile.logo_url} alt="Dealer logo" className="h-16 w-16 object-contain" />
            </div>
          )}

          <Button onClick={handleProfileSave} disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>

      <Card id="sales-reps">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Sales Rep Contacts</CardTitle>
            <CardDescription>Add and manage rep contact details.</CardDescription>
          </div>
          <Button onClick={startAddRep}>Add rep</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {reps.length === 0 ? (
            <p className="text-sm text-gray-500">No sales reps added yet.</p>
          ) : (
            <div className="space-y-3">
              {reps.map((rep) => (
                <div key={rep.id} className="rounded-md border p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {rep.first_name} {rep.last_name} {rep.is_default && <Badge className="ml-2">Default</Badge>}
                    </p>
                    <p className="text-sm text-gray-600">
                      {rep.phone} {rep.email ? `• ${rep.email}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!rep.is_default && (
                      <Button variant="outline" onClick={() => setDefaultRep(rep.id)}>Set default</Button>
                    )}
                    <Button variant="outline" onClick={() => startEditRep(rep)}>Edit</Button>
                    <Button variant="destructive" onClick={() => deleteRep(rep.id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showRepForm && (
            <div className="rounded-md border p-4 space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input value={repForm.first_name} onChange={(e) => setRepForm((r) => ({ ...r, first_name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input value={repForm.last_name} onChange={(e) => setRepForm((r) => ({ ...r, last_name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input value={repForm.phone} onChange={(e) => setRepForm((r) => ({ ...r, phone: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={repForm.email} onChange={(e) => setRepForm((r) => ({ ...r, email: e.target.value }))} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={repForm.is_default}
                  onChange={(e) => setRepForm((r) => ({ ...r, is_default: e.target.checked }))}
                />
                Set as default
              </label>
              <div className="flex gap-2">
                <Button onClick={saveRep} disabled={savingRep}>{savingRep ? 'Saving...' : 'Save rep'}</Button>
                <Button variant="outline" onClick={() => setShowRepForm(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Script Builder</CardTitle>
          <CardDescription>Generate text and email scripts with dealer and rep details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Send as</Label>
              <select
                className="h-10 rounded-md border px-3 text-sm w-full"
                value={selectedRep?.id || ''}
                onChange={(e) => setSelectedRepId(e.target.value)}
              >
                {reps.map((rep) => (
                  <option key={rep.id} value={rep.id}>
                    {rep.first_name} {rep.last_name}{rep.is_default ? ' (Default)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Buyer name (optional)</Label>
              <Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="Buyer Name" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-md border p-3 space-y-3">
              <p className="text-sm whitespace-pre-wrap">{textScript}</p>
              <Button onClick={() => copyText(textScript, 'Text script copied.')}>Copy Text Script</Button>
            </div>
            <div className="rounded-md border p-3 space-y-3">
              <Textarea value={emailScript} readOnly className="min-h-[180px]" />
              <Button onClick={() => copyText(emailScript, 'Email script copied.')}>Copy Email Script</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financing Available One-Pager</CardTitle>
          <CardDescription>Generate and print a one-pager with your dealer and rep information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!profileReady || !hasRep ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 space-y-2">
              <p>Before generating a one-pager:</p>
              {!profileReady && <Button variant="outline" onClick={() => document.getElementById('dealer-profile')?.scrollIntoView({ behavior: 'smooth' })}>Add dealership info</Button>}
              {!hasRep && <Button variant="outline" onClick={() => document.getElementById('sales-reps')?.scrollIntoView({ behavior: 'smooth' })}>Add a sales rep</Button>}
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowOnePagerPreview((s) => !s)}>
                  {showOnePagerPreview ? 'Hide Preview' : 'Preview'}
                </Button>
                <Button onClick={printOnePager}>Print</Button>
              </div>

              {showOnePagerPreview && selectedRep && (
                <div className="rounded-md border p-5 bg-white space-y-4">
                  <div className="flex items-center gap-3">
                    {profile.logo_url && (
                      <img src={profile.logo_url} alt="Dealer logo" className="h-12 w-12 object-contain border rounded" />
                    )}
                    <div>
                      <p className="font-semibold text-lg">{profile.dealership_name}</p>
                      <p className="text-sm text-gray-600">{profile.city}, {profile.state}</p>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold">Financing Available</h3>
                  <ul className="list-disc pl-6 text-sm space-y-1">
                    <li>Fast decisions</li>
                    <li>Flexible options</li>
                    <li>Keep your cash</li>
                  </ul>
                  <div className="rounded-md border p-3 text-sm">
                    <p className="font-medium">{selectedRep.first_name} {selectedRep.last_name}</p>
                    <p>{selectedRep.phone}</p>
                    <p>{selectedRep.email || 'No email set'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <img src={prequalQr} alt="Pre-qual QR" className="h-24 w-24 border rounded" />
                    <p className="text-sm text-gray-600">{prequalLink}</p>
                  </div>
                  <p className="text-xs text-gray-500">Powered by {brokerName}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pre-Qual Link + QR</CardTitle>
          <CardDescription>This routes to your broker: {brokerName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input readOnly value={prequalLink} />
            <Button variant="outline" onClick={() => copyText(prequalLink, 'Pre-qual link copied.')}>Copy Link</Button>
          </div>
          <img src={prequalQr} alt="Pre-qual QR" className="h-32 w-32 border rounded" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Broker Resources</CardTitle>
          <CardDescription>Templates and resources published by your broker.</CardDescription>
        </CardHeader>
        <CardContent>
          {!resources.length ? (
            <p className="text-sm text-gray-500">Your broker hasn&apos;t published resources yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {resources.map((resource) => (
                <div key={resource.id} className="rounded-md border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{resource.title}</p>
                    <Badge variant="outline">{resource.category || 'Resource'}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{resource.description || 'No description provided.'}</p>
                  <div className="flex gap-2">
                    {resource.file_path ? (
                      <a href={resource.file_path} target="_blank" rel="noreferrer">
                        <Button variant="outline">Download/Open</Button>
                      </a>
                    ) : (
                      <Button variant="outline" onClick={() => setOpenResourceId(openResourceId === resource.id ? null : resource.id)}>
                        Open
                      </Button>
                    )}
                  </div>
                  {openResourceId === resource.id && resource.content && (
                    <div className="rounded border bg-gray-50 p-3 text-sm whitespace-pre-wrap">{resource.content}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
