import React from 'react';

const tileClasses = "bg-white dark:bg-navy-950/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm transition-all duration-300 flex flex-col";

export const StatsWidget = ({ stats, isLoading }) => {
  const items = [
    { label: 'Total Employees', value: '1,248', trend: '+4%', trendColor: 'text-emerald-500' },
    { label: 'Active Tasks', value: '342', trend: '86%', trendColor: 'text-sky-500' },
    { label: 'Pending Leaves', value: '12', trend: 'Critical', trendColor: 'text-rose-500' },
  ];

  return (
    <div className={`col-span-12 lg:col-span-8 ${tileClasses}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col border-r border-slate-100 dark:border-slate-800 last:border-0 pr-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">{item.label}</span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{item.value}</span>
              <span className={`text-xs font-bold ${item.trendColor}`}>{item.trend}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const WeeklyPresence = ({ isLoading }) => {
  return (
    <div className={`col-span-12 lg:col-span-8 min-h-[400px] ${tileClasses}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">Weekly Presence</h3>
          <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-tight">Average check-in density per department</p>
        </div>
        <div className="flex gap-4">
           {['Low', 'Med', 'High'].map(l => (
             <div key={l} className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${l === 'Low' ? 'bg-slate-300' : l === 'Med' ? 'bg-sky-400' : 'bg-sky-600'}`}></div>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{l}</span>
             </div>
           ))}
        </div>
      </div>
      
      {/* Mock Graph Area */}
      <div className="flex-1 bg-slate-50 dark:bg-navy-950/60 rounded-3xl overflow-hidden relative">
         <div className="absolute inset-0 bg-gradient-to-t from-sky-500/5 to-transparent"></div>
         {/* Placeholder for complex SVG or chart */}
         <div className="absolute inset-x-8 bottom-8 top-16 flex items-end justify-between gap-1">
            {[20, 45, 30, 80, 50, 90, 40, 60, 35, 75, 40, 25].map((h, i) => (
               <div key={i} className="flex-1 bg-sky-500/20 dark:bg-sky-500/20 rounded-t-lg relative group transition-all" style={{ height: `${h}%` }}>
                  <div className="absolute inset-x-0 bottom-0 bg-sky-500 dark:bg-sky-500 rounded-t-lg opacity-40 group-hover:opacity-100 transition-opacity" style={{ height: '30%' }}></div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export const PriorityTasks = ({ tasks, isLoading }) => {
  const items = [
    { type: 'URGENT', title: 'Onboard New Engineering Director', time: '2h ago', color: 'bg-rose-500', text: 'text-rose-500' },
    { type: 'PROJECT', title: 'Review Q3 Office Budget Draft', time: '5h ago', color: 'bg-sky-500', text: 'text-sky-500' },
    { type: 'ROUTINE', title: 'Weekly Maintenance Check', time: '8h ago', color: 'bg-slate-500', text: 'text-slate-500' },
  ];

  return (
    <div className={`col-span-12 lg:col-span-4 min-h-[600px] ${tileClasses} bg-slate-50/50 dark:bg-navy-900/30 border-dashed`}>
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Priority Tasks</h3>
        <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black px-2.5 py-1 rounded-lg">8 NEW</span>
      </div>

      <div className="space-y-4">
        {items.map((task, idx) => (
          <div key={idx} className="bg-white dark:bg-navy-950 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex justify-between items-center mb-3">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded ${task.color} text-white`}>{task.type}</span>
              <span className="text-[10px] font-medium text-slate-400">{task.time}</span>
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight group-hover:text-sky-500 transition-colors uppercase tracking-tight">{task.title}</h4>
            <div className="mt-4 flex -space-x-2">
               {[1, 2].map(i => (
                 <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-navy-950 bg-slate-300 overflow-hidden">
                    <span className="text-[8px] flex items-center justify-center h-full">👤</span>
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const QuickActionsRow = () => {
    return (
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            {[
                { title: 'Generate Report', subtitle: 'Q2 Financial Performance', icon: '📄' },
                { title: 'Book Conference', subtitle: 'Main Hall / Floor 3', icon: '🏢' }
            ].map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-navy-950/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-sky-500/50 transition-all cursor-pointer group">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:bg-sky-500/10 transition-all">
                        {item.icon}
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold dark:text-white tracking-tight leading-none mb-1">{item.title}</h4>
                        <p className="text-[10px] font-medium text-slate-400 tracking-tight">{item.subtitle}</p>
                    </div>
                    <span className="text-slate-300 dark:text-slate-600 group-hover:text-sky-500 transition-colors italic">➡️</span>
                </div>
            ))}
        </div>
    );
};

