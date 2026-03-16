import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  StatsWidget, 
  WeeklyPresence, 
  PriorityTasks,
  QuickActionsRow
} from './Widgets';

function Dashboard() {
  const { user, data } = useOutletContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (data) setIsLoading(false);
  }, [data]);

  const firstName = user?.sub?.split(' ')[0] || 'User';

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
             <button className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 dark:text-white font-bold py-4 px-8 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm shadow-sm group">
                <span className="text-lg group-hover:scale-110 transition-transform">👤+</span>
                Invite User
             </button>
             <button className="flex items-center gap-3 bg-sky-500 hover:brightness-110 active:scale-95 text-white font-black py-4 px-10 rounded-2xl transition-all text-sm shadow-xl shadow-sky-500/20 group">
                <span className="text-lg animate-pulse">⏰</span>
                Clock In
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
    </div>
  );
}

export default Dashboard;
