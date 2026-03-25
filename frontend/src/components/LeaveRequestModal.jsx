import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCalendar, IconUsers, IconInfo, IconChevronDown } from './Icons';

const LeaveRequestModal = ({ isOpen, onClose, onSubmit, user, managers = [] }) => {
    const [formData, setFormData] = useState({
        type: 'EL',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const leaveTypes = [
        { id: 'EL', label: 'Earned Leave', desc: 'Vacation & Personal Time' },
        { id: 'SL', label: 'Sick Leave', desc: 'Medical & Wellness' },
        { id: 'CL', label: 'Casual Leave', desc: 'Unplanned Urgent Matters' },
        { id: 'LWP', label: 'Leave Without Pay', desc: 'Extended Absence' }
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-6"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-slate-700/50 shadow-2xl p-8 w-full max-w-2xl space-y-8 overflow-hidden relative"
                >
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                    
                    <div className="flex justify-between items-center relative z-10">
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Initialise <span className="text-sky-500 italic">Leave</span></h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Personnel Deployment Protocol</p>
                        </div>
                        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white transition-all text-slate-500 group">
                            <span className="text-xl font-bold group-hover:rotate-90 transition-transform">✕</span>
                        </button>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-6 relative z-10">
                        {/* Manager Selection Display (Hardcoded label as requested) */}
                        <div className="bg-sky-500/5 border border-sky-500/10 rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                                <IconUsers className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[8px] font-black uppercase text-sky-500 tracking-widest">Routing Approval To</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">
                                    {user?.manager?.full_name || 'Department Head / Admin'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Leave Type Selector */}
                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Configuration Type</label>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    {leaveTypes.map(type => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setFormData({...formData, type: type.id})}
                                            className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-1 ${formData.type === type.id ? 'bg-sky-500 border-sky-500 text-white shadow-xl shadow-sky-500/20' : 'bg-white/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-600 hover:border-sky-500'}`}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-tighter">{type.id}</span>
                                            <span className="text-[9px] font-bold opacity-70 leading-tight uppercase tracking-tighter">{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date Range Selection */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Extraction Point (Start)</label>
                                <div className="relative">
                                    <IconCalendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 focus:border-sky-500 outline-none font-bold text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Re-Entry Point (End)</label>
                                <div className="relative">
                                    <IconCalendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 focus:border-sky-500 outline-none font-bold text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mission Rationale (Reason)</label>
                                <textarea 
                                    value={formData.reason}
                                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                    className="w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 focus:border-sky-500 outline-none font-bold text-xs h-24 resize-none"
                                    placeholder="Provide detailed context for leave request..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                            >
                                Decouple
                            </button>
                            <button 
                                type="submit" 
                                className="flex-[2] py-4 rounded-2xl bg-sky-500 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-sky-500/20 active:scale-95 transition-all"
                            >
                                Broadcast Request
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LeaveRequestModal;
