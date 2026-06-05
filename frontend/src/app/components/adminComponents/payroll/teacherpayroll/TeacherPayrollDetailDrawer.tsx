// src/components/teacherComponents/payroll/PayrollDetailDrawer.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, Clock, BookOpen, CheckCircle } from 'lucide-react';
import type { PayrollDetailResponse } from '../../../../utils/types/payroll';

interface PayrollDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  payroll: PayrollDetailResponse | null;
  loading: boolean;
  onConfirm?: () => void;
}

export const PayrollDetailDrawer = ({ isOpen, onClose, payroll, loading, onConfirm }: PayrollDetailDrawerProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'DRAFT': 'Nháp',
      'WAITING_TEACHER_CONFIRMATION': 'Chờ xác nhận',
      'TEACHER_CONFIRMED': 'Đã xác nhận',
      'FINALIZED': 'Đã chốt',
      'PAID': 'Đã thanh toán',
    };
    return statusMap[status] || status;
  };

  const canConfirm = payroll?.status === 'WAITING_TEACHER_CONFIRMATION';

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
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween' }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Chi tiết bảng lương</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600" />
                </div>
              ) : payroll ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Giáo viên</p>
                        <p className="font-semibold text-gray-800">{payroll.teacherName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Kỳ lương</p>
                        <p className="font-semibold text-gray-800">Tháng {payroll.month}/{payroll.year}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tổng số buổi</p>
                        <p className="font-semibold text-gray-800">{payroll.totalSessions} buổi</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Trạng thái</p>
                        <p className="font-semibold text-gray-800">{getStatusText(payroll.status)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-600">Tổng tiền</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(payroll.amount)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Session Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <BookOpen size={20} />
                      Chi tiết các buổi dạy
                    </h3>
                    
                    <div className="space-y-3">
                      {payroll.details.map((session, index) => (
                        <div key={session.sessionTeacherId} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-gray-800">{session.subjectName}</p>
                              <p className="text-sm text-gray-600">
                                Ngày: {new Date(session.sessionDate).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                            <p className="font-bold text-green-600">{formatCurrency(session.amount)}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                            <div>
                              <span className="text-gray-500">Hình thức:</span>
                              <span className="ml-2 text-gray-700">
                                {session.salaryType === 'PER_HOUR' ? 'Theo giờ' : 'Theo buổi'}
                              </span>
                            </div>
                            {session.salaryType === 'PER_HOUR' && (
                              <div>
                                <span className="text-gray-500">Số giờ:</span>
                                <span className="ml-2 text-gray-700">{session.workedHours} giờ</span>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-500">Đơn giá:</span>
                              <span className="ml-2 text-gray-700">{formatCurrency(session.salaryRate)}</span>
                            </div>
                          </div>
                          
                          {session.note && (
                            <p className="text-sm text-gray-500 mt-2">Ghi chú: {session.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {canConfirm && onConfirm && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={onConfirm}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle size={18} />
                        Xác nhận bảng lương
                      </button>
                      <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      >
                        Đóng
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Không thể tải chi tiết bảng lương</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};