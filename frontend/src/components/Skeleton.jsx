import React from 'react';

export const CardSkeleton = () => (
    <div className="bg-primary-surface border border-border rounded-[2.5rem] p-8 animate-pulse">
        <div className="h-4 bg-primary-muted rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-primary rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-primary-muted rounded w-full"></div>
    </div>
);

export const ListSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-primary-surface rounded-3xl border border-border"></div>
        ))}
    </div>
);
