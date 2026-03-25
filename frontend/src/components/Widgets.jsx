import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import WeeklyPresence from './WeeklyPresence';
import { ListSkeleton } from './Skeleton';
import { 
  IconFileText, 
  IconBriefcase, 
  IconUsers, 
  IconClock, 
  IconBarChart,
  IconPlus,
  IconDashboard
} from './Icons';

const tileClasses = "bg-primary-surface backdrop-blur-md border border-border rounded-[2.5rem] p-8 shadow-sm transition-all duration-300 flex flex-col";

// StatsWidget remained same...
export const StatsWidget = ({ stats, isLoading }) => {
  const items = [
    { label: 'Total Employees', value: stats?.total_employees || '0', trend: '+4%', trendColor: 'text-emerald-500' },
    { label: 'Active Tasks', value: stats?.active_tasks || '0', trend: 'Live', trendColor: 'text-sky-500' },
    { label: 'Pending Leaves', value: stats?.pending_leaves || '0', trend: 'Action Required', trendColor: 'text-rose-500' },
  ];
  
  return (
    <div className={`col-span-12 lg:col-span-8 ${tileClasses}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col border-r border-border last:border-0 pr-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-content-muted mb-2">{item.label}</span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-content-main tracking-tighter">{item.value}</span>
              <span className={`text-xs font-bold ${item.trendColor}`}>{item.trend}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { WeeklyPresence };

/**
 * FloorDynamics: Admin Bento card showing office occupancy with dynamic presence
 */
export const FloorDynamics = ({ isLoading, totalEmployees = 0 }) => {
  const [presentUsers, setPresentUsers] = useState([]);
  const total = totalEmployees || 50; // Fallback to 50 if stats not available

  useEffect(() => {
    const fetchDynamics = async () => {
      try {
        const res = await apiClient.get('attendance/daily-status');
        setPresentUsers(res.data);
      } catch (err) {
        console.error("Dynamics fetch failed", err);
      }
    };
    fetchDynamics();
  }, []);

  const presentCount = presentUsers.length;
  const awayCount = Math.max(0, total - presentCount);

  return (
    <div className={`col-span-12 lg:col-span-4 ${tileClasses} bg-gradient-to-br from-primary-surface to-sky-500/5 min-h-[400px]`}>
      <span className="text-[10px] uppercase font-bold tracking-widest text-sky-500 mb-6 block font-black">Office Hub Dynamic</span>
      
      <div className="flex flex-col flex-1">
        <div className="mb-6">
          <h2 className="text-6xl font-black text-content-main tracking-tighter leading-none">{presentCount}</h2>
          <p className="text-sm font-bold text-content-muted uppercase tracking-tight mt-2 italic opacity-60">Currently Stationed</p>
        </div>

        {/* Presence Bar */}
        <div className="space-y-4 mb-8">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-sky-500 h-full rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${(presentCount / total) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
            <span className="text-sky-500">{presentCount} Active</span>
            <span className="text-content-muted">{awayCount} Out / Away</span>
          </div>
        </div>

        {/* Live Presence List */}
        <div className="flex-1 mt-4">
            <p className="text-[10px] font-bold text-content-muted uppercase tracking-widest mb-4">Lately Clocked In</p>
            <div className="flex -space-x-3 overflow-hidden p-2">
                {presentUsers.slice(0, 8).map((record, idx) => (
                    <div 
                        key={record._id || idx} 
                        className="w-12 h-12 rounded-full border-4 border-white dark:border-navy-950 bg-primary-muted flex items-center justify-center text-xs font-black text-sky-500 shadow-sm relative group cursor-help transition-transform hover:scale-110 hover:z-10"
                        title={record.user?.full_name}
                    >
                        {record.user?.full_name?.charAt(0) || '?'}
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-navy-950 shadow-sm" />
                        
                        {/* Tooltip-like popup */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-navy-950 text-white p-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl border border-white/10 w-32">
                           <p className="text-[10px] font-black uppercase leading-none truncate">{record.user?.full_name}</p>
                           <p className="text-[8px] font-bold text-sky-400 uppercase mt-1">Clocked {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}</p>
                        </div>
                    </div>
                ))}
                {presentUsers.length === 0 && (
                    <div className="flex items-center gap-3 opacity-30 italic text-[10px] font-bold uppercase tracking-widest py-4">
                        Waiting for deployments...
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold text-content-muted uppercase tracking-widest leading-none">Live Ops Sync</span>
        </div>
        <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest">Synced with Cloud</p>
      </div>
    </div>
  );
};

export const PriorityTasks = ({ tasks, isLoading, title = 'Priority Tasks' }) => {
  const [taskList, setTaskList] = React.useState(tasks || []);

  React.useEffect(() => {
    if (tasks) setTaskList(tasks);
  }, [tasks]);

  const handleToggleStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'Done' ? 'To Do' : 'Done';
    try {
        await apiClient.put(`tasks/${taskId}`, { status: nextStatus });
        setTaskList(prev => prev.map(t => t.id === taskId ? { ...t, status: nextStatus } : t));
        toast.success(`Task marked as ${nextStatus}`, {
            style: { borderRadius: '15px', background: '#0B1120', color: '#fff' }
        });
    } catch (err) {
        // Interceptor handles it
    }
  };

  if (isLoading) return <div className={`col-span-12 lg:col-span-4 min-h-[600px] ${tileClasses} bg-slate-50/50 dark:bg-navy-900/30 border-dashed`}><ListSkeleton /></div>;

  return (
    <div className={`col-span-12 lg:col-span-4 min-h-[600px] ${tileClasses} bg-primary border-dashed`}>
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black text-content-main tracking-tighter uppercase">{title}</h3>
        <span className="bg-primary-muted border border-border text-content-muted text-[10px] font-black px-2.5 py-1 rounded-lg">
            {taskList.length} TOTAL
        </span>
      </div>

      <div className="space-y-4">
        {taskList.slice(0, 5).map((task, idx) => (
          <div 
            key={task.id || idx} 
            onClick={() => handleToggleStatus(task.id, task.status)}
            className="bg-primary-surface p-5 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex justify-between items-center mb-3">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded ${task.priority === 'High' ? 'bg-rose-500' : 'bg-sky-500'} text-white`}>
                {task.priority || 'ROUTINE'}
              </span>
              <span className={`text-[10px] font-bold ${task.status === 'Done' ? 'text-emerald-500' : 'text-content-muted'}`}>
                {task.status || 'Pending'}
              </span>
            </div>
            <h4 className={`text-sm font-bold text-content-main leading-tight group-hover:text-sky-500 transition-colors uppercase tracking-tight ${task.status === 'Done' ? 'line-through opacity-50' : ''}`}>
                {task.title}
            </h4>
            <div className="mt-4 flex justify-between items-center">
                <div className="flex -space-x-2 overflow-hidden">
                    {Array.isArray(task.assigned_to) && task.assigned_to.length > 0 ? (
                        task.assigned_to.map((user, uIdx) => (
                            <div 
                                key={user.id || uIdx}
                                className="w-8 h-8 rounded-full border-2 border-white dark:border-navy-950 bg-sky-500 flex items-center justify-center text-[10px] font-black text-white shadow-sm transition-transform hover:scale-110 hover:z-10 cursor-help"
                                title={user.full_name}
                            >
                                {user.full_name?.charAt(0).toUpperCase() || '?'}
                            </div>
                        ))
                    ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-white dark:border-navy-950 bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm">
                            ?
                        </div>
                    )}
                </div>
                <span className="text-[9px] text-content-muted font-bold italic group-hover:text-sky-500 transition-colors">Toggle Status ➡️</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const QuickActionsRow = ({ onAction, isLoading }) => {
    return (
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            {[
                { title: 'Generate Report', subtitle: 'Monthly Attendance Analytics', icon: <IconFileText className="w-5 h-5 text-sky-500" /> },
                { title: 'Book Conference', subtitle: 'Main Hall / Floor 3', icon: <IconBriefcase className="w-5 h-5 text-sky-500" /> }
            ].map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => onAction && onAction(item.title)}
                  className="bg-primary-surface p-6 rounded-3xl border border-border flex items-center gap-4 hover:border-sky-500/50 transition-all cursor-pointer group shadow-sm"
                >
                    <div className="w-12 h-12 bg-primary-muted rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-sky-500/10 transition-all">
                        {isLoading && item.title === 'Generate Report' ? (
                          <span className="animate-spin border-2 border-sky-500 border-t-transparent rounded-full w-4 h-4"></span>
                        ) : item.icon}
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-content-main tracking-tight leading-none mb-1">{item.title}</h4>
                        <p className="text-[10px] font-medium text-content-muted tracking-tight">{item.subtitle}</p>
                    </div>
                    <IconPlus className="w-4 h-4 text-border group-hover:text-sky-500 rotate-45 transition-all" />
                </div>
            ))}
        </div>
    );
};
// --- HR Specialized Widgets ---
export const HiringPipeline = ({ isLoading }) => (
  <div className={`${tileClasses} bg-gradient-to-br from-primary-surface to-indigo-500/5 col-span-12 lg:col-span-4`}>
    <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-500 mb-6 block">Hiring Pipeline</span>
    <div className="space-y-6 flex-1 flex flex-col justify-center">
      {[
        { role: 'Senior Dev', status: 'Interviewing', progress: 75, color: 'bg-indigo-500' },
        { role: 'Product Lead', status: 'Sourcing', progress: 30, color: 'bg-indigo-300' }
      ].map((job, idx) => (
        <div key={idx} className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-content-main uppercase tracking-tighter">{job.role}</span>
            <span className="text-content-muted lowercase opacity-60 font-medium">{job.status}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className={`${job.color} h-full rounded-full`} style={{ width: `${job.progress}%` }}></div>
          </div>
        </div>
      ))}
    </div>
    <button className="mt-8 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-400 text-left transition-colors">Manage Requisitions 🛰️</button>
  </div>
);

export const PendingLeaveApprovals = ({ isLoading }) => (
  <div className={`${tileClasses} col-span-12 lg:col-span-4`}>
    <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black text-content-main tracking-tighter uppercase">Leave Queue</h3>
        <span className="bg-rose-500/10 text-rose-500 text-[10px] font-black px-2.5 py-1 rounded-lg border border-rose-500/20">4 PENDING</span>
    </div>
    <div className="space-y-4">
      {[
        { name: 'Alice Smith', type: 'Annual', duration: '3 Days', date: 'From Mar 20' },
        { name: 'Bob Johnson', type: 'Sick', duration: '1 Day', date: 'From Mar 19' }
      ].map((leave, idx) => (
        <div key={idx} className="p-4 bg-primary-muted rounded-2xl border border-border flex items-center justify-between group hover:border-rose-500/30 transition-all cursor-pointer">
          <div>
            <p className="text-xs font-black text-content-main uppercase tracking-tighter">{leave.name}</p>
            <p className="text-[9px] font-bold text-content-muted mt-0.5 opacity-60 uppercase">{leave.type} · {leave.duration}</p>
          </div>
          <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">{leave.date}</p>
        </div>
      ))}
    </div>
    <button className="mt-6 w-full py-4 bg-primary-surface border border-border rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all">Open Registry</button>
  </div>
);

export const DailyAttendancePercent = ({ isLoading }) => (
  <div className={`${tileClasses} bg-gradient-to-br from-emerald-500/5 via-primary-surface to-transparent col-span-12 lg:col-span-4`}>
    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500 mb-6 block">Force Presence</span>
    <div className="flex flex-col items-center justify-center flex-1 py-4">
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
          <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset="44" className="text-emerald-500" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black text-content-main tracking-tighter">90%</span>
          <span className="text-[9px] font-bold text-content-muted uppercase tracking-widest -mt-1 opacity-60">Avg. Rate</span>
        </div>
      </div>
      <p className="mt-6 text-[10px] font-bold text-content-muted uppercase tracking-wider text-center max-w-[150px]">
        Team attendance is <span className="text-emerald-500">+2%</span> compared to last week
      </p>
    </div>
  </div>
);

// --- Functional (Eng/Sales) Specialized Widgets ---
export const ProjectVelocity = ({ isLoading }) => (
  <div className={`${tileClasses} bg-gradient-to-br from-primary-surface to-sky-500/5 col-span-12 lg:col-span-4`}>
    <span className="text-[10px] uppercase font-bold tracking-widest text-sky-500 mb-6 block">Sprint Velocity</span>
    <div className="flex flex-col justify-between flex-1">
        <div className="flex items-end gap-3 mb-8">
            <h2 className="text-6xl font-black text-content-main tracking-tighter leading-none">24.5</h2>
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-tight mb-2">Points / Week 📈</span>
        </div>
        <div className="flex gap-1 items-end h-24">
            {[4, 6, 3, 7, 5, 8, 6, 9].map((h, idx) => (
                <div key={idx} className="flex-1 bg-sky-500/20 rounded-t-lg group relative hover:bg-sky-500 transition-all cursor-pointer" style={{ height: `${h * 10}%` }}>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-navy-950 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold">
                        {h} pts
                    </div>
                </div>
            ))}
        </div>
        <p className="mt-6 text-[9px] font-bold text-content-muted uppercase tracking-[0.15em] opacity-60">Target Cycle: Q1-Deployment</p>
    </div>
  </div>
);

export const DepartmentHeatmap = ({ isLoading }) => (
  <div className={`${tileClasses} col-span-12 lg:col-span-4`}>
    <span className="text-[10px] uppercase font-bold tracking-widest text-orange-500 mb-6 block">Resource Heatmap</span>
    <div className="grid grid-cols-4 grid-rows-4 gap-2 flex-1">
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} className={`rounded-xl ${i % 3 === 0 ? 'bg-orange-500/40' : i % 5 === 0 ? 'bg-orange-500/60' : 'bg-orange-500/20'} border border-orange-500/10 hover:border-orange-500/50 transition-all cursor-help relative group`}>
             <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-navy-950 text-white text-[9px] py-2 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-black uppercase tracking-widest whitespace-nowrap z-50 shadow-2xl">
                Zone {i+1}: 85% Load
            </div>
        </div>
      ))}
    </div>
    <div className="flex justify-between items-center mt-6">
        <span className="text-[9px] font-bold text-content-muted uppercase tracking-widest opacity-60">Distribution Map</span>
        <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500/20"></div>
            <div className="w-2 h-2 rounded-full bg-orange-500/40"></div>
            <div className="w-2 h-2 rounded-full bg-orange-500/60"></div>
        </div>
    </div>
  </div>
);
