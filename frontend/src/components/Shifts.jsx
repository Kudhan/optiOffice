import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/client';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { 
    IconSun, 
    IconMoon, 
    IconSunset, 
    IconClock, 
    IconUsers, 
    IconBriefcase,
    IconPlus,
    IconEdit,
    IconChevronLeft,
    IconChevronRight,
    IconSettings,
    IconSync,
    IconTrash
} from './Icons';

const Shifts = () => {
    const { isAdmin, hasPermission } = useAuth();
    const canManageShifts = isAdmin || hasPermission('can_manage_users');
    const [shifts, setShifts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null); 
    const [editShift, setEditShift] = useState(null); 
    const [isCreateMode, setIsCreateMode] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const fetchData = async () => {
        try {
            setLoading(true);
            const [shiftsRes, usersRes] = await Promise.all([
                apiClient.get('shifts'),
                apiClient.get('users')
            ]);
            setShifts(shiftsRes.data.data || []);
            setUsers(usersRes.data || []);
        } catch (err) {
            toast.error("Telemetry Link Fragmented: Hub Data Out of Reach 📡");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssignShift = async (userId, shiftId) => {
        try {
            await apiClient.post('shifts/assign', {
                userIds: [userId],
                shiftId
            });
            toast.success("Temporal Identity Synchronized 🛰️");
            setSelectedUser(null);
            fetchData();
        } catch (err) {
            toast.error("Assignment Interrupted.");
        }
    };

    const handleCreateOrUpdateShift = async (formData) => {
        try {
            if (editShift) {
                await apiClient.put(`shifts/${editShift._id}`, formData);
                toast.success("Shift Template Re-Mastered 🛠️");
            } else {
                await apiClient.post('shifts', formData);
                toast.success("New Temporal Pattern Established ⏱️");
            }
            setIsCreateMode(false);
            setEditShift(null);
            fetchData();
        } catch (err) {
            toast.error("Save Protocol Denied: Check Hub Constraints.");
        }
    };

    const handleDeleteShift = async (id) => {
        if (!window.confirm("CRITICAL: Erase this pattern and unlink all associated members?")) return;
        try {
            await apiClient.delete(`shifts/${id}`);
            toast.success("Shift Record Purged 🗑️");
            fetchData();
        } catch (err) {
            toast.error("System Override: Deletion Failed.");
        }
    };

    const getShiftIcon = (startTime, className = "w-6 h-6 px-6") => {
        if (!startTime) return <IconSun className={`text-amber-500 ${className}`} />;
        const hour = parseInt(startTime.split(':')[0]);
        if (hour >= 6 && hour < 16) return <IconSun className={`text-amber-500 ${className}`} />;
        if (hour >= 16 && hour < 20) return <IconSunset className={`text-orange-500 ${className}`} />;
        return <IconMoon className={`text-sky-500 ${className}`} />;
    };

    const totalPages = Math.ceil(users.length / itemsPerPage);
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return users.slice(start, start + itemsPerPage);
    }, [users, currentPage]);

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center animate-pulse text-content-muted font-black uppercase tracking-widest text-xs">
            Calibrating Temporal Roster...
        </div>
    );

    return (
        <div className="relative min-h-screen pb-20 overflow-x-hidden">
            
            {/* Main Content Area */}
            <div className="p-10 max-w-[1600px] mx-auto space-y-16 animate-fade-in">
                
                {/* Header Section */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
                    <div>
                        <h2 className="text-7xl font-black text-content-main tracking-tighter leading-none mb-6 uppercase">
                            Shift <span className="text-sky-500 italic">Roster</span>
                        </h2>
                        <div className="flex items-center gap-4 bg-primary-muted/50 px-6 py-3 rounded-2xl border border-border w-fit">
                            <IconClock className="w-4 h-4 text-sky-500" />
                            <p className="text-content-muted font-black text-[10px] uppercase tracking-[0.2em]">Hub Temporal Control</p>
                        </div>
                    </div>
                    {canManageShifts && (
                        <button 
                            onClick={() => { setEditShift(null); setIsCreateMode(true); }}
                            className="bg-sky-500 hover:bg-sky-600 text-white font-black py-5 px-12 rounded-[2rem] shadow-2xl shadow-sky-500/30 transition-all flex items-center gap-4 active:scale-95 uppercase tracking-[0.2em] text-[10px]"
                        >
                            <IconPlus className="w-5 h-5" />
                            Engineer New Template
                        </button>
                    )}
                </div>

                {/* Shift Template Cards (Dynamic Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {shifts.map((shift, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            key={shift._id}
                            className="group relative p-10 rounded-[3.5rem] bg-primary-surface border border-border hover:border-sky-500/40 transition-all shadow-xl hover:shadow-2xl overflow-hidden flex flex-col justify-between"
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/5 rounded-full -mr-24 -mt-24 blur-3xl transition-all group-hover:bg-sky-500/10" />
                            
                            <div className="flex justify-between items-center mb-14 relative z-10">
                                <div className="w-10 h-10 px-2 py-2 ml-4 bg-primary-muted rounded-[2rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform border border-border">
                                    {getShiftIcon(shift.startTime, "w-8 h-8")}
                                </div>
                                <div className="flex items-center gap-4">
                                    {canManageShifts && (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => { setEditShift(shift); setIsCreateMode(true); }}
                                                className="w-12 h-12 flex items-center justify-center bg-primary-muted hover:bg-sky-500 hover:text-white rounded-2xl border border-border transition-all shadow-sm group/edit"
                                                title="Edit Pattern"
                                            >
                                                <IconSettings className="w-5 h-5 group-hover/edit:rotate-45 transition-transform" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteShift(shift._id)}
                                                className="w-12 h-12 flex items-center justify-center bg-primary-muted hover:bg-rose-500 hover:text-white rounded-2xl border border-border transition-all shadow-sm"
                                                title="Delete Pattern"
                                            >
                                                <IconTrash className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                    <div className="bg-navy-950 dark:bg-sky-500/20 px-6 py-3 rounded-2xl border border-white/10 flex items-center justify-center h-fit min-w-[120px]">
                                        <span className="text-[10px] font-black text-white dark:text-sky-400 uppercase tracking-widest whitespace-nowrap">
                                            {shift.startTime} - {shift.endTime}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-2xl font-black text-content-main tracking-tighter uppercase mb-6 group-hover:text-sky-500 transition-colors leading-tight">
                                    {shift.name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-3 px-5 py-2.5 bg-primary-muted/50 rounded-2xl border border-border text-[9px] font-black text-content-muted uppercase tracking-widest transition-all hover:bg-primary-muted">
                                        <IconUsers className="w-4 h-4 text-sky-500" />
                                        {shift.userCount} Assigned
                                    </div>
                                    <div className="flex items-center gap-3 px-5 py-2.5 bg-primary-muted/50 rounded-2xl border border-border text-[9px] font-black text-content-muted uppercase tracking-widest transition-all hover:bg-primary-muted">
                                        <IconSync className="w-4 h-4 text-emerald-500" />
                                        {shift.gracePeriod}m Grace
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Personnel Roster Section */}
                <section className="bg-primary-surface rounded-[4rem] border border-border overflow-hidden shadow-2xl relative">
                    <div className="p-10 border-b border-border bg-slate-50/50 dark:bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center border border-sky-500/20 shadow-inner">
                                <IconBriefcase className="w-8 h-8 text-sky-500" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-content-main tracking-tighter uppercase leading-none mb-1.5">Stationing Matrix</h3>
                                <p className="text-[10px] font-black text-content-muted/60 uppercase tracking-[0.3em]">Operational User Registry</p>
                            </div>
                        </div>
                        <div className="flex items-center bg-primary-muted/50 px-8 py-4 rounded-[2rem] border border-border shadow-inner">
                            <span className="text-[11px] font-black text-content-muted uppercase tracking-[0.2em]">Registry Capacity: {users.length} Nodes</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1100px]">
                            <thead>
                                <tr className="bg-primary-muted/30">
                                    <th className="px-12 py-10 text-[10px] font-black uppercase text-content-muted tracking-[0.4em] opacity-50">User Personnel</th>
                                    <th className="px-12 py-10 text-[10px] font-black uppercase text-content-muted tracking-[0.4em] opacity-50">Sector</th>
                                    <th className="px-12 py-10 text-[10px] font-black uppercase text-content-muted tracking-[0.4em] opacity-50">Timing Protocol</th>
                                    <th className="px-12 py-10 text-[10px] font-black uppercase text-content-muted tracking-[0.4em] opacity-50 text-right">System Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {paginatedUsers.map((member) => {
                                    const userShift = shifts.find(s => s._id === member.shift_id);
                                    return (
                                        <tr key={member.id} className="hover:bg-primary-muted/40 group transition-all duration-300">
                                            <td className="px-12 py-10">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-500/20 to-sky-500/5 flex items-center justify-center font-black text-sky-500 text-base shadow-inner border border-sky-500/20 group-hover:scale-105 transition-transform">
                                                        {member.full_name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-black text-content-main uppercase tracking-tight mb-1">{member.full_name}</p>
                                                        <p className="text-[11px] font-medium text-content-muted/60 lowercase tracking-widest">{member.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-12 py-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-sky-500/40" />
                                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-content-muted/80">
                                                        {member.department || 'GLOBAL'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-12 py-10">
                                                {userShift ? (
                                                    <div className="flex items-center gap-5 bg-primary-muted/40 p-4 pr-8 rounded-3xl border border-border group-hover:bg-white dark:group-hover:bg-navy-950 group-hover:border-sky-500/30 transition-all shadow-sm w-fit">
                                                        <div className="w-12 h-12 rounded-2xl bg-primary-surface flex items-center justify-center shadow-md border border-border group-hover:scale-110 transition-transform">
                                                            {getShiftIcon(userShift.startTime, "w-6 h-6")}
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-black text-content-main uppercase tracking-[0.15em] leading-none mb-1.5">{userShift.name}</p>
                                                            <p className="text-[10px] font-bold text-sky-500 tracking-tighter flex items-center gap-2">
                                                                <IconClock className="w-3 h-3" />
                                                                {userShift.startTime} — {userShift.endTime}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-4 py-2 px-5 rounded-2xl bg-rose-500/5 border border-rose-500/10 w-fit">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                                                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] leading-none">Status: Unstationed</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-12 py-10 text-right">
                                                {canManageShifts && (
                                                    <button 
                                                        onClick={() => setSelectedUser(member)}
                                                        className="w-14 h-14 flex items-center justify-center bg-primary-muted rounded-2xl border border-border hover:border-sky-500/50 hover:bg-sky-500 hover:text-white transition-all active:scale-90 group/btn shadow-md"
                                                    >
                                                        <IconEdit className="w-6 h-6" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Matrix Pagination Controls */}
                    <div className="p-10 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-8 bg-slate-50/30 dark:bg-white/5">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="w-full sm:w-auto flex items-center justify-center gap-4 px-10 py-5 rounded-[2rem] bg-primary-muted text-[11px] font-black uppercase tracking-[0.25em] disabled:opacity-30 hover:bg-sky-500 hover:text-white transition-all shadow-md active:scale-95 text-content-muted"
                        >
                            <IconChevronLeft className="w-4 h-4" />
                            Previous Trace
                        </button>
                        <div className="flex items-center gap-4 overflow-x-auto py-2 px-6 max-w-full no-scrollbar">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`min-w-[48px] h-12 rounded-2xl font-black text-sm transition-all shadow-sm ${
                                        currentPage === i + 1 
                                        ? 'bg-sky-500 text-white shadow-xl shadow-sky-500/40 scale-110' 
                                        : 'bg-primary-muted text-content-muted hover:text-sky-500 hover:bg-sky-500/10'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="w-full sm:w-auto flex items-center justify-center gap-4 px-10 py-5 rounded-[2rem] bg-primary-muted text-[11px] font-black uppercase tracking-[0.25em] disabled:opacity-30 hover:bg-sky-500 hover:text-white transition-all shadow-md active:scale-95 text-content-muted"
                        >
                            Next Trace
                            <IconChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </section>
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-navy-950/80 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            className="bg-primary-surface rounded-[4rem] border border-sky-500/20 shadow-[0_40px_100px_rgba(0,0,0,0.6)] p-12 w-full max-w-xl flex flex-col gap-12 relative overflow-hidden"
                        >
                             <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/20 rounded-full -mr-40 -mt-40 blur-3xl opacity-50" />
                            
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <h3 className="text-4xl font-black text-content-main tracking-tighter uppercase leading-none">
                                        Shift <span className="text-sky-500 italic">Alignment</span>
                                    </h3>
                                    <p className="text-[11px] font-black text-content-muted uppercase tracking-[0.4em] mt-4 flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                                        Target Node: {selectedUser.full_name}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedUser(null)} className="w-14 h-14 flex items-center justify-center text-content-muted font-black border border-border bg-primary-muted rounded-[2rem] hover:bg-rose-500 hover:text-white transition-all shadow-lg">✕</button>
                            </div>

                            <div className="space-y-5 max-h-[480px] overflow-y-auto pr-4 custom-scrollbar relative z-10">
                                {shifts.map((shift) => (
                                    <button 
                                        key={shift._id}
                                        onClick={() => handleAssignShift(selectedUser.id, shift._id)}
                                        className={`w-full p-8 border rounded-[3rem] flex items-center justify-between transition-all group shadow-sm ${
                                            selectedUser.shift_id === shift._id 
                                            ? 'bg-sky-500/10 border-sky-500 shadow-sky-500/30' 
                                            : 'bg-primary-muted/30 border-border hover:border-sky-500/50 hover:bg-primary-surface'
                                        }`}
                                    >
                                        <div className="flex items-center gap-8">
                                            <div className="w-16 h-16 bg-white dark:bg-navy-950 rounded-[1.5rem] flex items-center justify-center shadow-md border border-border group-hover:scale-110 transition-transform">
                                                {getShiftIcon(shift.startTime, "w-8 h-8")}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-base font-black text-content-main uppercase tracking-[0.1em]">{shift.name}</p>
                                                <p className="text-xs font-bold text-sky-500 tracking-tight mt-1.5 opacity-80">{shift.startTime} — {shift.endTime}</p>
                                            </div>
                                        </div>
                                        {selectedUser.shift_id === shift._id ? (
                                            <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center shadow-xl shadow-sky-500/40">
                                                <IconSync className="w-6 h-6 text-white animate-spin-slow" />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full border-[6px] border-border group-hover:border-sky-500 transition-all scale-75 group-hover:scale-100 shadow-inner" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Shift Form Modal (Create/Edit Template) */}
            <AnimatePresence>
                {isCreateMode && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1100] bg-navy-950/90 backdrop-blur-2xl flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            className="bg-white/80 dark:bg-navy-950/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.3)] p-10 w-full max-w-lg flex flex-col gap-8 overflow-hidden relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-2.5 bg-sky-500/20 overflow-hidden">
                                <motion.div 
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '100%' }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                    className="w-1/2 h-full bg-sky-500 shadow-[0_0_20px_#0ea5e9]"
                                />
                            </div>

                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <h3 className="text-3xl font-black text-content-main tracking-tighter uppercase leading-none">
                                        {editShift ? 'Remaster' : 'Engineer'} <span className="text-sky-500 italic">Temporal</span>
                                    </h3>
                                    <p className="text-[9px] font-black text-content-muted uppercase tracking-[0.4em] mt-3 opacity-70 text-left">System Timing Calibration Framework</p>
                                </div>
                                <button onClick={() => { setIsCreateMode(false); setEditShift(null); }} className="w-10 h-10 flex items-center justify-center text-content-muted font-black bg-primary-muted/50 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-border/40">✕</button>
                            </div>

                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target);
                                    handleCreateOrUpdateShift({
                                        name: formData.get('name'),
                                        startTime: formData.get('startTime'),
                                        endTime: formData.get('endTime'),
                                        gracePeriod: parseInt(formData.get('gracePeriod'))
                                    });
                                }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10"
                            >
                                <div className="col-span-1 md:col-span-2 space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-content-muted ml-2 opacity-60">Pattern Designation</label>
                                    <input 
                                        name="name"
                                        defaultValue={editShift?.name}
                                        required
                                        placeholder="E.G. ALPHA CORE OPERATIONS"
                                        className="w-full bg-primary-muted/30 p-5 rounded-2xl border-2 border-transparent focus:border-sky-500/50 focus:bg-white dark:focus:bg-navy-950 outline-none text-[11px] font-black uppercase tracking-widest transition-all shadow-inner"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 ml-2 opacity-60">Cycle Start (24h)</label>
                                    <input 
                                        name="startTime"
                                        type="time"
                                        defaultValue={editShift?.startTime}
                                        required
                                        className="w-full bg-primary-muted/30 p-5 rounded-2xl border-2 border-transparent focus:border-emerald-500/50 focus:bg-white dark:focus:bg-navy-950 outline-none text-xs font-black transition-all shadow-inner"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 ml-2 opacity-60">Cycle End (24h)</label>
                                    <input 
                                        name="endTime"
                                        type="time"
                                        defaultValue={editShift?.endTime}
                                        required
                                        className="w-full bg-primary-muted/30 p-5 rounded-2xl border-2 border-transparent focus:border-rose-500/50 focus:bg-white dark:focus:bg-navy-950 outline-none text-xs font-black transition-all shadow-inner"
                                    />
                                </div>

                                <div className="col-span-1 md:col-span-2 space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-content-muted ml-2 opacity-60">Buffer / Grace Period (min)</label>
                                    <input 
                                        name="gracePeriod"
                                        type="number"
                                        defaultValue={editShift?.gracePeriod || 0}
                                        placeholder="0"
                                        className="w-full bg-primary-muted/30 p-5 rounded-2xl border-2 border-transparent focus:border-sky-500/50 focus:bg-white dark:focus:bg-navy-950 outline-none text-[11px] font-black transition-all shadow-inner"
                                    />
                                </div>

                                <div className="col-span-1 md:col-span-2 pt-4">
                                    <button 
                                        type="submit"
                                        className="w-full py-6 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-2xl shadow-xl shadow-sky-500/20 transition-all uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 active:scale-95 group overflow-hidden relative"
                                    >
                                        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                        <span className="relative z-10">Seal Framework</span>
                                        <IconSync className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700 relative z-10" />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Shifts;
