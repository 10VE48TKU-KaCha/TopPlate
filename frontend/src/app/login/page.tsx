'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { setAuthData } from '@/lib/auth';
import { Lock, Mail, UtensilsCrossed, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('superadmin@topplate.com');
  const [password, setPassword] = useState('SuperAdminPass123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch<{
        access_token: string;
        user_id: string;
        email: string;
        role: string;
        full_name: string;
        store_id?: string;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setAuthData(data.access_token, {
        id: data.user_id,
        email: data.email,
        role: data.role as any,
        fullName: data.full_name,
        storeId: data.store_id,
      });

      // Redirect based on role
      if (data.role === 'SUPER_ADMIN') {
        router.push('/super-admin');
      } else if (data.role === 'STORE_ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/staff/pos');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full glass-panel p-8 rounded-3xl shadow-2xl border border-slate-700/60 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex bg-gradient-to-r from-emerald-500 to-teal-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/30">
            <UtensilsCrossed className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Sign In to TopPlate</h2>
          <p className="text-sm text-slate-400">Enter your credentials to access your store portal</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl flex items-center space-x-2 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                placeholder="name@restaurant.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01] disabled:opacity-50 text-sm"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="border-t border-slate-800 pt-4 text-center space-y-2">
          <p className="text-xs text-slate-400">Default Super Admin credentials:</p>
          <div className="bg-slate-900/60 p-2 rounded-lg text-[11px] font-mono text-emerald-400">
            superadmin@topplate.com / SuperAdminPass123!
          </div>
        </div>
      </div>
    </div>
  );
}
