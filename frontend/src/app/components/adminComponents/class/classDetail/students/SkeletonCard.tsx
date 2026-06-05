// SkeletonCard.tsx
export const SkeletonCard = () => (
  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-slate-200" />
      <div className="space-y-2">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="h-3 w-48 bg-slate-100 rounded" />
      </div>
    </div>
    <div className="flex gap-1">
      <div className="w-7 h-7 rounded-lg bg-slate-200" />
      <div className="w-7 h-7 rounded-lg bg-slate-200" />
      <div className="w-7 h-7 rounded-lg bg-slate-200" />
    </div>
  </div>
);