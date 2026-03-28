import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import apiClient from '../api/client';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { 
  StatsWidget, 
  WeeklyPresence, 
  PriorityTasks,
  QuickActionsRow,
  FloorDynamics,
  DepartmentBreakdown,
  PendingLeaveApprovals,
  DailyAttendancePercent,
  AssetValuationPulse
} from './Widgets';
import { CardSkeleton, ListSkeleton } from './Skeleton';
import InviteUserModal from './InviteUserModal';

/**
 * LiveTimer: Simple ticking component that calculates HH:MM:SS from a start date
 */
const LiveTimer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    if (!startTime) return;

    const tick = () => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((now - start) / 1000));

      const h = Math.floor(diff / 3600).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');

      setElapsed(`${h}:${m}:${s}`);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  return <span className="font-mono text-sm tracking-tighter tabular-nums">{elapsed}</span>;
};

/**
 * Countdown: Shows time remaining until shift start
 */
const Countdown = ({ targetTime }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const tick = () => {
            const [h, m] = targetTime.split(':').map(Number);
            const target = new Date();
            target.setHours(h, m, 0, 0);
            
            const diff = target - new Date();
            if (diff <= 0) {
                setTimeLeft('');
                return;
            }

            const totalMinutes = Math.floor(diff / (1000 * 60));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            
            setTimeLeft(hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`);
        };

        tick();
        const interval = setInterval(tick, 60000);
        return () => clearInterval(interval);
    }, [targetTime]);

    if (!timeLeft) return null;
    return <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded ml-2 tracking-widest">{timeLeft}</span>;
};

function Dashboard() {
  const { user, data: layoutData, showNavbar } = useOutletContext();
  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';
  const isManager = user?.role === 'manager';
  
  const [data, setData] = useState(layoutData);
  const [isLoading, setIsLoading] = useState(!layoutData);
  const [isClocking, setIsClocking] = useState(false);
  const [attendanceId, setAttendanceId] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [userShift, setUserShift] = useState(null);

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
            const todayRecord = records.find(r => r.date === today && !r.checkOut);
            if (todayRecord) {
                setIsClockedIn(true);
                setAttendanceId(todayRecord.id);
                setCheckInTime(todayRecord.checkIn);
            }
        } catch (err) {
            console.error("Status check failed", err);
        }
    };
    const fetchShift = async () => {
        try {
            const res = await apiClient.get(`shifts/user/${user.id}`);
            setUserShift(res.data.data.shift);
        } catch (err) {
            console.error("Shift fetch failed", err);
        }
    };

    checkStatus();
    if (user?.id) fetchShift();
  }, [user]);

  const toggleClockIn = async () => {
    setIsClocking(true);
    try {
        if (!isClockedIn) {
            const res = await apiClient.post('attendance/check-in');
            setIsClockedIn(true);
            setAttendanceId(res.data.id);
            setCheckInTime(res.data.checkIn);
            
            // Personalized Feedback Loop
            toast.success(
              `Welcome to OptiOffice, ${res.data.userName}! Clock-in at ${res.data.formattedTime}`, 
              { icon: '🚀', duration: 4000 }
            );
        } else {
            await apiClient.put(`attendance/check-out/${attendanceId}`);
            setIsClockedIn(false);
            setAttendanceId(null);
            setCheckInTime(null);
            toast.success('Shift ended. Rest well!', { icon: '🌙' });
        }
    } catch (err) {
        // Interceptor handles error toast
    } finally {
        setIsClocking(false);
    }
  };

  // Report Download Logic
  const handleDownloadReport = async () => {
    setIsLoading(true);
    try {
        const res = await apiClient.get('attendance/report');
        const data = res.data;

        if (data.length === 0) {
            toast.error("No attendance data found for this month.");
            return;
        }

        // CSV Helper: Convert JSON to CSV string
        const headers = ["Name", "Email", "Total Days", "Total Lates", "Avg Work Hours"];
        const csvContent = [
            headers.join(","),
            ...data.map(r => [r.name, r.email, r.totalDays, r.totalLates, r.avgWorkHours].join(","))
        ].join("\n");

        // Trigger Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Attendance_Report_${new Date().getMonth()+1}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Monthly report generated & shared!", { icon: '📊' });
    } catch (err) {
        console.error("Report generation failed", err);
    } finally {
        setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.full_name?.split(' ')[0] || user?.username || user?.sub?.split(' ')[0] || 'User';

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
            <QuickActionsRow onAction={(title) => title === 'Generate Report' && handleDownloadReport()} isLoading={isLoading} />
        </div>
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-10">
            <FloorDynamics isLoading={isLoading} totalEmployees={data?.stats?.total_employees} />
            <PriorityTasks tasks={data?.tasks} title="Company Velocity" isLoading={isLoading} />
        </div>
    </div>
  );

  const HRView = (
    <div className="grid grid-cols-12 gap-10">
        <DepartmentBreakdown stats={data?.stats} isLoading={isLoading} />
        <PendingLeaveApprovals stats={data?.stats} isLoading={isLoading} />
        <DailyAttendancePercent stats={data?.stats} isLoading={isLoading} />
        <div className="col-span-12 lg:col-span-8">
            <StatsWidget stats={data?.stats} isLoading={isLoading} />
        </div>
        <div className="col-span-12 lg:col-span-4">
             <FloorDynamics isLoading={isLoading} totalEmployees={data?.stats?.total_employees} />
        </div>
    </div>
  );

  const FunctionalView = (
    <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-10 h-full">
                <AssetValuationPulse stats={data?.stats} isLoading={isLoading} />
            </div>
        </div>
        <div className="col-span-12 lg:col-span-4">
            <PriorityTasks tasks={data?.tasks} title="Team Priority" isLoading={isLoading} />
        </div>
        <div className="col-span-12">
            <StatsWidget stats={data?.stats} isLoading={isLoading} />
        </div>
    </div>
  );

  const EmployeeView = (
    <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-10">
             <div className="bg-primary-surface p-8 rounded-[2.5rem] border border-border shadow-sm transition-all h-full">
                <span className="text-[10px] uppercase font-bold tracking-widest text-content-muted mb-4 block">My Personal Stats</span>
                <div className="space-y-6">
                    <div className="p-6 bg-sky-500/5 rounded-3xl border border-sky-500/10">
                        <p className="text-xs font-bold text-sky-500 mb-1">Assigned Shift</p>
                        <p className="text-2xl font-black text-content-main uppercase tracking-tighter">
                            {userShift ? `${userShift.startTime} - ${userShift.endTime}` : 'No Shift Set'}
                        </p>
                    </div>
                    <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                        <p className="text-xs font-bold text-emerald-500 mb-1">Tasks Done</p>
                        <p className="text-3xl font-black text-content-main">{data?.stats?.completed_tasks || 0}</p>
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
            <h2 className="text-6xl font-black text-content-main tracking-tighter leading-none">
              {getGreeting()}, <span className="italic text-sky-500 dark:text-sky-400 font-extrabold">{firstName}.</span>
            </h2>
             <p className="text-content-muted font-bold mt-6 text-lg max-w-2xl leading-relaxed tracking-tight">
               {isAdmin || isManager 
                 ? `There are ${data?.stats?.active_tasks || 0} active tasks across the ${user?.tenantId || 'global'} hub. All systems are currently operational.`
                 : (data?.tasks?.filter(t => t.status !== 'Done' && t.status !== 'Completed').length > 0 
                    ? `You have ${data.tasks.filter(t => t.status !== 'Done' && t.status !== 'Completed').length} tasks to focus on today. Don't forget to track your progress!`
                    : "You've cleared your deck! Great job on staying ahead of your schedule today.")
               }
            </p>
          </div>

          <div className="flex items-center gap-4">
             {isAdmin && (
                <button 
                  onClick={() => setIsInviteOpen(true)}
                  className="flex items-center gap-2 border border-border text-content-main font-bold py-4 px-8 rounded-2xl hover:bg-primary-muted transition-all text-sm shadow-sm group"
                >
                  Invite User
                </button>
             )}
             
             {/* Smart Button: Clock In/Out */}
             <button 
                onClick={toggleClockIn}
                disabled={isClocking}
                className={`flex items-center gap-4 ${isClockedIn ? 'bg-rose-500 shadow-rose-500/20' : 'bg-[#7DD3FC] shadow-sky-300/20'} hover:brightness-105 active:scale-95 text-white font-black py-4 px-10 rounded-2xl transition-all text-sm shadow-xl group relative overflow-hidden`}
             >
                {isClocking ? (
                    <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                ) : (
                    <>
                        {isClockedIn ? (
                            <div className="flex flex-col items-start leading-none gap-0.5">
                                <span className="uppercase text-[9px] font-bold opacity-80 tracking-widest text-white/90">
                                    {userShift ? `Shift: ${userShift.startTime} - ${userShift.endTime}` : 'Work Session Live'}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">🌙</span>
                                  <LiveTimer startTime={checkInTime} />
                                  <span className="ml-2 bg-white/20 px-2 py-0.5 rounded text-[10px]">CLOCK OUT</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-start leading-none gap-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg animate-pulse">⏰</span>
                                    <span className="uppercase tracking-widest text-slate-800">Clock In</span>
                                    {userShift && <Countdown targetTime={userShift.startTime} />}
                                </div>
                                {userShift && (
                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter mt-1 opacity-60">
                                        Assigned: {userShift.startTime} - {userShift.endTime}
                                    </span>
                                )}
                            </div>
                        )}
                    </>
                )}
             </button>
          </div>
        </div>

        {/* Dynamic Bento Swap */}
        {(() => {
            if (isAdmin && user?.department === 'HR') return HRView;
            if (isAdmin || isManager) {
                if (['Engineering', 'Sales', 'Operations'].includes(user?.department)) return FunctionalView;
                return AdminView;
            }
            return EmployeeView;
        })()}

        <InviteUserModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </div>
  );
}

export default Dashboard;
