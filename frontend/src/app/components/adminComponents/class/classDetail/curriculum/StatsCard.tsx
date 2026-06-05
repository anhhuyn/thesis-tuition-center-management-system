// src/components/class/curriculum/StatsCard.tsx
import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  CheckCircle,
  Hourglass,
  Clock,
  Circle,
  RefreshCw,
  Search,
  X,
  List,
  Grid3x3,
} from "lucide-react";
import { cn } from "../../../../../utils/cn";
import type { ViewMode } from "./types";

interface Stats {
  totalSessions: number;
  completedSessions: number;
  remainingSessions: number;
  totalHours: number;
  overallProgress: number;
}

interface StatsCardProps {
  stats: Stats;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const StatsCard = ({
  stats,
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onRefresh,
  isRefreshing,
}: StatsCardProps) => (
  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
    <div className="p-5 border-b border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-indigo-500" />
          <h2 className="text-base font-semibold text-slate-700">
            Tổng quan tiến độ
          </h2>
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors rounded-lg hover:bg-slate-100 disabled:opacity-50"
          title="Làm mới"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CalendarDays size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800">
              {stats.totalSessions}
            </p>
            <p className="text-xs text-slate-500">Tổng buổi học</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={18} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800">
              {stats.completedSessions}
            </p>
            <p className="text-xs text-slate-500">Đã hoàn thành</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Hourglass size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800">
              {stats.remainingSessions}
            </p>
            <p className="text-xs text-slate-500">Còn lại</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Clock size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800">
              {stats.totalHours}
            </p>
            <p className="text-xs text-slate-500">Tổng giờ học</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-slate-700">
            Tiến độ học tập
          </span>
          <span className="font-bold text-indigo-600">
            {Math.round(stats.overallProgress)}%
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.overallProgress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle size={14} className="text-emerald-500" />
            <span>Đã học: {stats.completedSessions} buổi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Circle size={14} className="text-slate-400" />
            <span>Chưa học: {stats.remainingSessions} buổi</span>
          </div>
        </div>
      </div>
    </div>

    {/* Search and Filters */}
    <div className="p-4 bg-slate-50/50 border-t border-slate-100">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm lộ trình..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X size={14} className="text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white rounded-xl p-0.5 border border-slate-200">
            <button
              onClick={() => onViewModeChange("list")}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                viewMode === "list"
                  ? "bg-slate-100 text-indigo-600"
                  : "text-slate-500"
              )}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                viewMode === "grid"
                  ? "bg-slate-100 text-indigo-600"
                  : "text-slate-500"
              )}
            >
              <Grid3x3 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);