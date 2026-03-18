import React, { useState, useEffect } from 'react';
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
    IconEdit
} from './Icons';

const Shifts = () => {
    const { isAdmin, hasPermission } = useAuth();
    const canManageShifts = isAdmin || hasPermission('can_manage_users');
    const [shifts, setShifts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null); // For shift assignment modal
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [shiftsRes, usersRes] = await Promise.all([
                apiClient.get('shifts'),
                apiClient.get('users')
            ]);
            setShifts(shiftsRes.data.data);
            setUsers(usersRes.data);
        } catch (err) {
            toast.error("Cloud Link Unstable: Hub Telemetry Failed 🛰️");
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
            toast.success("Shift Pattern Recalibrated 🚀");
            setSelectedUser(null);
            fetchData();
        } catch (err) {
            toast.error("Pattern Assignment Failed");
        }
    };

    const getShiftIcon = (startTime) => {
        const hour = parseInt(startTime.split(':')[0]);
        if (hour >= 6 && hour < 16) return <IconSun className="text-amber-500" />;
        if (hour >= 16 && hour < 20) return <IconSunset className="text-orange-500" />;
        return <IconMoon className="text-sky-500" />;
    };

    if (loading) return (
        <div className="flex h-full items-center justify-center animate-pulse text-content-muted font-black uppercase tracking-widest text-[10px]">
            Syncing Hub Timelines...
        </div>
    );

    return (
        <div className="p-10 max-w-[1600px] mx-auto space-y-12 animate-fade-in font-sans">
            
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h2 className="text-5xl font-black text-content-main tracking-tighter leading-none mb-4 uppercase">
                        Shift <span className="text-sky-500 italic">Roster</span>
                    </h2>
                    <p className="text-content-muted font-bold text-sm tracking-tight opacity-70"> Hub Temporal Analysis Center</p>
                </div>
                {canManageShifts && (
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="bg-sky-500 hover:bg-sky-600 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-sky-500/20 transition-all flex items-center gap-3 active:scale-95 uppercase tracking-widest text-[10px]"
                    >
                        <IconPlus className="w-4 h-4" />
                        New Template
                    </button>
                )}
            </div>

            {/* Task 1: Shift Template Cards (Bento Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {shifts.map((shift, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={shift._id}
                        className="group relative p-8 rounded-[2.5rem] bg-primary-surface border border-border hover:border-sky-500/50 transition-all shadow-sm overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-sky-500/10" />
                        
                        <div className="flex justify-between items-start mb-10 relative z-10">
                            <div className="w-14 h-14 bg-primary-muted rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                {getShiftIcon(shift.startTime)}
                            </div>
                            {/* Task 1: High-contrast badge */}
                            <div className="bg-navy-950 dark:bg-sky-500/20 px-4 py-2 rounded-xl border border-white/10">
                                <span className="text-[10px] font-black text-white dark:text-sky-400 uppercase tracking-[0.2em] whitespace-nowrap">
                                    {shift.startTime} - {shift.endTime}
                                </span>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-content-main tracking-tighter uppercase mb-2 group-hover:text-sky-500 transition-colors">
                                {shift.name}
                            </h3>
                            <div className="flex items-center gap-4 mt-6">
                                <div className="flex items-center gap-2 px-3 py-1 bg-primary-muted rounded-lg border border-border text-[9px] font-black text-content-muted uppercase tracking-widest">
                                    <IconUsers className="w-3 h-3" />
                                    {shift.userCount} Assigned
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-primary-muted rounded-lg border border-border text-[9px] font-black text-content-muted uppercase tracking-widest">
                                    <IconClock className="w-3 h-3" />
                                    {shift.gracePeriod}m Grace
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Task 2: Roster Table */}
            <section className="bg-primary-surface rounded-[3rem] border border-border overflow-hidden shadow-sm">
                <div className="p-8 border-b border-border bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
                    <h3 className="text-xl font-black text-content-main tracking-tighter uppercase flex items-center gap-3">
                        <IconBriefcase className="w-6 h-6 text-sky-500" />
                        Personnel Roster
                    </h3>
                    <span className="text-[10px] font-bold text-content-muted uppercase tracking-[0.2em]">Live Registry</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-primary-muted/30">
                                <th className="px-8 py-6 text-[10px] font-black uppercase text-content-muted tracking-widest">Member</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase text-content-muted tracking-widest">Department</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase text-content-muted tracking-widest">Temporal Pattern</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase text-content-muted tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {users.map((member) => {
                                const userShift = shifts.find(s => s._id === member.shift_id);
                                return (
                                    <tr key={member.id} className="hover:bg-primary-muted group transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center font-black text-sky-500 text-xs shadow-inner">
                                                    {member.full_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-content-main uppercase tracking-tight">{member.full_name}</p>
                                                    <p className="text-[10px] font-medium text-content-muted lowercase opacity-60 mt-0.5">{member.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-bold text-content-muted uppercase tracking-widest opacity-80">
                                                {member.department || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {userShift ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-primary-muted flex items-center justify-center shadow-inner">
                                                        {getShiftIcon(userShift.startTime)}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-content-main uppercase tracking-widest leading-none mb-1">{userShift.name}</p>
                                                        <p className="text-[9px] font-bold text-content-muted opacity-60 tracking-tight">{userShift.startTime} - {userShift.endTime}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[9px] font-black text-rose-500 italic uppercase tracking-widest opacity-40">Not Stationed</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {canManageShifts && (
                                                <button 
                                                    onClick={() => setSelectedUser(member)}
                                                    className="p-3 bg-primary-muted rounded-xl border border-border hover:border-sky-500/50 hover:bg-sky-500/5 text-content-muted hover:text-sky-500 transition-all active:scale-95 group/btn"
                                                >
                                                    <IconEdit size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Shift Assignment Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-primary-surface rounded-[2.5rem] border border-border shadow-2xl p-10 w-full max-w-lg flex flex-col gap-10"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-black text-content-main tracking-tighter uppercase">
                                        Change <span className="text-sky-500 italic">Temporal Pattern</span>
                                    </h3>
                                    <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest mt-2">Member: {selectedUser.full_name}</p>
                                </div>
                                <button onClick={() => setSelectedUser(null)} className="text-content-muted hover:text-rose-500 font-bold p-3 bg-primary-muted rounded-2xl transition-all">✕</button>
                            </div>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {shifts.map((shift) => (
                                    <button 
                                        key={shift._id}
                                        onClick={() => handleAssignShift(selectedUser.id, shift._id)}
                                        className={`w-full p-6 border rounded-3xl flex items-center justify-between transition-all group ${
                                            selectedUser.shift_id === shift._id 
                                            ? 'bg-sky-500/5 border-sky-500' 
                                            : 'bg-primary-muted/50 border-border hover:border-sky-500/30'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white dark:bg-navy-950 rounded-2xl flex items-center justify-center shadow-lg border border-border group-hover:scale-110 transition-transform">
                                                {getShiftIcon(shift.startTime)}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-black text-content-main uppercase tracking-widest">{shift.name}</p>
                                                <p className="text-[9px] font-bold text-content-muted opacity-60 tracking-tight mt-1">{shift.startTime} - {shift.endTime}</p>
                                            </div>
                                        </div>
                                        {selectedUser.shift_id === shift._id ? (
                                            <span className="text-[9px] font-black text-sky-500 uppercase tracking-widest">Active Pattern</span>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full border-2 border-slate-200 group-hover:border-sky-500 transition-colors" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Shifts;
