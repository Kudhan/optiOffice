import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    IconChevronLeft, 
    IconChevronRight, 
    IconClock,
    IconCalendar,
    IconInfo,
    IconLogOut
} from './Icons';

const AttendanceCalendar = ({ records = [] }) => {
    const [viewDate, setViewDate] = useState(new Date());

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
        for (let i = 0; i < firstDayOfMonth; i++) grid.push(null);
        for (let i = 1; i <= daysInMonth; i++) grid.push(i);
        return grid;
    }, [daysInMonth, firstDayOfMonth]);

    const getRecordForDay = (day) => {
        if (!day) return null;
        const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return records.find(r => r.date === dateStr);
    };

    const changeMonth = (offset) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '--:--';
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Controls */}
            <div className="flex justify-between items-center bg-primary-muted/20 p-4 rounded-3xl border border-border/50">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => changeMonth(-1)}
                        className="w-10 h-10 rounded-xl bg-primary-surface border border-border flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all shadow-sm"
                    >
                        <IconChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="min-w-[140px] text-center">
                        <h4 className="text-xs font-black text-content-main uppercase tracking-widest">
                            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h4>
                    </div>
                    <button 
                        onClick={() => changeMonth(1)}
                        className="w-10 h-10 rounded-xl bg-primary-surface border border-border flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all shadow-sm"
                    >
                        <IconChevronRight className="w-5 h-5" />
                    </button>
                </div>
                <button 
                    onClick={() => setViewDate(new Date())}
                    className="text-[10px] font-black uppercase tracking-widest text-sky-500 hover:underline px-4"
                >
                    Current Cycle
                </button>
            </div>

            {/* Grid */}
            <div className="bg-primary-surface rounded-[2.5rem] border border-border shadow-xl overflow-hidden p-2">
                <div className="grid grid-cols-7 border-b border-border/50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="py-4 text-center">
                            <span className="text-[9px] font-black text-content-muted uppercase tracking-[0.2em]">{day}</span>
                        </div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7">
                    {calendarGrid.map((day, idx) => {
                        const record = getRecordForDay(day);
                        const isToday = day && 
                                        new Date().getDate() === day && 
                                        new Date().getMonth() === viewDate.getMonth() && 
                                        new Date().getFullYear() === viewDate.getFullYear();

                        return (
                            <div key={idx} className={`min-h-[120px] p-3 border-r border-b border-border/30 flex flex-col gap-2 relative group transition-all hover:bg-primary-muted/10 ${!day ? 'bg-primary-muted/5' : ''}`}>
                                {day && (
                                    <span className={`text-[11px] font-black ${isToday ? 'text-sky-500' : 'text-content-muted/60 group-hover:text-content-main transition-colors'}`}>
                                        {day.toString().padStart(2, '0')}
                                    </span>
                                )}
                                
                                {record && (
                                    <div className="flex flex-col gap-1.5 mt-1">
                                        <div className="flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-2 py-1">
                                            <IconClock className="w-2.5 h-2.5 text-emerald-500" />
                                            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400">{formatTime(record.checkIn)}</span>
                                        </div>
                                        {record.checkOut ? (
                                            <div className="flex items-center gap-1.5 bg-sky-500/5 border border-sky-500/20 rounded-lg px-2 py-1">
                                                <IconLogOut className="w-2.5 h-2.5 text-sky-500" />
                                                <span className="text-[9px] font-black text-sky-600 dark:text-sky-400">{formatTime(record.checkOut)}</span>
                                            </div>
                                        ) : (
                                            <div className="h-4 flex items-center px-2">
                                                <span className="text-[8px] font-black text-amber-500 animate-pulse uppercase">Active...</span>
                                            </div>
                                        )}
                                        
                                        <div className={`mt-1 text-[8px] font-black uppercase tracking-widest text-center py-0.5 rounded-full border ${
                                            record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                            record.status === 'Late' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                            'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                        }`}>
                                            {record.status}
                                        </div>
                                    </div>
                                )}

                                {isToday && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-sky-500 rounded-full shadow-lg shadow-sky-500/50 animate-pulse" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 px-6 py-4 bg-primary-muted/10 rounded-2xl border border-border/50 text-[9px] font-black text-content-muted uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>On Time</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Late Entry</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Short Attendance</span>
                </div>
                <div className="ml-auto opacity-50 flex items-center gap-2">
                    <IconInfo className="w-3 h-3" />
                    <span>Click to view detailed session log</span>
                </div>
            </div>
        </div>
    );
};

// No internal icon needed
export default AttendanceCalendar;
