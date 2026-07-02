// TabNavigationSection.tsx (Căn giữa cả thanh tab)
import { motion } from "framer-motion";
import {
  Info,
  Users,
  Calendar,
  FileText,
  CheckSquare,
  BookOpen,
} from "lucide-react";
import type { Subject } from "../../../../utils/types/subject";
import { cn } from "../../../ui/utils";

type Tab = {
  id: number;
  label: string;
  icon: React.ReactNode;
  count?: number;
};

type TabNavigationSectionProps = {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  subject: Subject | null;
};

export const TabNavigationSection = ({
  activeTab,
  setActiveTab,
  subject,
}: TabNavigationSectionProps) => {
  const tabs: Tab[] = [
    { id: 0, label: "Tổng quan", icon: <Info size={18} /> },
    {
      id: 1,
      label: "Học sinh",
      icon: <Users size={18} />,
      count: subject?.currentStudents ?? 0,
    },
    { id: 2, label: "Lộ trình", icon: <BookOpen size={18} /> },
    { id: 3, label: "Lịch học", icon: <Calendar size={18} /> },
    { id: 4, label: "Tài liệu", icon: <FileText size={18} /> },
    { id: 5, label: "Điểm danh", icon: <CheckSquare size={18} /> },
  ];

  return (
    <div className="w-full border-b border-slate-200">
      <div className="flex items-center justify-center gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-6 py-2.5 transition-all duration-200",
                "text-sm font-medium whitespace-nowrap",
                isActive
                  ? "text-indigo-600"
                  : "text-slate-500 hover:text-slate-700"
              )}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Icon */}
              <span className={cn(
                "transition-all duration-200",
                isActive && "text-indigo-600"
              )}>
                {tab.icon}
              </span>

              {/* Label */}
              <span>{tab.label}</span>

              {/* Count badge */}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-xs font-semibold rounded-md transition-all",
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {tab.count}
                </span>
              )}

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};