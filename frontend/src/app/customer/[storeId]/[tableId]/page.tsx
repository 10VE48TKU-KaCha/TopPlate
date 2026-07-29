'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { MenuItem } from '@/types';
import { Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

interface CartItem {
  item: MenuItem;
  quantity: number;
}

export default function CustomerMenuPage({
  params,
}: {
  params: { storeId: string; tableId: string };
}) {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadPublicMenu() {
      try {
        setLoading(true);
        const data = await apiFetch<MenuItem[]>(`/menu/public/${params.storeId}`);
        setMenuItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPublicMenu();
  }, [params.storeId]);

  const updateQuantity = (item: MenuItem, delta: number) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (!existing && delta > 0) {
        return [...prev, { item, quantity: 1 }];
      }
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          return prev.filter((ci) => ci.item.id !== item.id);
        }
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: newQty } : ci
        );
      }
      return prev;
    });
  };

  const totalAmount = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

  const handlePlaceCustomerOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true);

    try {
      const order = await apiFetch<{ id: string }>(`/orders/customer/${params.storeId}`, {
        method: 'POST',
        body: JSON.stringify({
          tableId: params.tableId !== 'tbl-1' ? params.tableId : null,
          customerNotes: notes || null,
          items: cart.map((ci) => ({
            menuItemId: ci.item.id,
            quantity: ci.quantity,
          })),
        }),
      });

      router.push(`/customer/${params.storeId}/${params.tableId}/status/${order.id}`);
    } catch (err: any) {
      alert(`Failed to place order: ${err.message}`);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900/60 to-teal-900/60 p-4 rounded-2xl border border-emerald-500/20 space-y-1">
        <h2 className="font-extrabold text-white text-lg">Welcome to Our Table Menu</h2>
        <p className="text-xs text-slate-300">Tap items to add to your order. Fast direct kitchen delivery.</p>
      </div>

      {/* Dishes List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-slate-400 text-xs text-center py-6">Loading digital menu...</p>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No active menu items found for this store.
          </div>
        ) : (
          menuItems.map((item) => {
            const inCart = cart.find((ci) => ci.item.id === item.id);
            const qty = inCart ? inCart.quantity : 0;

            return (
              <div
                key={item.id}
                className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between space-x-3"
              >
                <div className="flex-1 space-y-1">
                  <h3 className="font-bold text-white text-sm">{item.name}</h3>
                  {item.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2">{item.description}</p>
                  )}
                  <p className="text-emerald-400 font-bold font-mono text-sm">${item.price.toFixed(2)}</p>
                </div>

                <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  {qty > 0 ? (
                    <>
                      <button
                        onClick={() => updateQuantity(item, -1)}
                        className="p-1.5 bg-slate-800 text-slate-300 rounded-lg hover:text-white"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-mono text-xs font-bold px-1 text-white">{qty}</span>
                      <button
                        onClick={() => updateQuantity(item, 1)}
                        className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => updateQuantity(item, 1)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-md"
                    >
                      Add +
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Checkout Dock */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50 glass-panel p-4 rounded-2xl border border-emerald-500/40 shadow-2xl space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Special Table Requests</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Allergy info, extra ice"
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400">Total Bill</p>
              <p className="text-emerald-400 font-mono font-bold text-lg">${totalAmount.toFixed(2)}</p>
            </div>

            <button
              onClick={handlePlaceCustomerOrder}
              disabled={placing}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-2 text-xs transition-all"
            >
              <span>{placing ? 'Sending...' : 'Place Order'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
