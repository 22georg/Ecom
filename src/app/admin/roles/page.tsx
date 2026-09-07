'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, CheckCircle, Loader2 } from 'lucide-react';

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/roles')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRoles(data.roles);
          setPermissions(data.permissions);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Role-Based Access Control (RBAC)</h1>
        <p className="text-sm text-slate-400">
          Inspect predefined administrative roles and granular backend permission mapping.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((r) => (
          <div key={r.id} className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">{r.userCount} Users</span>
            </div>

            <div>
              <h3 className="font-extrabold text-white text-lg">{r.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{r.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Granted Permissions ({r.permissions.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {r.permissions.map((p: string) => (
                  <span key={p} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-emerald-400">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
