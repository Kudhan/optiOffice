import React from 'react';

export const CardSkeleton = () => (
    <div className="bg-white dark:bg-navy-950/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
    </div>
);

export const ListSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-navy-900/50 rounded-3xl border border-slate-200 dark:border-slate-800"></div>
        ))}
    </div>
);
