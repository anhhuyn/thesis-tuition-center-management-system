import { useState, useEffect } from "react";
import {
  Layers,
  PlayCircle,
  Inbox,
  CalendarX,
  Search,
  Plus,
  Loader2,
  TrendingUp,
  Users,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Shield,
} from "lucide-react";
import type { SubjectResponse } from "../../../utils/types/subject";
import { subjectApi } from "../../../utils/api";

export const DashboardSummarySection = ({ onAdd }: { onAdd: () => void }) => {
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [stats, setStats] = useState({
    all: 0,
    active: 0,
    upcoming: 0,
    nearFull: 0,
  });

  const getGreetingByTime = () => {
    const now = new Date();
    const vietnamTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    const hour = vietnamTime.getHours();

    if (hour >= 5 && hour < 10) return "Chào buổi sáng";
    if (hour >= 10 && hour < 12) return "Chào buổi trưa";
    if (hour >= 12 && hour < 14) return "Chào buổi chiều";
    if (hour >= 14 && hour < 18) return "Chào buổi chiều tốt lành";
    if (hour >= 18 && hour < 22) return "Chào buổi tối";
    return "Chào buổi đêm";
  };

  const getCurrentVietnamTime = () => {
    const now = new Date();
    const vietnamTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    return vietnamTime.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const updateGreetingAndTime = () => {
      setGreeting(getGreetingByTime());
      setCurrentTime(getCurrentVietnamTime());
    };

    updateGreetingAndTime();
    const interval = setInterval(updateGreetingAndTime, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res: SubjectResponse = await subjectApi.getAll(1, 100);

        if (res.success) {
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

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Header Section - Glassmorphism Style */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-indigo-50 to-white backdrop-blur-xl rounded-3xl shadow-sm border border-white/50">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200 via-indigo-200 to-transparent rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-200 via-pink-100 to-transparent rounded-full blur-3xl -ml-40 -mb-40"></div>

        <div className="relative px-6 py-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-sm">
                  <Sparkles size={14} className="text-indigo-600" />
                  <span className="text-indigo-600 text-xs font-medium">Quản trị viên</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full">
                  <Clock size={14} className="text-gray-500" />
                  <span className="text-gray-600 text-sm">{currentTime}</span>
                </div>
              </div>

              <div>
                <h1 className="text-gray-900 text-3xl lg:text-4xl font-bold tracking-tight">
                  {greeting}, <span className="gradient-text bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Quản trị viên!</span>
                </h1>
                <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                  <span>Chào mừng bạn quay trở lại</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="flex items-center gap-1">
                    <TrendingUp size={14} className="text-blue-500" />
                    Hôm nay có {stats.active} lớp đang hoạt động
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Tìm kiếm lớp học..."
                  className="peer w-80 pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl text-sm text-gray-700 outline-none border border-gray-200 focus:ring-1 focus:ring-indigo-300 transition-all placeholder:text-gray-400"
                />

                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors peer-focus:text-indigo-300"
                />
              </div>
              <button
                onClick={onAdd}
                className="group relative flex items-center gap-2 px-5 py-2.5 btn-gradient rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Plus size={18} className="text-white group-hover:rotate-90 transition-transform duration-300" />
                <span >
                  Thêm lớp mới
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats & Insights - Cân bằng chiều cao */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Section - Tổng quan nhanh */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-violet-500" />
              <h3 className="font-semibold text-gray-900">Tổng quan nhanh</h3>
            </div>
            <button className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1 group">
              <span>Xem chi tiết</span>
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">{stats.all}</p>
              <p className="text-xs text-gray-500 mt-0.5">Tổng số lớp học</p>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-xs text-gray-500 mt-0.5">Lớp đang hoạt động</p>
            </div>
          </div>
        </div>

        {/* Right Section - Trạng thái hệ thống */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-5 shadow-md border border-white/50 flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Trạng thái hệ thống</span>
          </div>

          <p className="text-gray-900 font-bold text-base mb-1.5">Hoạt động ổn định</p>
          <p className="text-sm text-gray-600 leading-relaxed mb-2.5">
            Tất cả các dịch vụ đang hoạt động bình thường.
          </p>

          <div className="mb-2.5">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Hiệu suất hệ thống</span>
              <span className="font-medium text-green-600">98%</span>
            </div>
            <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-[98%]"></div>
            </div>
          </div>

          <button className="w-full mt-auto px-4 py-2 bg-white/80 hover:bg-white rounded-xl text-sm font-medium text-gray-700 transition-all flex items-center justify-center gap-2 group">
            <Shield size={14} />
            <span>Kiểm tra bảo mật</span>
          </button>
        </div>
      </div>
    </div>
  );
};