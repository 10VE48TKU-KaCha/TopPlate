'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Order } from '@/types';
import { Clock, Flame, CheckCircle, ChefHat, RefreshCw } from 'lucide-react';

export default function StaffKDSPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Order[]>('/orders');
      // Filter active orders only
      setOrders(data.filter((o) => ['PENDING', 'COOKING', 'SERVED'].includes(o.status)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Auto refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <ChefHat className="h-6 w-6 text-amber-400" />
          <span>Kitchen Display System (KDS)</span>
        </h2>
        <button
          onClick={fetchOrders}
          className="flex items-center space-x-1 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Tickets</span>
        </button>
      </div>

      {loading && orders.length === 0 ? (
        <p className="text-slate-400 text-sm">Syncing kitchen order queue...</p>
      ) : orders.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
          <ChefHat className="h-12 w-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">Kitchen Queue Clean!</h3>
          <p className="text-xs text-slate-500">No pending orders currently awaiting preparation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((o) => {
            const isPending = o.status === 'PENDING';
            const isCooking = o.status === 'COOKING';
            const isServed = o.status === 'SERVED';

            return (
              <div
                key={o.id}
                className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between space-y-4 shadow-xl transition-all ${
                  isPending
                    ? 'border-amber-500/50 bg-amber-950/20'
                    : isCooking
                    ? 'border-blue-500/50 bg-blue-950/20'
                    : 'border-emerald-500/50 bg-emerald-950/20'
                }`}
              >
                {/* Header */}
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-white text-lg">
                      Ticket #{o.id.slice(0, 6)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase tracking-wider ${
                        isPending
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : isCooking
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-semibold">
                    {o.tableNumber ? `Table: ${o.tableNumber}` : 'Takeout Order'}
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Placing Time: {new Date(o.createdAt).toLocaleTimeString()}</span>
                  </p>
                </div>

                {/* Items List */}
                <div className="space-y-2 border-t border-b border-slate-800/80 py-3 flex-1">
                  {o.orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs">
                      <span className="text-slate-200 font-semibold">
                        {item.quantity}x {item.menuItemName || 'Dish'}
                      </span>
                    </div>
                  ))}
                  {o.customerNotes && (
                    <div className="mt-2 text-[11px] bg-rose-500/10 border border-rose-500/20 text-rose-300 p-2 rounded-lg font-medium">
                      Note: {o.customerNotes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-1">
                  {isPending && (
                    <button
                      onClick={() => updateStatus(o.id, 'COOKING')}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1 shadow-lg shadow-blue-600/20"
                    >
                      <Flame className="h-4 w-4" />
                      <span>Start Preparation</span>
                    </button>
                  )}

                  {isCooking && (
                    <button
                      onClick={() => updateStatus(o.id, 'SERVED')}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1 shadow-lg shadow-amber-500/20"
                    >
                      <ChefHat className="h-4 w-4" />
                      <span>Mark Ready / Served</span>
                    </button>
                  )}

                  {isServed && (
                    <button
                      onClick={() => updateStatus(o.id, 'COMPLETED')}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1 shadow-lg shadow-emerald-600/20"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Complete & Clear Ticket</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
