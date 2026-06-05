// StudentDetailTabs.tsx
import { cn } from "../../../../../utils/cn";
import { User, BookOpen, Calendar as CalendarIcon, Award, ClipboardCheck } from "lucide-react";

type Tab = "overview" | "academic" | "attendance" | "scores" | "feedback";

const tabs = [
  { id: "overview" as Tab, label: "Tổng quan", icon: <User size={13} /> },
  { id: "academic" as Tab, label: "Học tập", icon: <BookOpen size={13} /> },
  { id: "attendance" as Tab, label: "Chuyên cần", icon: <CalendarIcon size={13} /> },
  { id: "scores" as Tab, label: "Điểm số", icon: <Award size={13} /> },
  { id: "feedback" as Tab, label: "Đánh giá", icon: <ClipboardCheck size={13} /> },
];

type StudentDetailTabsProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

export const StudentDetailTabs = ({ activeTab, onTabChange }: StudentDetailTabsProps) => (
  <div className="flex gap-0.5 p-2 bg-slate-50/50 border-b border-slate-100">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={cn(
          "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
          activeTab === tab.id
            ? "bg-white text-violet-600 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        )}
      >
        {tab.icon}
        <span className="hidden lg:inline">{tab.label}</span>
      </button>
    ))}
  </div>
);