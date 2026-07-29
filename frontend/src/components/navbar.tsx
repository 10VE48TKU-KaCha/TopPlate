'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthUser, clearAuth } from '@/lib/auth';
import { User } from '@/types';
import { LogOut, UtensilsCrossed, Shield, Store, LayoutDashboard, Coffee, Layers } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setUser(getAuthUser());
  }, [pathname]);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    router.push('/login');
  };

  // Hide navbar on customer ordering view
  if (pathname?.startsWith('/customer')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-xl text-white shadow-lg shadow-emerald-500/20">
                <UtensilsCrossed className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                TopPlate
              </span>
            </Link>
          </div>

          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'SUPER_ADMIN' && (
                  <Link
                    href="/super-admin"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname?.startsWith('/super-admin')
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Super Admin</span>
                  </Link>
                )}

                {(user.role === 'STORE_ADMIN' || user.role === 'SUPER_ADMIN') && (
                  <Link
                    href="/admin/dashboard"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname?.startsWith('/admin')
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Store Admin</span>
                  </Link>
                )}

                {(user.role === 'EMPLOYEE' || user.role === 'STORE_ADMIN' || user.role === 'SUPER_ADMIN') && (
                  <Link
                    href="/staff/pos"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname?.startsWith('/staff')
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Coffee className="h-4 w-4" />
                    <span>Staff Portal</span>
                  </Link>
                )}

                <div className="h-4 w-px bg-slate-700 mx-2" />

                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-slate-200">{user.fullName}</p>
                    <p className="text-[10px] text-emerald-400 font-mono tracking-wide">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
