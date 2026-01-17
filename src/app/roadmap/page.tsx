import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, CheckCircle, Circle, Clock } from 'lucide-react'

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F9FAFB]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="VendorBuddy Mascot"
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
                priority
              />
              <span className="text-xl font-bold text-[#111827]">
                <span className="text-[#374151]">Vendor</span>
                <span className="text-[#F97316]">Buddy</span>
              </span>
            </Link>
            <nav className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-[#1F2937] hover:text-[#F97316] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
              >
                Sign Up
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#4B5563] hover:text-[#F97316] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-[#111827] mb-4">
              Product Roadmap
            </h1>
            <p className="text-xl text-[#4B5563]">
              See what we&apos;re building and what&apos;s coming next for VendorBuddy.
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-8">
            {/* Completed Phase */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#111827]">Phase 1: Foundation</h2>
                  <span className="text-sm text-green-600 font-medium">Completed</span>
                </div>
              </div>
              <ul className="space-y-3 ml-13">
                {[
                  'Modern landing page with brand theming',
                  'Broker registration and authentication',
                  'Vendor invitation system',
                  'Secure login with Supabase Auth',
                  'Role-based dashboard routing',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-[#4B5563]">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* In Progress Phase */}
            <div className="bg-white rounded-2xl border-2 border-[#F97316] p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#FED7AA] rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#F97316]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#111827]">Phase 2: Deal Management</h2>
                  <span className="text-sm text-[#F97316] font-medium">In Progress</span>
                </div>
              </div>
              <ul className="space-y-3 ml-13">
                {[
                  'Multi-step application form',
                  'Document upload and management',
                  'Drag-and-drop file handling',
                  'Document categorization and preview',
                  'Auto-save draft functionality',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-[#4B5563]">
                    <Circle className="w-4 h-4 text-[#F97316] flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Upcoming Phases */}
            {[
              {
                title: 'Phase 3: Pipeline View',
                items: ['Customizable kanban stages', 'Drag-and-drop deal movement', 'Quick deal preview cards', 'Stage-based filtering'],
              },
              {
                title: 'Phase 4: Broker Tools',
                items: ['Document review interface', 'Approval workflows', 'Vendor directory', 'Performance metrics'],
              },
              {
                title: 'Phase 5: Messaging',
                items: ['In-app messaging', 'Deal-specific threads', 'File sharing', 'Email notifications'],
              },
              {
                title: 'Phase 6: Analytics',
                items: ['Deal volume charts', 'Conversion metrics', 'Funding amounts tracking', 'Pipeline health dashboard'],
              },
            ].map((phase, phaseIndex) => (
              <div key={phaseIndex} className="bg-white rounded-2xl border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Circle className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#111827]">{phase.title}</h2>
                    <span className="text-sm text-gray-500 font-medium">Upcoming</span>
                  </div>
                </div>
                <ul className="space-y-3 ml-13">
                  {phase.items.map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-[#4B5563]">
                      <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Feedback CTA */}
          <div className="mt-12 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Have a Feature Request?</h2>
            <p className="text-white/90 mb-6">
              We&apos;d love to hear your ideas. Help us shape the future of VendorBuddy.
            </p>
            <a
              href="mailto:feedback@vendorbuddy.com"
              className="inline-block px-6 py-3 bg-white text-[#F97316] font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Share Your Ideas
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#111827] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} VendorBuddy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
