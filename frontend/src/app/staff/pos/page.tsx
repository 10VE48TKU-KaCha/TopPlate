'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { MenuItem, Category, Table } from '@/types';
import { ShoppingBag, Plus, Minus, Trash2, CheckCircle2, Utensils, Search, X } from 'lucide-react';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export default function StaffPOSPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [placing, setPlacing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, items, tbls] = await Promise.all([
          apiFetch<Category[]>('/menu/categories'),
          apiFetch<MenuItem[]>('/menu/items'),
          apiFetch<Table[]>('/tables'),
        ]);
        setCategories(cats);
        setMenuItems(items);
        setTables(tbls);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.menuItem.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.menuItem.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((ci) => {
          if (ci.menuItem.id === itemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const totalAmount = cart.reduce((sum, ci) => sum + ci.menuItem.price * ci.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true);
    setSuccessMsg(null);

    try {
      await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          tableId: selectedTableId || null,
          customerNotes: notes || null,
          items: cart.map((ci) => ({
            menuItemId: ci.menuItem.id,
            quantity: ci.quantity,
          })),
        }),
      });

      setSuccessMsg('Order dispatched to Kitchen Display System (KDS)! Stock auto-deducted.');
      setCart([]);
      setSelectedTableId('');
      setNotes('');
    } catch (err: any) {
      alert(`Error placing order: ${err.message}`);
    } finally {
      setPlacing(false);
    }
  };

  const filteredItems = menuItems.filter((i) => {
    const matchesCategory = activeCategory === 'ALL' || i.categoryId === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.description && i.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Menu Catalog (2 cols) */}
      <div className="lg:col-span-2 space-y-4">
        {/* Search Bar with Icon */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาเมนู / Search menu items..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Items
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === c.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => addToCart(item)}
              className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div>
                <h3 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                )}
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                <span className="text-amber-400 font-bold font-mono text-sm">${item.price.toFixed(2)}</span>
                <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                  <Plus className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart & Ticket Receipt Sidebar */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-amber-400" />
              <span>Current Order Ticket</span>
            </h2>
            <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-400">
              {cart.length} items
            </span>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Table Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Table (Optional)</label>
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="">Takeout / No Table</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tableNumber} ({t.status})
                </option>
              ))}
            </select>
          </div>

          {/* Cart Line Items */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <p className="text-slate-500 text-xs py-8 text-center">Tap items on the left to build the order.</p>
            ) : (
              cart.map((ci) => (
                <div key={ci.menuItem.id} className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2">
                    <p className="font-semibold text-slate-200">{ci.menuItem.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      ${ci.menuItem.price.toFixed(2)} x {ci.quantity} = ${(ci.menuItem.price * ci.quantity).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => updateQuantity(ci.menuItem.id, -1)}
                      className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="font-mono px-2 font-bold text-white text-xs">{ci.quantity}</span>
                    <button
                      onClick={() => updateQuantity(ci.menuItem.id, 1)}
                      className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Special instructions */}
          {cart.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Kitchen Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. No onion, extra spicy"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          )}
        </div>

        {/* Order Total & Submit */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="flex justify-between items-center text-sm font-bold text-white">
            <span>Total Payable</span>
            <span className="text-amber-400 font-mono text-xl">${totalAmount.toFixed(2)}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={cart.length === 0 || placing}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 text-sm"
          >
            {placing ? 'Dispatching...' : 'Place POS Order & Send to KDS'}
          </button>
        </div>
      </div>
    </div>
  );
}
