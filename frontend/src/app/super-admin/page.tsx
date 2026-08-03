'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Store } from '@/types';
import { Plus, Store as StoreIcon, Phone, MapPin, ExternalLink, UserPlus } from 'lucide-react';

export default function SuperAdminPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Store[]>('/stores');
      setStores(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await apiFetch('/stores', {
        method: 'POST',
        body: JSON.stringify({ name, slug, address, phone }),
      });
      setMessage(`Store "${name}" onboarded successfully!`);
      setName('');
      setSlug('');
      setAddress('');
      setPhone('');
      fetchStores();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Create Store Form */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-700/60 h-fit">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Plus className="h-5 w-5 text-emerald-400" />
          <span>Onboard New Store</span>
        </h2>

        {message && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs">
            {message}
          </div>
        )}

        <form onSubmit={handleCreateStore} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Store Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
              }}
              placeholder="e.g. Bistro Central"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Slug URL Identifier</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="bistro-central"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, Suite 400"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 019-2831"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all text-sm disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Register Store Tenant'}
          </button>
        </form>
      </div>

      {/* Stores List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <StoreIcon className="h-5 w-5 text-purple-400" />
            <span>Active Store Tenants ({stores.length})</span>
          </h2>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading active stores...</p>
        ) : stores.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-sm">
            No stores registered yet. Use the form to onboard the first store tenant.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stores.map((s) => (
              <div
                key={s.id}
                className="glass-panel p-5 rounded-2xl border border-slate-700/50 space-y-3 hover:border-purple-500/40 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-base">{s.name}</h3>
                    <p className="text-xs text-purple-400 font-mono">slug: {s.slug}</p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-mono">
                    ID: {s.id.slice(0, 8)}...
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-400">
                  {s.address && (
                    <p className="flex items-center space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span>{s.address}</span>
                    </p>
                  )}
                  {s.phone && (
                    <p className="flex items-center space-x-1">
                      <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      <span>{s.phone}</span>
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <a
                    href={`/customer/${s.id}/tbl-1`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-medium"
                  >
                    <span>Preview QR Link</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    onClick={() => {
                      localStorage.setItem('selected_store_id', s.id);
                      window.location.href = '/admin/dashboard';
                    }}
                    className="text-purple-400 hover:text-purple-300 flex items-center space-x-1 font-medium bg-purple-500/10 px-2 py-1 rounded transition-colors hover:bg-purple-500/20"
                  >
                    <span>Manage Store</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
