import { motion } from "framer-motion";
import {
  Info,
  Users,
  Calendar,
  FileText,
  CheckSquare,
  BarChart3,
} from "lucide-react";
import type { Subject } from "../../../../utils/types/subject";

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
    { id: 0, label: "Thông tin chi tiết", icon: <Info size={16} /> },
    {
      id: 1,
      label: "Học sinh",
      icon: <Users size={16} />,
      count: subject?.currentStudents ?? 0,
    },
    { id: 2, label: "Lịch học", icon: <Calendar size={16} /> },
    { id: 3, label: "Tài liệu", icon: <FileText size={16} /> },
    { id: 4, label: "Điểm danh", icon: <CheckSquare size={16} /> },
    { id: 5, label: "Báo cáo", icon: <BarChart3 size={16} /> },
  ];

  return (
    <div className="border-b border-slate-200/60">
      <nav
        className="flex items-center gap-1 overflow-x-auto scrollbar-hide"
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={isActive}
              className={cn(
                "relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "text-violet-600"
                  : "text-slate-400 hover:text-slate-600"
              )}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Icon */}
              <motion.span
                animate={isActive ? { scale: 1.05 } : { scale: 1 }}
              >
                {tab.icon}
              </motion.span>

              {/* Label */}
              <span className="hidden sm:inline">{tab.label}</span>

              {/* Count */}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-[10px] font-semibold rounded-full",
                    isActive
                      ? "bg-violet-100 text-violet-600"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {tab.count}
                </span>
              )}

              {/* Underline chỉ khi active */}
              {isActive && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-violet-500 rounded-full"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
};

// Helper
const cn = (...classes: (string | false | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};