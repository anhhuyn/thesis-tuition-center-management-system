// src/app/pages/admin/TuitionPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { RefreshCw, Sparkles, Clock, TrendingUp, Plus } from 'lucide-react';
import { ProtectedRoute } from '../../routes/ProtectedRoute';
import TuitionHeader from '../../components/adminComponents/tuition/TuitionHeader';
import TuitionKPISection from '../../components/adminComponents/tuition/TuitionKPISection';
import TuitionToolbar from '../../components/adminComponents/tuition/TuitionToolbar';
import AIInsightCard from '../../components/adminComponents/tuition/AIInsightCard';
import TuitionTable from '../../components/adminComponents/tuition/TuitionTable';
import type { TuitionCalculationDTO, TuitionStats, TopDebtStudent, TuitionFilterParams } from '../../utils/types/tuition';
import { tuitionApi } from '../../utils/api/tuition.api';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const TuitionPageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      {/* Header Skeleton */}
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-3.5 w-80 bg-gray-200 rounded-lg mt-1.5 animate-pulse" />
      </div>
      
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-lg bg-white border border-gray-100 shadow-sm p-4">
            <div className="h-3.5 w-20 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-6 w-28 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
      
      {/* AI Insight Skeleton */}
      <div className="rounded-lg bg-white border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-6 w-6 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-1.5 w-full bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Toolbar Skeleton */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-8 w-28 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-8 w-28 bg-gray-200 rounded-lg animate-pulse" />
      </div>
      
      {/* Table Skeleton */}
      <div className="rounded-lg bg-white border border-gray-100 shadow-sm p-4 min-h-[400px]">
        <div className="space-y-2.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const TuitionPage: React.FC = () => {
  const { setAlert } = useOutletContext<any>();
  const [invoices, setInvoices] = useState<TuitionCalculationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [stats, setStats] = useState<TuitionStats>({
    totalInvoices: 0,
    paidCount: 0,
    paidPercentage: 0,
    pendingCount: 0,
    pendingPercentage: 0,
    totalRevenue: 0,
    revenueGrowth: 0,
    debtRecoveryRate: 0,
    riskLevel: 'LOW',
    overdueCount: 0,
    totalDebtors: 0,
    totalDebtAmount: 0
  });
  const [topDebtors, setTopDebtors] = useState<TopDebtStudent[]>([]);
  const [forecastRevenue, setForecastRevenue] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

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

  const monthOptions = [
    { value: 1, label: 'Tháng 1' }, { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' }, { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' }, { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' }, { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' }, { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' }, { value: 12, label: 'Tháng 12' }
  ];
  const generateYearOptions = (): number[] => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };
  const yearOptions = generateYearOptions().sort((a, b) => b - a);
  const gradeOptions = [
    { value: '', label: 'Tất cả các khối' },
    { value: '6', label: 'Khối 6' },
    { value: '7', label: 'Khối 7' },
    { value: '8', label: 'Khối 8' },
    { value: '9', label: 'Khối 9' },
    { value: '10', label: 'Khối 10' },
    { value: '11', label: 'Khối 11' },
    { value: '12', label: 'Khối 12' }
  ];
  const statusOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'WAITING_PAYMENT', label: 'Chờ thanh toán' },
    { value: 'PARTIAL_PAID', label: 'Đã thanh toán một phần' },
    { value: 'PAID', label: 'Đã thanh toán' }
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: TuitionFilterParams = {
        month: selectedMonth,
        year: selectedYear,
        name: searchTerm || undefined,
        grade: selectedGrade || undefined,
        status: selectedStatus as any || undefined
      };

      const [invoicesData, statsData, topDebtorsData, debtCountData] = await Promise.all([
        tuitionApi.getTuitionList(params),
        tuitionApi.getStats(selectedMonth, selectedYear),
        tuitionApi.getTopDebtors(selectedMonth, selectedYear, 5),
        tuitionApi.countStudentsWithDebt(selectedMonth, selectedYear)
      ]);

      setInvoices(invoicesData);
      setStats({
        ...statsData,
        totalDebtors: debtCountData.totalDebtors,
        totalDebtAmount: debtCountData.totalDebtAmount
      });
      setTopDebtors(topDebtorsData);
      setForecastRevenue(Math.round(statsData.totalRevenue * 1.2));

    } catch (error) {
      console.error('Failed to fetch data:', error);
      setAlert?.({
        type: 'error',
        message: (error as any)?.response?.data?.message || (error as any)?.message || 'Không thể tải dữ liệu học phí'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, searchTerm, selectedGrade, selectedStatus, setAlert]);

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
    fetchData();
  }, [fetchData, refreshTrigger]);

  const handleCreateInvoice = async () => {
    try {
      setLoading(true);

      const exists = await tuitionApi.checkTuitionExists(selectedMonth, selectedYear);

      if (exists) {
        setAlert?.({
          type: 'warning',
          message: `Học phí tháng ${selectedMonth}/${selectedYear} đã được tạo trước đó.`
        });
        setLoading(false);
        return;
      }

      await tuitionApi.createTuitions(selectedMonth, selectedYear);
      setAlert?.({
        type: 'success',
        message: `Tạo hóa đơn học phí tháng ${selectedMonth}/${selectedYear} thành công!`
      });
      setRefreshTrigger(prev => prev + 1);

    } catch (error) {
      console.error('Failed to create invoices:', error);
      const errorMessage = (error as any)?.response?.data?.message || (error as any)?.message || '';

      if (errorMessage.includes('already') || errorMessage.includes('đã tồn tại') || errorMessage.includes('duplicate')) {
        setAlert?.({
          type: 'warning',
          message: `Học phí tháng ${selectedMonth}/${selectedYear} đã được tạo trước đó.`
        });
      } else {
        setAlert?.({
          type: 'error',
          message: errorMessage || 'Không thể tạo hóa đơn'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (tuitionId: number) => {
    const studentId = invoices.find(i => i.tuitionId === tuitionId)?.studentId;
    if (studentId) {
      window.location.href = `/admin/tuition/${studentId}?month=${selectedMonth}&year=${selectedYear}`;
    } else {
      setAlert?.({ type: 'info', message: `Đang phát triển xem chi tiết #${tuitionId}` });
    }
  };

  const handleEdit = async (tuitionId: number) => {
    setAlert?.({ type: 'info', message: `Đang phát triển chỉnh sửa #${tuitionId}` });
  };

  const handlePayment = async (tuitionId: number) => {
    setAlert?.({ type: 'info', message: `Đang phát triển thanh toán #${tuitionId}` });
  };

  const handleCreateFirst = () => handleCreateInvoice();
  const handleFilterClick = () => setShowFilters(!showFilters);
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedGrade('');
    setSelectedStatus('');
    setShowFilters(false);
  };

  if (loading && !stats.totalInvoices && invoices.length === 0) {
    return <TuitionPageSkeleton />;
  }

  return (
    <ProtectedRoute allowedRoles={['R0']}>
      <main className="min-h-screen bg-gray-50">
        {/* Header Section với gradient từ AdminHomePage */}
        <section className="relative overflow-visible pb-6 bg-white">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200 via-indigo-300 to-cyan-200 opacity-30"></div>
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur-3xl opacity-40"></div>
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-sky-300 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

          {/* SVG Waves */}
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

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 z-10">
            <div className="relative overflow-hidden">
              <div className="relative px-6 py-6 lg:px-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2 px-3 py-1.5">
                        <Sparkles size={14} className="text-indigo-500" />
                        <span className="text-indigo-500 text-xs font-medium">Quản lý học phí</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full">
                        <Clock size={14} className="text-gray-500" />
                        <span className="text-gray-600 text-sm">{currentTime}</span>
                      </div>
                    </div>

                    <div>
                      <h1 className="text-gray-900 text-3xl lg:text-4xl font-bold tracking-tight">
                        {greeting}, <span className="bg-clip-text text-transparent gradient-text">Quản lý học phí</span>
                      </h1>
                      <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                        <span>Hệ thống theo dõi tài chính và công nợ học sinh định kỳ</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="flex items-center gap-1">
                          <TrendingUp size={14} className="text-blue-500" />
                          {monthNames[selectedMonth - 1]} {selectedYear}
                        </span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleCreateInvoice}
                    className="flex-1 md:flex-none btn-gradient text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Tạo Học Phí
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Stats Cards */}
            <motion.div variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
              <TuitionKPISection stats={stats} loading={loading} />
            </motion.div>

            {/* AI Insight Card */}
            <motion.div variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
              <AIInsightCard
                forecastRevenue={forecastRevenue}
                debtRecoveryRate={stats.debtRecoveryRate}
                riskLevel={stats.riskLevel}
                overdueCount={stats.overdueCount}
                topDebtors={topDebtors}
              />
            </motion.div>

            {/* Toolbar */}
            <motion.div variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
              <TuitionToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                selectedGrade={selectedGrade}
                onGradeChange={setSelectedGrade}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                monthOptions={monthOptions}
                yearOptions={yearOptions}
                gradeOptions={gradeOptions}
                statusOptions={statusOptions}
                onFilterClick={handleFilterClick}
                showFilters={showFilters}
                onClearFilters={handleClearFilters}
              />
            </motion.div>

            {/* Main Table */}
            <motion.div variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
              <TuitionTable
                invoices={invoices}
                loading={loading}
                onView={handleViewDetail}
                onEdit={handleEdit}
                onPayment={handlePayment}
                onCreateFirst={handleCreateFirst}
                month={selectedMonth}
                year={selectedYear}
              />
            </motion.div>

            {/* Refresh Indicator */}
            {refreshTrigger > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="fixed bottom-6 right-6 z-50"
              >
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg shadow-gray-200/50">
                  <RefreshCw className="h-3 w-3 text-indigo-500 animate-spin" style={{ animationDuration: '0.6s' }} />
                  <span className="text-[10px] text-slate-600">Đã cập nhật</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </ProtectedRoute>
  );
};

export default TuitionPage;