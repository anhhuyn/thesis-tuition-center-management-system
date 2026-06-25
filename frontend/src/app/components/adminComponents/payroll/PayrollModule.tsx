'use client';
import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { X, Sparkles, RefreshCw } from 'lucide-react';
import './payroll.css';
import PayrollHeader from './PayrollHeader';
import PayrollStats from './PayrollStats';
import PayrollToolbar from './PayrollToolbar';
import PayrollPreviewTab from './PayrollPreviewTab';
import PayrollListTab from './PayrollListTab';
import PayrollWaitingTab from './PayrollWaitingTab';
import PayrollFinalizedTab from './PayrollFinalizedTab';
import PayrollMonthlyPreview from './PayrollMonthlyPreview';
import PayrollRejectedTab from './PayrollRejectedTab';
import type {
  PayrollFilter, PayrollStats as StatsType, PayrollListItem, TeacherPayrollRejectRequest, TeacherPaymentResponse
} from '../../../utils/types/payroll';
import { payrollApi } from '../../../utils/api/payroll.api';

type TabType = 'preview' | 'list' | 'waiting' | 'finalized' | 'rejected';
interface PayrollModuleProps {
  mode?: 'create';
}

// Animation variants
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

const modalOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2, ease: 'easeIn' }
  },
};

const tabContentVariants: Variants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

// Skeleton loader cho toàn bộ module
const PayrollModuleSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-10 w-64 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-4 w-96 bg-slate-200 rounded-lg mt-2 animate-pulse" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-3" />
            <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Toolbar skeleton */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="h-10 w-32 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-10 w-40 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-10 w-48 bg-slate-200 rounded-xl animate-pulse ml-auto" />
      </div>

      {/* Content skeleton */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 min-h-[400px]">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  </div>
);



const PayrollModule: React.FC<PayrollModuleProps> = ({ mode }) => {
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showMonthlyPreview, setShowMonthlyPreview] = useState(false);
  const [previewMonth, setPreviewMonth] = useState({ month: 0, year: 0 });
  const [filters, setFilters] = useState<PayrollFilter>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    teacherName: ''
  });
  const { setAlert } = useOutletContext<any>();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const currentMonth = filters.month || new Date().getMonth() + 1;
      const currentYear = filters.year || new Date().getFullYear();

      console.log('Fetching stats for:', currentMonth, currentYear);

      // Sử dụng API mới của BE
      const statsData = await payrollApi.getPayrollStats(currentMonth, currentYear);
      console.log('Stats data:', statsData);

      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setAlert?.({
        type: 'error',
        message:
          (error as any)?.response?.data?.message ||
          (error as any)?.message ||
          'Không thể tải dữ liệu thống kê'
      });
      setStats({
        totalAmount: 0,
        totalPaidAmount: 0,
        totalPayrolls: 0,
        draftCount: 0,
        waitingConfirmationCount: 0,
        confirmedCount: 0,
        rejectedCount: 0,
        finalizedCount: 0,
        paidCount: 0,
        completionRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [filters.month, filters.year, refreshTrigger]);

  const handleCreatePayroll = () => {
    setActiveTab('preview');
  };

  const handlePayrollSuccess = () => {
    setRefreshTrigger(prev => prev + 1);

    setAlert?.({
      type: 'success',
      message: 'Tạo bảng lương thành công'
    });

    setActiveTab('list');
  };

  const handleFilterChange = (newFilters: Partial<PayrollFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handlePreviewMonthly = () => {
    setPreviewMonth({
      month: filters.month || new Date().getMonth() + 1,
      year: filters.year || new Date().getFullYear()
    });
    setShowMonthlyPreview(true);
  };

  const handleMonthlySuccess = () => {
    setRefreshTrigger(prev => prev + 1);

    setAlert?.({
      type: 'success',
      message: 'Tạo lương hàng loạt thành công'
    });
  };

  // Show skeleton khi loading lần đầu
  if (loading && !stats) {
    return <PayrollModuleSkeleton />;
  }

  return (
    <div className="payroll-module min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 lg:space-y-8"
        >
          {/* Header */}
          <motion.div variants={{ hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0 } }}>
            <PayrollHeader onCreatePayroll={handleCreatePayroll} />
          </motion.div>

         
          {/* Stats Cards */}
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
            <PayrollStats stats={stats} loading={loading} />
          </motion.div>

          {/* Toolbar */}
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
            <PayrollToolbar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              filters={filters}
              onFilterChange={handleFilterChange}
              onPreviewMonthly={handlePreviewMonthly}
            />
          </motion.div>

          {/* Tab Content */}
          <div className="relative min-h-[500px]">
            <AnimatePresence mode="wait">
              {activeTab === 'preview' && (
                <motion.div
                  key="preview"
                  variants={tabContentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <PayrollPreviewTab
                    filters={filters}
                    onSuccess={handlePayrollSuccess}
                  />
                </motion.div>
              )}

              {activeTab === 'list' && (
                <motion.div
                  key="list"
                  variants={tabContentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <PayrollListTab
                    filters={filters}
                    refreshTrigger={refreshTrigger}
                  />
                </motion.div>
              )}

              {activeTab === 'waiting' && (
                <motion.div
                  key="waiting"
                  variants={tabContentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <PayrollWaitingTab
                    refreshTrigger={refreshTrigger}
                  />
                </motion.div>
              )}

              {activeTab === 'rejected' && (
                <motion.div
                  key="rejected"
                  variants={tabContentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <PayrollRejectedTab
                    refreshTrigger={refreshTrigger}
                    onRegenerateSuccess={() => {
                      setRefreshTrigger(prev => prev + 1);
                      setAlert?.({
                        type: 'success',
                        message: 'Tái tạo bảng lương thành công'
                      });
                    }}
                  />
                </motion.div>
              )}

              {activeTab === 'finalized' && (
                <motion.div
                  key="finalized"
                  variants={tabContentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  <PayrollFinalizedTab
                    refreshTrigger={refreshTrigger}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Refresh Indicator */}
          {refreshTrigger > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-6 right-6 z-50"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 shadow-lg shadow-slate-200/50">
                <RefreshCw className="h-3.5 w-3.5 text-purple-500 animate-spin" style={{ animationDuration: '0.6s' }} />
                <span className="text-xs text-slate-600">Đã cập nhật</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Premium Monthly Preview Modal */}
      <AnimatePresence>
        {showMonthlyPreview && (
          <>
            <motion.div
              variants={modalOverlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowMonthlyPreview(false)}
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            >
              <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-5 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      Xem trước lương tháng {previewMonth.month}/{previewMonth.year}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Tổng hợp lương của tất cả giáo viên trong tháng
                    </p>
                  </div>
                  <button
                    onClick={() => setShowMonthlyPreview(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                  <PayrollMonthlyPreview
                    month={previewMonth.month}
                    year={previewMonth.year}
                    onClose={() => setShowMonthlyPreview(false)}
                    onGenerate={handleMonthlySuccess}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PayrollModule;