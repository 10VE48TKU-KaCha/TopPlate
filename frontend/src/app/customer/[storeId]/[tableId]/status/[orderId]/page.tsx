'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Order } from '@/types';
import { CheckCircle2, Clock, Flame, ChefHat, Sparkles } from 'lucide-react';

export default function CustomerOrderStatusPage({
  params,
}: {
  params: { storeId: string; tableId: string; orderId: string };
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const data = await apiFetch<Order>(`/orders/customer/status/${params.orderId}`);
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Poll status every 5 seconds
    return () => clearInterval(interval);
  }, [params.orderId]);

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs">
        Connecting to kitchen live stream...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-12 text-center text-rose-400 text-xs">
        Order ticket not found.
      </div>
    );
  }

  const steps = [
    { status: 'PENDING', label: 'Ticket Received', icon: Clock },
    { status: 'COOKING', label: 'Chef Cooking', icon: Flame },
    { status: 'SERVED', label: 'Served to Table', icon: ChefHat },
  ];

  const currentStepIndex = steps.findIndex((s) => s.status === order.status);

  return (
    <div className="space-y-6 py-4">
      {/* Ticket Header */}
      <div className="glass-panel p-6 rounded-3xl text-center space-y-3 border border-emerald-500/30">
        <div className="inline-flex bg-emerald-500/10 text-emerald-400 p-3 rounded-full">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-extrabold text-white">Order Tracked</h2>
        <p className="text-xs text-slate-400 font-mono">
          Ticket #{order.id.slice(0, 8)} • Table {params.tableId}
        </p>
      </div>

      {/* Progress Timeline */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
        <h3 className="text-sm font-bold text-white text-center">Live Kitchen Status</h3>

        <div className="space-y-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = currentStepIndex >= idx || order.status === 'COMPLETED';
            const isCurrent = order.status === step.status;

            return (
              <div key={step.status} className="flex items-center space-x-3">
                <div
                  className={`p-2.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30 animate-pulse'
                      : isDone
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-900 text-slate-600 border-slate-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-xs ${isDone ? 'text-white' : 'text-slate-500'}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {isCurrent ? 'In progress now...' : isDone ? 'Completed' : 'Upcoming'}
                  </p>
                </div>
                {isDone && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Item summary */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Ordered Items</h4>
        <div className="divide-y divide-slate-800/80">
          {order.orderItems.map((oi) => (
            <div key={oi.id} className="py-2 flex justify-between text-xs">
              <span className="text-slate-300 font-medium">
                {oi.quantity}x {oi.menuItemName || 'Dish'}
              </span>
              <span className="font-mono text-emerald-400">${oi.subtotal.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
          <span>Total Paid</span>
          <span className="font-mono text-emerald-400">${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
