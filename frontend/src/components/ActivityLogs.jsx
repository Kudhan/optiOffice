import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { IconActivity, IconSearch, IconChevronLeft, IconChevronRight } from './Icons';

/**
 * ActivityLogs Component: High-fidelity administrative audit trail view
 * Supports date range filtering, type-based filtering, and dynamic pagination.
 */
function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'All',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1
  });

  useEffect(() => {
    fetchLogs();
  }, [filters.page, filters.type]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        type: filters.type,
      });
      
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const response = await apiClient.get(`/users/activity-logs?${queryParams.toString()}`);
      setLogs(response.data.logs);
      setPagination({
        total: response.data.total,
        page: response.data.page,
        pages: response.data.pages
      });
    } catch (err) {
      console.error("Failed to fetch activity logs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const formatTimestamp = (ts) => {
    return new Date(ts).toLocaleString('default', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="p-10 max-w-[1400px] mx-auto min-h-[85vh] animate-fade-in space-y-12">
      
      {/* Header & Control Intelligence */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-10">
        <div>
          <h2 className="text-5xl font-black text-content-main tracking-tighter uppercase italic leading-none">
            Activity <span className="text-sky-500">Records.</span>
          </h2>
          <p className="text-content-muted font-bold mt-4 uppercase tracking-widest text-xs">
            System-wide Audit Trail / Personnel Activity Tracker
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Chronological Range */}
          <div className="flex items-center gap-2 bg-primary-muted px-4 py-2 rounded-2xl border border-border shadow-inner">
            <input 
              type="date" 
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="bg-transparent text-[10px] font-black text-content-main outline-none uppercase"
              title="Start Date"
            />
            <span className="text-content-muted text-[10px] font-black uppercase opacity-40">to</span>
            <input 
              type="date" 
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="bg-transparent text-[10px] font-black text-content-main outline-none uppercase"
              title="End Date"
            />
            <button 
              onClick={fetchLogs}
              className="ml-2 w-8 h-8 flex items-center justify-center bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 active:scale-90"
            >
              <IconSearch className="w-4 h-4" />
            </button>
          </div>

          {/* Type Classification */}
          <div className="relative group">
            <select 
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="bg-primary-muted border border-border text-content-main text-[10px] font-black uppercase rounded-2xl px-6 py-4 outline-none appearance-none cursor-pointer hover:bg-primary-surface transition-all shadow-inner min-w-[160px]"
            >
              <option value="All">All Operations</option>
              <option value="Attendance">Attendance Nodes</option>
              <option value="Task">Task Lifecycles</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
              <IconChevronRight className="w-3 h-3 rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Audit Matrix */}
      <div className="bg-primary-surface border border-border rounded-[3rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead>
                <tr className="border-b border-border bg-primary-muted/30">
                <th className="px-10 py-6 text-[10px] font-black text-content-muted uppercase tracking-widest">Temporal Node</th>
                <th className="px-10 py-6 text-[10px] font-black text-content-muted uppercase tracking-widest">Personnel Identity</th>
                <th className="px-10 py-6 text-[10px] font-black text-content-muted uppercase tracking-widest text-center">Protocol Type</th>
                <th className="px-10 py-6 text-[10px] font-black text-content-muted uppercase tracking-widest text-center">Operation</th>
                <th className="px-10 py-6 text-[10px] font-black text-content-muted uppercase tracking-widest text-right">Data Context</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border">
                {loading ? (
                <tr><td colSpan="5" className="p-24 text-center animate-pulse text-content-muted font-bold italic tracking-tighter uppercase text-xs">Syncing activity stream...</td></tr>
                ) : logs.length === 0 ? (
                <tr><td colSpan="5" className="p-24 text-center text-content-muted font-black uppercase italic tracking-widest text-xs opacity-50">Zero records matching current selection.</td></tr>
                ) : (
                logs.map(log => (
                    <tr key={log.id} className="hover:bg-primary-muted/20 transition-all group">
                    <td className="px-10 py-8 text-[11px] font-bold text-content-muted font-mono tracking-tighter">
                        {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500 font-black text-sm border border-sky-500/20 shadow-inner group-hover:scale-110 transition-transform">
                            {(log.userId?.full_name || log.userName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-content-main font-black uppercase text-sm tracking-tighter leading-none">{log.userId?.full_name || log.userName}</p>
                            <p className="text-[10px] text-content-muted font-bold mt-1 opacity-60 underline decoration-sky-500/30">{log.userId?.email || 'System Operation'}</p>
                        </div>
                        </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${
                        log.type === 'Attendance' ? 'bg-sky-500/10 text-sky-500 border-sky-500/20' : 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                        }`}>
                        {log.type}
                        </span>
                    </td>
                    <td className="px-10 py-8 text-center">
                        <div className="flex flex-col items-center">
                            <span className="text-[11px] font-black text-content-main uppercase italic bg-primary-muted px-3 py-1 rounded-lg border border-border group-hover:bg-sky-500/10 group-hover:border-sky-500/30 transition-colors">
                                {log.action}
                            </span>
                        </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                        <div className="max-w-[240px] ml-auto">
                            <p className="text-[10px] font-bold text-content-muted truncate uppercase tracking-tighter" title={log.details}>
                                {log.details || 'Baseline Operation'}
                            </p>
                            <p className="text-[8px] font-black text-sky-500/50 uppercase mt-0.5 tracking-widest">{log.tenantId}</p>
                        </div>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>

        {/* Global Pagination Hub */}
        {pagination.pages > 1 && (
          <div className="px-10 py-8 bg-primary-muted/30 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <p className="text-[10px] font-black text-content-muted uppercase tracking-[0.2em]">
                Telemetry Feed Status: <span className="text-content-main">Online</span>
                </p>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
            
            <div className="flex items-center gap-6">
              <p className="text-[10px] font-black text-content-muted uppercase tracking-widest">
                Nodes <span className="text-content-main">{(pagination.page - 1) * filters.limit + 1} - {Math.min(pagination.page * filters.limit, pagination.total)}</span> of <span className="text-content-main">{pagination.total}</span>
              </p>
              
              <div className="flex items-center bg-primary-surface rounded-2xl border border-border p-1 shadow-lg">
                <button 
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-3 rounded-xl hover:bg-primary-muted disabled:opacity-20 transition-all text-content-muted hover:text-sky-500"
                >
                  <IconChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-6 flex flex-col items-center justify-center">
                    <span className="text-xs font-black text-content-main leading-none">{pagination.page}</span>
                    <span className="text-[8px] font-black text-content-muted uppercase mt-1">of {pagination.pages}</span>
                </div>
                <button 
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="p-3 rounded-xl hover:bg-primary-muted disabled:opacity-20 transition-all text-content-muted hover:text-sky-500"
                >
                  <IconChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Flare */}
      <div className="flex justify-center opacity-20 group">
         <div className="flex flex-col items-center gap-2">
            <IconActivity className="w-6 h-6 text-sky-500 group-hover:scale-125 transition-transform" />
            <span className="text-[8px] font-black uppercase tracking-[0.5em] text-content-muted">Identity Audit Core v1.0</span>
         </div>
      </div>
    </div>
  );
}

export default ActivityLogs;
