'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  User,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { formatDate } from '../../../lib/utils';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resourceFilter, setResourceFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      let query = `/admin/audit-logs?page=${page}&limit=20`;
      if (resourceFilter) query += `&resource=${encodeURIComponent(resourceFilter)}`;

      const res = await api.get(query);
      if (res.success) {
        setLogs(Array.isArray(res.data) ? res.data : []);
        if (res.meta?.totalPages) setTotalPages(res.meta.totalPages);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, resourceFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-amber-600" />
            Security & Admin Audit Trail
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            Immutable log of administrative operations, price modifications, status changes, and customer activations.
          </p>
        </div>

        <button
          onClick={() => fetchLogs()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 self-start sm:self-auto transition-all shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          Refresh Logs
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-stone-400" />
          <span className="text-xs font-semibold text-stone-700">Filter by Resource Entity</span>
        </div>

        <div>
          <select
            value={resourceFilter}
            onChange={(e) => {
              setResourceFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          >
            <option value="">All Entities</option>
            <option value="ORDER">Orders</option>
            <option value="ADVANCE_BOOKING">Advance Bookings</option>
            <option value="PRODUCT">Products</option>
            <option value="CATEGORY">Categories</option>
            <option value="USER">User Accounts</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-400 text-xs animate-pulse">
            Loading cryptographic audit logs...
          </div>
        ) : (!logs || logs.length === 0) ? (
          <div className="p-12 text-center">
            <ShieldAlert className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-stone-800 text-base">No audit events recorded</h3>
            <p className="text-stone-500 text-xs mt-1">Actions taken by administrators will be permanently logged here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50/80 text-stone-500 uppercase tracking-wider text-[11px] font-semibold border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Administrator</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Resource</th>
                  <th className="px-6 py-4">Resource Ref</th>
                  <th className="px-6 py-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-6 py-4 text-stone-500 text-xs">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-stone-900 block">{log.adminEmail}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-stone-700">
                        {log.resource}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-stone-500">
                      {log.resourceId}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-stone-400">
                      {log.ip || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
