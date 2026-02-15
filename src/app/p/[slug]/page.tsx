import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PrequalLinkPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: prequal } = await supabase
    .from('vendor_prequal_links')
    .select('slug, vendor:vendors(company_name, broker:brokers(company_name))')
    .eq('slug', slug)
    .single()

  if (!prequal) notFound()

  const vendor = Array.isArray(prequal.vendor) ? prequal.vendor[0] : prequal.vendor
  const broker = Array.isArray(vendor?.broker) ? vendor.broker[0] : vendor?.broker

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full bg-white border rounded-xl p-8 text-center space-y-4">
        <p className="text-sm text-gray-500">Financing Pre-Qualification</p>
        <h1 className="text-2xl font-bold text-gray-900">{vendor?.company_name || 'Dealer'} Financing Options</h1>
        <p className="text-gray-600">
          This request routes to {broker?.company_name || 'the broker'} for follow-up and next steps.
        </p>
        <p className="text-sm text-gray-500">
          A public buyer pre-qual form can be connected here in phase 2.
        </p>
        <Link href="/login" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#111827] text-white font-semibold">
          Continue
        </Link>
      </div>
    </div>
  )
}
