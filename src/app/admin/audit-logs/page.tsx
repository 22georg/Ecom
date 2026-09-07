'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Search, Loader2 } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLogs(data.logs);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Administrative Audit Trail</h1>
        <p className="text-sm text-slate-400">
          Auditable history of administrative actions, entity modifications, stock adjustments, and state changes.
        </p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Administrator</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entity Type</th>
                <th className="py-3.5 px-4">Entity ID</th>
                <th className="py-3.5 px-4">Payload Diff / Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                    <span>Loading audit log entries...</span>
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 font-mono whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-200">{l.adminUser.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{l.adminUser.email}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{l.action}</td>
                    <td className="py-3.5 px-4 text-slate-300 font-semibold">{l.entityType}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[10px]">{l.entityId}</td>
                    <td className="py-3.5 px-4 max-w-xs">
                      {l.payload ? (
                        <pre className="text-[10px] font-mono bg-slate-950 p-2 rounded-lg text-slate-300 overflow-x-auto border border-slate-800">
                          {JSON.stringify(l.payload, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 italic">
                    No administrative audit logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
