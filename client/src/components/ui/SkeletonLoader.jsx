import React from 'react';

export default function SkeletonLoader({ type = 'card', count = 3 }) {
  const renderSkeleton = () => {
    if (type === 'list') {
      return (
        <div className="border border-border p-4 rounded-xl bg-white flex justify-between items-center gap-4 animate-pulse">
          <div className="space-y-2 flex-1">
            <div className="h-3.5 bg-slate-200 rounded w-1/3" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
          <div className="w-16 h-8 bg-slate-200 rounded-lg" />
        </div>
      );
    }

    if (type === 'metrics') {
      return (
        <div className="bg-white border border-border p-5 rounded-2xl shadow-premium-sm animate-pulse space-y-3">
          <div className="h-3 bg-slate-200 rounded w-1/3" />
          <div className="h-6 bg-slate-200 rounded w-1/2" />
          <div className="h-2.5 bg-slate-100 rounded w-2/3" />
        </div>
      );
    }

    // Default card skeleton
    return (
      <div className="border border-border p-5 rounded-2xl bg-white shadow-premium-sm space-y-4 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-5 bg-slate-200 rounded w-1/2" />
          </div>
          <div className="w-10 h-10 bg-slate-200 rounded-lg" />
        </div>
        
        <div className="space-y-2 pt-2">
          <div className="h-3.5 bg-slate-100 rounded w-full" />
          <div className="h-3.5 bg-slate-100 rounded w-5/6" />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <div className="h-3.5 bg-slate-200 rounded w-1/4" />
          <div className="w-20 h-7 bg-slate-200 rounded-lg" />
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <React.Fragment key={idx}>{renderSkeleton()}</React.Fragment>
      ))}
    </div>
  );
}
