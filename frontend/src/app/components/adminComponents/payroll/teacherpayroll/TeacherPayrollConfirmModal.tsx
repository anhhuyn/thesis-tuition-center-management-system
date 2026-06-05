// src/components/teacherComponents/payroll/ConfirmPayrollModal.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { PayrollDetailResponse } from '../../../../utils/types/payroll';

interface ConfirmPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  payroll: PayrollDetailResponse | null;
}

export const ConfirmPayrollModal = ({ isOpen, onClose, onConfirm, loading, payroll }: ConfirmPayrollModalProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-50"
          >
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertTriangle size={32} className="text-yellow-600" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-center text-gray-800 mb-2">
                Xác nhận bảng lương
              </h3>

              {payroll && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 text-center">
                    Kỳ lương: <strong>Tháng {payroll.month}/{payroll.year}</strong>
                  </p>
                  <p className="text-sm text-gray-600 text-center mt-1">
                    Tổng tiền: <strong className="text-green-600">{formatCurrency(payroll.amount)}</strong>
                  </p>
                  <p className="text-sm text-gray-600 text-center mt-1">
                    Số buổi: <strong>{payroll.totalSessions} buổi</strong>
                  </p>
                </div>
              )}

              <p className="text-gray-600 text-center mb-6">
                Bạn xác nhận bảng lương này là chính xác?
                <br />
                <span className="text-sm text-gray-500">
                  Sau khi xác nhận, bạn sẽ không thể chỉnh sửa.
                </span>
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  Xác nhận
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};