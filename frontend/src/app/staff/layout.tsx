'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { Coffee, Monitor, Grid, ShoppingCart } from 'lucide-react';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = getAuthUser();
    if (!user) {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400">Verifying staff terminal session...</p>
      </div>
    );
  }

  const tabs = [
    { name: 'POS Cashier', href: '/staff/pos', icon: ShoppingCart },
    { name: 'Kitchen Display (KDS)', href: '/staff/kds', icon: Monitor },
    { name: 'Table Layout Map', href: '/staff/tables', icon: Grid },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-500/20 p-2 rounded-xl text-amber-400">
            <Coffee className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Staff Operational Terminal</h1>
            <p className="text-xs text-slate-400">Point of Sale, Kitchen Display & Dining Tables</p>
          </div>
        </div>

        <div className="flex space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}
