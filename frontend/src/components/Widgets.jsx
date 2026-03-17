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
    { label: 'Total Employees', value: stats?.total_employees || '1,248', trend: '+4%', trendColor: 'text-emerald-500' },
    { label: 'Active Tasks', value: stats?.active_tasks || '342', trend: '86%', trendColor: 'text-sky-500' },
    { label: 'Pending Leaves', value: stats?.pending_leaves || '12', trend: 'Critical', trendColor: 'text-rose-500' },
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
 * FloorDynamics: Admin Bento card showing office occupancy
 */
export const FloorDynamics = ({ isLoading }) => {
  const [data, setData] = useState({ present: 42, absent: 8 });

  useEffect(() => {
    const fetchDynamics = async () => {
      try {
        const res = await apiClient.get('attendance/daily-status');
        setData({
          present: res.data.length,
          absent: Math.max(0, 50 - res.data.length) // Mocking 50 total for now
        });
      } catch (err) {
        console.error("Dynamics fetch failed", err);
      }
    };
    fetchDynamics();
  }, []);

  return (
    <div className={`col-span-12 lg:col-span-4 ${tileClasses} bg-gradient-to-br from-primary-surface to-sky-500/5`}>
      <span className="text-[10px] uppercase font-bold tracking-widest text-sky-500 mb-6 block">Floor Dynamics</span>
      
      <div className="flex flex-col flex-1 justify-center">
        <div className="mb-8">
          <h2 className="text-6xl font-black text-content-main tracking-tighter leading-none">{data.present}</h2>
          <p className="text-sm font-bold text-content-muted uppercase tracking-tight mt-2">Currently In Office</p>
        </div>

        <div className="space-y-4">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-sky-500 h-full rounded-full transition-all duration-700" 
              style={{ width: `${(data.present/50)*100}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <span className="text-sky-500">{data.present} Present</span>
            <span className="text-content-muted">{data.absent} Away / Leave</span>
          </div>
        </div>
      </div>

      <button className="mt-10 py-4 px-6 bg-primary-muted border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-500/10 hover:text-sky-500 transition-all">
        View Floor Map
      </button>
    </div>
  );
};

export const PriorityTasks = ({ tasks, isLoading, title = 'Priority Tasks' }) => {
  const [taskList, setTaskList] = React.useState(tasks || []);

  React.useEffect(() => {
    if (tasks) setTaskList(tasks);
  }, [tasks]);

  const handleToggleStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
        await apiClient.put(`tasks/${taskId}`, { status: nextStatus });
        setTaskList(prev => prev.map(t => t._id === taskId ? { ...t, status: nextStatus } : t));
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
            key={task._id || idx} 
            onClick={() => handleToggleStatus(task._id, task.status)}
            className="bg-primary-surface p-5 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex justify-between items-center mb-3">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded ${task.priority === 'High' ? 'bg-rose-500' : 'bg-sky-500'} text-white`}>
                {task.priority || 'ROUTINE'}
              </span>
              <span className={`text-[10px] font-bold ${task.status === 'Completed' ? 'text-emerald-500' : 'text-content-muted'}`}>
                {task.status || 'Pending'}
              </span>
            </div>
            <h4 className={`text-sm font-bold text-content-main leading-tight group-hover:text-sky-500 transition-colors uppercase tracking-tight ${task.status === 'Completed' ? 'line-through opacity-50' : ''}`}>
                {task.title}
            </h4>
            <div className="mt-4 flex justify-between items-center">
                <div className="flex -space-x-2">
                    {[1, 2].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-navy-950 bg-slate-300 overflow-hidden">
                            <span className="text-[8px] flex items-center justify-center h-full">👤</span>
                        </div>
                    ))}
                </div>
                <span className="text-[9px] text-slate-400 italic">Toggle Status ➡️</span>
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
