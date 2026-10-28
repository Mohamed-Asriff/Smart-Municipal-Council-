import React, { useState, useEffect } from 'react';
import { 
  Users, Search, ShieldCheck, Mail, Phone, Plus, 
  Pencil, Trash2, X, Loader2, MapPin, CreditCard, 
  UserCheck, CheckCircle2, User 
} from 'lucide-react';
import { api } from '../../api';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'CITIZEN' | 'ADMIN' | 'OFFICER'

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, userId: null, userName: '', isLoading: false });

  // Forms
  const initialForm = {
    name: '',
    email: '',
    phone: '',
    nic: '',
    assessmentNo: '',
    zone: 'Kalmunai Town',
    address: '',
    role: 'CITIZEN',
    status: 'Verified Citizen',
    password: 'password123'
  };
  const [form, setForm] = useState(initialForm);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.adminGetUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreate = () => {
    setForm(initialForm);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      nic: user.nic || '',
      assessmentNo: user.assessmentNo || '',
      zone: user.zone || 'Kalmunai Town',
      address: user.address || '',
      role: user.role || 'CITIZEN',
      status: user.status || 'Verified Citizen',
      password: ''
    });
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.adminCreateUser(form);
      setIsCreateOpen(false);
      setForm(initialForm);
      await fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to create citizen record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await api.adminUpdateUser(selectedUser.id, form);
      setIsEditOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to update citizen record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id, name) => {
    setConfirmDialog({ isOpen: true, userId: id, userName: name, isLoading: false });
  };

  const handleConfirmDelete = async () => {
    setConfirmDialog(prev => ({ ...prev, isLoading: true }));
    try {
      await api.adminDeleteUser(confirmDialog.userId);
      setConfirmDialog({ isOpen: false, userId: null, userName: '', isLoading: false });
      await fetchUsers();
    } catch (err) {
      setConfirmDialog(prev => ({ ...prev, isLoading: false }));
      alert(err.message || 'Failed to delete record');
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, userId: null, userName: '', isLoading: false });
  };

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q) ||
      (u.nic || '').toLowerCase().includes(q) ||
      (u.userCode || '').toLowerCase().includes(q) ||
      (u.assessmentNo || '').toLowerCase().includes(q);

    const matchesRole = roleFilter === 'ALL' || (u.role || '').toUpperCase() === roleFilter;

    return matchesSearch && matchesRole;
  });

  const citizenCount = users.filter(u => (u.role || '').toUpperCase() === 'CITIZEN').length;
  const staffCount = users.filter(u => (u.role || '').toUpperCase() !== 'CITIZEN').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-kmc-navy">Citizen Records</h1>
            <span className="bg-kmc-navy/10 text-kmc-navy text-xs font-bold px-2.5 py-0.5 rounded-full">
              {users.length} Total
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Manage registered citizens, tax assessment links, and municipal accounts.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input 
              type="text" 
              placeholder="Search name, NIC, tax ID..." 
              className="input-gov pl-9 py-2.5 text-xs w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button 
            onClick={handleOpenCreate}
            className="btn-gold py-2.5 px-4 text-xs shadow-sm flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Citizen</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs font-semibold">
        <button
          onClick={() => setRoleFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg border transition ${
            roleFilter === 'ALL'
              ? 'bg-kmc-navy text-white border-kmc-navy'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Accounts ({users.length})
        </button>
        <button
          onClick={() => setRoleFilter('CITIZEN')}
          className={`px-3 py-1.5 rounded-lg border transition ${
            roleFilter === 'CITIZEN'
              ? 'bg-kmc-navy text-white border-kmc-navy'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Citizens ({citizenCount})
        </button>
        <button
          onClick={() => setRoleFilter('ADMIN')}
          className={`px-3 py-1.5 rounded-lg border transition ${
            roleFilter === 'ADMIN'
              ? 'bg-kmc-navy text-white border-kmc-navy'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Staff & Admins ({staffCount})
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="p-4">Citizen / User</th>
                <th className="p-4">Contact Information</th>
                <th className="p-4">NIC & Assessment No</th>
                <th className="p-4">Zone & Address</th>
                <th className="p-4">Role & Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin text-kmc-blue mx-auto mb-2" />
                    Loading citizen records from database...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-500">
                    No citizen records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isCitizen = (user.role || '').toUpperCase() === 'CITIZEN';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition">
                      {/* Name & ID */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-kmc-navy flex items-center justify-center font-bold text-xs shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-kmc-navy leading-tight">{user.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{user.userCode || `USR-${user.id}`}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4 space-y-1">
                        <p className="text-xs flex items-center gap-1.5 text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-44">{user.email}</span>
                        </p>
                        <p className="text-xs flex items-center gap-1.5 text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{user.phone || 'â€”'}</span>
                        </p>
                      </td>

                      {/* NIC & Assessment */}
                      <td className="p-4 space-y-1">
                        <p className="text-xs font-mono font-bold text-kmc-blue">
                          {user.assessmentNo || 'â€”'}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          NIC: {user.nic || 'Not Provided'}
                        </p>
                      </td>

                      {/* Zone & Address */}
                      <td className="p-4 text-xs text-slate-600 max-w-xs">
                        <p className="font-semibold text-slate-700">{user.zone || 'Kalmunai'}</p>
                        <p className="text-slate-400 text-[11px] truncate">{user.address || 'â€”'}</p>
                      </td>

                      {/* Role & Status */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className={`badge-gov text-[10px] inline-flex items-center gap-1 ${
                            isCitizen ? 'badge-success' : 'badge-info'
                          }`}>
                            <ShieldCheck className="w-3 h-3"/> {user.role || 'CITIZEN'}
                          </span>
                          <p className="text-[10px] font-medium text-slate-500">{user.status || 'Active'}</p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            title="Edit Record"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-kmc-navy hover:bg-slate-100 transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            title="Delete Record"
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE CITIZEN MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-kmc-navy/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-kmc-navy p-4 flex justify-between items-center text-white shrink-0">
              <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-kmc-gold" />
                <span>Register New Citizen</span>
              </h3>
              <button onClick={() => setIsCreateOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. A. Mohamed Rizwan"
                  className="input-gov"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    required
                    type="email"
                    placeholder="citizen@gmail.com"
                    className="input-gov"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="077 123 4567"
                    className="input-gov"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIC Number</label>
                  <input
                    type="text"
                    placeholder="199214502891V"
                    className="input-gov"
                    value={form.nic}
                    onChange={(e) => setForm({ ...form, nic: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assessment Tax No</label>
                  <input
                    type="text"
                    placeholder="Leave blank to auto-generate"
                    className="input-gov"
                    value={form.assessmentNo}
                    onChange={(e) => setForm({ ...form, assessmentNo: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Zone / Ward</label>
                  <input
                    type="text"
                    placeholder="e.g. Sainthamaruthu - Ward 03"
                    className="input-gov"
                    value={form.zone}
                    onChange={(e) => setForm({ ...form, zone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Role</label>
                  <select
                    className="input-gov"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="CITIZEN">Citizen</option>
                    <option value="OFFICER">Municipal Officer</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  placeholder="e.g. Beach Road, Sainthamaruthu"
                  className="input-gov"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password</label>
                <input
                  type="password"
                  placeholder="Defaults to password123"
                  className="input-gov"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="btn-gov w-full py-3 font-bold mt-2"
              >
                {isSubmitting ? 'Registering...' : 'Register Citizen'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CITIZEN MODAL */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-kmc-navy/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-kmc-navy p-4 flex justify-between items-center text-white shrink-0">
              <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                <Pencil className="w-5 h-5 text-kmc-gold" />
                <span>Edit Citizen Record</span>
              </h3>
              <button onClick={() => setIsEditOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  required
                  type="text"
                  className="input-gov"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    required
                    type="email"
                    className="input-gov"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    className="input-gov"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIC Number</label>
                  <input
                    type="text"
                    className="input-gov"
                    value={form.nic}
                    onChange={(e) => setForm({ ...form, nic: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assessment Tax No</label>
                  <input
                    type="text"
                    className="input-gov"
                    value={form.assessmentNo}
                    onChange={(e) => setForm({ ...form, assessmentNo: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Zone / Ward</label>
                  <input
                    type="text"
                    className="input-gov"
                    value={form.zone}
                    onChange={(e) => setForm({ ...form, zone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Role</label>
                  <select
                    className="input-gov"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="CITIZEN">Citizen</option>
                    <option value="OFFICER">Municipal Officer</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Verification Status</label>
                  <select
                    className="input-gov"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="Verified Citizen">Verified Citizen</option>
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reset Password</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current"
                    className="input-gov"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  className="input-gov"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="btn-gov w-full py-3 font-bold mt-2"
              >
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ConfirmDialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        variant="danger"
        title="Delete Citizen Record"
        message={`Are you sure you want to permanently delete the record for "${confirmDialog.userName}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Keep Record"
        isLoading={confirmDialog.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
