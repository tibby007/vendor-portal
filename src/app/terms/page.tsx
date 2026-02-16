import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="text-[#4B5563]">
              Last updated: January 2026
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="prose prose-gray max-w-none">
              <h2 className="text-xl font-bold text-[#111827] mt-0">1. Acceptance of Terms</h2>
              <p className="text-[#4B5563]">
                By accessing or using VendorBuddy&apos;s services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>

              <h2 className="text-xl font-bold text-[#111827] mt-8">2. Description of Service</h2>
              <p className="text-[#4B5563]">
                VendorBuddy provides a vendor management platform that enables brokers to manage vendor relationships, process equipment financing applications, and facilitate communication between parties. Our services include deal tracking, document management, and analytics tools.
              </p>

              <h2 className="text-xl font-bold text-[#111827] mt-8">3. User Accounts</h2>
              <p className="text-[#4B5563]">
                To access our services, you must create an account. You agree to:
              </p>
              <ul className="text-[#4B5563] space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h2 className="text-xl font-bold text-[#111827] mt-8">4. Acceptable Use</h2>
              <p className="text-[#4B5563]">
                You agree not to:
              </p>
              <ul className="text-[#4B5563] space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the rights of others</li>
                <li>Upload malicious code or attempt to breach security</li>
                <li>Use the service for fraudulent purposes</li>
                <li>Interfere with the proper functioning of the service</li>
                <li>Share your account credentials with third parties</li>
              </ul>

              <h2 className="text-xl font-bold text-[#111827] mt-8">5. Intellectual Property</h2>
              <p className="text-[#4B5563]">
                VendorBuddy and its licensors retain all rights to the service, including all software, content, and trademarks. You retain ownership of content you upload but grant us a license to use it to provide our services.
              </p>

              <h2 className="text-xl font-bold text-[#111827] mt-8">6. Payment Terms</h2>
              <p className="text-[#4B5563]">
                If you subscribe to a paid plan, you agree to pay all applicable fees. Fees are non-refundable except as required by law. We may change our pricing with reasonable notice.
              </p>

              <h2 className="text-xl font-bold text-[#111827] mt-8">7. Termination</h2>
              <p className="text-[#4B5563]">
                We may suspend or terminate your account for violations of these terms. You may cancel your account at any time. Upon termination, your right to use the service ends immediately.
              </p>

              <h2 className="text-xl font-bold text-[#111827] mt-8">8. Disclaimer of Warranties</h2>
              <p className="text-[#4B5563]">
                The service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that the service will be uninterrupted, secure, or error-free.
              </p>

              <h2 className="text-xl font-bold text-[#111827] mt-8">9. Limitation of Liability</h2>
              <p className="text-[#4B5563]">
                To the maximum extent permitted by law, VendorBuddy shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.
              </p>

              <h2 className="text-xl font-bold text-[#111827] mt-8">10. Changes to Terms</h2>
              <p className="text-[#4B5563]">
                We may update these terms from time to time. We will notify you of material changes. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>

              <h2 className="text-xl font-bold text-[#111827] mt-8">11. Contact Us</h2>
              <p className="text-[#4B5563]">
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-[#4B5563]">
                Email: <a href="mailto:legal@vendorbuddy.com" className="text-[#F97316] hover:underline">legal@vendorbuddy.com</a>
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
