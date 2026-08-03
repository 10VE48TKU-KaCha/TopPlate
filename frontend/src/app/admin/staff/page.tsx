'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Users, UserPlus, Edit2, Trash2, ShieldCheck, User } from 'lucide-react';

interface StaffModel {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffModel[]>([]);
  const [loading, setLoading] = useState(true);

  // Register State
  const [showRegister, setShowRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const role = 'EMPLOYEE';
  
  // Edit State
  const [editingStaff, setEditingStaff] = useState<StaffModel | null>(null);
  const [editFullName, setEditFullName] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<StaffModel[]>('/users');
      setStaffList(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleRegisterStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);

    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          email,
          password,
          role,
        }),
      });
      setMsg(`Staff member "${fullName}" registered successfully!`);
      setFullName('');
      setEmail('');
      setPassword('');
      fetchStaff();
      setTimeout(() => {
        setShowRegister(false);
        setMsg(null);
      }, 1500);
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (staffId: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await apiFetch(`/users/${staffId}`, { method: 'DELETE' });
      setStaffList(staffList.filter((s) => s.id !== staffId));
    } catch (err: any) {
      alert(`Error deleting staff: ${err.message}`);
    }
  };

  const startEdit = (staff: StaffModel) => {
    setEditingStaff(staff);
    setEditFullName(staff.fullName);
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setSubmitting(true);
    try {
      await apiFetch(`/users/${editingStaff.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          fullName: editFullName,
        }),
      });
      setEditingStaff(null);
      fetchStaff();
    } catch (err: any) {
      alert(`Error updating staff: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (r: string) => {
    if (r === 'STORE_ADMIN') {
      return <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-max"><ShieldCheck className="h-3 w-3" /> MANAGER</span>;
    }
    return <span className="bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-max"><User className="h-3 w-3" /> STAFF</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Users className="h-5 w-5 text-emerald-400" />
          <span>Store Staff ({staffList.length})</span>
        </h2>
        <button
          onClick={() => setShowRegister(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors shadow-lg shadow-emerald-600/20"
        >
          <UserPlus className="h-4 w-4" />
          <span>Register Staff</span>
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading staff members...</p>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Staff Member</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{staff.fullName}</div>
                    <div className="text-xs text-slate-500">{staff.email}</div>
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(staff.role)}</td>
                  <td className="px-6 py-4 text-right">
                    {staff.role === 'EMPLOYEE' && (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => startEdit(staff)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                          title="Edit Staff"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(staff.id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded transition-colors"
                          title="Remove Staff"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {staffList.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                    No staff members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingStaff && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Edit Staff Member</h3>
            <form onSubmit={handleUpdateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Register Store Employee</h3>
            <p className="text-xs text-slate-400 mb-4">
              Create accounts for cashiers, waitstaff, or managers.
            </p>

            {msg && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs">
                {msg}
              </div>
            )}

            <form onSubmit={handleRegisterStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@restaurant.com"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>



              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setShowRegister(false); setMsg(null); }}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-600/30 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Register Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
