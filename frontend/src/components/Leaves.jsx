import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { 
  IconPlus, 
  IconCheck, 
  IconX, 
  IconCalendar, 
  IconUser, 
  IconAlertCircle,
  IconChevronRight,
  IconClock,
  IconInfo
} from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import LeaveRequestModal from './LeaveRequestModal';
import TeamCalendar from './TeamCalendar';

const Leaves = () => {
    const { user, isManager, isAdmin } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [balance, setBalance] = useState({ annual_total: 30, used: 0, remaining: 30 });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'team'

    const [rejectionReason, setRejectionReason] = useState({});

    const fetchData = async () => {
        try {
            setLoading(true);
            const [leavesRes, balanceRes] = await Promise.all([
                apiClient.get('/leaves'),
                apiClient.get('/leaves/balance')
            ]);
            setLeaves(leavesRes.data);
            setBalance(balanceRes.data);
        } catch (err) {
            console.error("Signal fragmentation in tactical data link");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApply = async (formData) => {
        try {
            await apiClient.post('/leaves', formData);
            setShowModal(false);
            toast.success("Extraction Request Broadcasted Successfully", {
                style: { borderRadius: '15px', background: '#0B1120', color: '#fff' }
            });
            fetchData();
        } catch (err) {
            console.error("Request crystalisation failed", err);
            const message = err.response?.data?.message || err.response?.data?.detail || "Request protocol failure";
            toast.error(message, {
                style: { borderRadius: '15px', background: '#0B1120', color: '#fff' }
            });
        }
    };

    const handleManage = async (id, status, reason = "") => {
        try {
            await apiClient.put(`/leaves/${id}/manage`, { status, reason });
            toast.success(`Deployment Protocol: Request ${status}`, {
                style: { borderRadius: '15px', background: '#0B1120', color: '#fff' }
            });
            fetchData();
        } catch (err) {
            console.error("Approval protocol failure", err);
            const message = err.response?.data?.detail || "Authorization link failure";
            toast.error(message, {
                style: { borderRadius: '15px', background: '#0B1120', color: '#fff' }
            });
        }
    };

    const pendingApprovals = useMemo(() => {
        return leaves.filter(l => {
            if (l.status !== 'Pending') return false;
            if (isAdmin) return true; // Admins see everything pending
            return l.appliedTo === user?.id || (typeof l.appliedTo === 'object' && l.appliedTo?._id === user?.id);
        });
    }, [leaves, user, isAdmin]);

    const myRequests = useMemo(() => {
        const currentUserId = user?.id || user?._id;
        return leaves.filter(l => {
            const leaveUserId = (typeof l.user === 'object') ? (l.user?.id || l.user?._id) : l.user;
            return leaveUserId?.toString() === currentUserId?.toString();
        });
    }, [leaves, user]);

    const ProgressRing = ({ percentage, color = "sky", label, value }) => {
        const radius = 36;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;

        return (
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 rounded-[2rem] flex items-center justify-between shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
                <div className="space-y-1 relative z-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{value} <span className="text-[10px] text-slate-400">Days</span></h4>
                </div>
                
                <div className="relative flex items-center justify-center z-10">
                    <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                            className="text-slate-100 dark:text-slate-700"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="40"
                            cy="40"
                        />
                        <circle
                            className={`text-${color}-500 transition-all duration-1000 ease-out`}
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="40"
                            cy="40"
                        />
                    </svg>
                    <span className="absolute text-[10px] font-black text-slate-600 dark:text-slate-300">{Math.round(percentage)}%</span>
                </div>
                <div className={`absolute bottom-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-${color}-500/10 transition-colors`} />
            </div>
        );
    };

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center animate-pulse text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">
            Calibrating Personnel Trajectories...
        </div>
    );

    const AdminOversight = () => {
        const stats = useMemo(() => ({
            pending: leaves.filter(l => l.status === 'Pending').length,
            approved: leaves.filter(l => l.status === 'Approved').length,
            rejected: leaves.filter(l => l.status === 'Rejected').length,
            total: leaves.length
        }), [leaves]);

        return (
            <div className="space-y-12 animate-fade-in">
                {/* Stats Oversight */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pending</p>
                        <h4 className="text-3xl font-black text-sky-500 uppercase tracking-tighter">{stats.pending}</h4>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Approved Extractions</p>
                        <h4 className="text-3xl font-black text-emerald-500 uppercase tracking-tighter">{stats.approved}</h4>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rejected Strategics</p>
                        <h4 className="text-3xl font-black text-rose-500 uppercase tracking-tighter">{stats.rejected}</h4>
                    </div>
                    <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl text-white">
                        <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-1">Global Throughput</p>
                        <h4 className="text-3xl font-black uppercase tracking-tighter">{stats.total}</h4>
                    </div>
                </div>

                {/* Tactical Approval Queue */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">
                            Active <span className="text-sky-500">Authorization Queue</span>
                        </h3>
                        <div className="h-0.5 flex-1 bg-slate-100 dark:bg-slate-800" />
                    </div>

                    {pendingApprovals.length > 0 ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {pendingApprovals.map(request => (
                                <motion.div 
                                    layout
                                    key={request.id}
                                    className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden group"
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-black uppercase tracking-tighter">
                                                {request.user?.full_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <h5 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{request.user?.full_name}</h5>
                                                <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest">{request.user?.role} Role</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-700 px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-600">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest border-r border-slate-300 dark:border-slate-500 pr-4">
                                                <IconCalendar className="w-3.5 h-3.5 text-sky-500" />
                                                {new Date(request.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                <IconChevronRight className="w-2.5 h-2.5 opacity-30" />
                                                {new Date(request.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </div>
                                            <div className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                                                {request.type} | {Math.ceil(Math.abs(new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1}D
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 mb-8">
                                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 italic leading-relaxed uppercase tracking-tight">
                                            "{request.reason || 'Strategic protocol initiated without context.'}"
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <input 
                                            type="text"
                                            placeholder="ENTER FORMAL FEEDBACK / RATIONALE..."
                                            value={rejectionReason[request.id] || ""}
                                            onChange={(e) => setRejectionReason({ ...rejectionReason, [request.id]: e.target.value })}
                                            className="w-full px-6 py-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 focus:border-sky-500 outline-none text-[10px] font-black uppercase tracking-widest transition-all"
                                        />
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => handleManage(request.id, 'Rejected', rejectionReason[request.id])}
                                                className="flex-1 py-4 rounded-2xl bg-rose-500/10 text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                                            >
                                                Deny Access
                                            </button>
                                            <button 
                                                onClick={() => handleManage(request.id, 'Approved', rejectionReason[request.id])}
                                                className="flex-[2] py-4 rounded-2xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                                            >
                                                Authorize Extraction
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-700">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Clear Tactical Horizon: No Pending Requests</p>
                        </div>
                    )}
                </div>

                {/* Global Archive Hub */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">
                            Strategic <span className="text-sky-500">Archive Hub</span>
                        </h3>
                        <div className="h-0.5 flex-1 bg-slate-100 dark:bg-slate-800" />
                    </div>

                    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-x-auto scrollbar-thin">
                        <table className="w-full text-left min-w-[1200px]">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Days</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Manager Feedback</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                {leaves.map(request => (
                                    <tr key={request.id} className="group hover:bg-sky-500/5 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                                                    {request.user?.full_name?.charAt(0)}
                                                </div>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">{request.user?.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${request.type === 'EL' ? 'text-sky-500' : 'text-amber-500'}`}>{request.type} Strategy</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                                {new Date(request.startDate).toLocaleDateString()}
                                                <IconChevronRight className="w-3 h-3 opacity-30" />
                                                {new Date(request.endDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center text-xs font-black text-slate-900 dark:text-white">
                                            {Math.ceil(Math.abs(new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`w-fit px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                request.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                                                request.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
                                                'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                            }`}>
                                                {request.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 max-w-sm">
                                            <p className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors uppercase tracking-tight italic">
                                                {request.rejection_reason || '---'}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 md:p-10 max-w-[1700px] mx-auto space-y-10 animate-fade-in flex flex-col min-h-screen">
            
            {/* Strategy Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 shrink-0">
                <div className="space-y-2">
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">
                        Leave <span className="text-sky-500 italic">Command</span>
                    </h2>
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700/50 w-fit">
                        <IconClock className="w-3.5 h-3.5 text-sky-500" />
                        <p className="text-slate-500 font-black text-[9px] uppercase tracking-[0.25em]">
                            {isAdmin ? 'Global Strategic Oversight' : 'Operational Downtime Management'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                    {(isManager || isAdmin) && (
                        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <button 
                                onClick={() => setActiveTab('personal')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'personal' ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {isAdmin ? 'Oversight Deck' : 'Personal'}
                            </button>
                            <button 
                                onClick={() => setActiveTab('team')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'team' ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {isAdmin ? 'Deployment Map' : 'Team Hub'}
                            </button>
                        </div>
                    )}
                    {!isAdmin && (
                        <button 
                            onClick={() => setShowModal(true)}
                            className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all flex items-center gap-3 active:scale-95 uppercase tracking-[0.2em] text-[10px]"
                        >
                            <IconPlus className="w-4 h-4" />
                            Request Extraction
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'personal' ? (
                    isAdmin ? <AdminOversight /> : (
                        <motion.div 
                            key="personal-view"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-10"
                        >
                            {/* Standard Employee/Manager Personal View */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                <ProgressRing 
                                    label="Earned Leave Balance" 
                                    value={balance.remaining} 
                                    percentage={(balance.remaining / balance.annual_total) * 100} 
                                    color="sky"
                                />
                                <ProgressRing 
                                    label="Sick Leave Utilisation" 
                                    value={balance.used} 
                                    percentage={(balance.used / balance.annual_total) * 100} 
                                    color="amber"
                                />
                                <div className="bg-slate-900 rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden shadow-xl text-white">
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black opacity-50 uppercase tracking-widest">Total Remaining Allowance</p>
                                        <h4 className="text-4xl font-black tracking-tighter mt-2">{balance.remaining} <span className="text-xs opacity-50 uppercase tracking-widest ml-2">Days Clear</span></h4>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4 relative z-10">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Quota Re-filling in 124 Days</p>
                                    </div>
                                    <IconInfo className="absolute top-8 right-8 w-12 h-12 text-white/5" />
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 rounded-full blur-[60px] -mr-16 -mt-16" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                                {/* Pending Approvals for Managers */}
                                {isManager && !isAdmin && pendingApprovals.length > 0 && (
                                    <div className="xl:col-span-12 space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-0.5 flex-1 bg-slate-100 dark:bg-slate-800" />
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">
                                                Pending Deployment <span className="text-sky-500">Approvals</span>
                                            </h3>
                                            <div className="h-0.5 flex-1 bg-slate-100 dark:bg-slate-800" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <AnimatePresence>
                                                {pendingApprovals.map(request => (
                                                    <motion.div 
                                                        layout
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        key={request.id}
                                                        className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all relative group overflow-hidden"
                                                    >
                                                        <div className="flex items-center justify-between mb-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-slate-500 uppercase tracking-tighter">
                                                                    {request.user?.full_name?.charAt(0) || 'U'}
                                                                </div>
                                                                <div>
                                                                    <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{request.user?.full_name}</h5>
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{request.type} Strategy</p>
                                                                </div>
                                                            </div>
                                                            <div className="bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-600 text-[9px] font-black text-slate-500 uppercase tracking-tighter text-center">
                                                                <div className="flex items-center gap-1.5 justify-center mb-0.5 opacity-60">
                                                                    <IconCalendar className="w-2.5 h-2.5" />
                                                                    <span>{new Date(request.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                                </div>
                                                                {Math.ceil(Math.abs(new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1}D
                                                            </div>
                                                        </div>

                                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mb-6 h-8 italic">"{request.reason || 'No reason provided'}"</p>

                                                        <div className="space-y-3">
                                                            <input 
                                                                type="text"
                                                                placeholder="FEEDBACK / RATIONALE..."
                                                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 focus:border-sky-500 outline-none text-[9px] font-black uppercase tracking-widest transition-all"
                                                                onChange={(e) => setRejectionReason({ ...rejectionReason, [request.id]: e.target.value })}
                                                                value={rejectionReason[request.id] || ""}
                                                            />
                                                            <div className="flex gap-3">
                                                                <button 
                                                                    onClick={() => handleManage(request.id, 'Rejected', rejectionReason[request.id])}
                                                                    className="flex-1 py-3 rounded-xl bg-rose-500/10 text-rose-500 font-black text-[9px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                                                                >
                                                                    Deny
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleManage(request.id, 'Approved', rejectionReason[request.id])}
                                                                    className="flex-2 py-3 rounded-xl bg-emerald-500 text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                                                                >
                                                                    Authorise
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}

                                {/* My Requests Tracker for Everyone */}
                                <div className="xl:col-span-12 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-0.5 flex-1 bg-slate-100 dark:bg-slate-800" />
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">
                                            Incident <span className="text-sky-500">History</span>
                                        </h3>
                                        <div className="h-0.5 flex-1 bg-slate-100 dark:bg-slate-800" />
                                    </div>

                                    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-x-auto scrollbar-thin">
                                        <table className="w-full text-left min-w-[1000px]">
                                            <thead>
                                                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Type</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment Period</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Duration</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Hub</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rationale</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Manager Feedback</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                                {myRequests.map(request => (
                                                    <tr key={request.id} className="group hover:bg-sky-500/5 transition-all">
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-2 h-2 rounded-full ${request.type === 'EL' ? 'bg-sky-500' : 'bg-amber-500'} animate-pulse`} />
                                                                <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{request.type} Strategy</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                                                                <IconCalendar className="w-3.5 h-3.5 text-sky-500/50" />
                                                                {new Date(request.startDate).toLocaleDateString()}
                                                                <IconChevronRight className="w-3 h-3 text-slate-300" />
                                                                {new Date(request.endDate).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-center">
                                                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase">
                                                                {Math.ceil(Math.abs(new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className={`w-fit px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                                request.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                                                                request.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 
                                                                'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                            }`}>
                                                                {request.status}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 max-w-xs transition-all">
                                                            <p className="text-[10px] font-bold text-slate-400 truncate group-hover:text-slate-600 transition-colors uppercase tracking-tight">
                                                                {request.reason || 'Strategic extraction protocol - No context provided.'}
                                                            </p>
                                                        </td>
                                                        <td className="px-8 py-6 max-w-xs transition-all">
                                                            <p className={`text-[10px] font-bold uppercase tracking-tight ${request.status === 'Rejected' ? 'text-rose-500' : 'text-slate-400'}`}>
                                                                {request.status === 'Rejected' ? (request.rejection_reason || 'No specific protocol feedback provided.') : '---'}
                                                            </p>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                ) : (
                    <motion.div
                        key="team-view"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <TeamCalendar />
                    </motion.div>
                )}
            </AnimatePresence>

            <LeaveRequestModal 
                isOpen={showModal} 
                onClose={() => setShowModal(false)} 
                onSubmit={handleApply}
                user={user}
            />
        </div>
    );
};

export default Leaves;
