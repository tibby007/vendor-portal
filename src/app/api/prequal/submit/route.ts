import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface SubmitPayload {
  slug: string
  buyer_name: string
  buyer_mobile: string
  buyer_email: string
  equipment_type: string
  estimated_amount: number | null
  timeframe: string
  sms_consent: boolean
}

const validTimeframes = new Set(['Today', 'This week', '30 days'])

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmitPayload

    if (!body.slug || !body.buyer_name || !body.buyer_mobile || !body.buyer_email || !body.equipment_type || !body.timeframe) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    if (!validTimeframes.has(body.timeframe)) {
      return NextResponse.json({ error: 'Invalid timeframe.' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: link } = await supabase
      .from('vendor_prequal_links')
      .select('vendor_id, broker_id, default_rep_id')
      .eq('slug', body.slug)
      .single()

    if (!link) {
      return NextResponse.json({ error: 'Invalid link.' }, { status: 404 })
    }

    const { data: defaultRep } = link.default_rep_id
      ? await supabase
          .from('vendor_sales_reps')
          .select('id, first_name, last_name, phone, email, title, photo_url')
          .eq('id', link.default_rep_id)
          .eq('vendor_id', link.vendor_id)
          .single()
      : await supabase
          .from('vendor_sales_reps')
          .select('id, first_name, last_name, phone, email, title, photo_url')
          .eq('vendor_id', link.vendor_id)
          .eq('is_default', true)
          .maybeSingle()

    const { error: insertError } = await supabase
      .from('prequal_leads')
      .insert({
        vendor_id: link.vendor_id,
        broker_id: link.broker_id,
        rep_contact_id: defaultRep?.id || null,
        buyer_name: body.buyer_name.trim(),
        buyer_mobile: body.buyer_mobile.trim(),
        buyer_email: body.buyer_email.trim(),
        equipment_type: body.equipment_type.trim(),
        estimated_amount: body.estimated_amount,
        timeframe: body.timeframe,
        sms_consent: Boolean(body.sms_consent),
        source: 'prequal_qr',
        status: 'New',
      })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    return NextResponse.json({
      ok: true,
      rep: defaultRep
        ? {
            name: `${defaultRep.first_name} ${defaultRep.last_name}`,
            title: defaultRep.title,
            phone: defaultRep.phone,
            email: defaultRep.email,
            photo_url: defaultRep.photo_url,
          }
        : null,
    })
  } catch {
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}
