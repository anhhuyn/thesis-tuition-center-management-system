// src/pages/payroll/teacher/TeacherPayrollPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, FileText, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { payrollApi } from '../../utils/api/payroll.api';
import { teacherApi } from '../../utils/api';
import type { TeacherPayrollSummary, PayrollDetailResponse } from '../../utils/types/payroll';
import { TeacherPayrollHeader } from '../../components/adminComponents/payroll/teacherpayroll/TeacherPayrollHeader';
import { TeacherPayrollStats } from '../../components/adminComponents/payroll/teacherpayroll/TeacherPayrollStats';
import { TeacherPayrollToolbar } from '../../components/adminComponents/payroll/teacherpayroll/TeacherPayrollToolbar';
import { TeacherPayrollTableRow } from '../../components/adminComponents/payroll/teacherpayroll/TeacherPayrollTableRow';
import { PayrollDetailDrawer } from '../../components/adminComponents/payroll/teacherpayroll/TeacherPayrollDetailDrawer';
import { ConfirmPayrollModal } from '../../components/adminComponents/payroll/teacherpayroll/TeacherPayrollConfirmModal';

export const TeacherPayrollPage = () => {
  const [payrolls, setPayrolls] = useState<TeacherPayrollSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollDetailResponse | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<number | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [teacherName, setTeacherName] = useState('');
  const [isLoadingTeacher, setIsLoadingTeacher] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Hàm lấy teacherId từ API
  const fetchTeacherIdFromAPI = useCallback(async (userId: number): Promise<number | null> => {
    try {
      console.log('Calling API getTeacherIdByUserId with userId:', userId);
      const response = await teacherApi.getTeacherIdByUserId(userId);
      console.log('API response:', response);
      
      // Xử lý response theo cấu trúc thực tế
      // Nếu response là { data: { teacherId: number } }
      if (response && typeof response === 'object') {
        // Trường hợp response.data có teacherId
        if (response.data && typeof response.data === 'object') {
          if (response.data.teacherId) return response.data.teacherId;
          if (response.data.id) return response.data.id;
        }
        // Trường hợp response trực tiếp có teacherId
        if (response.teacherId) return response.teacherId;
        if (response.userId) return response.userId;
      }
      
      // Nếu response trực tiếp là số
      if (typeof response === 'number') return response;
      
      console.error('Cannot extract teacherId from response:', response);
      return null;
    } catch (error) {
      console.error('API call failed:', error);
      return null;
    }
  }, []);

  // Lấy thông tin giáo viên
  useEffect(() => {
    const getTeacherInfo = async () => {
      setIsLoadingTeacher(true);
      setApiError(null);
      
      try {
        // 1. Lấy token từ localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          setApiError('Không tìm thấy token đăng nhập');
          setIsLoadingTeacher(false);
          return;
        }

        // 2. Decode token để lấy userId
        let userId: number | null = null;
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('Decoded token payload:', payload);
          userId = payload.userId || payload.id || payload.sub;
          
          if (!userId) {
            setApiError('Token không chứa userId');
            setIsLoadingTeacher(false);
            return;
          }
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
          setApiError('Token không hợp lệ');
          setIsLoadingTeacher(false);
          return;
        }

        // 3. Gọi API lấy teacherId từ userId
        const teacherIdValue = await fetchTeacherIdFromAPI(userId);
        
        if (teacherIdValue) {
          console.log('Successfully got teacherId:', teacherIdValue);
          setTeacherId(teacherIdValue);
          
          // Lấy tên giáo viên từ localStorage hoặc từ user object
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            setTeacherName(user.fullName || user.name || `Giáo viên ${teacherIdValue}`);
          } else {
            setTeacherName(`Giáo viên ${teacherIdValue}`);
          }
          
          // Lưu lại để dùng sau
          localStorage.setItem('teacherId', teacherIdValue.toString());
        } else {
          setApiError('Không thể lấy teacherId từ API');
        }
      } catch (error) {
        console.error('Error in getTeacherInfo:', error);
        setApiError('Có lỗi xảy ra khi lấy thông tin giáo viên');
      } finally {
        setIsLoadingTeacher(false);
      }
    };

    getTeacherInfo();
  }, [fetchTeacherIdFromAPI]);

  // Lấy danh sách bảng lương
  const fetchPayrolls = useCallback(async () => {
    if (!teacherId) return;
    
    setLoading(true);
    try {
      console.log('Fetching payrolls for teacherId:', teacherId);
      const data = await payrollApi.getMyPayrolls(teacherId);
      console.log('Payrolls received:', data);
      setPayrolls(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch payrolls error:', error);
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    if (teacherId) {
      fetchPayrolls();
    }
  }, [teacherId, fetchPayrolls]);

  // Lọc dữ liệu
  const filteredPayrolls = payrolls.filter(payroll => {
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      const matchMonth = payroll.month.toString().includes(keyword);
      const matchYear = payroll.year.toString().includes(keyword);
      const matchPeriod = `${payroll.month}/${payroll.year}`.includes(keyword);
      if (!matchMonth && !matchYear && !matchPeriod) return false;
    }
    
    if (statusFilter && statusFilter !== 'all') {
      if (payroll.status !== statusFilter) return false;
    }
    
    return true;
  });

  // Thống kê
  const stats = {
    totalPayrolls: payrolls.length,
    totalAmount: payrolls.reduce((sum, p) => sum + p.amount, 0),
    totalSessions: payrolls.reduce((sum, p) => sum + p.totalSessions, 0),
    pendingCount: payrolls.filter(p => p.status === 'WAITING_TEACHER_CONFIRMATION').length,
    confirmedCount: payrolls.filter(p => p.status === 'TEACHER_CONFIRMED').length,
    finalizedCount: payrolls.filter(p => p.status === 'FINALIZED').length,
  };

  // Handlers
  const handleViewDetail = async (paymentId: number) => {
    if (!teacherId) return;
    
    setDetailLoading(true);
    setIsDetailDrawerOpen(true);
    try {
      const detail = await payrollApi.getMyPayrollDetail(paymentId, teacherId);
      setSelectedPayroll(detail);
    } catch (error) {
      console.error('Get detail error:', error);
      setSelectedPayroll(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleConfirmPayroll = async (paymentId: number) => {
    setConfirmingPaymentId(paymentId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!confirmingPaymentId) return;
    
    setConfirmLoading(true);
    try {
      await payrollApi.confirmPayroll({
        paymentId: confirmingPaymentId,
        teacherFeedback: 'Tôi xác nhận bảng lương này là chính xác.'
      });
      
      await fetchPayrolls();
      
      if (selectedPayroll?.paymentId === confirmingPaymentId && teacherId) {
        const updatedDetail = await payrollApi.getMyPayrollDetail(confirmingPaymentId, teacherId);
        setSelectedPayroll(updatedDetail);
      }
      
      setIsConfirmModalOpen(false);
      alert('Xác nhận bảng lương thành công!');
    } catch (error: any) {
      console.error('Confirm error:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau');
    } finally {
      setConfirmLoading(false);
      setConfirmingPaymentId(null);
    }
  };

  const handleRefresh = () => {
    fetchPayrolls();
  };

  const handleExport = () => {
    if (!teacherId) return;
    
    const exportData = {
      teacherId: teacherId,
      teacherName: teacherName,
      exportedAt: new Date().toISOString(),
      payrolls: filteredPayrolls,
      summary: stats
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date();
    a.download = `payroll_${teacherId}_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Loading state
  if (isLoadingTeacher) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin giáo viên...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (apiError || !teacherId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <AlertCircle size={64} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không thể tải thông tin giáo viên</h2>
          <p className="text-gray-600 mb-4">{apiError || 'Không tìm thấy teacherId'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <TeacherPayrollHeader 
          teacherName={teacherName}
          teacherId={teacherId}
          onRefresh={handleRefresh}
        />

        <TeacherPayrollStats stats={stats} />

        <TeacherPayrollToolbar
          searchKeyword={searchKeyword}
          onSearchChange={setSearchKeyword}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onExport={handleExport}
          onRefresh={handleRefresh}
        />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              📋 Bảng lương của tôi
              {filteredPayrolls.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredPayrolls.length} bảng)
                </span>
              )}
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl p-12 text-center"
              >
                <div className="inline-block rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600 animate-spin" />
                <p className="mt-3 text-gray-500">Đang tải dữ liệu...</p>
              </motion.div>
            ) : filteredPayrolls.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl p-12 text-center border border-gray-100"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <DollarSign size={28} className="text-gray-400" />
                </div>
                <p className="text-gray-500">Chưa có bảng lương nào</p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchKeyword || statusFilter ? 'Thử thay đổi bộ lọc tìm kiếm' : 'Liên hệ quản trị viên để được hỗ trợ'}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <AnimatePresence>
                  {filteredPayrolls.map((payroll, index) => (
                    <motion.div
                      key={payroll.paymentId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TeacherPayrollTableRow
                        payroll={payroll}
                        onViewDetail={handleViewDetail}
                        onConfirm={handleConfirmPayroll}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <PayrollDetailDrawer
          isOpen={isDetailDrawerOpen}
          onClose={() => {
            setIsDetailDrawerOpen(false);
            setSelectedPayroll(null);
          }}
          payroll={selectedPayroll}
          loading={detailLoading}
          onConfirm={() => {
            if (selectedPayroll) {
              setIsDetailDrawerOpen(false);
              handleConfirmPayroll(selectedPayroll.paymentId);
            }
          }}
        />

        <ConfirmPayrollModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setConfirmingPaymentId(null);
          }}
          onConfirm={handleConfirmSubmit}
          loading={confirmLoading}
          payroll={selectedPayroll}
        />
      </div>
    </div>
  );
};