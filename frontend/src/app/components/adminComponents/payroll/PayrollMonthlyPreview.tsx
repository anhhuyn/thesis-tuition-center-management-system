import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  FileSpreadsheet, 
  Loader2, 
  ChevronLeft,
  Eye,
  CheckCircle,
  Award,
  BarChart3,
  User
} from 'lucide-react';
import { payrollApi } from '../../../utils/api/payroll.api';
import type { MonthlyPayrollPreview, MonthlyPayrollTeacherDTO } from '../../../utils/types/payroll';
import './payroll.css';

interface PayrollMonthlyPreviewProps {
  month: number;
  year: number;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onClose: () => void;
  onGenerate?: () => void;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const tableRowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.02, duration: 0.2 }
  })
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.3 }
  })
};

// Skeleton loader
const PreviewSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 bg-slate-200 rounded-lg" />
            <div className="h-4 w-20 bg-slate-200 rounded" />
          </div>
          <div className="h-8 w-32 bg-slate-200 rounded mb-2" />
          <div className="h-3 w-24 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  </div>
);

// Empty state component
const EmptyPreviewState: React.FC<{ month: number; year: number; onPreview: () => void; loading: boolean }> = ({ 
  month, 
  year, 
  onPreview, 
  loading 
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-sm p-12 text-center"
  >
    <div className="flex justify-center mb-4">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
        <Calendar className="w-10 h-10 text-purple-400" />
      </div>
    </div>
    <h3 className="text-xl font-semibold text-slate-700 mb-2">Xem trước lương tháng</h3>
    <p className="text-sm text-slate-500 mb-2">
      Tháng <span className="font-semibold text-purple-600">{month}</span> / 
      Năm <span className="font-semibold text-purple-600">{year}</span>
    </p>
    <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
      Hệ thống sẽ tổng hợp lương của tất cả giáo viên có buổi dạy trong tháng
    </p>
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onPreview}
      disabled={loading}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md shadow-purple-200 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải...
        </>
      ) : (
        <>
          <Eye className="h-5 w-5" />
          Xem trước
        </>
      )}
    </motion.button>
  </motion.div>
);

// KPI Card Component
const KPICard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'purple';
  index: number;
}> = ({ title, value, subtitle, icon, color, index }) => {
  const colorClasses = {
    blue: { bg: 'from-blue-50 to-white', iconBg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    emerald: { bg: 'from-emerald-50 to-white', iconBg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    purple: { bg: 'from-purple-50 to-white', iconBg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' }
  };
  const colors = colorClasses[color];

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2 }}
      className={`rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} shadow-sm transition-all duration-200`}
    >
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className={`h-8 w-8 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
            {icon}
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        </div>
        <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );
};

// Teacher Row Component
const TeacherRow: React.FC<{ teacher: MonthlyPayrollTeacherDTO; index: number }> = ({ teacher, index }) => {
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <motion.tr
      custom={index}
      variants={tableRowVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ backgroundColor: 'rgba(124, 58, 237, 0.02)' }}
      className="border-b border-slate-100 transition-colors duration-150"
    >
      <td className="p-4">
        <span className="text-sm text-slate-400 font-medium">#{index + 1}</span>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-50">
            <User className="h-3.5 w-3.5 text-purple-600" />
          </div>
          <span className="font-medium text-slate-800">{teacher.teacherName}</span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-slate-700">{teacher.totalSessions}</span>
          <span className="text-xs text-slate-400">buổi</span>
        </div>
      </td>
      <td className="p-4">
        <span className="font-bold text-purple-600">{formatCurrency(teacher.amount)}</span>
      </td>
    </motion.tr>
  );
};

const PayrollMonthlyPreview: React.FC<PayrollMonthlyPreviewProps> = ({
  month,
  year,
  showToast,
  onClose,
  onGenerate
}) => {
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<MonthlyPayrollPreview | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handlePreview = async () => {
    setLoading(true);
    try {
      const data = await payrollApi.previewMonthlyPayroll(month, year);
      console.log('Monthly preview data:', data);
      setPreviewData(data);
      setShowPreview(true);
      showToast(`Tìm thấy ${data.totalTeachers} giáo viên có lương`, 'success');
    } catch (error: any) {
      console.error('Preview error:', error);
      showToast(error?.message || 'Không thể xem trước lương tháng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMonthly = async () => {
    setLoading(true);
    try {
      const result = await payrollApi.generateMonthlyPayroll(month, year);
      showToast(`Đã tạo thành công ${result.length} bảng lương`, 'success');
      if (onGenerate) onGenerate();
      onClose();
    } catch (error: any) {
      console.error('Generate error:', error);
      showToast(error?.message || 'Không thể tạo lương hàng loạt', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  if (!showPreview) {
    return (
      <EmptyPreviewState
        month={month}
        year={year}
        onPreview={handlePreview}
        loading={loading}
      />
    );
  }

  if (!previewData) return null;

  const averageAmount = previewData.totalPayrollAmount / (previewData.totalTeachers || 1);
  const totalInMillions = (previewData.totalPayrollAmount / 1000000).toFixed(1);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowPreview(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-all text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          Quay lại
        </motion.button>
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium text-slate-600">
            Tháng {month}/{year}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Giáo viên"
          value={previewData.totalTeachers}
          subtitle="giáo viên có buổi dạy"
          icon={<Users className="h-4 w-4 text-blue-600" />}
          color="blue"
          index={0}
        />
        
        <KPICard
          title="Tổng số buổi"
          value={previewData.teachers.reduce((sum, t) => sum + t.totalSessions, 0)}
          subtitle="buổi dạy"
          icon={<Calendar className="h-4 w-4 text-emerald-600" />}
          color="emerald"
          index={1}
        />
        
        <KPICard
          title="Tổng lương"
          value={`${totalInMillions}M`}
          subtitle={formatCurrency(previewData.totalPayrollAmount)}
          icon={<DollarSign className="h-4 w-4 text-purple-600" />}
          color="purple"
          index={2}
        />
        
        <KPICard
          title="Trung bình/GV"
          value={formatCurrency(averageAmount)}
          subtitle="/ giáo viên"
          icon={<TrendingUp className="h-4 w-4 text-purple-600" />}
          color="purple"
          index={3}
        />
      </div>

      {/* Teacher List Table - Premium */}
      <motion.div variants={itemVariants} className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-700">Chi tiết lương từng giáo viên</h4>
                <p className="text-xs text-slate-400">Danh sách chi tiết theo từng giáo viên</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>{previewData.teachers.length} giáo viên</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white border-b border-slate-100">
              <tr>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">STT</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Giáo viên</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">Số buổi</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng lương</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {previewData.teachers.map((teacher, index) => (
                  <TeacherRow key={teacher.teacherId} teacher={teacher} index={index} />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {previewData.teachers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">Không có giáo viên nào trong tháng này</p>
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-slate-100">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowPreview(false)}
          className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all"
        >
          Quay lại
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerateMonthly}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-200 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tạo...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Tạo lương hàng loạt
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default PayrollMonthlyPreview;