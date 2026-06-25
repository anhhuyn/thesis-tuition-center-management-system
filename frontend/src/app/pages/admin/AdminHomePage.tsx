import { useState, useEffect } from "react";
import { Sparkles, Clock, TrendingUp, Search, Plus } from "lucide-react";
import { StatsCards } from '../../components/adminComponents/StatsCards';
import { QuickActions } from '../../components/adminComponents/QuickActions';
import { ChartsSection } from '../../components/adminComponents/ChartsSection';
import { StudentsTable } from '../../components/adminComponents/StudentsTable';
import { PerformanceMetrics } from '../../components/adminComponents/PerformanceMetrics';
import { TeachersList } from '../../components/adminComponents/TeachersList';
import { RecentActivities } from '../../components/adminComponents/RecentActivities';
import { FadeInWhenVisible } from '../../components/motion/FadeInWhenVisible';

export function AdminHomePage() {
  const [searchValue, setSearchValue] = useState("");
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");

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

  return (
    <main className="min-h-screen">
      {/* Header Section với gradient và viền lượn sóng phía sau */}
      <section className="relative overflow-visible pb-6 bg-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-200 via-indigo-300 to-cyan-200 opacity-30"></div>
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-sky-300 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

        {/* SVG Waves - Đặt phía sau với z-index thấp */}
        <div className="absolute bottom-0 left-0 w-full pointer-events-none z-0">
          <svg
            className="relative w-full h-auto"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 250"
            preserveAspectRatio="none"
          >
            <path
              fill="#f3f5f7"
              fillOpacity="0.9"
              d="M0,256L48,240C96,224,192,192,288,186.7C384,181,480,203,576,208C672,213,768,203,864,186.7C960,171,1056,149,1152,138.7C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>

        {/* Content - Đặt phía trên với z-index cao hơn */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 z-10">
          <div className="relative overflow-hidden">
            <div className="relative px-6 py-6 lg:px-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5">
                      <Sparkles size={14} className="text-indigo-500" />
                      <span className="text-indigo-500 text-xs font-medium">Quản trị viên</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full">
                      <Clock size={14} className="text-gray-500" />
                      <span className="text-gray-600 text-sm">{currentTime}</span>
                    </div>
                  </div>

                  <div>
                    <h1 className="text-gray-900 text-3xl lg:text-4xl font-bold tracking-tight">
                      {greeting}, <span className="bg-clip-text text-transparent gradient-text">Quản trị viên!</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                      <span>Chào mừng bạn quay trở lại</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="flex items-center gap-1">
                        <TrendingUp size={14} className="text-blue-500" />
                        Đây là tổng quan về trung tâm học thêm của bạn
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <FadeInWhenVisible delay={0.1}>
            <StatsCards />
          </FadeInWhenVisible>
        </div>
      </section>

      {/* Other Sections - đã có nền #f3f5f7 từ main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <FadeInWhenVisible delay={0.15}>
          <QuickActions />
        </FadeInWhenVisible>

        {/*
<div className="mt-6">
  <FadeInWhenVisible delay={0.2}>
    <ChartsSection />
  </FadeInWhenVisible>
</div>
*/}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FadeInWhenVisible delay={0.25}>
              <StudentsTable />
            </FadeInWhenVisible>
          </div>

          <FadeInWhenVisible delay={0.3}>
            <PerformanceMetrics />
          </FadeInWhenVisible>
        </div>

        <div className="mt-6">
          <FadeInWhenVisible delay={0.35}>
            <TeachersList />
          </FadeInWhenVisible>
        </div>

        <div className="mt-6">
          <FadeInWhenVisible delay={0.4}>
            <RecentActivities />
          </FadeInWhenVisible>
        </div>
      </div>
    </main>
  );
}