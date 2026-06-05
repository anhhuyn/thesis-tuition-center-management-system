'use client';

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
import type { PayrollFilter, PayrollStats as StatsType, PayrollListItem } from '../../../utils/types/payroll';
import { payrollApi } from '../../../utils/api/payroll.api';

type TabType = 'preview' | 'list' | 'waiting' | 'finalized';

interface PayrollModuleProps {
  mode?: 'create';
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

// Animation variants
const containerVariants : Variants= {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const modalOverlayVariants : Variants= {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants : Variants= {
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

const tabContentVariants : Variants= {
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

// AI Insight Widget - Premium feature
const AIInsightWidget: React.FC<{ stats: StatsType | null }> = ({ stats }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getInsight = () => {
    if (!stats || stats.totalPayrolls === 0) {
      return {
        title: 'Chưa có dữ liệu',
        message: 'Tạo bảng lương đầu tiên để xem AI insights',
        icon: '✨',
      };
    }

    const completionRate = stats.completionRate;
    const waitingCount = stats.waitingConfirmationCount;
    const draftCount = stats.draftCount;

    if (waitingCount > 0) {
      return {
        title: 'Cần xác nhận',
        message: `${waitingCount} bảng lương đang chờ giáo viên xác nhận`,
        icon: '📋',
      };
    }
    if (draftCount > 0) {
      return {
        title: 'Bảng lương nháp',
        message: `${draftCount} bảng lương cần hoàn thiện trước khi gửi`,
        icon: '✏️',
      };
    }
    if (completionRate >= 80) {
      return {
        title: 'Tiến độ tốt',
        message: `Hoàn thành ${completionRate}% bảng lương - Xuất sắc!`,
        icon: '🎯',
      };
    }
    return {
      title: 'Tổng quan',
      message: `${stats.totalPayrolls} bảng lương | Hoàn thành ${completionRate}%`,
      icon: '📊',
    };
  };

  const insight = getInsight();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 via-white to-purple-50/30 backdrop-blur-sm border border-purple-200 shadow-lg shadow-purple-100/30 mb-6"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-50" />
      <div className="relative px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-md shadow-purple-200">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-500">AI Insight</p>
            <p className="text-sm font-medium text-slate-700">{insight.message}</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isHovered ? 360 : 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl"
        >
          {insight.icon}
        </motion.div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-purple-50/20 to-white/0 pointer-events-none" />
    </motion.div>
  );
};

const PayrollModule: React.FC<PayrollModuleProps> = ({ mode, showToast }) => {
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

  // Fetch stats từ API monthly-stats (GIỮ NGUYÊN LOGIC)
  const fetchStats = async () => {
    const toast = showToast || ((msg: string, type?: any) => console.log(msg));

    try {
      setLoading(true);
      const currentMonth = filters.month || new Date().getMonth() + 1;
      const currentYear = filters.year || new Date().getFullYear();

      console.log('Fetching stats for:', currentMonth, currentYear);

      let monthlyStats;
      try {
        monthlyStats = await payrollApi.getMonthlyStats(currentMonth, currentYear);
        console.log('Monthly stats:', monthlyStats);
      } catch (statsError) {
        console.error('Error fetching monthly stats:', statsError);
        monthlyStats = { month: currentMonth, year: currentYear, teacherCount: 0, sessionCount: 0, totalAmount: 0 };
      }

      let allPayrolls: PayrollListItem[] = [];
      try {
        allPayrolls = await payrollApi.getAllPayrolls();
        console.log('All payrolls:', allPayrolls);
      } catch (payrollsError) {
        console.error('Error fetching payrolls:', payrollsError);
        allPayrolls = [];
      }

      const statsData: StatsType = {
        totalAmount: monthlyStats.totalAmount || 0,
        totalPaidAmount: 0,
        totalPayrolls: allPayrolls.length,
        draftCount: allPayrolls.filter((p: PayrollListItem) => p.status === 'DRAFT').length,
        waitingConfirmationCount: allPayrolls.filter((p: PayrollListItem) => p.status === 'WAITING_TEACHER_CONFIRMATION').length,
        confirmedCount: allPayrolls.filter((p: PayrollListItem) => p.status === 'TEACHER_CONFIRMED').length,
        finalizedCount: allPayrolls.filter((p: PayrollListItem) => p.status === 'FINALIZED').length,
        paidCount: allPayrolls.filter((p: PayrollListItem) => p.status === 'PAID').length,
        completionRate: allPayrolls.length > 0
          ? Math.round((allPayrolls.filter((p: PayrollListItem) => p.status === 'FINALIZED' || p.status === 'PAID').length / allPayrolls.length) * 100)
          : 0
      };

      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast('Không thể tải dữ liệu thống kê', 'error');
      setStats({
        totalAmount: 0,
        totalPaidAmount: 0,
        totalPayrolls: 0,
        draftCount: 0,
        waitingConfirmationCount: 0,
        confirmedCount: 0,
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
    if (showToast) showToast('Tạo bảng lương thành công', 'success');
    setActiveTab('list');
  };

  const handleFilterChange = (newFilters: Partial<PayrollFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const safeShowToast = showToast || ((msg: string, type?: any) => console.log(`[${type || 'info'}]: ${msg}`));
  
  const handlePreviewMonthly = () => {
    setPreviewMonth({
      month: filters.month || new Date().getMonth() + 1,
      year: filters.year || new Date().getFullYear()
    });
    setShowMonthlyPreview(true);
  };

  const handleMonthlySuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    if (showToast) showToast('Tạo lương hàng loạt thành công', 'success');
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

          {/* AI Insight Widget */}
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
            <AIInsightWidget stats={stats} />
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
                    showToast={safeShowToast}
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
                    showToast={safeShowToast}
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
                    showToast={safeShowToast}
                    refreshTrigger={refreshTrigger}
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
                    showToast={safeShowToast}
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
                    showToast={safeShowToast}
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