'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Order, InventoryItem } from '@/types';
import { DollarSign, ShoppingBag, AlertTriangle, TrendingUp } from 'lucide-react';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [ordersData, invData] = await Promise.all([
          apiFetch<Order[]>('/orders'),
          apiFetch<InventoryItem[]>('/inventory'),
        ]);
        setOrders(ordersData);
        setInventory(invData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'CANCELLED' ? o.totalAmount : 0), 0);
  const totalCompletedOrders = orders.filter((o) => o.status === 'COMPLETED').length;
  const activeOrdersCount = orders.filter((o) => ['PENDING', 'COOKING', 'SERVED'].includes(o.status)).length;
  const lowStockItems = inventory.filter((item) => item.currentStock <= item.minStock);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Sales</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
          <span className="text-[11px] text-emerald-400 font-medium">Revenue across orders</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Orders</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{activeOrdersCount}</p>
          <span className="text-[11px] text-blue-400 font-medium">Currently in POS / KDS</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed Orders</span>
            <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{totalCompletedOrders}</p>
          <span className="text-[11px] text-teal-400 font-medium">Served and settled</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Low Stock Warnings</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{lowStockItems.length}</p>
          <span className="text-[11px] text-rose-400 font-medium">Requires replenishment</span>
        </div>
      </div>

      {/* Recent Orders & Stock Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Orders Summary */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-700/50 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center justify-between">
            <span>Recent Restaurant Orders</span>
            <span className="text-xs font-normal text-slate-400">Total: {orders.length}</span>
          </h3>

          {loading ? (
            <p className="text-slate-400 text-sm">Loading store metrics...</p>
          ) : orders.length === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center">No orders recorded yet for this tenant.</p>
          ) : (
            <div className="divide-y divide-slate-800 overflow-x-auto">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-200">
                      Order #{o.id.slice(0, 8)} • {o.tableNumber || 'Takeout'}
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      {o.orderItems.map((oi) => `${oi.quantity}x ${oi.menuItemName || 'Item'}`).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400">${o.totalAmount.toFixed(2)}</p>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/50 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            <span>Stock Alerts</span>
          </h3>

          {lowStockItems.length === 0 ? (
            <p className="text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
              ✓ All inventory items are above minimum stock thresholds.
            </p>
          ) : (
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-rose-200">{item.name}</p>
                    <p className="text-[10px] text-rose-400">Min threshold: {item.minStock} {item.unit}</p>
                  </div>
                  <span className="font-mono font-bold text-rose-400 bg-rose-950/60 px-2 py-1 rounded">
                    {item.currentStock} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
