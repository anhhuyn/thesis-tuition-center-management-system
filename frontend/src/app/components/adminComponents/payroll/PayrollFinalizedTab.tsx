import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { 
  CheckCircle, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar, 
  Award,
  FileCheck,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { payrollApi } from '../../../utils/api/payroll.api';
import type { PayrollListItem } from '../../../utils/types/payroll';
import './payroll.css';

interface PayrollFinalizedTabProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  refreshTrigger: number;
}

// Animation variants
const containerVariants : Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const cardVariants : Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' },
  }),
};

const itemVariants : Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.25, ease: 'easeOut' },
  }),
};

const statsCardVariants : Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.3, ease: 'easeOut' },
  }),
  hover: {
    y: -4,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

// Skeleton loader
const FinalizedSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Stats skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 animate-pulse">
          <div className="h-3 w-24 bg-slate-200 rounded mb-3" />
          <div className="h-8 w-32 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
    
    {/* List skeleton */}
    <div className="space-y-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-200" />
              <div className="space-y-2">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-5 w-32 bg-slate-200 rounded" />
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="h-6 w-28 bg-slate-200 rounded" />
              <div className="h-3 w-20 bg-slate-200 rounded ml-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// KPI Card Component
const KPICard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'emerald' | 'blue' | 'purple' | 'amber';
  index: number;
}> = ({ title, value, subtitle, icon, color, index }) => {
  const colorClasses = {
    emerald: { bg: 'from-emerald-50 to-white', iconBg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    blue: { bg: 'from-blue-50 to-white', iconBg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    purple: { bg: 'from-purple-50 to-white', iconBg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    amber: { bg: 'from-amber-50 to-white', iconBg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  };
  const colors = colorClasses[color];

  return (
    <motion.div
      custom={index}
      variants={statsCardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`relative rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} shadow-sm overflow-hidden group`}
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/0 to-white/50 rounded-full blur-2xl" />
      <div className="relative p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {title}
            </p>
            <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
            {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`h-10 w-10 rounded-xl ${colors.iconBg} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Finalized Payroll Card Component
const FinalizedPayrollCard: React.FC<{
  payroll: PayrollListItem;
  index: number;
}> = ({ payroll, index }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <motion.div
      custom={index}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.01, y: -2 }}
      className="group relative rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 overflow-hidden"
    >
      {/* Success gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-500" />
      
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              {payroll.status === 'PAID' ? (
                <DollarSign className="h-6 w-6 text-emerald-600" />
              ) : (
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              )}
            </div>
          </div>
          
          {/* Content */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tháng {payroll.month}/{payroll.year}
              </p>
              {payroll.status === 'PAID' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  <DollarSign className="h-3 w-3" />
                  Đã thanh toán
                </span>
              )}
            </div>
            <h5 className="text-lg font-bold text-slate-800">
              {payroll.teacherName}
            </h5>
          </div>
        </div>
        
        <div className="sm:text-right">
          <p className="text-2xl font-bold text-emerald-600">
            {formatCurrency(payroll.amount)}đ
          </p>
          <div className="flex items-center justify-end gap-3 text-sm text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {payroll.totalSessions} buổi
            </span>
            <span className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5" />
              {payroll.status === 'PAID' ? 'Đã thanh toán' : 'Đã chốt'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Hover reflection */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-emerald-50/0 to-emerald-100/0 group-hover:via-emerald-50/10 transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
};

// Empty state component
const EmptyState: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="rounded-2xl bg-white border border-slate-200 shadow-sm p-12 text-center"
  >
    <div className="flex justify-center mb-4">
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
        <FileCheck className="h-8 w-8 text-slate-300" />
      </div>
    </div>
    <h3 className="text-lg font-semibold text-slate-700 mb-2">Chưa có bảng lương nào được chốt</h3>
    <p className="text-sm text-slate-400 max-w-sm mx-auto">
      Khi bảng lương được giáo viên xác nhận và quản trị viên chốt, chúng sẽ xuất hiện tại đây.
    </p>
  </motion.div>
);

const PayrollFinalizedTab: React.FC<PayrollFinalizedTabProps> = ({ showToast, refreshTrigger }) => {
  const [finalizedPayrolls, setFinalizedPayrolls] = useState<PayrollListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAmount: 0,
    averageAmount: 0,
    totalTeachers: 0,
    paidCount: 0,
    finalizedCount: 0
  });

  useEffect(() => {
    fetchFinalizedPayrolls();
  }, [refreshTrigger]);

  const fetchFinalizedPayrolls = async () => {
    try {
      setLoading(true);
      const allPayrolls = await payrollApi.getAllPayrolls();
      const finalized = allPayrolls.filter(p => p.status === 'FINALIZED' || p.status === 'PAID');
      setFinalizedPayrolls(finalized);
      
      const totalAmount = finalized.reduce((sum, p) => sum + p.amount, 0);
      setStats({
        totalAmount,
        averageAmount: finalized.length > 0 ? totalAmount / finalized.length : 0,
        totalTeachers: new Set(finalized.map(p => p.teacherId)).size,
        paidCount: finalized.filter(p => p.status === 'PAID').length,
        finalizedCount: finalized.filter(p => p.status === 'FINALIZED').length
      });
    } catch (error) {
      console.error('Failed to fetch finalized payrolls:', error);
      showToast('Không thể tải dữ liệu đã chốt', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  if (loading) {
    return <FinalizedSkeleton />;
  }

  const totalInMillions = (stats.totalAmount / 1000000).toFixed(0);
  const averageInMillions = (stats.averageAmount / 1000000).toFixed(1);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header with icon */}
      <motion.div variants={cardVariants} custom={0} className="flex items-center gap-2 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
          <FileCheck className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-700">Bảng lương đã chốt</h3>
          <p className="text-xs text-slate-400">Danh sách các bảng lương đã được xác nhận và chốt</p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Tổng kỳ lương"
          value={finalizedPayrolls.length}
          subtitle="bảng lương"
          icon={<FileCheck className="h-5 w-5 text-emerald-600" />}
          color="emerald"
          index={0}
        />
        
        <KPICard
          title="Tổng chi trả"
          value={`${totalInMillions}M`}
          subtitle={`≈ ${formatCurrency(stats.totalAmount)} VNĐ`}
          icon={<DollarSign className="h-5 w-5 text-blue-600" />}
          color="blue"
          index={1}
        />
        
        <KPICard
          title="Giáo viên"
          value={stats.totalTeachers}
          subtitle="người"
          icon={<Users className="h-5 w-5 text-purple-600" />}
          color="purple"
          index={2}
        />
        
        <KPICard
          title="Trung bình/GV"
          value={`${averageInMillions}M`}
          subtitle="VNĐ"
          icon={<TrendingUp className="h-5 w-5 text-amber-600" />}
          color="amber"
          index={3}
        />
      </div>

      {/* Status breakdown (optional insight) */}
      {(stats.finalizedCount > 0 || stats.paidCount > 0) && (
        <motion.div
          variants={cardVariants}
          custom={4}
          className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-slate-400" />
            <span className="text-xs text-slate-500">Phân bổ trạng thái:</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-600">Đã chốt: {stats.finalizedCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-xs text-slate-600">Đã thanh toán: {stats.paidCount}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Finalized Payrolls List */}
      <div className="space-y-3">
        <AnimatePresence>
          {finalizedPayrolls.length > 0 ? (
            finalizedPayrolls.map((payroll, idx) => (
              <FinalizedPayrollCard
                key={payroll.paymentId}
                payroll={payroll}
                index={idx}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </AnimatePresence>
      </div>

      {/* Footer insight */}
      {finalizedPayrolls.length > 0 && (
        <motion.div
          variants={cardVariants}
          custom={finalizedPayrolls.length}
          className="flex items-center justify-center gap-2 py-3 text-xs text-slate-400 border-t border-slate-100 mt-4"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Tổng giá trị đã chốt: {totalInMillions} triệu VNĐ</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PayrollFinalizedTab;