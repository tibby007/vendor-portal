import Link from 'next/link'
import Image from 'next/image'
import { Shield, Lock, Server, Eye, CheckCircle, ArrowLeft } from 'lucide-react'

export default function SecurityPage() {
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
              Security at VendorBuddy
            </h1>
            <p className="text-xl text-[#4B5563]">
              Your data security is our top priority. Learn about the measures we take to protect your information.
            </p>
          </div>

          {/* Security Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-2">End-to-End Encryption</h3>
              <p className="text-[#4B5563]">
                All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-2">SOC 2 Compliant</h3>
              <p className="text-[#4B5563]">
                Our infrastructure and processes are designed to meet SOC 2 Type II compliance standards.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center mb-4">
                <Server className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-2">Secure Infrastructure</h3>
              <p className="text-[#4B5563]">
                Hosted on enterprise-grade cloud infrastructure with redundancy and 99.9% uptime SLA.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-2">Access Controls</h3>
              <p className="text-[#4B5563]">
                Role-based access controls and row-level security ensure users only see their authorized data.
              </p>
            </div>
          </div>

          {/* Security Practices */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-12">
            <h2 className="text-2xl font-bold text-[#111827] mb-6">Our Security Practices</h2>
            <ul className="space-y-4">
              {[
                'Regular security audits and penetration testing',
                'Automated vulnerability scanning and patching',
                'Multi-factor authentication support',
                'Secure session management with automatic timeout',
                'Activity logging and audit trails',
                'Data backup and disaster recovery procedures',
                'Employee security training and background checks',
                'Incident response and breach notification protocols',
              ].map((practice, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#F97316] mt-0.5 flex-shrink-0" />
                  <span className="text-[#4B5563]">{practice}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Have Security Questions?</h2>
            <p className="text-white/90 mb-6">
              Our security team is here to help. Contact us for security inquiries or to report vulnerabilities.
            </p>
            <a
              href="mailto:security@vendorbuddy.com"
              className="inline-block px-6 py-3 bg-white text-[#F97316] font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Contact Security Team
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
