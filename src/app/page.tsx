import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Users, FileText, KanbanSquare, Wrench } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F9FAFB]">
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="VendorOS"
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
                priority
              />
              <span className="text-xl font-bold text-[#111827]">VendorOS</span>
            </div>
            <nav className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-[#1F2937] hover:text-[#F97316] transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg transition-colors"
              >
                Request access
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#111827] leading-tight">
            VendorOS: Vendor-Driven Deal Flow for Brokers
          </h1>
          <p className="mt-6 text-lg text-[#4B5563] max-w-3xl mx-auto">
            Invite dealers into a branded portal, capture submissions cleanly, and track deal status without chasing documents.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-7 py-3.5 bg-[#111827] hover:bg-[#1F2937] text-white font-semibold rounded-xl"
            >
              Log in
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-7 py-3.5 border border-[#D1D5DB] hover:border-[#F97316] text-[#111827] font-semibold rounded-xl"
            >
              Request access
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4">
          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-semibold text-[#111827]">Invite Dealers in Minutes</h3>
            <p className="text-sm text-[#4B5563] mt-2">Dealers sign up under your brokerage via invite link.</p>
          </div>
          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-semibold text-[#111827]">Clean Deal Submissions</h3>
            <p className="text-sm text-[#4B5563] mt-2">Upload docs, submit deals, keep everything organized per dealer.</p>
          </div>
          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-semibold text-[#111827]">Status Tracking Without Chaos</h3>
            <p className="text-sm text-[#4B5563] mt-2">One pipeline view, fewer “any updates?” calls.</p>
          </div>
        </div>
      </section>

      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-white border-y">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-[#111827] mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-xl bg-[#F9FAFB] p-6 border">
              <p className="text-xs font-semibold text-[#F97316]">Step 1</p>
              <p className="mt-2 font-semibold text-[#111827]">Create your broker account</p>
            </div>
            <div className="rounded-xl bg-[#F9FAFB] p-6 border">
              <p className="text-xs font-semibold text-[#F97316]">Step 2</p>
              <p className="mt-2 font-semibold text-[#111827]">Invite dealers/vendors</p>
            </div>
            <div className="rounded-xl bg-[#F9FAFB] p-6 border">
              <p className="text-xs font-semibold text-[#F97316]">Step 3</p>
              <p className="mt-2 font-semibold text-[#111827]">Receive submissions and manage the pipeline</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-[#111827] mb-8 text-center">Built for Broker Workflows</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border bg-white p-5">
              <Users className="w-5 h-5 text-[#F97316]" />
              <h3 className="font-semibold mt-3 text-[#111827]">Vendor invites + dealer accounts</h3>
            </div>
            <div className="rounded-xl border bg-white p-5">
              <KanbanSquare className="w-5 h-5 text-[#F97316]" />
              <h3 className="font-semibold mt-3 text-[#111827]">Pipeline view by dealer and stage</h3>
            </div>
            <div className="rounded-xl border bg-white p-5">
              <FileText className="w-5 h-5 text-[#F97316]" />
              <h3 className="font-semibold mt-3 text-[#111827]">Templates/resources for dealer enablement</h3>
            </div>
            <div className="rounded-xl border bg-white p-5">
              <Wrench className="w-5 h-5 text-[#F97316]" />
              <h3 className="font-semibold mt-3 text-[#111827]">Dealer tools: scripts, pre-qual link, financing flyer</h3>
            </div>
          </div>

          <p className="text-center text-[#4B5563] mt-10 max-w-3xl mx-auto">
            VendorOS is not a lender. It’s the enablement layer brokers use to turn dealers into a repeatable deal source.
          </p>
        </div>
      </section>

      <footer className="bg-[#111827] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} VendorOS. All rights reserved.</p>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-[#F97316]">Privacy</Link>
            <Link href="/terms" className="text-gray-400 hover:text-[#F97316]">Terms</Link>
            <Link href="/cookies" className="text-gray-400 hover:text-[#F97316]">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
