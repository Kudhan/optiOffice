import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    IconChevronLeft, 
    IconChevronRight, 
    IconUsers, 
    IconCalendar,
    IconSearch,
    IconInfo
} from './Icons';
import apiClient from '../api/client';

const TeamCalendar = () => {
    const [viewDate, setViewDate] = useState(new Date());
    const [teamLeaves, setTeamLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/leaves/team-calendar');
            setTeamLeaves(res.data);
        } catch (err) {
            console.error("Calendar data link severed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const daysInMonth = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        return new Date(year, month + 1, 0).getDate();
    }, [viewDate]);

    const firstDayOfMonth = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        return new Date(year, month, 1).getDay();
    }, [viewDate]);

    const calendarGrid = useMemo(() => {
        const grid = [];
        // Pad for month start
        for (let i = 0; i < firstDayOfMonth; i++) grid.push(null);
        // Add days
        for (let i = 1; i <= daysInMonth; i++) grid.push(i);
        return grid;
    }, [daysInMonth, firstDayOfMonth]);

    const getLeavesForDay = (day) => {
        if (!day) return [];
        // Normalize calendar date to local midnight
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        date.setHours(0, 0, 0, 0);

        return filteredLeaves.filter(l => {
            // Normalize start/end dates to local midnight for comparison
            const start = new Date(l.startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(l.endDate);
            end.setHours(0, 0, 0, 0);
            
            return date >= start && date <= end && l.status !== 'Rejected';
        });
    };

    const changeMonth = (offset) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
    };

    const filteredLeaves = useMemo(() => {
        if (!filter) return teamLeaves;
        return teamLeaves.filter(l => 
            l.user?.full_name?.toLowerCase().includes(filter.toLowerCase()) ||
            l.user?.department?.toLowerCase().includes(filter.toLowerCase())
        );
    }, [teamLeaves, filter]);

    if (loading) return <div className="p-20 text-center animate-pulse uppercase tracking-[0.3em] font-black text-[10px] text-slate-400">Synchronizing Strategic Calendar...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Calendar Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => changeMonth(-1)}
                            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all shadow-sm"
                        >
                            <IconChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="px-6 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm min-w-[160px] text-center">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h4>
                        </div>
                        <button 
                            onClick={() => changeMonth(1)}
                            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all shadow-sm"
                        >
                            <IconChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <button 
                        onClick={() => setViewDate(new Date())}
                        className="text-[10px] font-black uppercase tracking-widest text-sky-500 hover:underline"
                    >
                        Return to Point Alpha
                    </button>
                </div>

                <div className="relative w-full md:w-80">
                    <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="FILTER BY PERSONNEL OR UNIT..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full pl-12 pr-6 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:border-sky-500 outline-none text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Monthly Grid */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden p-4">
                <div className="grid grid-cols-7 border-b border-slate-50 dark:border-slate-800">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-4 text-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{day}</span>
                        </div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7">
                    {calendarGrid.map((day, idx) => {
                        const dayLeaves = getLeavesForDay(day);
                        const isToday = day && 
                                        new Date().getDate() === day && 
                                        new Date().getMonth() === viewDate.getMonth() && 
                                        new Date().getFullYear() === viewDate.getFullYear();

                        return (
                            <div key={idx} className={`min-h-[140px] p-4 border-r border-b border-slate-50 dark:border-slate-800/50 flex flex-col gap-2 relative transition-all group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${!day ? 'bg-slate-50/20 dark:bg-slate-900/50' : ''}`}>
                                {day && (
                                    <span className={`text-xs font-black ${isToday ? 'text-sky-500' : 'text-slate-400 group-hover:text-slate-600 transition-colors'}`}>
                                        {day.toString().padStart(2, '0')}
                                    </span>
                                )}
                                
                                <div className="space-y-1 overflow-y-auto max-h-[110px] scrollbar-hide">
                                    {dayLeaves.slice(0, 3).map(l => (
                                        <div 
                                            key={l.id}
                                            className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter truncate border ${
                                                l.status === 'Approved' 
                                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                                                : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                            }`}
                                            title={`${l.user?.full_name} (${l.type})`}
                                        >
                                            {l.user?.full_name}
                                        </div>
                                    ))}
                                    {dayLeaves.length > 3 && (
                                        <div className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter border bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 text-center">
                                            + {dayLeaves.length - 3} OTHERS
                                        </div>
                                    )}
                                </div>

                                {isToday && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-sky-500 rounded-full shadow-lg shadow-sky-500/50 animate-pulse" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend & Stats Overview */}
            <div className="flex flex-wrap items-center gap-8 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-md bg-emerald-500/10 border border-emerald-500/20" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Extraction</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-md bg-amber-500/10 border border-amber-500/20" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Awaiting Approval</span>
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-4 text-slate-400">
                    <IconInfo className="w-4 h-4" />
                    <p className="text-[9px] font-bold uppercase tracking-widest leading-none">
                        All personnel data encrypted via Tactical Layer-4.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TeamCalendar;
