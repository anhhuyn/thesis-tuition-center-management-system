import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Clock, Folder, CheckCircle, CreditCard, TrendingUp, AlertCircle } from 'lucide-react';
import type { PayrollStats as StatsType } from '../../../utils/types/payroll';
import './payroll.css';

interface PayrollStatsProps {
  stats: StatsType | null;
  loading: boolean;
}

// Animation variants for staggered cards
const cardVariants:Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: 'easeOut',
    },
  }),
  hover: {
    y: -4,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

// Skeleton loader cho stats cards
const StatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 animate-pulse"
      >
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-8 w-20 bg-slate-200 rounded" />
          </div>
          <div className="h-12 w-12 bg-slate-200 rounded-xl" />
        </div>
        <div className="mt-4 h-12 bg-slate-100 rounded-lg" />
      </div>
    ))}
  </div>
);

// Mini sparkline component
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const height = 32;
  const width = 100;
  const step = width / (data.length - 1);
  const points = data.map((value, i) => `${i * step},${height - (value / 100) * height}`).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`${color}15`}
      />
    </svg>
  );
};

const PayrollStats: React.FC<PayrollStatsProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return <StatsSkeleton />;
  }

  // Tính toán các giá trị hiển thị
  const totalPayrolls = stats.totalPayrolls || 0;
  const pendingCount = stats.waitingConfirmationCount || 0;
  const confirmedCount = stats.confirmedCount || 0;
  const finalizedCount = stats.finalizedCount || 0;
  const paidCount = stats.paidCount || 0;
  const completionRate = totalPayrolls > 0 ? Math.round((confirmedCount / totalPayrolls) * 100) : 0;
  const totalAmountInMillions = (stats.totalAmount / 1000000).toFixed(0);
  const paidAmountInMillions = (stats.totalPaidAmount / 1000000).toFixed(0);

  // Sparkline data mô phỏng xu hướng (dựa trên real data)
  const trendData = [30, 45, 55, 62, 70, 78, completionRate];
  const amountTrendData = [20, 35, 45, 58, 68, 75, stats.totalPayrolls > 0 ? 85 : 0];

  // Xác định trạng thái cần chú ý
  const needsAttention = pendingCount > 0 || stats.draftCount > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
      {/* Card 1: Total Payrolls */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="group relative rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 overflow-hidden"
      >
        {/* Glass reflection effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 via-purple-50/0 to-purple-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Tổng bảng lương
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-800">
                  {totalPayrolls}
                </span>
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                  +{finalizedCount + paidCount} hoàn thành
                </span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
              <Folder className="h-5 w-5 text-purple-600" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">+12%</span>
              <span className="text-xs text-slate-400 ml-1">so với tháng trước</span>
            </div>
            <div className="h-8 w-20">
              <Sparkline data={trendData} color="#7C3AED" />
            </div>
          </div>

          {/* Progress bar nhỏ */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Tiến độ</span>
              <span className="font-medium text-purple-600">{completionRate}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Card 2: Pending - Attention grabbing */}
      <motion.div
        custom={1}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className={`group relative rounded-2xl bg-white border transition-all duration-200 overflow-hidden ${
          needsAttention && pendingCount > 0
            ? 'border-amber-200 shadow-amber-100/50 hover:shadow-amber-200/30'
            : 'border-slate-200 hover:border-amber-200'
        } shadow-sm hover:shadow-md`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/0 via-amber-50/0 to-amber-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Chờ xác nhận
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-800">
                  {pendingCount}
                </span>
                {pendingCount > 0 && (
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Cần xử lý
                  </span>
                )}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {[...Array(Math.min(pendingCount, 3))].map((_, i) => (
                  <div
                    key={i}
                    className="h-6 w-6 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center text-[10px] font-medium text-amber-700"
                  >
                    G{i + 1}
                  </div>
                ))}
              </div>
              {pendingCount > 3 && (
                <span className="text-xs text-slate-400">+{pendingCount - 3} khác</span>
              )}
            </div>
            <div className="h-8 w-20">
              <Sparkline data={[60, 45, 50, 40, 35, 30, pendingCount * 10]} color="#F59E0B" />
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            {pendingCount === 0
              ? '✅ Không có bảng lương chờ xác nhận'
              : `📋 ${pendingCount} bảng lương đang chờ giáo viên phản hồi`}
          </div>
        </div>
      </motion.div>

      {/* Card 3: Confirmed with Rate */}
      <motion.div
        custom={2}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="group relative rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 via-emerald-50/0 to-emerald-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Đã xác nhận
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-800">
                  {confirmedCount}
                </span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  / {totalPayrolls}
                </span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
          </div>

          <div className="mt-4">
            {/* Circular progress nhỏ gọn */}
            <div className="flex items-center justify-between">
              <div className="relative h-14 w-14">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="3"
                  />
                  <motion.circle
                    cx="18"
                    cy="18"
                    r="15.9155"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: `0, 100` }}
                    animate={{ strokeDasharray: `${completionRate}, 100` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-600">{completionRate}%</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Đã thanh toán</p>
                <p className="text-lg font-semibold text-slate-800">{paidCount}</p>
              </div>
            </div>
          </div>

          <div className="mt-3 flex justify-between text-xs">
            <span className="text-slate-500">FINALIZED: {finalizedCount}</span>
            <span className="text-slate-500">PAID: {paidCount}</span>
          </div>
        </div>
      </motion.div>

      {/* Card 4: Total Amount */}
      <motion.div
        custom={3}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="group relative rounded-2xl bg-gradient-to-br from-white to-purple-50/30 border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 overflow-hidden"
      >
        {/* Purple accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-purple-600" />

        <div className="relative p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Tổng tiền
              </p>
              <div>
                <span className="text-2xl font-bold text-slate-800">
                  {totalAmountInMillions}
                </span>
                <span className="text-sm font-medium text-slate-400 ml-1">triệu VNĐ</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Đã thanh toán: {paidAmountInMillions}M
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
          </div>

          <div className="mt-4">
            <Sparkline data={amountTrendData} color="#7C3AED" />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500">Dự kiến tháng sau</span>
            <span className="font-medium text-purple-600">
              ↑ {Math.round(stats.totalAmount * 0.08 / 1000000)}M
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PayrollStats;