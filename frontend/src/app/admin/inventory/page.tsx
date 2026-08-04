'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { InventoryItem } from '@/types';
import { Package, Plus, AlertCircle, RefreshCw, Search, X } from 'lucide-react';

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [name, setName] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [unit, setUnit] = useState('kg');
  const [msg, setMsg] = useState<string | null>(null);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<InventoryItem[]>('/inventory');
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/inventory', {
        method: 'POST',
        body: JSON.stringify({
          name,
          currentStock: parseFloat(currentStock),
          minStock: parseFloat(minStock),
          unitCost: parseFloat(unitCost || '0'),
          unit,
        }),
      });
      setName('');
      setCurrentStock('');
      setMinStock('');
      setUnitCost('');
      setMsg('Ingredient added to inventory!');
      loadInventory();
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    }
  };

  const handleUpdateStock = async (itemId: string, newStock: number) => {
    try {
      await apiFetch(`/inventory/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ currentStock: newStock }),
      });
      loadInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUnitCost = async (itemId: string, newCost: number) => {
    try {
      await apiFetch(`/inventory/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ unitCost: newCost }),
      });
      loadInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter((item) =>
    searchQuery.trim() === '' ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {msg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs">
          {msg}
        </div>
      )}

      {/* Add ingredient form */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <Plus className="h-5 w-5 text-emerald-400" />
          <span>Track New Inventory Ingredient & Unit Cost</span>
        </h2>
        <form onSubmit={handleCreateItem} className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Item / Ingredient Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Beef Patty, Cheese, Rice"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Stock</label>
            <input
              type="number"
              step="0.1"
              required
              value={currentStock}
              onChange={(e) => setCurrentStock(e.target.value)}
              placeholder="50"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Min Threshold Alert</label>
            <input
              type="number"
              step="0.1"
              required
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              placeholder="10"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Unit Cost (฿/หน่วย)</label>
            <input
              type="number"
              step="0.01"
              required
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              placeholder="150.00"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 text-emerald-400 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Measurement Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="kg">kg (Kilograms)</option>
              <option value="grams">grams</option>
              <option value="liters">liters</option>
              <option value="pcs">pcs (Pieces)</option>
              <option value="packs">packs</option>
            </select>
          </div>

          <div className="sm:col-span-5">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20"
            >
              Add Inventory Item & Cost
            </button>
          </div>
        </form>
      </div>

      {/* Inventory table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Package className="h-5 w-5 text-emerald-400" />
            <span>Live Inventory & Unit Costs ({filteredItems.length})</span>
          </h2>

          {/* Search Bar with Icon */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาวัตถุดิบ / Search stock..."
              className="w-full pl-10 pr-10 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
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
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading stock levels...</p>
        ) : filteredItems.length === 0 ? (
          <p className="text-slate-500 text-sm py-4 text-center">
            {searchQuery ? `ไม่พบวัตถุดิบที่ค้นหา "${searchQuery}"` : 'No inventory items recorded for this store tenant.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Ingredient / Item</th>
                  <th className="px-4 py-3">Current Stock</th>
                  <th className="px-4 py-3">Unit Cost (ต้นทุน/หน่วย)</th>
                  <th className="px-4 py-3">Min Alert Threshold</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Quick Stock Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredItems.map((item) => {
                  const isLow = item.currentStock <= item.minStock;
                  return (
                    <tr key={item.id} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3 font-semibold text-slate-200">{item.name}</td>
                      <td className="px-4 py-3 font-mono font-bold text-white">
                        {item.currentStock} {item.unit}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                        ฿{(item.unitCost || 0).toFixed(2)} /{item.unit}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {item.minStock} {item.unit}
                      </td>
                      <td className="px-4 py-3">
                        {isLow ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <AlertCircle className="h-3 w-3" />
                            <span>LOW STOCK</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            OPTIMAL
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => handleUpdateStock(item.id, item.currentStock + 10)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded text-[11px] font-medium border border-slate-700"
                        >
                          +10 {item.unit}
                        </button>
                        <button
                          onClick={() => handleUpdateStock(item.id, item.currentStock + 50)}
                          className="bg-slate-800 hover:bg-slate-700 text-emerald-400 px-2 py-1 rounded text-[11px] font-medium border border-slate-700"
                        >
                          +50 {item.unit}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
