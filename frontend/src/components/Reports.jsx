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
import { motion, AnimatePresence } from 'framer-motion';

const Reports = () => {
    const { isAdmin, isManager } = useAuth();
    const { showNavbar } = useOutletContext();
    const [activeTab, setActiveTab] = useState('hr');
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
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(value / max) * 100}%` }}
                className={`h-full ${color} rounded-full`}
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

    const renderHR = () => {
        const hr = data.hr;
        if (!hr) return null;
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
        <div className="space-y-10 animate-fade-in max-w-[1600px] mx-auto pb-20">
            {/* Header / Tab Navigation */}
            <div className={`flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl p-8 rounded-[3.5rem] border border-slate-100 dark:border-slate-700 shadow-xl shadow-sky-500/5 sticky transition-all duration-500 ease-in-out z-20 ${
                showNavbar ? 'top-24 opacity-100 translate-y-0' : '-top-20 opacity-0 -translate-y-10'
            }`}>
                <div className="space-y-1 ml-4 flex items-center gap-6">
                    <div className="space-y-1">
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Strategic <span className="text-sky-500 italic">Reports</span></h2>
                        <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Real-time Sync: Active</p>
                        </div>
                    </div>
                    
                    <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-700 hidden xl:block" />

                    <div className="hidden xl:block">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-50">Last Intelligence Pulse</p>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{lastUpdated.toLocaleTimeString()}</p>
                    </div>
                </div>
                
                <div className="flex gap-4 items-center w-full xl:w-auto">
                    <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-2 rounded-2xl flex-1 xl:flex-none overflow-x-auto no-scrollbar">
                        {tabs.map(tab => (
                            (tab.adminOnly && !isAdmin) ? null : (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    activeTab === tab.id 
                                    ? 'bg-white dark:bg-slate-800 text-sky-500 shadow-xl shadow-sky-500/10' 
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                }`}
                            >
                                {tab.icon}
                                <span className="">{tab.label}</span>
                            </button>
                            )
                        ))}
                    </div>

                    <div className="flex-shrink-0">
                        <button 
                            onClick={() => { fetchData(activeTab); setLastUpdated(new Date()); }}
                            className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-sky-500 hover:text-white transition-all group shadow-sm flex items-center justify-center min-w-[48px] min-h-[48px]"
                            title="Force Intelligence Pulse"
                        >
                            <RefreshCw size={18} className={`group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Dynamic Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {loading ? (
                        <div className="py-40 text-center flex flex-col items-center justify-center gap-6">
                            <div className="w-16 h-16 border-4 border-slate-100 dark:border-slate-800 border-t-sky-500 rounded-full animate-spin" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Synchronizing Intelligence Nodes...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'hr' && renderHR()}
                            {activeTab === 'inventory' && renderInventory()}
                            {activeTab === 'org' && renderOrg()}
                        </>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Global Export Footer */}
            {!loading && (
                <div className="flex justify-center pt-10">
                    <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-10 py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-sky-500/10"
                    >
                        <Download size={18} />
                        Export Intelligence Summary (PDF)
                    </button>
                </div>
            )}
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
