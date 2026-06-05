import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  CheckCircle, 
  Lock, 
  FileText, 
  Download, 
  AlertCircle,
  User,
  Calendar,
  DollarSign,
  BookOpen,
  X,
  Clock,
  TrendingUp,
  Filter
} from 'lucide-react';
import type { PayrollFilter, PayrollListItem, TeacherPaymentStatus } from '../../../utils/types/payroll';
import { payrollApi } from '../../../utils/api/payroll.api';
import './payroll.css';

interface PayrollListTabProps {
  filters: PayrollFilter;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  refreshTrigger: number;
}

// Animation variants
const tableRowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.2 },
  }),
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// Status badge component with icons
const StatusBadge: React.FC<{ status: TeacherPaymentStatus }> = ({ status }) => {
  const config: Record<TeacherPaymentStatus, { class: string; label: string; icon: React.ReactNode }> = {
    'DRAFT': { 
      class: 'bg-slate-100 text-slate-600 border-slate-200', 
      label: 'NHÁP',
      icon: <FileText className="h-3 w-3" />
    },
    'WAITING_TEACHER_CONFIRMATION': { 
      class: 'bg-amber-50 text-amber-700 border-amber-200', 
      label: 'CHỜ XÁC NHẬN',
      icon: <Clock className="h-3 w-3" />
    },
    'TEACHER_CONFIRMED': { 
      class: 'bg-blue-50 text-blue-700 border-blue-200', 
      label: 'ĐÃ XÁC NHẬN',
      icon: <CheckCircle className="h-3 w-3" />
    },
    'FINALIZED': { 
      class: 'bg-purple-50 text-purple-700 border-purple-200', 
      label: 'ĐÃ CHỐT',
      icon: <Lock className="h-3 w-3" />
    },
    'PAID': { 
      class: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
      label: 'ĐÃ THANH TOÁN',
      icon: <DollarSign className="h-3 w-3" />
    }
  };
  const { class: className, label, icon } = config[status];
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}>
      {icon}
      {label}
    </span>
  );
};

// Skeleton loader for table
const TableSkeleton: React.FC = () => (
  <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <th key={i} className="p-4"><div className="h-4 w-20 bg-slate-200 rounded animate-pulse" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map(i => (
            <tr key={i} className="border-b border-slate-100">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(j => (
                <td key={j} className="p-4"><div className="h-5 w-16 bg-slate-100 rounded animate-pulse" /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Empty state component
const EmptyState: React.FC<{ role: string }> = ({ role }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="flex justify-center mb-4">
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
        <FileText className="h-8 w-8 text-slate-300" />
      </div>
    </div>
    <h3 className="text-lg font-semibold text-slate-700 mb-2">Không có bảng lương nào</h3>
    <p className="text-sm text-slate-400 max-w-sm mx-auto">
      {role === 'ADMIN' 
        ? 'Chưa có bảng lương nào được tạo trong kỳ này'
        : 'Bạn chưa có bảng lương nào trong kỳ này'}
    </p>
  </motion.div>
);

const PayrollListTab: React.FC<PayrollListTabProps> = ({ filters, showToast, refreshTrigger }) => {
  const [payrolls, setPayrolls] = useState<PayrollListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  
  const [currentUser, setCurrentUser] = useState<{ id: number; role: string }>({
    id: 0,
    role: ''
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser({
          id: user.id,
          role: user.role || 'ADMIN'
        });
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
  }, []);

  useEffect(() => {
    fetchPayrolls();
  }, [filters, refreshTrigger]);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const allPayrolls = await payrollApi.getAllPayrolls();
      console.log('Fetched payrolls:', allPayrolls);
      
      let filteredPayrolls = [...allPayrolls];
      
      if (filters.month && filters.year) {
        filteredPayrolls = filteredPayrolls.filter(p => p.month === filters.month && p.year === filters.year);
      }
      
      if (filters.status) {
        filteredPayrolls = filteredPayrolls.filter(p => p.status === filters.status);
      }
      
      if (filters.teacherName) {
        filteredPayrolls = filteredPayrolls.filter(p => 
          p.teacherName.toLowerCase().includes(filters.teacherName!.toLowerCase())
        );
      }

      if (currentUser.role === 'TEACHER' && currentUser.id) {
        filteredPayrolls = filteredPayrolls.filter(p => p.teacherId === currentUser.id);
      }
      
      setPayrolls(filteredPayrolls);
    } catch (error) {
      console.error('Failed to fetch payrolls:', error);
      showToast('Không thể tải danh sách bảng lương', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (paymentId: number) => {
    try {
      const detail = await payrollApi.getPayrollById(paymentId);
      setSelectedPayroll(detail);
      setShowDetailModal(true);
    } catch (error) {
      showToast('Không thể tải chi tiết bảng lương', 'error');
    }
  };

  const handleConfirm = async (paymentId: number) => {
    if (currentUser.role !== 'TEACHER') {
      showToast('Chỉ giáo viên mới có thể xác nhận bảng lương', 'error');
      return;
    }

    setActionLoading(paymentId);
    try {
      await payrollApi.confirmPayroll({
        paymentId: paymentId,
        teacherFeedback: 'Tôi xác nhận bảng lương này là chính xác.'
      });
      showToast('Xác nhận bảng lương thành công', 'success');
      await fetchPayrolls();
    } catch (error) {
      showToast('Không thể xác nhận bảng lương', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFinalize = async (paymentId: number) => {
    if (currentUser.role !== 'ADMIN') {
      showToast('Chỉ quản trị viên mới có thể chốt lương', 'error');
      return;
    }

    setActionLoading(paymentId);
    try {
      await payrollApi.finalizePayroll({
        paymentId: paymentId,
        payrollNote: 'Đã duyệt và chốt lương'
      }, currentUser.id);
      showToast('Chốt bảng lương thành công', 'success');
      await fetchPayrolls();
    } catch (error) {
      showToast('Không thể chốt bảng lương', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = async (paymentId: number) => {
    setActionLoading(paymentId);
    try {
      const data = await payrollApi.exportPayroll(paymentId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll_${paymentId}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Xuất dữ liệu thành công', 'success');
    } catch (error) {
      showToast('Không thể xuất dữ liệu', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const isOwner = (teacherId: number) => {
    if (currentUser.role === 'ADMIN') return true;
    return currentUser.id === teacherId;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div>
      {/* Role indicator and summary */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
            currentUser.role === 'ADMIN' 
              ? 'bg-purple-50 text-purple-700' 
              : 'bg-blue-50 text-blue-700'
          }`}>
            {currentUser.role === 'ADMIN' ? 'Quản trị viên' : 'Giáo viên'}
          </div>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <FileText className="h-4 w-4" />
            <span>{payrolls.length} bảng lương</span>
          </div>
        </div>
        
        {payrolls.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <TrendingUp className="h-3 w-3" />
            <span>Tổng giá trị: {formatCurrency(payrolls.reduce((sum, p) => sum + p.amount, 0))}đ</span>
          </div>
        )}
      </motion.div>

      {/* Premium Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Giáo viên</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kỳ lương</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Số buổi</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng tiền</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày tạo</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {payrolls.map((payroll, idx) => (
                  <motion.tr
                    key={payroll.paymentId}
                    custom={idx}
                    variants={tableRowVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ backgroundColor: 'rgba(124, 58, 237, 0.02)' }}
                    className="border-b border-slate-100 transition-colors duration-150"
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm font-medium text-purple-600">#{payroll.paymentId}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-purple-600" />
                        </div>
                        <span className="font-medium text-slate-800">{payroll.teacherName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-sm text-slate-600">Tháng {payroll.month}/{payroll.year}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-slate-700">{payroll.totalSessions} buổi</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-purple-600">{formatCurrency(payroll.amount)}đ</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-500">
                        {new Date(payroll.paymentDate).toLocaleDateString('vi-VN')}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={payroll.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1.5">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewDetail(payroll.paymentId)}
                          className="p-2 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-all"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        
                        {currentUser.role === 'TEACHER' && 
                         payroll.status === 'WAITING_TEACHER_CONFIRMATION' && 
                         isOwner(payroll.teacherId) && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleConfirm(payroll.paymentId)}
                            disabled={actionLoading === payroll.paymentId}
                            className="p-2 rounded-lg text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-50"
                            title="Xác nhận bảng lương"
                          >
                            {actionLoading === payroll.paymentId ? (
                              <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </motion.button>
                        )}
                        
                        {currentUser.role === 'ADMIN' && 
                         payroll.status === 'TEACHER_CONFIRMED' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleFinalize(payroll.paymentId)}
                            disabled={actionLoading === payroll.paymentId}
                            className="p-2 rounded-lg text-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all disabled:opacity-50"
                            title="Chốt lương"
                          >
                            {actionLoading === payroll.paymentId ? (
                              <div className="h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </motion.button>
                        )}
                        
                        {currentUser.role === 'ADMIN' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleExport(payroll.paymentId)}
                            disabled={actionLoading === payroll.paymentId}
                            className="p-2 rounded-lg text-slate-500 hover:text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50"
                            title="Xuất dữ liệu"
                          >
                            {actionLoading === payroll.paymentId ? (
                              <div className="h-4 w-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {payrolls.length === 0 && <EmptyState role={currentUser.role} />}
        </div>
      </div>

      {/* Premium Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedPayroll && (
          <>
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowDetailModal(false)}
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-5 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Chi tiết bảng lương</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="font-mono text-sm text-purple-600">#{selectedPayroll.paymentId}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-sm text-slate-600">{selectedPayroll.teacherName}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-sm text-slate-500">
                        Tháng {selectedPayroll.month}/{selectedPayroll.year}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </button>
                </div>
                
                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)] space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-500 mb-2">
                        <BookOpen className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Tổng số buổi</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-800">{selectedPayroll.totalSessions}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-100">
                      <div className="flex items-center gap-2 text-purple-500 mb-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider">Tổng lương</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">{formatCurrency(selectedPayroll.amount)}đ</p>
                    </div>
                  </div>
                  
                  {/* Sessions List */}
                  {selectedPayroll.details && selectedPayroll.details.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-purple-500" />
                        Chi tiết các buổi dạy
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {selectedPayroll.details.map((session: any, idx: number) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex justify-between items-start flex-wrap gap-2">
                              <div>
                                <p className="font-medium text-slate-800">{session.subjectName}</p>
                                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                                  <span>📅 {session.sessionDate}</span>
                                  <span>⏱ {session.workedHours} giờ</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-purple-600">{formatCurrency(session.amount)}đ</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDetailModal(false)}
                    className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all"
                  >
                    Đóng
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PayrollListTab;