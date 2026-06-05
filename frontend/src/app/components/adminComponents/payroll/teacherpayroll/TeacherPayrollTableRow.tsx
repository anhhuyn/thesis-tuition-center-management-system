// src/components/teacherComponents/payroll/TeacherPayrollTableRow.tsx
import { motion } from 'framer-motion';
import { Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { TeacherPayrollSummary } from '../../../../utils/types/payroll';

interface TeacherPayrollTableRowProps {
  payroll: TeacherPayrollSummary;
  onViewDetail: (paymentId: number) => void;
  onConfirm: (paymentId: number) => void;
}

export const TeacherPayrollTableRow = ({ payroll, onViewDetail, onConfirm }: TeacherPayrollTableRowProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusBadge = () => {
    const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
      'DRAFT': { color: 'bg-gray-100 text-gray-800', label: 'Nháp', icon: AlertCircle },
      'WAITING_TEACHER_CONFIRMATION': { color: 'bg-yellow-100 text-yellow-800', label: 'Chờ xác nhận', icon: Clock },
      'TEACHER_CONFIRMED': { color: 'bg-blue-100 text-blue-800', label: 'Đã xác nhận', icon: CheckCircle },
      'FINALIZED': { color: 'bg-green-100 text-green-800', label: 'Đã chốt', icon: CheckCircle },
      'PAID': { color: 'bg-purple-100 text-purple-800', label: 'Đã thanh toán', icon: CheckCircle },
    };
    
    const config = statusConfig[payroll.status] || statusConfig['DRAFT'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const canConfirm = payroll.status === 'WAITING_TEACHER_CONFIRMATION';

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Period */}
        <div className="min-w-[120px]">
          <p className="text-sm text-gray-500">Kỳ lương</p>
          <p className="font-semibold text-gray-800">
            Tháng {payroll.month}/{payroll.year}
          </p>
        </div>

        {/* Sessions */}
        <div className="min-w-[100px]">
          <p className="text-sm text-gray-500">Số buổi</p>
          <p className="font-semibold text-gray-800">{payroll.totalSessions} buổi</p>
        </div>

        {/* Amount */}
        <div className="min-w-[150px]">
          <p className="text-sm text-gray-500">Tổng tiền</p>
          <p className="font-bold text-green-600">{formatCurrency(payroll.amount)}</p>
        </div>

        {/* Status */}
        <div className="min-w-[120px]">
          <p className="text-sm text-gray-500">Trạng thái</p>
          {getStatusBadge()}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetail(payroll.paymentId)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Xem chi tiết"
          >
            <Eye size={18} />
          </button>
          
          {canConfirm && (
            <button
              onClick={() => onConfirm(payroll.paymentId)}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              Xác nhận
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};