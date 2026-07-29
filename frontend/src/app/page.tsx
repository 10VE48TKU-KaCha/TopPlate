import Link from 'next/link';
import { Shield, Store, Coffee, QrCode, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-12 py-6">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto pt-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
          <Zap className="h-4 w-4" />
          <span>Next-Gen Multi-Tenant Restaurant Engine</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
          Streamline Your Restaurant Operations with <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">TopPlate</span>
        </h1>
        <p className="text-lg text-slate-400">
          High-performance multi-tenant SaaS for restaurant chains & single stores. Real-time POS, Kitchen Display Systems (KDS), automated stock deduction, and mobile QR table ordering.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
          >
            <span>Access Platform</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/customer/demo-store-id/tbl-1"
            className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-6 py-3 rounded-xl border border-slate-700 transition-all"
          >
            <QrCode className="h-4 w-4 text-emerald-400" />
            <span>Try Customer QR Ordering</span>
          </Link>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {/* Super Admin */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 hover:border-emerald-500/40 transition-all">
          <div className="bg-purple-500/10 text-purple-400 p-3 rounded-xl w-fit border border-purple-500/20">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Super Admin Portal</h3>
          <p className="text-sm text-slate-400">
            Global SaaS management. Onboard new store tenants, monitor multi-store metrics, and manage system users.
          </p>
          <Link
            href="/super-admin"
            className="inline-flex items-center text-sm font-semibold text-purple-400 hover:text-purple-300 space-x-1"
          >
            <span>Enter Super Admin</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Store Admin */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 hover:border-emerald-500/40 transition-all">
          <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl w-fit border border-emerald-500/20">
            <Store className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Store Admin Dashboard</h3>
          <p className="text-sm text-slate-400">
            Manage store menu items, recipe ingredients, inventory stock thresholds, and employee staff accounts.
          </p>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center text-sm font-semibold text-emerald-400 hover:text-emerald-300 space-x-1"
          >
            <span>Enter Store Admin</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Staff & Kitchen */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 hover:border-emerald-500/40 transition-all">
          <div className="bg-amber-500/10 text-amber-400 p-3 rounded-xl w-fit border border-amber-500/20">
            <Coffee className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Staff POS & KDS</h3>
          <p className="text-sm text-slate-400">
            Cashier order placement interface, Table layout map, and Kitchen Display System for live order cooking status updates.
          </p>
          <Link
            href="/staff/pos"
            className="inline-flex items-center text-sm font-semibold text-amber-400 hover:text-amber-300 space-x-1"
          >
            <span>Launch POS / KDS</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="glass-card p-8 rounded-3xl space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">Engineered for Enterprise SaaS Security</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-900/50">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-white text-sm">Zero-Trust Isolation</h4>
              <p className="text-xs text-slate-400">`storeId` extracted strictly from signed JWT claims.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-900/50">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-white text-sm">Auto Stock Deduction</h4>
              <p className="text-xs text-slate-400">Ingredient quantities auto-deducted per dish recipe.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-900/50">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-white text-sm">Real-time KDS Workflows</h4>
              <p className="text-xs text-slate-400">PENDING → COOKING → SERVED → COMPLETED lifecycle.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-900/50">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-white text-sm">FastAPI & Next.js</h4>
              <p className="text-xs text-slate-400">Asynchronous Python backend + modern React UI.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
