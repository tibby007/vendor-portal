import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-[#4B5563]">
              Last updated: January 2026
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="prose prose-gray max-w-none">
              <h2 className="text-xl font-bold text-[#111827] mt-0">1. Introduction</h2>
              <p className="text-[#4B5563]">
                VendorBuddy (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our vendor management platform.
              </p>

              <h2 className="text-xl font-bold text-[#111827] mt-8">2. Information We Collect</h2>
              <p className="text-[#4B5563]">We collect information you provide directly to us, including:</p>
              <ul className="text-[#4B5563] space-y-2">
                <li>Account information (name, email address, company name)</li>
                <li>Profile information (business details, contact preferences)</li>
                <li>Deal and application data you submit through the platform</li>
                <li>Documents you upload to the platform</li>
                <li>Communications with us and other users</li>
              </ul>

              <h2 className="text-xl font-bold text-[#111827] mt-8">3. How We Use Your Information</h2>
              <p className="text-[#4B5563]">We use the information we collect to:</p>
              <ul className="text-[#4B5563] space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Detect, investigate, and prevent security incidents</li>
              </ul>

              <h2 className="text-xl font-bold text-[#111827] mt-8">4. Information Sharing</h2>
              <p className="text-[#4B5563]">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="text-[#4B5563] space-y-2">
                <li>With vendors or brokers you choose to work with on the platform</li>
                <li>With service providers who assist in our operations</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>In connection with a merger, acquisition, or sale of assets</li>
              </ul>

              <h2 className="text-xl font-bold text-[#111827] mt-8">5. Data Security</h2>
              <p className="text-[#4B5563]">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption of data in transit and at rest, regular security assessments, and access controls.
              </p>

              <h2 className="text-xl font-bold text-[#111827] mt-8">6. Data Retention</h2>
              <p className="text-[#4B5563]">
                We retain your information for as long as your account is active or as needed to provide services. We may retain certain information as required by law or for legitimate business purposes.
              </p>

              <h2 className="text-xl font-bold text-[#111827] mt-8">7. Your Rights</h2>
              <p className="text-[#4B5563]">
                Depending on your location, you may have rights regarding your personal information, including the right to access, correct, delete, or port your data. Contact us to exercise these rights.
              </p>

              <h2 className="text-xl font-bold text-[#111827] mt-8">8. Contact Us</h2>
              <p className="text-[#4B5563]">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-[#4B5563]">
                Email: <a href="mailto:privacy@vendorbuddy.com" className="text-[#F97316] hover:underline">privacy@vendorbuddy.com</a>
              </p>
            </div>
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
