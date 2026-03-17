import React from 'react';

const tileClasses = "bg-primary-surface backdrop-blur-md border border-border rounded-[2.5rem] p-8 shadow-sm transition-all duration-300 flex flex-col";

/**
 * WeeklyPresence: A visual grid showing check-in density per department
 */
const WeeklyPresence = ({ isLoading }) => {
  const departments = ['Engineering', 'Product', 'Design', 'Sales', 'HR'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getDensityColor = (val) => {
    if (val < 30) return 'bg-slate-200 dark:bg-slate-800/50';
    if (val < 70) return 'bg-sky-300 dark:bg-sky-500/40';
    return 'bg-sky-600 dark:bg-sky-500';
  };

  return (
    <div className={`col-span-12 lg:col-span-8 min-h-[400px] ${tileClasses}`}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-lg font-bold text-content-main tracking-tight leading-none uppercase italic">Weekly Presence</h3>
          <p className="text-xs text-content-muted font-medium mt-1 uppercase tracking-tight">Active Check-in Density</p>
        </div>
        <div className="flex gap-4">
           {['Low', 'Med', 'High'].map(l => (
             <div key={l} className="flex items-center gap-2">
               <div className={`w-3 h-3 rounded ${l === 'Low' ? 'bg-slate-200' : l === 'Med' ? 'bg-sky-300' : 'bg-sky-600'}`}></div>
               <span className="text-[10px] font-bold text-content-muted uppercase tracking-tighter">{l}</span>
             </div>
           ))}
        </div>
      </div>
      
      <div className="grid grid-cols-8 gap-3">
        {/* Header Row */}
        <div className="col-span-1"></div>
        {days.map(day => (
          <div key={day} className="text-center text-[10px] font-black text-content-muted uppercase">{day}</div>
        ))}

        {/* Department Rows */}
        {departments.map(dept => (
          <React.Fragment key={dept}>
            <div className="col-span-1 flex items-center">
              <span className="text-[10px] font-bold text-content-main truncate uppercase tracking-tighter">{dept}</span>
            </div>
            {days.map((_, i) => {
              const val = Math.random() * 100;
              return (
                <div 
                  key={i} 
                  className={`h-12 rounded-xl transition-all hover:scale-105 cursor-pointer border border-white/5 ${getDensityColor(val)}`}
                  title={`${dept}: ${Math.floor(val)}% density`}
                ></div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default WeeklyPresence;
