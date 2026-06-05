import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, Calendar, DollarSign, BookOpen, User, Info, Shield, Bell } from 'lucide-react';
import { payrollApi } from '../../../utils/api/payroll.api';
import type { PayrollListItem } from '../../../utils/types/payroll';
import './payroll.css';

interface PayrollWaitingTabProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  refreshTrigger: number;
}

// Animation variants
const cardVariants : Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' },
  }),
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

const infoCardVariants : Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, delay: 0.1 } },
};

// Skeleton loader
const WaitingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-slate-200" />
              <div className="space-y-2">
                <div className="h-5 w-48 bg-slate-200 rounded" />
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-4 w-40 bg-slate-200 rounded" />
              </div>
            </div>
            <div className="h-10 w-28 bg-slate-200 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
    <div className="h-64 rounded-2xl bg-white border border-slate-200 shadow-sm p-6 animate-pulse" />
  </div>
);

// Empty state component
const EmptyState: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="rounded-2xl bg-white border border-slate-200 shadow-sm p-12 text-center"
  >
    <div className="flex justify-center mb-4">
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-emerald-500" />
      </div>
    </div>
    <h3 className="text-lg font-semibold text-slate-700 mb-2">Không có bảng lương chờ xác nhận</h3>
    <p className="text-sm text-slate-400 max-w-sm mx-auto">
      Bạn đã xác nhận tất cả bảng lương của mình. Hãy kiểm tra lại sau nếu có bảng lương mới.
    </p>
  </motion.div>
);

// Admin view - hiển thị danh sách nhưng không có nút xác nhận
const AdminView: React.FC<{ payrolls: PayrollListItem[] }> = ({ payrolls }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
          <Shield className="h-4 w-4 text-slate-600" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-700">Chế độ xem (Admin)</h4>
          <p className="text-xs text-slate-400">Bạn đang xem danh sách chờ xác nhận của giáo viên</p>
        </div>
      </div>
    </div>
    
    {payrolls.map((payroll, idx) => (
      <motion.div
        key={payroll.paymentId}
        custom={idx}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="group relative rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden opacity-75"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-400 to-slate-500" />
        
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-slate-500" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h5 className="font-bold text-lg text-slate-800">
                  Bảng lương tháng {payroll.month}/{payroll.year}
                </h5>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  <Bell className="h-3 w-3" />
                  Chờ xác nhận
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-2">
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>{payroll.teacherName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{payroll.totalSessions} buổi</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-slate-500" />
                <span className="text-lg font-bold text-slate-600">
                  {payroll.amount.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </div>
          
          {/* Nút xác nhận bị vô hiệu hóa cho admin */}
          <button
            disabled
            className="flex-shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-200 text-slate-400 cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Chỉ giáo viên mới xác nhận
          </button>
        </div>
      </motion.div>
    ))}
  </div>
);

// Payroll waiting card component (cho giáo viên)
const PayrollWaitingCard: React.FC<{
  payroll: PayrollListItem;
  onConfirm: (id: number) => void;
  isConfirming: boolean;
  index: number;
}> = ({ payroll, onConfirm, isConfirming, index }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="group relative rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
      
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h5 className="font-bold text-lg text-slate-800">
                Bảng lương tháng {payroll.month}/{payroll.year}
              </h5>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                <Bell className="h-3 w-3" />
                Chờ xác nhận
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-2">
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>{payroll.teacherName}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{payroll.totalSessions} buổi</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Tạo: {new Date(payroll.paymentDate).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-purple-500" />
              <span className="text-lg font-bold text-purple-600">{formatCurrency(payroll.amount)}đ</span>
            </div>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onConfirm(payroll.paymentId)}
          disabled={isConfirming}
          className="flex-shrink-0 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-200 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
        >
          {isConfirming ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Xác nhận
            </>
          )}
        </motion.button>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-purple-50/0 to-purple-100/0 group-hover:via-purple-50/10 transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
};

// Info widget component
const InfoWidget: React.FC = () => (
  <motion.div
    variants={infoCardVariants}
    initial="hidden"
    animate="visible"
    className="rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 shadow-sm overflow-hidden sticky top-6"
  >
    <div className="p-5 border-b border-purple-100">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100">
          <Info className="h-4 w-4 text-purple-600" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-800">Hướng dẫn xác nhận</h4>
          <p className="text-xs text-slate-400">Vui lòng kiểm tra kỹ thông tin</p>
        </div>
      </div>
    </div>
    
    <div className="p-5 space-y-4">
      <div className="space-y-3">
        {[
          { step: 1, text: 'Kiểm tra kỹ số buổi dạy trong tháng', icon: '📋' },
          { step: 2, text: 'Xác nhận nếu thông tin chính xác', icon: '✅' },
          { step: 3, text: 'Liên hệ quản lý nếu có sai sót', icon: '📞' },
        ].map((item) => (
          <div key={item.step} className="flex items-start gap-3">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">
              {item.step}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">{item.icon}</span>
              <span className="text-sm text-slate-600">{item.text}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Sau khi xác nhận, bảng lương sẽ được chuyển đến quản trị viên để chốt lương. Hành động này không thể hoàn tác.
          </p>
        </div>
      </div>
      
      <div className="mt-2 pt-3 border-t border-purple-100">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="h-3 w-3" />
          <span>Thời gian xử lý: 1-2 ngày làm việc</span>
        </div>
      </div>
    </div>
  </motion.div>
);

const PayrollWaitingTab: React.FC<PayrollWaitingTabProps> = ({ showToast, refreshTrigger }) => {
  const [waitingPayrolls, setWaitingPayrolls] = useState<PayrollListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  
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
          role: user.role || 'TEACHER'
        });
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
  }, []);

  useEffect(() => {
    fetchWaitingPayrolls();
  }, [refreshTrigger]);

  const fetchWaitingPayrolls = async () => {
    try {
      setLoading(true);
      const allPayrolls = await payrollApi.getAllPayrolls();
      
      let waiting = allPayrolls.filter(p => p.status === 'WAITING_TEACHER_CONFIRMATION');
      
      if (currentUser.role === 'TEACHER' && currentUser.id) {
        waiting = waiting.filter(p => p.teacherId === currentUser.id);
      }
      
      setWaitingPayrolls(waiting);
    } catch (error) {
      console.error('Failed to fetch waiting payrolls:', error);
      showToast('Không thể tải danh sách chờ xác nhận', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (paymentId: number) => {
    if (currentUser.role !== 'TEACHER') {
      showToast('Chỉ giáo viên mới có thể xác nhận bảng lương', 'error');
      return;
    }

    setConfirmingId(paymentId);
    try {
      await payrollApi.confirmPayroll({
        paymentId: paymentId,
        teacherFeedback: 'Tôi xác nhận bảng lương này là chính xác.'
      });
      showToast('Xác nhận bảng lương thành công', 'success');
      await fetchWaitingPayrolls();
    } catch (error) {
      showToast('Không thể xác nhận bảng lương', 'error');
    } finally {
      setConfirmingId(null);
    }
  };

  if (loading) {
    return <WaitingSkeleton />;
  }

  // Trường hợp ADMIN: hiển thị danh sách nhưng không có nút xác nhận
  if (currentUser.role === 'ADMIN') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {waitingPayrolls.length > 0 ? (
            <AdminView payrolls={waitingPayrolls} />
          ) : (
            <EmptyState />
          )}
        </div>
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-slate-500" />
              <h4 className="font-semibold text-slate-700">Chế độ xem</h4>
            </div>
            <p className="text-sm text-slate-500">
              Bạn đang ở chế độ <strong className="text-slate-700">Quản trị viên</strong>. 
              Các bảng lương chờ xác nhận hiển thị để tham khảo. Vui lòng chuyển sang tab 
              <strong className="text-purple-600"> "Danh sách bảng lương"</strong> để chốt lương.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Trường hợp TEACHER: hiển thị đầy đủ với nút xác nhận
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <AnimatePresence mode="wait">
          {waitingPayrolls.length > 0 ? (
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between mb-4"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700">Chờ xác nhận</h4>
                    <p className="text-xs text-slate-400">{waitingPayrolls.length} bảng lương cần xem xét</p>
                  </div>
                </div>
              </motion.div>
              
              {waitingPayrolls.map((payroll, idx) => (
                <PayrollWaitingCard
                  key={payroll.paymentId}
                  payroll={payroll}
                  onConfirm={handleConfirm}
                  isConfirming={confirmingId === payroll.paymentId}
                  index={idx}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </AnimatePresence>
      </div>

      <div className="lg:col-span-1">
        <InfoWidget />
      </div>
    </div>
  );
};

export default PayrollWaitingTab;