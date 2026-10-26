import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, Mail, Phone } from 'lucide-react';
import { api } from '../../api';
import { formatDate } from '../../utils/formatters';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await api.adminGetUsers();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.assessmentNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-bold text-kmc-navy">Citizen Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage registered citizens and accounts.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input 
            type="text" 
            placeholder="Search by name, email, or ID..." 
            className="input-gov pl-9 py-3 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Assessment No</th>
              <th className="p-4">Role / Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan="4" className="p-8 text-center text-slate-500">Loading directory...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-slate-500">No citizens found.</td></tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition">
                  <td className="p-4">
                    <p className="font-bold text-kmc-navy">{user.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{user.userCode}</p>
                  </td>
                  <td className="p-4 space-y-1">
                    <p className="text-xs flex items-center gap-1 text-slate-600"><Mail className="w-3 h-3"/> {user.email}</p>
                    <p className="text-xs flex items-center gap-1 text-slate-600"><Phone className="w-3 h-3"/> {user.phone || 'N/A'}</p>
                  </td>
                  <td className="p-4 font-mono text-xs">{user.assessmentNo || '—'}</td>
                  <td className="p-4">
                    <span className="badge-gov badge-success text-[10px] flex items-center gap-1 w-max">
                      <ShieldCheck className="w-3 h-3"/> {user.role || 'CITIZEN'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}