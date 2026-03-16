import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import apiClient from '../api/client';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { 
  StatsWidget, 
  WeeklyPresence, 
  PriorityTasks,
  QuickActionsRow
} from './Widgets';
import { CardSkeleton, ListSkeleton } from './Skeleton';
import InviteUserModal from './InviteUserModal';


function Dashboard() {
  const { isAdmin, isManager, user } = useAuth();
  const { data: layoutData } = useOutletContext();
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

  // Role-Based Views
  const AdminView = (
    <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-10">
            <StatsWidget stats={data?.stats} isLoading={isLoading} />
            <WeeklyPresence isLoading={isLoading} />
            <QuickActionsRow />
        </div>
        <div className="col-span-12 lg:col-span-4 h-full">
            <PriorityTasks tasks={data?.tasks} title="Company Velocity" isLoading={isLoading} />
        </div>
    </div>
  );

  const EmployeeView = (
    <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-10">
             <div className="bg-white dark:bg-navy-950/50 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all h-full">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-4 block">My Personal Stats</span>
                <div className="space-y-6">
                    <div className="p-6 bg-sky-500/5 rounded-3xl border border-sky-500/10">
                        <p className="text-xs font-bold text-sky-500 mb-1">Weekly Focus</p>
                        <p className="text-3xl font-black dark:text-white">92%</p>
                    </div>
                    <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                        <p className="text-xs font-bold text-emerald-500 mb-1">Tasks Done</p>
                        <p className="text-3xl font-black dark:text-white">{data?.tasks?.filter(t => t.status === 'Completed').length || 0}</p>
                    </div>
                </div>
             </div>
        </div>
        <div className="col-span-12 lg:col-span-8">
            <PriorityTasks tasks={data?.tasks} title="My Task List" isLoading={isLoading} />
        </div>
    </div>
  );

  return (
    <div className="p-10 max-w-[1600px] mx-auto animate-fade-in transition-colors duration-500">
        
        {/* The Command Center Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8">
          <div>
            <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              Good Morning, <span className="italic text-sky-500 dark:text-sky-400 font-extrabold">{firstName}.</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold mt-6 text-lg max-w-2xl leading-relaxed tracking-tight">
               {isAdmin || isManager 
                 ? `Your office velocity is up 12.5% this week. All systems in the ${user?.tenantId || 'global'} hub are currently operational.`
                 : "You have 3 tasks due today. Remember to track your time in the attendance module."}
            </p>
          </div>

          <div className="flex items-center gap-4">
             {isAdmin && (
                <button 
                  onClick={() => setIsInviteOpen(true)}
                  className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 dark:text-white font-bold py-4 px-8 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm shadow-sm group"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">👤+</span>
                  Invite User
                </button>
             )}
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

        {/* Dynamic Bento Swap */}
        {(isAdmin || isManager) ? AdminView : EmployeeView}

        <InviteUserModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </div>
  );
}

export default Dashboard;
