import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCalendar, IconUsers, IconInfo, IconChevronDown } from './Icons';
import apiClient from '../api/client';

const LeaveRequestModal = ({ isOpen, onClose, onSubmit, user, config, managers = [] }) => {
    const [stats, setStats] = useState({});
    const [loadingStats, setLoadingStats] = useState(false);

    const rawClassifications = config?.leaveClassifications || [];
    
    const [formData, setFormData] = useState({
        type: rawClassifications[0]?.code || 'EL',
        startDate: '',
        endDate: '',
        reason: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchStats();
        }
    }, [isOpen]);

    const fetchStats = async () => {
        try {
            setLoadingStats(true);
            const { data } = await apiClient.get('/leaves/usage-stats');
            setStats(data || {});
        } catch (err) {
            console.error("Stats link synchronization failure");
        } finally {
            setLoadingStats(false);
        }
    };

    const calculateDays = () => {
        if (!formData.startDate || !formData.endDate) return 0;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (isNaN(start) || isNaN(end) || end < start) return 0;
        
        let count = 0;
        let cur = new Date(start);
        const weeklyOffs = config?.weeklyOffs || [0, 6];
        
        while (cur <= end) {
            if (!weeklyOffs.includes(cur.getDay())) {
                count++;
            }
            cur.setDate(cur.getDate() + 1);
        }
        return count;
    };

    const requestDays = calculateDays();
    const selectedType = rawClassifications.find(c => c.code === formData.type);
    const usedDays = stats[formData.type] || 0;
    const remainingDays = selectedType ? Math.max(0, selectedType.days - usedDays) : 0;
    const willExceed = selectedType && (usedDays + requestDays > selectedType.days) && selectedType.isDeductible !== false;

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
                        {/* Status Balance Ribbon */}
                        <div className="flex items-center gap-4">
                            <div className="h-0.5 flex-1 bg-slate-100 dark:bg-slate-800" />
                            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">
                                Quota <span className="text-sky-500">Availability</span>
                            </h3>
                            <div className="h-0.5 flex-1 bg-slate-100 dark:bg-slate-800" />
                        </div>

                        {/* Leave Type Selector with Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {rawClassifications.map(type => {
                                const used = stats[type.code] || 0;
                                const isSelected = formData.type === type.code;
                                const isExhausted = type.isDeductible !== false && used >= type.days;
                                
                                return (
                                    <button
                                        key={type.code}
                                        type="button"
                                        onClick={() => setFormData({...formData, type: type.code})}
                                        className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col justify-between h-28 relative overflow-hidden group ${
                                            isSelected 
                                                ? 'bg-sky-500 border-sky-500 text-white shadow-xl shadow-sky-500/20' 
                                                : isExhausted
                                                ? 'bg-rose-500/5 border-rose-500/20 text-slate-400'
                                                : 'bg-white/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-600 hover:border-sky-500'
                                        }`}
                                    >
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-tighter block">{type.code}</span>
                                            <span className={`text-[8px] font-bold opacity-70 leading-tight uppercase tracking-tighter block truncate ${isSelected ? 'text-white' : ''}`}>{type.title}</span>
                                        </div>
                                        <div className="mt-auto">
                                            <span className={`text-[11px] font-black ${isSelected ? 'text-white' : 'text-sky-500'}`}>{used} <span className="text-[8px] opacity-50">/ {type.days}</span></span>
                                        </div>
                                        {type.isDeductible === false && (
                                            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-500" title="Non-Deductible" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Analysis Window */}
                        {requestDays > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className={`p-4 rounded-2xl border flex items-center gap-4 transition-colors ${
                                    willExceed ? 'bg-rose-500/10 border-rose-500/20 text-rose-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                                }`}
                            >
                                <IconInfo className="w-5 h-5 shrink-0" />
                                <div className="text-[10px] font-bold uppercase tracking-tight leading-relaxed">
                                    {willExceed ? (
                                        <span>Alert: This {requestDays}-day request exceeds your {selectedType?.title} quota. It will be converted to Loss of Pay (LWP).</span>
                                    ) : (
                                        <span>Tactical Analysis: This {requestDays}-day request will leave you with {remainingDays - requestDays} days of {selectedType?.title}.</span>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
