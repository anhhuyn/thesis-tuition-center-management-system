// InfoCard.tsx
type InfoCardProps = {
  label: string;
  value: string;
  icon?: any;
};

export const InfoCard = ({ label, value, icon: Icon }: InfoCardProps) => (
  <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50/50 border border-slate-100">
    {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />}
    <div className="flex flex-col gap-0">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-xs font-medium text-slate-700">{value || "—"}</span>
    </div>
  </div>
);