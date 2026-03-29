import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import apiClient from '../api/client';
import useAuth from '../hooks/useAuth';
import { 
  BarChart2, 
  Users, 
  Package, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Shield, 
  Download,
  Activity,
  Box,
  Monitor,
  Database,
  Search,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Strategic Print Guard: Ensuring High-Fidelity Ledger Exports
const reportStyles = `
@media print {
    @page {
        size: A4;
        margin: 15mm;
    }
    body {
        background: white !important;
        color: black !important;
    }
    aside, header, nav, .sticky, button, .flex-shrink-0 {
        display: none !important;
    }
    .space-y-10 {
        margin: 0 !important;
        padding: 0 !important;
    }
    .rounded-[3.5rem], .rounded-[3rem], .rounded-[2.5rem], .rounded-[4rem] {
        border-radius: 1rem !important;
        border: 1px solid #e2e8f0 !important;
    }
    .shadow-xl, .shadow-2xl, .shadow-sm {
        shadow: none !important;
        box-shadow: none !important;
    }
    .bg-slate-900, .bg-sky-500, .bg-slate-800 {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
    .grid {
        display: block !important;
    }
    .grid > div {
        page-break-inside: avoid !important;
        margin-bottom: 2rem !important;
        width: 100% !important;
    }
    .xl\\:col-span-8, .xl\\:col-span-12, .xl\\:col-span-4 {
        width: 100% !important;
    }
    .screen-only {
        display: none !important;
    }
    .print-only {
        display: block !important;
    }
}
.print-only {
    display: none;
}
.screen-only {
    display: block;
}
`;

const Reports = () => {
    const { isAdmin, isManager } = useAuth();
    const { showNavbar } = useOutletContext();
    const [activeTab, setActiveTab] = useState('hr');
    const [viewMode, setViewMode] = useState('bento'); // 'bento' or 'table'
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ hr: null, inventory: null, org: null });

    const [lastUpdated, setLastUpdated] = useState(new Date());



    const tabs = [
        { id: 'hr', label: 'HR Intelligence', icon: <Users size={18} /> },
        { id: 'inventory', label: 'Asset Ledger', icon: <Package size={18} /> },
        { id: 'org', label: 'Site Operations', icon: <Activity size={18} />, adminOnly: true }
    ];

    const fetchData = async (tab) => {
        try {
            setLoading(true);
            const endpoint = `/reports/${tab}`;
            const response = await apiClient.get(endpoint);
            setData(prev => ({ ...prev, [tab]: response.data }));
        } catch (err) {
            console.error(`Failed to fetch ${tab} analytics`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(activeTab);
        
        // Real-time Synchronization: 30s Polling Cycle
        const interval = setInterval(() => {
            fetchData(activeTab);
            setLastUpdated(new Date());
        }, 30000);

        return () => clearInterval(interval);
    }, [activeTab]);

    const ProgressBar = ({ value, max, color = "bg-sky-500" }) => (
        <div className="w-full bg-slate-100 dark:bg-slate-700/50 h-2 rounded-full overflow-hidden">
            <div 
                style={{ width: `${(value / max) * 100}%` }}
                className={`h-full ${color} rounded-full transition-all duration-500`}
            />
        </div>
    );

    const StatCard = ({ title, value, subtitle, icon, colorClass }) => (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</h4>
                {subtitle && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-1">{subtitle}</p>}
            </div>
            <div className={`absolute top-6 right-6 p-3 rounded-2xl ${colorClass} opacity-20 group-hover:opacity-100 transition-all group-hover:scale-110`}>
                {icon}
            </div>
        </div>
    );

    const DataTable = ({ headers, data, title, icon, color = "sky", compact = false, paginate = true }) => {
        const [currentPage, setCurrentPage] = useState(1);
        const rowsPerPage = compact ? 5 : 10;
        
        // Pagination Logic (Screen-only)
        const totalPages = Math.ceil((data?.length || 0) / rowsPerPage);
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const displayedData = paginate ? data?.slice(startIndex, endIndex) : data;

        return (
            <div className={`bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm ${compact ? 'scale-95 origin-top' : ''}`}>
                <div className={`px-10 py-8 border-b border-slate-50 dark:border-slate-700/50 flex items-center justify-between bg-gradient-to-r from-${color}-500/5 to-transparent`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-500`}>
                            {icon}
                        </div>
                        <h5 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                            {title}
                        </h5>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg">
                            {data?.length || 0} Total Nodes
                        </span>
                        {paginate && totalPages > 1 && (
                            <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest bg-sky-500/5 px-3 py-1.5 rounded-lg border border-sky-500/10">
                                Page {currentPage} of {totalPages}
                            </span>
                        )}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                                {headers.map((h, i) => (
                                    <th key={i} className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                            {(displayedData || []).map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                    {Object.values(row).map((val, j) => (
                                        <td key={j} className="px-10 py-6 text-sm font-bold text-slate-700 dark:text-slate-200">
                                            {val}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {(!data || data.length === 0) && (
                                <tr>
                                    <td colSpan={headers.length} className="px-10 py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest italic opacity-50">
                                        No tactical data points synchronized for this sector.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls (Dashboard Only) */}
                {paginate && totalPages > 1 && (
                    <div className="px-10 py-6 bg-slate-50/30 dark:bg-slate-900/30 border-t border-slate-50 dark:border-slate-700/50 flex items-center justify-between">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                        >
                            <ChevronRight className="rotate-180" size={14} />
                            Previous
                        </button>
                        <div className="flex gap-2">
                             {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                                 <button 
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-sky-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                 >
                                    {i + 1}
                                 </button>
                             ))}
                        </div>
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                        >
                            Next
                            <ChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const renderHR = () => {
        const hr = data.hr;
        if (!hr) return null;

        if (viewMode === 'table') {
            return (
                <div className="space-y-8">
                    <DataTable 
                        title="Attendance Status Ledger"
                        icon={<Users size={20} className="text-sky-500" />}
                        headers={['Operational Status', 'Node Count', 'Average Workflow (Hrs)', 'Saturation (%)']}
                        data={hr.attendance.map(a => ({
                            status: a._id,
                            nodes: a.count,
                            hours: `${a.avgHours?.toFixed(1) || 0}h`,
                            saturation: `${((a.count / hr.summary.totalAttendanceNodes) * 100).toFixed(1)}%`
                        }))}
                        color="sky"
                    />
                    <DataTable 
                        title="Personnel Leave Distribution"
                        icon={<Calendar size={20} className="text-rose-500" />}
                        headers={['Request Status', 'Volume', 'Organizational Impact']}
                        data={hr.leaves.map(l => ({
                            status: l._id,
                            count: l.count,
                            impact: l._id === 'Approved' ? 'Moderate (Capacity Reduction)' : 'Minimal (Policy Review)'
                        }))}
                        color="rose"
                    />
                    <DataTable 
                        title="Detailed Attendance Registry (Last 100 Nodes)"
                        icon={<Activity size={20} className="text-sky-500" />}
                        headers={['Personnel', 'Date', 'Clock In', 'Clock Out', 'Duration', 'Tactical Status']}
                        data={hr.details.attendance.map(a => ({
                            user: a.userName,
                            date: new Date(a.date).toLocaleDateString(),
                            in: a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
                            out: a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ACTIVE',
                            hours: `${a.workHours?.toFixed(2) || 0}h`,
                            status: a.status
                        }))}
                        color="sky"
                    />
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Attendance Summary */}
                <div className="xl:col-span-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StatCard 
                            title="Present Nodes" 
                            value={hr.attendance.find(a => a._id === 'Present')?.count || 0}
                            subtitle="Daily Operational Readiness"
                            icon={<CheckCircle size={24} />}
                            colorClass="bg-emerald-500/20 text-emerald-500"
                        />
                        <StatCard 
                            title="Avg Work Hours" 
                            value={`${hr.attendance[0]?.avgHours?.toFixed(1) || 0}h`}
                            subtitle="Current Productivity Index"
                            icon={<Clock size={24} />}
                            colorClass="bg-sky-500/20 text-sky-500"
                        />
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h5 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                            <TrendingUp className="text-sky-500" />
                            Attendance Integrity Breakdown
                        </h5>
                        <div className="space-y-8">
                            {hr.attendance.map(item => (
                                <div key={item._id} className="space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item._id}</span>
                                        <span className="text-xs font-black text-slate-900 dark:text-white">{item.count} Nodes</span>
                                    </div>
                                    <ProgressBar value={item.count} max={hr.summary.totalAttendanceNodes || 1} color={item._id === 'Present' ? 'bg-emerald-500' : 'bg-amber-500'} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Leave Distribution */}
                <div className="xl:col-span-4 bg-slate-900 p-10 rounded-[3rem] text-white overflow-hidden relative shadow-2xl">
                    <div className="relative z-10 h-full flex flex-col">
                        <h5 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                            <Calendar className="text-rose-500" />
                            Leave Equilibrium
                        </h5>
                        <div className="space-y-10 flex-1">
                            {hr.leaves.map(item => (
                                <div key={item._id} className="flex justify-between items-end border-b border-white/10 pb-4">
                                    <div>
                                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">{item._id}</p>
                                        <h6 className="text-2xl font-black tracking-tighter">{item.count}</h6>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full ${item._id === 'Approved' ? 'bg-emerald-500' : 'bg-amber-500'} shadow-[0_0_15px_rgba(16,185,129,0.3)]`} />
                                </div>
                            ))}
                        </div>
                        <div className="mt-10 p-6 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">Total Personnel Requests</p>
                            <h4 className="text-4xl font-black mt-1 leading-none italic">{hr.summary.totalLeaveRequests}</h4>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderInventory = () => {
        const inv = data.inventory;
        if (!inv) return null;

        if (viewMode === 'table') {
            return (
                <div className="space-y-8">
                    <DataTable 
                        title="Asset Category Valuation"
                        icon={<Package size={20} className="text-indigo-500" />}
                        headers={['Deployment Category', 'Node Volume', 'Collective Valuation', 'Portfolio Share']}
                        data={inv.categories.map(c => ({
                            category: c._id,
                            count: c.count,
                            value: `₹${c.totalValue.toLocaleString()}`,
                            share: `${((c.totalValue / inv.valuation) * 100).toFixed(1)}%`
                        }))}
                        color="indigo"
                    />
                    <DataTable 
                        title="Operational Status Registry"
                        icon={<TrendingUp size={20} className="text-emerald-500" />}
                        headers={['Lifecycle Status', 'Node Count', 'Condition Criticality']}
                        data={inv.status.map(s => ({
                            status: s._id,
                            count: s.count,
                            criticality: s._id === 'Maintenance' ? 'HIGH (Action Required)' : 'OPTIMAL'
                        }))}
                        color="emerald"
                    />
                    <DataTable 
                        title="Master Asset Registry (Detailed)"
                        icon={<Box size={20} className="text-indigo-500" />}
                        headers={['Asset Name', 'Category', 'Assigned To', 'Value (₹)', 'Operational Status']}
                        data={inv.details.assets.map(a => ({
                            name: a.name,
                            category: a.category,
                            user: a.assigned_to ? a.assigned_to.full_name : 'UNASSIGNED',
                            val: `₹${a.value.toLocaleString()}`,
                            status: a.status
                        }))}
                        color="indigo"
                    />
                </div>
            );
        }

        return (
            <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatCard 
                        title="Global Valuation" 
                        value={`₹${inv.valuation.toLocaleString()}`}
                        subtitle="Capitalized Tech Stack"
                        icon={<Shield size={24} />}
                        colorClass="bg-sky-500/20 text-sky-500"
                    />
                    <StatCard 
                        title="Healthy Condition" 
                        value="94%"
                        subtitle="Operational Reliability"
                        icon={<Database size={24} />}
                        colorClass="bg-emerald-500/20 text-emerald-500"
                    />
                    <StatCard 
                        title="Maintenance Queue" 
                        value={inv.status.find(s => s._id === 'Maintenance')?.count || 0}
                        subtitle="Pending Strategic Service"
                        icon={<TrendingUp size={24} />}
                        colorClass="bg-amber-500/20 text-amber-500"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h5 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                            Category Distribution Nodes
                        </h5>
                        <div className="space-y-8">
                            {inv.categories.map(item => (
                                <div key={item._id} className="group cursor-help">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item._id}</span>
                                        <span className="text-xs font-black text-slate-900 dark:text-white italic">₹{item.totalValue.toLocaleString()}</span>
                                    </div>
                                    <ProgressBar value={item.count} max={inv.categories.reduce((a,b) => a + b.count, 0)} color="bg-indigo-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-sky-500 p-10 rounded-[3rem] text-white flex flex-col justify-between overflow-hidden relative group">
                        <div className="relative z-10">
                            <h5 className="text-xl font-black uppercase tracking-tighter mb-2">Asset Aging Index</h5>
                            <p className="text-white/60 text-xs font-bold tracking-tight">Deployment lifecycle monitoring active.</p>
                        </div>
                        <div className="relative z-10 mt-12 grid grid-cols-2 gap-6">
                            {inv.status.map(s => (
                                <div key={s._id} className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/10">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{s._id}</p>
                                    <h4 className="text-3xl font-black tracking-tighter">{s.count}</h4>
                                </div>
                            ))}
                        </div>
                        <TrendingUp className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 rotate-[-15deg] group-hover:scale-110 transition-transform duration-700" />
                    </div>
                </div>
            </div>
        );
    };

    const renderOrg = () => {
        const org = data.org;
        if (!org) return null;

        if (viewMode === 'table') {
            return (
                <div className="space-y-8">
                    <DataTable 
                        title="Departmental Density Matrix"
                        icon={<Users size={20} className="text-sky-500" />}
                        headers={['Organizational Unit', 'Personnel Nodes', 'Inter-departmental Share']}
                        data={org.departments.map(d => ({
                            unit: d._id,
                            personnel: d.count,
                            share: `${((d.count / org.activePersonnel) * 100).toFixed(1)}%`
                        }))}
                        color="sky"
                    />
                    <DataTable 
                        title="Hierarchical Tier Distribution"
                        icon={<Shield size={20} className="text-indigo-500" />}
                        headers={['Tier Layer', 'Personnel Nodes', 'Access Escalation']}
                        data={org.roles.map(r => ({
                            tier: r._id,
                            count: r.count,
                            escalation: r._id === 'Admin' ? 'Level 5 (Global)' : (r._id === 'Manager' ? 'Level 3 (Tactical)' : 'Level 1 (Basic)')
                        }))}
                        color="indigo"
                    />
                    <DataTable 
                        title="Universal Personnel Directory"
                        icon={<Users size={20} className="text-emerald-500" />}
                        headers={['Full Name', 'Department', 'Role Tier', 'Contact Node', 'Auth Status']}
                        data={org.details.personnel.map(p => ({
                            name: p.full_name,
                            dept: p.department,
                            role: p.role,
                            email: p.email,
                            status: p.status
                        }))}
                        color="emerald"
                    />
                </div>
            );
        }

        return (
            <div className="space-y-10">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-slate-900 p-12 rounded-[4rem] text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-6xl font-black tracking-tighter leading-none mb-4 italic text-sky-500">{org.activePersonnel}</h2>
                        <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Active Personnel Nodes</h3>
                        <p className="text-white/40 text-xs font-bold tracking-[0.2em] mt-3 uppercase">Global Organization Health: Optimized</p>
                    </div>
                    <div className="relative z-10 flex gap-4">
                        <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
                            <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">Departments</p>
                            <h4 className="text-2xl font-black italic">{org.departments.length} Units</h4>
                        </div>
                        <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
                            <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1">Role Layers</p>
                            <h4 className="text-2xl font-black italic">{org.roles.length} Tiers</h4>
                        </div>
                    </div>
                    <Users className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] text-white/[0.02]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h5 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                            <Users size={20} className="text-sky-500" />
                            Departmental Density
                        </h5>
                        <div className="space-y-6">
                            {org.departments.map(item => (
                                <div key={item._id} className="flex items-center gap-4 group">
                                    <span className="w-12 text-xs font-black text-slate-300 group-hover:text-sky-500 transition-colors uppercase tracking-widest">{item.count}X</span>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{item._id}</span>
                                        </div>
                                        <ProgressBar value={item.count} max={org.activePersonnel} color="bg-emerald-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h5 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                            <Shield size={20} className="text-indigo-500" />
                            Role Tier Distribution
                        </h5>
                        <div className="space-y-6">
                            {org.roles.map(item => (
                                <div key={item._id} className="flex items-center gap-4 group">
                                    <span className="w-12 text-xs font-black text-slate-300 group-hover:text-indigo-500 transition-colors uppercase tracking-widest">{item.count}X</span>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase">{item._id}</span>
                                        </div>
                                        <ProgressBar value={item.count} max={org.activePersonnel} color="bg-indigo-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-10 max-w-[1600px] mx-auto pb-20 min-h-screen relative">
            <style>{reportStyles}</style>
            
            {/* Tactical Print Header */}
            <div className="print-only mb-10 border-b-2 border-slate-900 pb-12 uppercase">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter italic">Consolidated Strategic Ledger</h1>
                        <p className="text-sm font-bold text-slate-500 tracking-[0.3em] mt-2">OptiFlow Command Center // Universal Intelligence Audit</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-black">Generation Node: {new Date().toLocaleDateString()}</p>
                        <p className="text-xs font-black">Clearance: {isAdmin ? 'Level 5 (Admin)' : 'Level 3 (Management)'}</p>
                    </div>
                </div>
            </div>

            {/* Strategic Header / Command Bar */}
            <div className={`screen-only mb-10 sticky top-[5.5rem] z-30 transition-all duration-500 ease-in-out ${
                showNavbar 
                ? 'translate-y-0 opacity-100' 
                : '-translate-y-28 opacity-100'
            }`}>
                <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/10 p-8 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 transition-all duration-300">
                    {/* Visual Identity */}
                    <div className="flex items-center gap-6 px-4">
                        <div className="relative">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none flex items-center gap-2">
                                Strategic <span className="text-sky-500 italic">Reports</span>
                            </h2>
                            <div className="absolute -bottom-3 left-0 flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Live Intelligence Node</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Unified Command Hub */}
                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-inner">
                        {/* View Mode Segment */}
                        <div className="flex p-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                            {[
                                { id: 'bento', label: 'Bento', icon: <BarChart2 size={14} /> },
                                { id: 'table', label: 'Table', icon: <Clock size={14} /> }
                            ].map(mode => (
                                <button 
                                    key={mode.id}
                                    onClick={() => setViewMode(mode.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === mode.id ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {mode.icon}
                                    <span className="hidden sm:inline">{mode.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2 hidden lg:block" />

                        {/* Category Segment */}
                        <div className="flex gap-1">
                            {tabs.map(tab => (
                                (tab.adminOnly && !isAdmin) ? null : (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                        activeTab === tab.id 
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' 
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {tab.icon}
                                    <span className="hidden xl:inline">{tab.label}</span>
                                </button>
                                )
                            ))}
                        </div>
                    </div>
                </div>

            {/* Dynamic Content */}
            <div className="py-6 relative z-10">
                {loading ? (
                    <div className="py-40 text-center flex flex-col items-center justify-center gap-6">
                        <div className="w-16 h-16 border-4 border-slate-100 dark:border-slate-800 border-t-sky-500 rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Synchronizing Intelligence Nodes...</p>
                    </div>
                ) : (
                    <div className="transition-all duration-200">
                        {activeTab === 'hr' && renderHR()}
                        {activeTab === 'inventory' && renderInventory()}
                        {activeTab === 'org' && renderOrg()}
                    </div>
                )}
            </div>

            {/* Global Export Footer */}
            {!loading && (
                <div className="flex justify-center pt-10">
                    <button 
                        onClick={() => {
                            toast.loading("Intelligence Engine: Compiling Master Ledger [Working on it...]", {
                                duration: 3000,
                                style: { background: '#0f172a', color: '#fff', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }
                            });
                        }}
                        className="flex items-center gap-4 bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-10 py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl transition-all cursor-not-allowed grayscale"
                    >
                        <Download size={18} />
                        Export Master Intelligence PDF (Beta)
                    </button>
                </div>
            )}
            </div>

            {/* Consolidated Print Registry (Universal Table Ledger) */}
            <div className="print-only space-y-20">
                <section>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 border-l-8 border-sky-500 pl-6">I. Human Resources Intelligence</h2>
                    <div className="space-y-12">
                        <DataTable 
                            title="Attendance Status Registry (Summary)"
                            headers={['Operational Status', 'Node Count', 'Avg Workflow', 'Saturation (%)']}
                            data={data.hr?.attendance.map(a => ({ status: a._id, nodes: a.count, hours: `${a.avgHours?.toFixed(1) || 0}h`, saturation: `${((a.count / data.hr.summary.totalAttendanceNodes) * 100).toFixed(1)}%` })) || []} 
                            paginate={false}
                        />
                        <div className="page-break-before-always pt-10">
                            <DataTable 
                                title="Personnel Attendance Log (Detailed Audit)"
                                headers={['Personnel', 'Date', 'Clock In', 'Clock Out', 'Duration', 'Status']}
                                data={data.hr?.details.attendance.map(a => ({ user: a.userName, date: new Date(a.date).toLocaleDateString(), in: a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-', out: a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'ACTIVE', hours: `${a.workHours?.toFixed(2) || 0}h`, status: a.status })) || []}
                                paginate={false}
                            />
                        </div>
                        <DataTable 
                            title="Leave Request Distribution"
                            headers={['Status', 'Volume', 'Impact Index']}
                            data={data.hr?.leaves.map(l => ({ status: l._id, count: l.count, impact: l._id === 'Approved' ? 'High' : 'Low' })) || []}
                            paginate={false}
                        />
                    </div>
                </section>
                
                <section className="page-break-before-always">
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 border-l-8 border-emerald-500 pl-6">II. Asset Ledger & Valuation</h2>
                    <div className="space-y-12">
                        <DataTable 
                            title="Asset Valuation Matrix (Summary)"
                            headers={['Category', 'Volume', 'Total Valuation (₹)', 'Share (%)']}
                            data={data.inventory?.categories.map(c => ({ category: c._id, count: c.count, value: c.totalValue.toLocaleString(), share: `${((c.totalValue / data.inventory.valuation) * 100).toFixed(1)}%` })) || []}
                            paginate={false}
                        />
                        <div className="page-break-before-always pt-10">
                            <DataTable 
                                title="Comprehensive Asset Inventory (Detailed Audit)"
                                headers={['Asset Name', 'Category', 'Assigned To', 'Value (₹)', 'Status']}
                                data={data.inventory?.details.assets.map(a => ({ name: a.name, category: a.category, user: a.assigned_to ? a.assigned_to.full_name : 'UNASSIGNED', val: `₹${a.value.toLocaleString()}`, status: a.status })) || []}
                                paginate={false}
                            />
                        </div>
                    </div>
                </section>

                {isAdmin && (
                    <section className="page-break-before-always">
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 border-l-8 border-indigo-500 pl-6">III. Organizational Dynamics</h2>
                        <div className="space-y-12">
                            <DataTable 
                                title="Departmental Density Matrix"
                                headers={['Unit', 'Personnel Nodes', 'Global Share (%)']}
                                data={data.org?.departments.map(d => ({ unit: d._id, personnel: d.count, share: `${((d.count / data.org.activePersonnel) * 100).toFixed(1)}%` })) || []}
                                paginate={false}
                            />
                            <div className="page-break-before-always pt-10">
                                <DataTable 
                                    title="Universal Personnel Directory (Detailed Audit)"
                                    headers={['Full Name', 'Department', 'Role Tier', 'Contact Node', 'Status']}
                                    data={data.org?.details.personnel.map(p => ({ name: p.full_name, dept: p.department, role: p.role, email: p.email, status: p.status })) || []}
                                    paginate={false}
                                />
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

// Helper Icons
const CheckCircle = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

export default Reports;
