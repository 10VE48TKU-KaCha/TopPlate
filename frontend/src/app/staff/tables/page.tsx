'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Table } from '@/types';
import { Grid, Users, Plus } from 'lucide-react';

export default function StaffTablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  // New Table form state
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('4');

  const fetchTables = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Table[]>('/tables');
      setTables(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/tables', {
        method: 'POST',
        body: JSON.stringify({
          tableNumber,
          capacity: parseInt(capacity),
        }),
      });
      setTableNumber('');
      fetchTables();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleTableStatus = async (tableId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE';
    try {
      await apiFetch(`/tables/${tableId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchTables();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Table Form */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Grid className="h-5 w-5 text-amber-400" />
            <span>Floorplan Table Configuration</span>
          </h2>
          <p className="text-xs text-slate-400">Add dining tables to generate customer QR ordering routes.</p>
        </div>

        <form onSubmit={handleCreateTable} className="flex items-center space-x-2 w-full sm:w-auto">
          <input
            type="text"
            required
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="Table Number (e.g. Table 6)"
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
          />
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-16 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
            title="Capacity"
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs whitespace-nowrap shadow-md"
          >
            + Add Table
          </button>
        </form>
      </div>

      {/* Table Grid */}
      {loading ? (
        <p className="text-slate-400 text-sm">Loading floorplan...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {tables.map((t) => {
            const isOccupied = t.status === 'OCCUPIED';
            return (
              <div
                key={t.id}
                onClick={() => toggleTableStatus(t.id, t.status)}
                className={`glass-panel p-6 rounded-2xl border text-center space-y-3 cursor-pointer transition-all hover:scale-[1.02] ${
                  isOccupied
                    ? 'border-rose-500/50 bg-rose-950/20 text-rose-300'
                    : 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300'
                }`}
              >
                <div className="font-extrabold text-lg text-white">{t.tableNumber}</div>
                <div className="flex items-center justify-center space-x-1 text-xs text-slate-400">
                  <Users className="h-3.5 w-3.5" />
                  <span>Seats: {t.capacity}</span>
                </div>

                <div
                  className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                    isOccupied ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {t.status}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
