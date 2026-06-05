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
    <main className="min-h-screen">

      {/* Gradient Header Section */}
      <section className="relative overflow-hidden pb-6">

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

          <div className="mb-6 text-slate-900">
            <h1 className="text-3xl sm:text-4xl font-bold">
              Dashboard Quản Lý
            </h1>
            <p className="text-slate/80 text-sm">
              Chào mừng bạn quay trở lại! Đây là tổng quan về trung tâm học thêm của bạn.
            </p>
          </div>

          <FadeInWhenVisible delay={0.1}>
            <StatsCards />
          </FadeInWhenVisible>

        </div>

      </section>

      {/* Other Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">

        <FadeInWhenVisible delay={0.15}>
          <QuickActions />
        </FadeInWhenVisible>

        <div className="mt-6">
          <FadeInWhenVisible delay={0.2}>
            <ChartsSection />
          </FadeInWhenVisible>
        </div>

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