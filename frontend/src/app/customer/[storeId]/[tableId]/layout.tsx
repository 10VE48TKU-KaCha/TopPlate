'use client';

import React from 'react';
import { UtensilsCrossed, Bell } from 'lucide-react';

export default function CustomerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { storeId: string; tableId: string };
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-md mx-auto border-x border-slate-800 shadow-2xl">
      {/* Customer Mobile Top Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-xl text-white shadow-md">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm">TopPlate Dining</h1>
            <p className="text-[10px] text-emerald-400 font-mono">Digital Menu • Table {params.tableId}</p>
          </div>
        </div>

        <button
          onClick={() => alert('Staff notified! A waiter will assist your table shortly.')}
          className="flex items-center space-x-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-amber-500 hover:text-slate-950 transition-colors"
        >
          <Bell className="h-3.5 w-3.5" />
          <span>Call Staff</span>
        </button>
      </header>

      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
