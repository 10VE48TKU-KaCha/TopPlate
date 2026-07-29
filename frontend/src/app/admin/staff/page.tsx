'use client';

import React, { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Users, UserPlus, Mail, Lock, ShieldCheck } from 'lucide-react';

export default function AdminStaffPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleRegisterStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);

    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          email,
          password,
          role,
        }),
      });
      setMsg(`Staff member "${fullName}" registered successfully!`);
      setFullName('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <UserPlus className="h-5 w-5 text-emerald-400" />
          <span>Register Store Employee / Staff</span>
        </h2>
        <p className="text-xs text-slate-400">
          Create accounts for cashiers, waitstaff, or kitchen chefs with direct access to POS and KDS.
        </p>

        {msg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs">
            {msg}
          </div>
        )}

        <form onSubmit={handleRegisterStaff} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@restaurant.com"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="EMPLOYEE">Employee (POS / KDS Access)</option>
              <option value="STORE_ADMIN">Store Admin (Full Manager Access)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all text-xs disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Register Employee Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
