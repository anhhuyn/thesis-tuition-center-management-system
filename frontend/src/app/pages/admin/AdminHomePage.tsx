import { StatsCards } from '../../components/adminComponents/StatsCards';
import { QuickActions } from '../../components/adminComponents/QuickActions';
import { ChartsSection } from '../../components/adminComponents/ChartsSection';
import { StudentsTable } from '../../components/adminComponents/StudentsTable';
import { PerformanceMetrics } from '../../components/adminComponents/PerformanceMetrics';
import { TeachersList } from '../../components/adminComponents/TeachersList';
import { RecentActivities } from '../../components/adminComponents/RecentActivities';
import { FadeInWhenVisible } from '../../components/motion/FadeInWhenVisible';

export function AdminHomePage() {
  return (
    <main className=" min-h-screen">

      {/* Gradient Header Section */}
      <section className="relative overflow-hidden pb-10">

        {/* Gradient background */}
        <div className="absolute inset-0 bg-[linear-gradient(169deg,rgba(102,126,234,1)_0%,rgba(118,75,162,1)_50%,rgba(240,147,251,1)_100%)]"></div>

        {/* Wave shape */}
        <svg
          className="absolute bottom-[-1px] left-0 w-full"
          viewBox="0 0 1440 320"
        >
          <path
            fill="#f9fafb"
            fillOpacity="1"
            d="M0,192L80,170.7C160,149,320,107,480,117.3C640,128,800,192,960,202.7C1120,213,1280,171,1360,149.3L1440,128L1440,320L0,320Z"
          ></path>
        </svg>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

          <div className="mb-10 text-white">
            <h1 className="text-3xl sm:text-4xl font-bold">
              Dashboard Quản Lý
            </h1>
            <p className="text-white/80 text-sm">
              Chào mừng bạn quay trở lại! Đây là tổng quan về trung tâm học thêm của bạn.
            </p>
          </div>

          <FadeInWhenVisible delay={0.1}>
            <StatsCards />
          </FadeInWhenVisible>

        </div>

      </section>

      {/* Other Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">

        <FadeInWhenVisible delay={0.15}>
          <QuickActions />
        </FadeInWhenVisible>

        <div className="mt-8">
          <FadeInWhenVisible delay={0.2}>
            <ChartsSection />
          </FadeInWhenVisible>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2">
            <FadeInWhenVisible delay={0.25}>
              <StudentsTable />
            </FadeInWhenVisible>
          </div>

          <FadeInWhenVisible delay={0.3}>
            <PerformanceMetrics />
          </FadeInWhenVisible>

        </div>

        <div className="mt-8">
          <FadeInWhenVisible delay={0.35}>
            <TeachersList />
          </FadeInWhenVisible>
        </div>

        <div className="mt-8">
          <FadeInWhenVisible delay={0.4}>
            <RecentActivities />
          </FadeInWhenVisible>
        </div>

      </div>

    </main>
  );
}