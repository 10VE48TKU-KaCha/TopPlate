'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { FinancialsSummary, MenuProfitabilityItem } from '@/types';
import { BarChart3, TrendingUp, DollarSign, Coins, Award, ArrowUpRight } from 'lucide-react';

export default function AdminReportsPage() {
  const [financials, setFinancials] = useState<FinancialsSummary | null>(null);
  const [profitability, setProfitability] = useState<MenuProfitabilityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const [finData, profData] = await Promise.all([
          apiFetch<FinancialsSummary>('/reports/financials'),
          apiFetch<MenuProfitabilityItem[]>('/reports/menu-profitability'),
        ]);
        setFinancials(finData);
        setProfitability(profData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  return (
    <div className="space-y-8">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Sales (ยอดขายรวม)</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">฿{(financials?.totalRevenue || 0).toFixed(2)}</p>
          <span className="text-[11px] text-emerald-400 font-medium">All completed & active orders</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Material Cost (ต้นทุนวัตถุดิบ)</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">฿{(financials?.totalCost || 0).toFixed(2)}</p>
          <span className="text-[11px] text-amber-400 font-medium">Calculated from recipe stock</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Profit (กำไรสุทธิ)</span>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">฿{(financials?.grossProfit || 0).toFixed(2)}</p>
          <span className="text-[11px] text-cyan-400 font-medium">Gross Margin Ratio</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-700/50 space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Profit Margin %</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{(financials?.grossProfitMarginPercent || 0).toFixed(1)}%</p>
          <span className="text-[11px] text-indigo-400 font-medium">Average across catalog</span>
        </div>
      </div>

      {/* Menu Profitability Analysis Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/50 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-emerald-400" />
            <span>Menu Item Profitability & Cost Breakdown (รายงานผลกำไรแยกตามเมนู)</span>
          </h2>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm py-4">Calculating menu profit margins...</p>
        ) : profitability.length === 0 ? (
          <p className="text-slate-500 text-sm py-4 text-center">No menu items found to generate profitability report.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Menu Item</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Selling Price</th>
                  <th className="px-4 py-3">Recipe Cost (ต้นทุน)</th>
                  <th className="px-4 py-3">Profit / Unit</th>
                  <th className="px-4 py-3">Margin %</th>
                  <th className="px-4 py-3 text-center">Qty Sold</th>
                  <th className="px-4 py-3 text-right">Total Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {profitability.map((item) => {
                  const isHighMargin = item.profitMarginPercent >= 50;
                  const isMidMargin = item.profitMarginPercent >= 25 && item.profitMarginPercent < 50;
                  return (
                    <tr key={item.menuItemId} className="hover:bg-slate-900/40">
                      <td className="px-4 py-3 font-semibold text-slate-200">{item.menuItemName}</td>
                      <td className="px-4 py-3 text-slate-400">{item.categoryName || '-'}</td>
                      <td className="px-4 py-3 font-mono font-bold text-white">฿{item.price.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono font-bold text-amber-400">฿{item.recipeCost.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-400">฿{item.profitPerUnit.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isHighMargin
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isMidMargin
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {item.profitMarginPercent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-center text-slate-300">{item.totalQuantitySold}</td>
                      <td className="px-4 py-3 font-mono font-bold text-right text-cyan-400 text-sm">
                        ฿{item.totalProfit.toFixed(2)}
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
