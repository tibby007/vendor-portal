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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  title: string | null
  photo_url: string | null
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
  brokerLogoUrl?: string | null
  brandColor?: string
  shortSlug: string
  initialProfile: VendorProfile | null
  initialReps: SalesRep[]
  resources: BrokerResource[]
}

const headlineOptions = [
  'Get Approved and Take It Home',
  'Financing Options Available Today',
  'Flexible Payment Options for Qualified Buyers',
]

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '')
  const full = normalized.length === 3 ? normalized.split('').map((c) => c + c).join('') : normalized
  if (full.length !== 6) return `rgba(249,115,22,${alpha})`

  const r = Number.parseInt(full.slice(0, 2), 16)
  const g = Number.parseInt(full.slice(2, 4), 16)
  const b = Number.parseInt(full.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function DealerToolsManager({
  vendorId,
  brokerName,
  brokerLogoUrl,
  brandColor = '#F97316',
  shortSlug,
  initialProfile,
  initialReps,
  resources,
}: DealerToolsManagerProps) {
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState('profile')
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
  const [headline, setHeadline] = useState(headlineOptions[0])
  const [copyTone, setCopyTone] = useState<'cash' | 'working_capital'>('cash')
  const [localAccent, setLocalAccent] = useState(brandColor)

  const [showRepForm, setShowRepForm] = useState(false)
  const [editingRepId, setEditingRepId] = useState<string | null>(null)
  const [repForm, setRepForm] = useState({
    first_name: '',
    last_name: '',
    title: 'Sales Representative',
    phone: '',
    email: '',
    photo_url: '',
    is_default: false,
  })

  const [savingProfile, setSavingProfile] = useState(false)
  const [savingRep, setSavingRep] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(true)
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
  const shortLink = `${prequalBase}/p/${shortSlug}`
  const prequalQr = `https://quickchart.io/qr?size=300&text=${encodeURIComponent(shortLink)}`

  const copyPhrase = copyTone === 'cash' ? 'keep your cash available' : 'keep working capital available'

  const personalize = (template: string) => {
    const buyer = buyerName.trim() || 'there'
    const repName = selectedRep ? `${selectedRep.first_name} ${selectedRep.last_name}` : 'Your sales rep'

    return template
      .replaceAll('{Buyer}', buyer)
      .replaceAll('{Dealer}', profile.dealership_name || 'Our dealership')
      .replaceAll('{Rep}', repName)
      .replaceAll('{RepPhone}', selectedRep?.phone || 'N/A')
      .replaceAll('{RepEmail}', selectedRep?.email || '')
      .replaceAll('{Broker}', brokerName)
      .replaceAll('{CashPhrase}', copyPhrase)
      .replaceAll('{Link}', shortLink)
  }

  const textScript = personalize(
    'Hi {Buyer}, we have financing options available so you can move forward without tying up cash. Want the 2-minute pre-qual link?'
  )

  const emailScript = personalize(
    [
      'Subject: Financing options for your purchase',
      '',
      'Hi {Buyer},',
      '',
      '{Dealer} has financing options available so you can move forward and {CashPhrase}.',
      'If you want to explore options, here is the 2-minute pre-qual link:',
      '{Link}',
      '',
      'Best,',
      '{Rep}',
      '{RepPhone}',
      '{RepEmail}',
    ].join('\n')
  )

  const emailWithSignature = `${emailScript}\n\nPowered by ${brokerName}`
  const smsScript = textScript.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim()

  const refreshReps = async () => {
    const { data, error: repsError } = await supabase
      .from('vendor_sales_reps')
      .select('id, vendor_id, first_name, last_name, title, phone, email, photo_url, is_default')
      .eq('vendor_id', vendorId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })

    if (repsError) {
      setError(repsError.message)
      return
    }

    const next = (data || []) as SalesRep[]
    setReps(next)
    if (!selectedRepId && next[0]) {
      setSelectedRepId(next[0].id)
    }
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

  const fileToDataUrl = (file: File | null, cb: (value: string) => void) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      cb(typeof reader.result === 'string' ? reader.result : '')
    }
    reader.readAsDataURL(file)
  }

  const startAddRep = () => {
    setEditingRepId(null)
    setRepForm({
      first_name: '',
      last_name: '',
      title: 'Sales Representative',
      phone: '',
      email: '',
      photo_url: '',
      is_default: reps.length === 0,
    })
    setShowRepForm(true)
  }

  const startEditRep = (rep: SalesRep) => {
    setEditingRepId(rep.id)
    setRepForm({
      first_name: rep.first_name,
      last_name: rep.last_name,
      title: rep.title || 'Sales Representative',
      phone: rep.phone,
      email: rep.email || '',
      photo_url: rep.photo_url || '',
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
          title: repForm.title.trim() || null,
          phone: repForm.phone.trim(),
          email: repForm.email.trim() || null,
          photo_url: repForm.photo_url || null,
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
          title: repForm.title.trim() || null,
          phone: repForm.phone.trim(),
          email: repForm.email.trim() || null,
          photo_url: repForm.photo_url || null,
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
    await supabase
      .from('vendor_prequal_links')
      .update({ default_rep_id: id, updated_at: new Date().toISOString() })
      .eq('vendor_id', vendorId)
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
    const popup = window.open('', '_blank', 'width=950,height=1200')
    if (!popup) return

    const accentSoft = hexToRgba(localAccent, 0.15)

    popup.document.write(`
      <html>
        <head>
          <title>${profile.dealership_name} - Financing Sheet</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; color: #111827; background: #f9fafb; }
            .page { max-width: 860px; margin: 24px auto; background: white; border: 1px solid #e5e7eb; }
            .band { height: 14px; background: ${localAccent}; }
            .content { padding: 28px; }
            .top { display: flex; justify-content: space-between; align-items: center; }
            .logo { width: 72px; height: 72px; object-fit: contain; border: 1px solid #e5e7eb; border-radius: 10px; }
            .headline { font-size: 34px; font-weight: 700; margin: 20px 0 8px; }
            .sub { font-size: 18px; color: #4b5563; margin-bottom: 20px; }
            .grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 18px; }
            .card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; background: #fff; }
            .steps { background: ${accentSoft}; }
            .cta { margin-top: 16px; background: ${localAccent}; color: white; border-radius: 12px; padding: 14px; font-weight: 700; text-align: center; }
            .small { font-size: 13px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="band"></div>
            <div class="content">
              <div class="top">
                <div style="display:flex;gap:14px;align-items:center;">
                  ${profile.logo_url ? `<img src="${profile.logo_url}" class="logo" />` : ''}
                  <div>
                    <div style="font-size:24px;font-weight:700;">${profile.dealership_name}</div>
                    <div class="small">${profile.city}, ${profile.state}</div>
                  </div>
                </div>
                ${brokerLogoUrl ? `<img src="${brokerLogoUrl}" class="logo" />` : ''}
              </div>

              <div class="sub">Financing Available</div>
              <div class="headline">${headline}</div>

              <div class="grid">
                <div class="card">
                  <div style="font-weight:700;margin-bottom:8px;">Why buyers choose financing</div>
                  <div>• Fast decisions</div>
                  <div>• Flexible options</div>
                  <div>• ${copyPhrase.charAt(0).toUpperCase() + copyPhrase.slice(1)}</div>

                  <div class="card steps" style="margin-top:14px;">
                    <div style="font-weight:700;margin-bottom:8px;">How it works</div>
                    <div>1) Scan QR / open link</div>
                    <div>2) Quick pre-qual (2 minutes)</div>
                    <div>3) We follow up with next steps</div>
                  </div>

                  <div class="cta">Scan to get pre-qualified</div>
                </div>

                <div class="card">
                  ${selectedRep.photo_url ? `<img src="${selectedRep.photo_url}" style="width:72px;height:72px;border-radius:9999px;object-fit:cover;" />` : ''}
                  <div style="font-weight:700;margin-top:8px;">${repName}</div>
                  <div class="small">${selectedRep.title || 'Sales Representative'}</div>
                  <div style="margin-top:8px;">${selectedRep.phone}</div>
                  <div>${selectedRep.email || ''}</div>
                  <div class="small" style="margin-top:8px;">Text me and I’ll help you through it.</div>
                  <img src="${prequalQr}" style="width:170px;height:170px;margin-top:12px;border:1px solid #e5e7eb;border-radius:8px;" />
                  <div class="small" style="margin-top:8px;word-break:break-all;">${shortLink}</div>
                </div>
              </div>

              <div class="small" style="margin-top:18px;">Powered by ${brokerName}</div>
            </div>
          </div>
        </body>
      </html>
    `)

    popup.document.close()
    popup.focus()
    popup.print()
  }

  const cardHeaderStyle = { borderTop: `4px solid ${localAccent}` }

  const statusTone = (status: 'Done' | 'Ready' | 'Missing') => {
    if (status === 'Done') return { background: '#DCFCE7', color: '#166534' }
    if (status === 'Ready') return { background: '#DBEAFE', color: '#1D4ED8' }
    return { background: '#FEE2E2', color: '#991B1B' }
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

      <Card style={cardHeaderStyle}>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Use these three steps to launch your branded sales tools.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-md border p-3 flex items-center justify-between">
            <span>Add dealership info</span>
            <span className="px-2 py-1 rounded-full text-xs font-medium" style={statusTone(profileReady ? 'Done' : 'Missing')}>
              {profileReady ? 'Done' : 'Missing'}
            </span>
          </div>
          <div className="rounded-md border p-3 flex items-center justify-between">
            <span>Add at least 1 sales rep</span>
            <span className="px-2 py-1 rounded-full text-xs font-medium" style={statusTone(hasRep ? 'Done' : 'Missing')}>
              {hasRep ? 'Done' : 'Missing'}
            </span>
          </div>
          <div className="rounded-md border p-3 flex items-center justify-between">
            <span>Generate one-pager</span>
            <span className="px-2 py-1 rounded-full text-xs font-medium" style={statusTone(profileReady && hasRep ? 'Ready' : 'Missing')}>
              {profileReady && hasRep ? 'Ready' : 'Missing'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Dealer Profile</TabsTrigger>
          <TabsTrigger value="team">Sales Team</TabsTrigger>
          <TabsTrigger value="tools">Sales Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card id="dealer-profile" style={cardHeaderStyle}>
            <CardHeader>
              <CardTitle>Dealer Profile</CardTitle>
              <CardDescription>Profile completeness: {completenessPercent}%</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!profileReady && (
                <Badge style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                  Complete profile to generate one-pager
                </Badge>
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
                  <Input type="file" accept="image/*" onChange={(e) => fileToDataUrl(e.target.files?.[0] || null, (logo) => setProfile((p) => ({ ...p, logo_url: logo })))} />
                </div>
              </div>

              {profile.logo_url && (
                <div className="border rounded-md p-3 w-fit">
                  <img src={profile.logo_url} alt="Dealer logo" className="h-16 w-16 object-contain" />
                </div>
              )}

              <Button onClick={handleProfileSave} disabled={savingProfile} style={{ backgroundColor: localAccent }}>
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card id="sales-reps" style={cardHeaderStyle}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sales Rep Contacts</CardTitle>
                <CardDescription>Add reps with photo, title, and default selection.</CardDescription>
              </div>
              <Button onClick={startAddRep} style={{ backgroundColor: localAccent }}>Add rep</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {reps.length === 0 ? (
                <p className="text-sm text-gray-500">No sales reps added yet.</p>
              ) : (
                <div className="space-y-3">
                  {reps.map((rep) => (
                    <div key={rep.id} className="rounded-md border p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {rep.photo_url ? (
                          <img src={rep.photo_url} alt={`${rep.first_name} ${rep.last_name}`} className="h-12 w-12 rounded-full object-cover border" />
                        ) : (
                          <div className="h-12 w-12 rounded-full border flex items-center justify-center text-xs text-gray-500">No photo</div>
                        )}
                        <div>
                          <p className="font-medium">
                            {rep.first_name} {rep.last_name} {rep.is_default && <Badge className="ml-2">Default</Badge>}
                          </p>
                          <p className="text-sm text-gray-600">{rep.title || 'Sales Representative'}</p>
                          <p className="text-sm text-gray-600">
                            {rep.phone} {rep.email ? `• ${rep.email}` : ''}
                          </p>
                        </div>
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
                      <Label>Title</Label>
                      <Input value={repForm.title} onChange={(e) => setRepForm((r) => ({ ...r, title: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone *</Label>
                      <Input value={repForm.phone} onChange={(e) => setRepForm((r) => ({ ...r, phone: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={repForm.email} onChange={(e) => setRepForm((r) => ({ ...r, email: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Photo Upload</Label>
                      <Input type="file" accept="image/*" onChange={(e) => fileToDataUrl(e.target.files?.[0] || null, (photo) => setRepForm((r) => ({ ...r, photo_url: photo })))} />
                    </div>
                  </div>

                  {repForm.photo_url && (
                    <img src={repForm.photo_url} alt="Rep preview" className="h-14 w-14 rounded-full object-cover border" />
                  )}

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={repForm.is_default}
                      onChange={(e) => setRepForm((r) => ({ ...r, is_default: e.target.checked }))}
                    />
                    Set as default
                  </label>
                  <div className="flex gap-2">
                    <Button onClick={saveRep} disabled={savingRep} style={{ backgroundColor: localAccent }}>{savingRep ? 'Saving...' : 'Save rep'}</Button>
                    <Button variant="outline" onClick={() => setShowRepForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Card style={cardHeaderStyle}>
            <CardHeader>
              <CardTitle>Script Builder 2.0</CardTitle>
              <CardDescription>Dynamic scripts that match your current offer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
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
                <div className="space-y-2">
                  <Label>Offer tone</Label>
                  <select
                    className="h-10 rounded-md border px-3 text-sm w-full"
                    value={copyTone}
                    onChange={(e) => setCopyTone(e.target.value as 'cash' | 'working_capital')}
                  >
                    <option value="cash">Keep your cash</option>
                    <option value="working_capital">Keep working capital</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-md border p-3 space-y-3">
                  <p className="text-sm whitespace-pre-wrap">{textScript}</p>
                  <div className="flex gap-2">
                    <Button onClick={() => copyText(textScript, 'Text script copied.')} style={{ backgroundColor: localAccent }}>Copy Text</Button>
                    <Button variant="outline" onClick={() => copyText(smsScript, 'SMS script copied.')}>Copy as SMS</Button>
                  </div>
                </div>
                <div className="rounded-md border p-3 space-y-3">
                  <Textarea value={emailScript} readOnly className="min-h-[200px]" />
                  <div className="flex gap-2">
                    <Button onClick={() => copyText(emailScript, 'Email script copied.')} style={{ backgroundColor: localAccent }}>Copy Email</Button>
                    <Button variant="outline" onClick={() => copyText(emailWithSignature, 'Email + signature copied.')}>Copy with rep signature</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card style={cardHeaderStyle}>
            <CardHeader>
              <CardTitle>One-Pager 2.0</CardTitle>
              <CardDescription>Conversion-focused branded sheet for your buyers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!profileReady || !hasRep ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 space-y-2">
                  <p>Before generating a one-pager:</p>
                  {!profileReady && <Button variant="outline" onClick={() => setActiveTab('profile')}>Add dealership info</Button>}
                  {!hasRep && <Button variant="outline" onClick={() => setActiveTab('team')}>Add a sales rep</Button>}
                </div>
              ) : (
                <div className="grid lg:grid-cols-[1fr_280px] gap-4 items-start">
                  <div className="rounded-md border bg-gray-100 p-4">
                    {showPreview && selectedRep && (
                      <div className="bg-white border rounded-lg max-w-3xl mx-auto shadow-sm">
                        <div style={{ backgroundColor: localAccent }} className="h-4 rounded-t-lg" />
                        <div className="p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {profile.logo_url && <img src={profile.logo_url} alt="Dealer logo" className="h-12 w-12 object-contain border rounded" />}
                              <div>
                                <p className="font-semibold text-lg">{profile.dealership_name}</p>
                                <p className="text-sm text-gray-600">{profile.city}, {profile.state}</p>
                              </div>
                            </div>
                            {brokerLogoUrl && <img src={brokerLogoUrl} alt="Broker logo" className="h-10 w-10 object-contain" />}
                          </div>

                          <p className="text-sm text-gray-600">Financing Available</p>
                          <h3 className="text-2xl font-bold">{headline}</h3>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="rounded-md border p-3 space-y-2">
                              <p className="font-semibold">Benefits</p>
                              <p className="text-sm">Fast decisions</p>
                              <p className="text-sm">Flexible options</p>
                              <p className="text-sm">{copyPhrase.charAt(0).toUpperCase() + copyPhrase.slice(1)}</p>
                            </div>
                            <div className="rounded-md border p-3 space-y-2">
                              <p className="font-semibold">How it works</p>
                              <p className="text-sm">1. Scan QR / open link</p>
                              <p className="text-sm">2. Quick pre-qual (2 minutes)</p>
                              <p className="text-sm">3. We follow up with next steps</p>
                            </div>
                          </div>

                          <div className="rounded-md p-3 text-white font-semibold" style={{ backgroundColor: localAccent }}>
                            Scan to get pre-qualified
                          </div>

                          <div className="grid md:grid-cols-[1fr_130px] gap-4 items-center rounded-md border p-3">
                            <div className="flex items-center gap-3">
                              {selectedRep.photo_url ? (
                                <img src={selectedRep.photo_url} alt="Rep" className="h-14 w-14 rounded-full object-cover border" />
                              ) : (
                                <div className="h-14 w-14 rounded-full border flex items-center justify-center text-xs text-gray-500">Rep</div>
                              )}
                              <div>
                                <p className="font-semibold">{selectedRep.first_name} {selectedRep.last_name}</p>
                                <p className="text-sm text-gray-600">{selectedRep.title || 'Sales Representative'}</p>
                                <p className="text-sm text-gray-600">{selectedRep.phone}</p>
                                {selectedRep.email && <p className="text-sm text-gray-600">{selectedRep.email}</p>}
                                <p className="text-xs text-gray-500">Text me and I’ll help you through it.</p>
                              </div>
                            </div>
                            <img src={prequalQr} alt="Pre-qual QR" className="h-28 w-28 border rounded" />
                          </div>

                          <p className="text-xs text-gray-500">{shortLink}</p>
                          <p className="text-xs text-gray-500">Powered by {brokerName}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-md border p-3 space-y-2">
                      <Label>Headline</Label>
                      <select className="h-10 rounded-md border px-3 text-sm w-full" value={headline} onChange={(e) => setHeadline(e.target.value)}>
                        {headlineOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </div>

                    <div className="rounded-md border p-3 space-y-2">
                      <Label>Accent color</Label>
                      <Input type="color" value={localAccent} onChange={(e) => setLocalAccent(e.target.value)} />
                    </div>

                    <div className="rounded-md border p-3 space-y-2">
                      <Label>Cash phrase</Label>
                      <select
                        className="h-10 rounded-md border px-3 text-sm w-full"
                        value={copyTone}
                        onChange={(e) => setCopyTone(e.target.value as 'cash' | 'working_capital')}
                      >
                        <option value="cash">Keep your cash</option>
                        <option value="working_capital">Keep working capital</option>
                      </select>
                    </div>

                    <Button variant="outline" onClick={() => setShowPreview((s) => !s)}>
                      {showPreview ? 'Hide preview' : 'Preview'}
                    </Button>
                    <Button onClick={printOnePager} style={{ backgroundColor: localAccent }}>Print</Button>
                    <Button variant="outline" onClick={printOnePager}>Download PDF (Print to PDF)</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card style={cardHeaderStyle}>
            <CardHeader>
              <CardTitle>Pre-Qual Link + QR</CardTitle>
              <CardDescription>This routes to your broker: {brokerName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input readOnly value={shortLink} />
                <Button variant="outline" onClick={() => copyText(shortLink, 'Short link copied.')}>Copy Link</Button>
              </div>
              <img src={prequalQr} alt="Pre-qual QR" className="h-32 w-32 border rounded" />
            </CardContent>
          </Card>

          <Card style={cardHeaderStyle}>
            <CardHeader>
              <CardTitle>Broker Resources</CardTitle>
              <CardDescription>Published by your broker for dealer enablement.</CardDescription>
            </CardHeader>
            <CardContent>
              {!resources.length ? (
                <p className="text-sm text-gray-500">Your broker hasn&apos;t published resources yet.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {resources.map((resource) => (
                    <div key={resource.id} className="rounded-md border p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{resource.title}</p>
                        <Badge variant="outline">{resource.category || 'Resource'}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{resource.description || 'No description provided.'}</p>
                      {resource.file_path ? (
                        <a href={resource.file_path} target="_blank" rel="noreferrer">
                          <Button variant="outline">Download/Open</Button>
                        </a>
                      ) : (
                        <Button variant="outline" onClick={() => setOpenResourceId(openResourceId === resource.id ? null : resource.id)}>
                          Open
                        </Button>
                      )}
                      {openResourceId === resource.id && resource.content && (
                        <div className="rounded border bg-gray-50 p-3 text-sm whitespace-pre-wrap">{resource.content}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
