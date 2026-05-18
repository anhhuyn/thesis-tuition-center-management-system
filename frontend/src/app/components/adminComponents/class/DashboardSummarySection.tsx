import { useState, useEffect } from "react";
import {
  Layers,
  PlayCircle,
  Inbox,
  CalendarX,
  Search,
  Plus,
  Loader2,
} from "lucide-react";
import type { SubjectResponse } from "../../../utils/types/subject";
import { subjectApi } from "../../../utils/api";

export const DashboardSummarySection = ({ onAdd }: { onAdd: () => void }) => {
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    all: 0,
    active: 0,
    upcoming: 0,
    nearFull: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res: SubjectResponse = await subjectApi.getAll(1, 100);

        if (res.success) {
          // Tính toán lớp gần đầy (80% - 99%)
          const nearFullCount = res.data.filter((s) => {
            const ratio = s.currentStudents / s.maxStudents;
            return ratio >= 0.8 && ratio < 1;
          }).length;

          setStats({
            all: res.stats.all,
            active: res.stats.active,
            upcoming: res.stats.upcoming,
            nearFull: nearFullCount,
          });
        }
      } catch (error) {
        console.error("Lỗi fetch dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const summaryCards = [
    { label: "Tổng số lớp", value: stats.all, icon: Layers, bgColor: "bg-purple-50", iconColor: "text-purple-600" },
    { label: "Đang học", value: stats.active, icon: PlayCircle, bgColor: "bg-teal-50", iconColor: "text-teal-600" },
    { label: "Sắp khai giảng", value: stats.upcoming, icon: Inbox, bgColor: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "Gần đầy", value: stats.nearFull, icon: CalendarX, bgColor: "bg-amber-50", iconColor: "text-amber-600" },
  ];

  return (
    <div className="w-full flex flex-col">
      <header className="flex flex-col w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col">
            <h1 className="text-white text-3xl lg:text-4xl font-bold">Quản lý Lớp học</h1>
            <p className="text-white/80 text-sm mt-1">Chào buổi sáng, Quản trị viên!</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Tìm kiếm lớp học..."
                className="w-72 pl-10 pr-4 py-2.5 bg-white rounded-xl text-sm text-gray-700 outline-none border border-gray-200 focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 rounded-xl text-white text-sm font-semibold shadow-sm hover:bg-violet-700 transition">
              <Plus size={16} /> Thêm lớp mới
            </button>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-6 w-full">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <article key={index} className="flex flex-col p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 relative">
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <h3 className="text-gray-500 font-semi    bold text-[11px] uppercase tracking-wider">{card.label}</h3>
                  <p className="font-bold text-2xl lg:text-3xl text-gray-900 mt-1">
                    {loading ? <span className="animate-pulse">...</span> : card.value}
                  </p>
                </div>
                <div className={`flex w-11 h-11 items-center justify-center ${card.bgColor} rounded-xl`}>
                  {loading ? (
                    <Loader2 size={18} className="animate-spin text-slate-300" />
                  ) : (
                    <Icon size={20} className={card.iconColor} />
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};