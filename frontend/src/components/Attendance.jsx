import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { IconClock, IconBarChart, IconUsers, IconCalendar, IconClipboardList } from './Icons';
import AttendanceCalendar from './AttendanceCalendar';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Attendance Component: Premium Detailed History Page
 */
function Attendance({ token }) {
  const [records, setRecords] = useState([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ avgHours: '0.0', presence: 0, shift: null });
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/attendance/me');
      const { records: fetchedRecords, stats: fetchedStats } = response.data;
      
      setRecords(fetchedRecords || []);
      setStats(fetchedStats || { avgHours: '0.0', presence: 0, shift: null });

      const today = new Date().toISOString().split('T')[0];
      const todayRecord = (fetchedRecords || []).find(r => r.date === today && !r.checkOut);
      if (todayRecord) {
        setIsCheckedIn(true);
        setCurrentRecordId(todayRecord.id || todayRecord._id);
      }
    } catch (err) {
      console.error("Failed to fetch attendance", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await apiClient.post('/attendance/check-in', {});
      setIsCheckedIn(true);
      setCurrentRecordId(response.data.id || response.data._id);
      fetchAttendance();
    } catch (err) {
      // Handled by client interceptor
    }
  };

  const handleCheckOut = async () => {
    try {
      await apiClient.put(`/attendance/check-out/${currentRecordId}`, {});
      setIsCheckedIn(false);
      setCurrentRecordId(null);
      fetchAttendance();
    } catch (err) {
      // Handled by client interceptor
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '--:--';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isWeekoff = stats.shift?.workDays 
    ? !stats.shift.workDays.includes(new Date().getDay()) 
    : [0, 6].includes(new Date().getDay());

  return (
    <div className="p-10 max-w-[1400px] mx-auto min-h-[85vh] animate-fade-in space-y-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-10">
        <div>
          <h2 className="text-5xl font-black text-content-main tracking-tighter uppercase italic leading-none">
            Time <span className="text-sky-500">Log.</span>
          </h2>
          <p className="text-content-muted font-bold mt-4 uppercase tracking-widest text-xs">
            Advanced Attendance Management / {new Date().getFullYear()}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-6 px-8 py-4 bg-primary-muted rounded-2xl border border-border mr-4">
             <div className="text-center">
                <p className="text-[9px] font-black text-content-muted uppercase">Avg Hours</p>
                <p className="text-lg font-black text-content-main">{stats.avgHours}<span className="text-xs text-sky-500 ml-0.5">h</span></p>
             </div>
             <div className="w-px h-8 bg-border"></div>
             <div className="text-center">
                <p className="text-[9px] font-black text-content-muted uppercase">Monthly Presence</p>
                <p className="text-lg font-black text-content-main">{stats.presence}<span className="text-xs text-sky-500 ml-0.5">%</span></p>
             </div>
          </div>
          
          {isCheckedIn ? (
            <button 
              className="bg-rose-500 hover:brightness-110 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-rose-500/20 active:scale-95 animate-pulse" 
              onClick={handleCheckOut}
            >
              STOP SESSION
            </button>
          ) : isWeekoff ? (
            <button 
              className="bg-slate-200 text-slate-400 font-black py-4 px-10 rounded-2xl cursor-not-allowed border border-border" 
              disabled
            >
              WEEKOFF
            </button>
          ) : (
            <button 
              className="bg-[#7DD3FC] hover:brightness-110 text-slate-800 font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-sky-300/20 active:scale-95" 
              onClick={handleCheckIn}
            >
              START SHIFT
            </button>
          )}

          <div className="flex p-1 bg-primary-muted rounded-2xl border border-border ml-4 shadow-inner">
             <button 
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-sky-500' : 'text-content-muted hover:text-content-main'}`}
                title="Log Archive"
             >
                <IconClipboardList className="w-5 h-5" />
             </button>
             <button 
                onClick={() => setViewMode('calendar')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm text-sky-500' : 'text-content-muted hover:text-content-main'}`}
                title="Deployment Map"
             >
                <IconCalendar className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>

      {/* Grid: Stats & Detailed History */}
      <div className="grid grid-cols-12 gap-10">
        
        {/* History Table/List */}
      {/* Deployment Map (Calendar) vs Log Archive (List) */}
      <AnimatePresence mode="wait">
        {viewMode === 'calendar' ? (
          <motion.div 
            key="calendar" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="col-span-12"
          >
            <AttendanceCalendar records={records} />
          </motion.div>
        ) : (
          <motion.div 
            key="list" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="col-span-12"
          >
            <div className="bg-primary-surface border border-border rounded-[3rem] overflow-hidden shadow-sm">
               <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-primary-muted/30">
                      <th className="px-10 py-6 text-[10px] font-black text-content-muted uppercase tracking-widest">Date / Period</th>
                      <th className="px-10 py-6 text-[10px] font-black text-content-muted uppercase tracking-widest text-center">In</th>
                      <th className="px-10 py-6 text-[10px] font-black text-content-muted uppercase tracking-widest text-center">Out</th>
                      <th className="px-10 py-6 text-[10px] font-black text-content-muted uppercase tracking-widest text-center">Hours</th>
                      <th className="px-10 py-6 text-[10px] font-black text-content-muted uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoading ? (
                      <tr><td colSpan="5" className="p-20 text-center animate-pulse text-content-muted font-bold italic">Syncing with server...</td></tr>
                    ) : records.length === 0 ? (
                      <tr><td colSpan="5" className="p-20 text-center text-content-muted font-bold uppercase italic">No records found.</td></tr>
                    ) : (
                      records.map(record => (
                        <tr key={record.id || record._id} className="hover:bg-primary-muted/20 transition-colors group">
                          <td className="px-10 py-8">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary-muted rounded-2xl flex flex-col items-center justify-center border border-border group-hover:bg-sky-500 group-hover:text-white transition-all">
                                   <span className="text-[8px] font-black leading-none">{new Date(record.date).toLocaleString('default', { month: 'short' })}</span>
                                   <span className="text-lg font-black leading-none mt-0.5">{new Date(record.date).getDate()}</span>
                                </div>
                                <div>
                                  <p className="text-sm font-black text-content-main uppercase">{new Date(record.date).toLocaleDateString('default', { weekday: 'long' })}</p>
                                  <p className="text-[9px] font-bold text-content-muted uppercase tracking-tighter">Tenant Hub: {record.tenantId}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-10 py-8 text-center text-sm font-bold text-content-main">{formatTime(record.checkIn)}</td>
                          <td className="px-10 py-8 text-center text-sm font-bold text-content-main">{formatTime(record.checkOut)}</td>
                          <td className="px-10 py-8 text-center">
                             <span className="text-lg font-black text-content-main italic">{record.workHours || '0.0'}<span className="text-[9px] ml-0.5 not-italic text-sky-500">HRS</span></span>
                          </td>
                          <td className="px-10 py-8 text-right">
                             <span className={`inline-block px-4 py-1.5 text-[9px] font-black uppercase rounded-full border ${
                               record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                               record.status === 'Late' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                               'bg-rose-500/10 text-rose-500 border-rose-500/20'
                             }`}>
                               {record.status}
                             </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
               </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

export default Attendance;
