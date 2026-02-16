import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Target, Heart, Zap, Users } from 'lucide-react'

export default function AboutPage() {
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
              About VendorBuddy
            </h1>
            <p className="text-xl text-[#4B5563]">
              Transforming how brokers and vendors work together in equipment financing.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="bg-gradient-to-br from-[#111827] to-[#1F2937] rounded-2xl p-8 mb-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              To streamline the equipment financing process by creating an intuitive, modern platform that simplifies vendor-broker relationships, reduces friction in deal management, and accelerates funding timelines.
            </p>
          </div>

          {/* Story Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-12">
            <h2 className="text-2xl font-bold text-[#111827] mb-6">Our Story</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-[#4B5563] mb-4">
                VendorBuddy was born from a simple observation: the equipment financing industry was stuck in the past. Brokers juggled spreadsheets, email threads, and phone calls to manage their vendor relationships. Vendors struggled with opaque processes and long wait times for updates.
              </p>
              <p className="text-[#4B5563] mb-4">
                We knew there had to be a better way. So we built VendorBuddy&mdash;a platform designed from the ground up to modernize how brokers and vendors collaborate on equipment financing deals.
              </p>
              <p className="text-[#4B5563]">
                Today, VendorBuddy helps brokers manage their entire vendor network, track deals through every stage of the pipeline, and communicate seamlessly&mdash;all in one place.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#111827] mb-6 text-center">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-2xl border border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-2">Simplicity First</h3>
                <p className="text-[#4B5563]">
                  We believe powerful software should be easy to use. Every feature is designed with simplicity in mind.
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-2">Customer Obsessed</h3>
                <p className="text-[#4B5563]">
                  Our customers&apos; success is our success. We listen, learn, and build features that solve real problems.
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-2">Move Fast</h3>
                <p className="text-[#4B5563]">
                  We ship quickly and iterate often. Our users get continuous improvements and new features regularly.
                </p>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-2">Build Trust</h3>
                <p className="text-[#4B5563]">
                  Security and transparency are non-negotiable. Your data is protected and your trust is earned.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-white/90 mb-6">
              Join the growing community of brokers and vendors using VendorBuddy.
            </p>
            <Link
              href="/register"
              className="inline-block px-6 py-3 bg-white text-[#F97316] font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#111827] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} VendorBuddy. All rights reserved.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Are you a broker?{' '}
            <a
              href="https://www.vendormarketing.solutions/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#F97316] hover:underline"
            >
              VendorMarketing
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
