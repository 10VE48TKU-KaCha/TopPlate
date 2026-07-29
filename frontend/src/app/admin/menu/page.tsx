'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Category, MenuItem } from '@/types';
import { Plus, Utensils, FolderPlus, Tag, DollarSign } from 'lucide-react';

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Category form state
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // MenuItem form state
  const [itemName, setItemName] = useState('');
  const [itemCategoryId, setItemCategoryId] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDesc, setItemDesc] = useState('');

  const [msg, setMsg] = useState<string | null>(null);

  const loadMenuData = async () => {
    try {
      setLoading(true);
      const [cats, items] = await Promise.all([
        apiFetch<Category[]>('/menu/categories'),
        apiFetch<MenuItem[]>('/menu/items'),
      ]);
      setCategories(cats);
      setMenuItems(items);
      if (cats.length > 0 && !itemCategoryId) {
        setItemCategoryId(cats[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuData();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/menu/categories', {
        method: 'POST',
        body: JSON.stringify({ name: catName, description: catDesc }),
      });
      setCatName('');
      setCatDesc('');
      setMsg('Category added successfully!');
      loadMenuData();
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    }
  };

  const handleCreateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/menu/items', {
        method: 'POST',
        body: JSON.stringify({
          categoryId: itemCategoryId,
          name: itemName,
          description: itemDesc,
          price: parseFloat(itemPrice),
          isAvailable: true,
        }),
      });
      setItemName('');
      setItemPrice('');
      setItemDesc('');
      setMsg('Menu item added successfully!');
      loadMenuData();
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">
      {msg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs">
          {msg}
        </div>
      )}

      {/* Forms grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Form */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-700/60">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <FolderPlus className="h-5 w-5 text-emerald-400" />
            <span>Add Menu Category</span>
          </h2>
          <form onSubmit={handleCreateCategory} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category Name</label>
              <input
                type="text"
                required
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g. Starters, Main Course, Drinks"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
              <input
                type="text"
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="Brief category summary"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold py-2 rounded-xl text-xs transition-all"
            >
              Save Category
            </button>
          </form>
        </div>

        {/* Menu Item Form */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-700/60">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Plus className="h-5 w-5 text-emerald-400" />
            <span>Add Dish / Drink Item</span>
          </h2>
          <form onSubmit={handleCreateMenuItem} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={itemCategoryId}
                  onChange={(e) => setItemCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  placeholder="14.99"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dish Name</label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Signature Truffle Burger"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <input
                type="text"
                value={itemDesc}
                onChange={(e) => setItemDesc(e.target.value)}
                placeholder="Ingredients & taste notes"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20"
            >
              Add Menu Item
            </button>
          </form>
        </div>
      </div>

      {/* Menu Catalog Display */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/50 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Utensils className="h-5 w-5 text-emerald-400" />
          <span>Active Menu Items Catalog ({menuItems.length})</span>
        </h2>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading store catalog...</p>
        ) : menuItems.length === 0 ? (
          <p className="text-slate-500 text-sm py-4 text-center">No menu items configured for this store tenant.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="glass-card p-4 rounded-xl space-y-2 border border-slate-800 hover:border-emerald-500/40 transition-all"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-white text-sm">{item.name}</h3>
                  <span className="text-emerald-400 font-bold font-mono text-sm">${item.price.toFixed(2)}</span>
                </div>
                {item.description && (
                  <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                )}
                <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-800/80">
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-medium">
                    {categories.find((c) => c.id === item.categoryId)?.name || 'Category'}
                  </span>
                  <span className={item.isAvailable ? 'text-emerald-400 font-semibold' : 'text-rose-400'}>
                    {item.isAvailable ? 'AVAILABLE' : 'SOLD OUT'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
