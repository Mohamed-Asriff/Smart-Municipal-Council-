import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { api } from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await api.adminGetAllUsers();
      setUsers(Array.isArray(data) ? data : []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
      <h2 className="text-xl font-black text-white flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-red-500" />
        Registered Citizens ({users.length})
      </h2>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-zinc-500">No users yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800">
              <tr className="text-left text-xs text-zinc-500 uppercase">
                <th className="py-3 pr-4">Code</th>
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">NIC</th>
                <th className="py-3 pr-4">Role</th>
                <th className="py-3 pr-4">Zone</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-zinc-800/60">
                  <td className="py-3 pr-4 font-mono text-xs text-red-400">{u.userCode}</td>
                  <td className="py-3 pr-4 text-white font-semibold">{u.name}</td>
                  <td className="py-3 pr-4 text-zinc-300">{u.email}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-zinc-400">{u.nic}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.role === 'ADMIN'
                        ? 'bg-red-600 text-white'
                        : u.role === 'OFFICER'
                        ? 'bg-amber-600 text-white'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-zinc-400 text-xs">{u.zone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}