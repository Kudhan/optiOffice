import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { 
  StatsWidget, 
  WeeklyPresence, 
  PriorityTasks,
  QuickActionsRow
} from './Widgets';
import { CardSkeleton, ListSkeleton } from './Skeleton';

const InviteModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({ full_name: '', username: '', email: '', role: 'employee', password: 'Password123!' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await apiClient.post('users', formData);
            toast.success(`Invitation sent to ${formData.full_name}!`, {
                icon: '📩',
                style: { borderRadius: '15px', background: '#0B1120', color: '#fff' }
            });
            onClose();
        } catch (err) {
            // Error handled by interceptor
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-navy-950/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-navy-900 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-in">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Invite New User</h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-xl">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                            <input 
                                required 
                                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold dark:text-white"
                                value={formData.full_name}
                                onChange={e => setFormData({...formData, full_name: e.target.value})}
                                placeholder="Alex Carter"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Username</label>
                            <input 
                                required 
                                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold dark:text-white"
                                value={formData.username}
                                onChange={e => setFormData({...formData, username: e.target.value})}
                                placeholder="alex_c"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address Address</label>
                        <input 
                            required 
                            type="email"
                            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold dark:text-white"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            placeholder="alex@optioffice.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Organization Role</label>
                        <select 
                            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold dark:text-white appearance-none"
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="employee">Employee</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full bg-sky-500 hover:bg-sky-400 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-sky-500/20 active:scale-95 disabled:opacity-50"
                    >
                        {submitting ? 'Sending Request...' : 'Dispatch Invitation'}
                    </button>
                </form>
            </div>
        </div>
    );
};

function Dashboard() {
  const { user, data: layoutData } = useOutletContext();
  const [data, setData] = useState(layoutData);
  const [isLoading, setIsLoading] = useState(!layoutData);
  const [isClocking, setIsClocking] = useState(false);
  const [attendanceId, setAttendanceId] = useState(null);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  useEffect(() => {
    if (layoutData) {
        setData(layoutData);
        setIsLoading(false);
    }
  }, [layoutData]);

  // Fetch current attendance status on mount
  useEffect(() => {
    const checkStatus = async () => {
        try {
            const res = await apiClient.get('attendance/me');
            const records = res.data;
            const today = new Date().toISOString().split('T')[0];
            const todayRecord = records.find(r => r.date === today && !r.check_out);
            if (todayRecord) {
                setIsClockedIn(true);
                setAttendanceId(todayRecord._id);
            }
        } catch (err) {
            console.error("Status check failed", err);
        }
    };
    checkStatus();
  }, []);

  const toggleClockIn = async () => {
    setIsClocking(true);
    try {
        if (!isClockedIn) {
            const res = await apiClient.post('attendance/check-in');
            setIsClockedIn(true);
            setAttendanceId(res.data._id);
            toast.success('Shift started! Have a productive day.', { icon: '🚀' });
        } else {
            await apiClient.put(`attendance/check-out/${attendanceId}`);
            setIsClockedIn(false);
            setAttendanceId(null);
            toast.success('Shift ended. Rest well!', { icon: '🌙' });
        }
    } catch (err) {
        // Interceptor handles error toast
    } finally {
        setIsClocking(false);
    }
  };

  const firstName = user?.sub?.split(' ')[0] || 'User';

  if (isLoading) {
    return (
        <div className="p-10 max-w-[1600px] mx-auto space-y-10">
            <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-3xl w-1/2 animate-pulse mb-12"></div>
            <div className="grid grid-cols-12 gap-10">
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-10">
                    <CardSkeleton />
                    <div className="h-[400px] bg-slate-100 dark:bg-navy-900/50 rounded-3xl animate-pulse"></div>
                </div>
                <div className="col-span-12 lg:col-span-4">
                    <ListSkeleton />
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="p-10 max-w-[1600px] mx-auto animate-fade-in transition-colors duration-500">
        
        {/* The Command Center Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8">
          <div>
            <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              Good Morning, <span className="italic text-sky-500 dark:text-sky-400 font-extrabold">{firstName}.</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold mt-6 text-lg max-w-2xl leading-relaxed tracking-tight">
               Your office velocity is up <span className="text-sky-500 dark:text-sky-400">12.5%</span> this week. All systems in the New York hub are currently operational.
            </p>
          </div>

          <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsInviteOpen(true)}
                className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 dark:text-white font-bold py-4 px-8 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm shadow-sm group"
             >
                <span className="text-lg group-hover:scale-110 transition-transform">👤+</span>
                Invite User
             </button>
             <button 
                onClick={toggleClockIn}
                disabled={isClocking}
                className={`flex items-center gap-3 ${isClockedIn ? 'bg-rose-500 shadow-rose-500/20' : 'bg-sky-500 shadow-sky-500/20'} hover:brightness-110 active:scale-95 text-white font-black py-4 px-10 rounded-2xl transition-all text-sm shadow-xl group`}
             >
                {isClocking ? (
                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                ) : (
                    <>
                        <span className="text-lg animate-pulse">{isClockedIn ? '🌙' : '⏰'}</span>
                        <span>{isClockedIn ? 'Clock Out' : 'Clock In'}</span>
                    </>
                )}
             </button>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-10">
            
            {/* Left/Central Column (8-col) */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-10">
                <StatsWidget stats={data?.stats} isLoading={isLoading} />
                <WeeklyPresence isLoading={isLoading} />
                <QuickActionsRow />
            </div>

            {/* Right Side Column (4-col) */}
            <div className="col-span-12 lg:col-span-4 h-full">
                <PriorityTasks tasks={data?.tasks} isLoading={isLoading} />
            </div>

        </div>

        <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </div>
  );
}

export default Dashboard;
