// src/components/class/curriculum/StatsCard.tsx
import {  Search,
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
  searchTerm,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: StatsCardProps) => (
    <div className="px-4 bg-slate-50/50 border-t border-slate-100">
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
);