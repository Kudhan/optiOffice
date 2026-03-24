import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/client';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { CardSkeleton } from './Skeleton';
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { 
  IconTrash, 
  IconCalendar, 
  IconPlus, 
  IconSync, 
  IconGlobe, 
  IconPaid 
} from './Icons';

// --- Utility: Get Next Holiday & Countdown ---
const getNextHolidayInfo = (holidays) => {
  if (!holidays || holidays.length === 0) return null;
  const now = new Date();
  const upcoming = holidays
    .map(h => ({ ...h, dateObj: new Date(h.date) }))
    .filter(h => h.dateObj > now)
    .sort((a, b) => a.dateObj - b.dateObj);

  if (upcoming.length === 0) return null;
  const next = upcoming[0];
  const diffTime = Math.abs(next.dateObj - now);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return { ...next, daysRemaining: diffDays };
};

// --- Holiday Card Sub-Component ---
const HolidayCard = ({ holiday, isAdmin, onRefresh, setLoading }) => {
  const dateObj = new Date(holiday.date);
  const month = dateObj.toLocaleString('default', { month: 'short' });
  const day = dateObj.getDate();

  // Check if holiday has passed
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPassed = dateObj < today;

  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent card clicks if we add them later
    console.log('[DEBUG] Delete Clicked for:', holiday.name);
    console.log('[DEBUG] Holiday Data:', holiday);
    
    if (!window.confirm(`Delete "${holiday.name}"? This action cannot be undone.`)) {
      console.log('[DEBUG] Delete Cancelled by user');
      return;
    }

    const holidayId = holiday.id || holiday._id;
    console.log('[DEBUG] Target ID:', holidayId);

    if (!holidayId) {
      toast.error("Holiday ID missing. Please refresh.");
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.delete(`/holidays/${holidayId}`);
      console.log('[DEBUG] Delete Response:', res.data);
      toast.success("Holiday purged successfully.");
      onRefresh();
    } catch (err) {
      console.error('[DEBUG] Delete Error:', err);
      const errMsg = err.response?.data?.message || "Internal server error during deletion";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-primary-surface backdrop-blur-xl rounded-[2.5rem] p-6 border border-border bento-card-hover glass-hover flex items-center gap-6 group transition-all duration-500 hover:shadow-2xl hover:shadow-sky-500/10 ${
      isPassed ? 'opacity-40 grayscale-[0.3]' : 'opacity-100'
    }`}>
      {/* Date Badge */}
      <div className={`flex flex-col items-center justify-center min-w-[80px] h-24 rounded-3xl shadow-lg text-white transition-all duration-500 ${
        isPassed 
          ? 'bg-gradient-to-br from-slate-400 to-slate-600 shadow-slate-500/20' 
          : 'bg-gradient-to-br from-sky-400 to-sky-600 shadow-sky-500/20'
      }`}>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{month}</span>
        <span className="text-3xl font-black leading-none">{day}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-2 mb-2">
          <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider ${
            holiday.type === 'Public' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
          }`}>
            {holiday.type}
          </span>
          {holiday.isPaid && (
            <span className="flex items-center gap-1 bg-sky-500/10 text-sky-500 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider">
              <IconPaid className="w-3 h-3" />
              Paid
            </span>
          )}
          <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
            holiday.isCustom !== false 
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' 
              : 'bg-slate-500/10 text-slate-500'
          }`}>
            {holiday.isCustom !== false ? 'Personal Custom' : 'National Roster'}
          </span>
          {isPassed && (
            <span className="bg-slate-500/10 text-slate-500 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider animate-pulse">
              Completed
            </span>
          )}
        </div>
        <h3 className={`text-xl font-black text-content-main truncate tracking-tight transition-all ${isPassed ? 'opacity-50 line-through' : ''}`}>{holiday.name}</h3>
      </div>

      {isAdmin && holiday.isCustom !== false && (
        <div className="flex items-center gap-2 relative z-50">
          <button 
            onClick={handleDelete}
            title="Delete Custom Holiday"
            className="w-12 h-12 rounded-3xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white flex items-center justify-center transition-all opacity-60 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-lg hover:shadow-rose-500/20 cursor-pointer relative z-[100]"
          >
            <IconTrash className="w-5 h-5 pointer-events-none" />
          </button>
        </div>
      )}
    </div>
  );
};

function Holidays() {
  const { isAdmin } = useAuth();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newHoliday, setNewHoliday] = useState({
    name: '', date: '', type: 'Public', isPaid: true
  });

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/holidays');
      // Filter for 2026 AS PER METADATA sourcing
      const currentYear = 2026; 
      const data = res.data.data;
      const filtered = data.filter(h => new Date(h.date).getFullYear() === currentYear);
      setHolidays(filtered);
    } catch (err) {
      toast.error("Failed to load holiday grid.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHolidays(); }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await apiClient.post('/holidays/sync-defaults');
      toast.success("2026 National Holidays Seeded Successfully!", { icon: '🇮🇳' });
      fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.message || "Sync failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Backend defaults isCustom to true, but we can be explicit
      await apiClient.post('/holidays', { ...newHoliday, isCustom: true });
      toast.success("Holiday added to calendar!");
      setShowForm(false);
      setNewHoliday({ name: '', date: '', type: 'Public', isPaid: true });
      fetchHolidays();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const nextHoliday = useMemo(() => getNextHolidayInfo(holidays), [holidays]);

  return (
    <div className="p-10 max-w-[1600px] mx-auto animate-fade-in pb-32">
      {/* Header Area */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-8">
        <div>
          <h2 className="text-6xl font-black text-content-main tracking-tighter leading-none mb-4">
            Office <span className="italic text-sky-500 font-extrabold underline decoration-sky-500/20 underline-offset-8">Leave.</span>
          </h2>
          <p className="text-content-muted font-bold text-lg tracking-tight max-w-xl">
            View upcoming public and company-specific holidays for your hub.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-3 bg-primary-surface border border-border text-content-main font-black py-4 px-8 rounded-[2rem] hover:bg-primary-muted transition-all shadow-xl group disabled:opacity-50"
            >
              <IconSync className={`w-5 h-5 ${isSyncing ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
              Sync National Holidays
            </button>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="bg-sky-500 text-white font-black py-4 px-10 rounded-[2rem] shadow-2xl shadow-sky-500/30 hover:brightness-110 active:scale-95 transition-all"
            >
              {showForm ? 'Cancel' : 'Add Custom'}
            </button>
          </div>
        )}
      </div>

      {/* Add Holiday Form */}
      {showForm && (
        <div className="mb-12 bg-primary-surface backdrop-blur-xl rounded-[3rem] p-10 border border-border animate-fade-in">
          <h3 className="text-2xl font-black text-content-main mb-6 uppercase tracking-tighter">New Holiday Event</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-content-muted ml-2">Event Designation</label>
              <Input 
                className="h-12 bg-primary-muted border-border rounded-2xl px-5 text-[11px] font-black uppercase tracking-widest text-content-main focus:ring-4 focus:ring-sky-500/10 transition-all placeholder:text-content-muted/30"
                placeholder="E.G. ANNUAL OPERATIONS SUMMIT"
                value={newHoliday.name}
                onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-content-muted ml-2">Holiday Date</label>
              <div className="relative group/input">
                <input 
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                  className="w-full h-12 rounded-2xl bg-primary-muted border border-border px-5 text-[11px] font-black uppercase tracking-widest text-content-main focus:outline-none focus:ring-2 focus:ring-sky-500/50 appearance-none cursor-pointer transition-all hover:bg-primary-muted/80 shadow-inner"
                  required
                />
                
              </div>
              <p className="text-[9px] text-content-muted/60 ml-2 font-bold italic">* Choose the target date for this holiday event</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-content-muted ml-2">Classification</label>
              <Select 
                onValueChange={(val) => setNewHoliday({...newHoliday, type: val})}
                value={newHoliday.type}
              >
                <SelectTrigger className="w-full h-12 rounded-2xl bg-primary-muted border-border text-[11px] font-black uppercase tracking-widest px-5 shadow-inner">
                  <SelectValue placeholder="Protocol Type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border bg-white/95 dark:bg-navy-950/95 backdrop-blur-xl shadow-2xl">
                  <SelectItem value="Public" className="text-[10px] font-black uppercase tracking-widest">Public Holiday</SelectItem>
                  <SelectItem value="Optional" className="text-[10px] font-black uppercase tracking-widest">Optional Holiday</SelectItem>
                  <SelectItem value="Company-Specific" className="text-[10px] font-black uppercase tracking-widest">Internal Holiday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all text-[10px] uppercase tracking-widest">
                Save & Synchronize
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Hero Widget: Next Holiday */}
      {nextHoliday && (
        <div className="mb-12 bg-content-main dark:bg-primary-surface rounded-[3rem] p-10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden group border border-border">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
             <IconCalendar className="w-32 h-32 text-sky-500" />
          </div>
          <div className="z-10 text-center md:text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-500 mb-4 block">Coming Up Next</span>
            <h3 className="text-4xl md:text-5xl font-black text-primary-surface dark:text-content-main tracking-tighter mb-2">{nextHoliday.name}</h3>
            <p className="text-content-muted font-bold text-lg">{new Date(nextHoliday.date).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
          </div>
          <div className="z-10 bg-primary-surface/10 dark:bg-primary-muted backdrop-blur-md rounded-[2.5rem] p-8 text-center min-w-[200px] border border-border">
            <span className="text-5xl font-black text-primary-surface dark:text-content-main block leading-tight">{nextHoliday.daysRemaining}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-500">Days Remaining</span>
          </div>
        </div>
      )}

      {/* Main Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : holidays.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 bg-primary-muted rounded-[4rem] border-4 border-dashed border-border">
          <IconCalendar className="w-20 h-20 text-content-muted opacity-20 mb-8" />
          <h3 className="text-3xl font-black text-content-main tracking-tighter mb-4">No Holidays Loaded.</h3>
          {isAdmin && (
             <button onClick={handleSync} className="text-sky-500 font-bold hover:underline underline-offset-4">Click here to seed India standard holidays.</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {holidays.map(h => (
            <HolidayCard 
              key={h.id || h._id} 
              holiday={h} 
              isAdmin={isAdmin} 
              onRefresh={fetchHolidays} 
              setLoading={setLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Holidays;
