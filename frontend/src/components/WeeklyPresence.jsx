import React from 'react';

const tileClasses = "bg-primary-surface backdrop-blur-md border border-border rounded-[2.5rem] p-8 shadow-sm transition-all duration-300 flex flex-col";

/**
 * WeeklyPresence: A visual grid showing check-in density per department
 */
const WeeklyPresence = ({ isLoading }) => {
  const departments = ['Engineering', 'Product', 'Design', 'Sales', 'HR'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getDensityColor = (val) => {
    if (val < 20) return 'bg-slate-200 dark:bg-slate-800/30';
    if (val < 50) return 'bg-sky-200 dark:bg-sky-500/20';
    if (val < 80) return 'bg-sky-400 dark:bg-sky-500/60';
    return 'bg-sky-600 dark:bg-sky-500';
  };

  // Mocking realistic density per department for the week
  const getDeptValue = (dept, dayIdx) => {
    // Weekend logic
    if (dayIdx > 4) return Math.random() * 15;
    // Weekday logic based on department "vibe"
    if (dept === 'Engineering') return 70 + Math.random() * 30;
    if (dept === 'Sales') return 40 + Math.random() * 50;
    return 30 + Math.random() * 40;
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
              const val = getDeptValue(dept, i);
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
