'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { Shield, Store, Users } from 'lucide-react';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = getAuthUser();
    if (!user || user.role !== 'SUPER_ADMIN') {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400">Verifying Super Admin clearance...</p>
      </div>
    );
  }

  const tabs = [
    { name: 'Store Tenants', href: '/super-admin', icon: Store },
    { name: 'User Management', href: '/super-admin/users', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-500/20 p-2 rounded-xl text-purple-400">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Super Admin Control Center</h1>
            <p className="text-xs text-slate-400">Global SaaS tenant onboarding & multi-store administration</p>
          </div>
        </div>

        <div className="flex space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
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
