import Link from 'next/link'
import { ArrowRight, Package, TrendingUp, Users, Shield, Clock, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F9FAFB]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#111827]">VendorBuddy</span>
            </div>
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#111827] via-[#1F2937] to-[#111827] animate-gradient-shift"></div>

        {/* Animated grid pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-grid-pattern animate-grid-flow"></div>
        </div>

        {/* Floating animated orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-full blur-3xl opacity-30 animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-[#EA580C] to-[#F97316] rounded-full blur-3xl opacity-20 animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-full blur-3xl opacity-25 animate-pulse-slow"></div>

        {/* Geometric floating shapes */}
        <div className="absolute top-32 right-1/4 w-16 h-16 border-2 border-[#F97316] rotate-45 animate-spin-slow opacity-40"></div>
        <div className="absolute bottom-32 left-1/3 w-12 h-12 bg-[#F97316]/20 rounded-lg animate-float-reverse"></div>
        <div className="absolute top-1/2 right-12 w-20 h-20 border-2 border-[#EA580C] rounded-full animate-pulse-glow opacity-50"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F97316]/20 border border-[#F97316]/40 rounded-full mb-6 backdrop-blur-sm animate-fade-in-up shadow-lg shadow-[#F97316]/20">
              <div className="w-2 h-2 bg-[#F97316] rounded-full animate-pulse-fast"></div>
              <span className="text-sm font-medium text-[#FED7AA]">Your Complete Vendor Management Solution</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in-up animation-delay-100">
              <span className="text-white">Streamline Your</span>
              <span className="block bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#EA580C] text-transparent bg-clip-text animate-gradient-text bg-300% mt-2">
                Vendor Operations
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Manage vendors, track performance, and optimize your supply chain with powerful tools designed for modern businesses.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-300">
              <Link
                href="/register"
                className="group px-8 py-4 bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#F97316] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#F97316]/50 hover:shadow-xl hover:shadow-[#F97316]/60 hover:scale-105 active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center animate-glow-pulse"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border-2 border-white/20 hover:border-[#F97316]/60 transition-all shadow-sm hover:shadow-md backdrop-blur-sm w-full sm:w-auto text-center"
              >
                Login to Dashboard
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-300 animate-fade-in-up animation-delay-400">
              <div className="flex items-center gap-2 group">
                <Shield className="w-5 h-5 text-[#F97316] group-hover:scale-110 transition-transform" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2 group">
                <Clock className="w-5 h-5 text-[#F97316] group-hover:scale-110 transition-transform" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade to white */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] mb-4">
              Everything You Need to Manage Vendors
            </h2>
            <p className="text-lg text-[#4B5563] max-w-2xl mx-auto">
              Powerful features that help you build stronger vendor relationships and drive business growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-gradient-to-br from-white to-[#F9FAFB] rounded-2xl border border-gray-200 hover:border-[#F97316]/30 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3">Vendor Directory</h3>
              <p className="text-[#4B5563] leading-relaxed">
                Centralize all vendor information in one secure, searchable database with custom fields and categories.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-gradient-to-br from-white to-[#F9FAFB] rounded-2xl border border-gray-200 hover:border-[#F97316]/30 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3">Performance Analytics</h3>
              <p className="text-[#4B5563] leading-relaxed">
                Track KPIs, monitor delivery times, and generate comprehensive reports to optimize vendor performance.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-gradient-to-br from-white to-[#F9FAFB] rounded-2xl border border-gray-200 hover:border-[#F97316]/30 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3">Cost Optimization</h3>
              <p className="text-[#4B5563] leading-relaxed">
                Identify cost-saving opportunities and negotiate better terms with data-driven insights.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 bg-gradient-to-br from-white to-[#F9FAFB] rounded-2xl border border-gray-200 hover:border-[#F97316]/30 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3">Team Collaboration</h3>
              <p className="text-[#4B5563] leading-relaxed">
                Enable seamless collaboration across departments with role-based access and shared workflows.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 bg-gradient-to-br from-white to-[#F9FAFB] rounded-2xl border border-gray-200 hover:border-[#F97316]/30 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3">Compliance Tracking</h3>
              <p className="text-[#4B5563] leading-relaxed">
                Ensure vendor compliance with automated tracking of certifications, licenses, and documentation.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 bg-gradient-to-br from-white to-[#F9FAFB] rounded-2xl border border-gray-200 hover:border-[#F97316]/30 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3">Real-time Updates</h3>
              <p className="text-[#4B5563] leading-relaxed">
                Stay informed with instant notifications about vendor activities, deadlines, and important changes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-3xl p-12 sm:p-16 text-center shadow-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Vendor Management?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join hundreds of businesses that trust VendorBuddy to streamline their operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/register"
                className="group px-8 py-4 bg-white hover:bg-gray-50 text-[#F97316] font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-transparent hover:bg-white/10 text-white font-semibold rounded-xl border-2 border-white/30 hover:border-white transition-all w-full sm:w-auto text-center"
              >
                Login Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111827] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">VendorBuddy</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your trusted partner in vendor management and supply chain optimization.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-[#F97316] text-sm transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#F97316] text-sm transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#F97316] text-sm transition-colors">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#F97316] text-sm transition-colors">Roadmap</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-[#F97316] text-sm transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#F97316] text-sm transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#F97316] text-sm transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#F97316] text-sm transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-[#F97316] text-sm transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#F97316] text-sm transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#F97316] text-sm transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[#F97316] text-sm transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} VendorBuddy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
