import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export default function CookiesPage() {
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
              Cookie Policy
            </h1>
            <p className="text-[#4B5563]">
              Last updated: January 2026
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="prose prose-gray max-w-none">
              <h2 className="text-xl font-bold text-[#111827] mt-0">1. What Are Cookies</h2>
              <p className="text-[#4B5563]">
                Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences, keep you logged in, and provide a better user experience.
              </p>

              <h2 className="text-xl font-bold text-[#111827] mt-8">2. How We Use Cookies</h2>
              <p className="text-[#4B5563]">
                VendorBuddy uses cookies for the following purposes:
              </p>

              <h3 className="text-lg font-semibold text-[#111827] mt-6">Essential Cookies</h3>
              <p className="text-[#4B5563]">
                These cookies are necessary for the website to function properly. They enable core functionality such as security, authentication, and session management. You cannot opt out of these cookies.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 my-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-2 text-[#111827]">Cookie</th>
                      <th className="pb-2 text-[#111827]">Purpose</th>
                      <th className="pb-2 text-[#111827]">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-[#4B5563]">
                    <tr>
                      <td className="py-1">sb-access-token</td>
                      <td className="py-1">Authentication</td>
                      <td className="py-1">Session</td>
                    </tr>
                    <tr>
                      <td className="py-1">sb-refresh-token</td>
                      <td className="py-1">Session refresh</td>
                      <td className="py-1">7 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-[#111827] mt-6">Functional Cookies</h3>
              <p className="text-[#4B5563]">
                These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings. If you disable these cookies, some features may not work properly.
              </p>

              <h3 className="text-lg font-semibold text-[#111827] mt-6">Analytics Cookies</h3>
              <p className="text-[#4B5563]">
                We use analytics cookies to understand how visitors interact with our website. This helps us improve our service. All data is aggregated and anonymous.
              </p>

              <h2 className="text-xl font-bold text-[#111827] mt-8">3. Managing Cookies</h2>
              <p className="text-[#4B5563]">
                Most web browsers allow you to control cookies through their settings. You can:
              </p>
              <ul className="text-[#4B5563] space-y-2">
                <li>View what cookies are stored on your device</li>
                <li>Delete some or all cookies</li>
                <li>Block cookies from being set</li>
                <li>Set preferences for certain websites</li>
              </ul>
              <p className="text-[#4B5563] mt-4">
                Please note that blocking or deleting cookies may impact your experience on our website and limit certain functionality.
              </p>

              <h2 className="text-xl font-bold text-[#111827] mt-8">4. Third-Party Cookies</h2>
              <p className="text-[#4B5563]">
                Some cookies on our site are set by third-party services we use. These include:
              </p>
              <ul className="text-[#4B5563] space-y-2">
                <li><strong>Supabase:</strong> Authentication and database services</li>
                <li><strong>Vercel:</strong> Hosting and performance analytics</li>
              </ul>
              <p className="text-[#4B5563] mt-4">
                These third parties have their own privacy policies governing how they use your data.
              </p>

              <h2 className="text-xl font-bold text-[#111827] mt-8">5. Updates to This Policy</h2>
              <p className="text-[#4B5563]">
                We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
              </p>

              <h2 className="text-xl font-bold text-[#111827] mt-8">6. Contact Us</h2>
              <p className="text-[#4B5563]">
                If you have questions about our use of cookies, please contact us at:
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
