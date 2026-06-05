import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSpreadsheet, 
  Search, 
  Loader2, 
  UserCheck, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Users,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import type { PayrollFilter, PayrollPreviewResponse } from '../../../utils/types/payroll';
import { payrollApi } from '../../../utils/api/payroll.api';
import { teacherApi } from '../../../utils/api/teacher.api';
import './payroll.css';

interface PayrollPreviewTabProps {
  filters: PayrollFilter;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onSuccess: () => void;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const sessionVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.2 }
  })
};

// Skeleton loader
const PreviewSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 animate-pulse">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 rounded" />
          <div className="h-4 w-32 bg-slate-200 rounded" />
        </div>
        <div className="text-right space-y-1">
          <div className="h-3 w-20 bg-slate-200 rounded" />
          <div className="h-8 w-16 bg-slate-200 rounded" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-8 w-32 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
      <div className="h-6 w-32 bg-slate-200 rounded mb-4 animate-pulse" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  </div>
);

// Empty state component
const EmptyPreviewState: React.FC = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 shadow-sm p-12 text-center"
  >
    <div className="flex justify-center mb-4">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
        <FileSpreadsheet className="w-10 h-10 text-purple-400" />
      </div>
    </div>
    <h3 className="text-lg font-semibold text-slate-700 mb-2">Chưa có dữ liệu xem trước</h3>
    <p className="text-sm text-slate-400 max-w-sm mx-auto">
      Tìm và chọn giáo viên từ danh sách bên trái, sau đó nhấn "Xem trước lương" để hiển thị thông tin chi tiết
    </p>
    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
      <span className="flex items-center gap-1"><Search className="w-3 h-3" /> Tìm kiếm</span>
      <span>→</span>
      <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> Chọn giáo viên</span>
      <span>→</span>
      <span className="flex items-center gap-1"><FileSpreadsheet className="w-3 h-3" /> Xem trước</span>
    </div>
  </motion.div>
);

const PayrollPreviewTab: React.FC<PayrollPreviewTabProps> = ({ filters, showToast, onSuccess }) => {
  const [previewData, setPreviewData] = useState<PayrollPreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ userId: number; name: string; email?: string }>>([]);
  const [searching, setSearching] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<{ teacherId: number; name: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // ========== 1. TÌM KIẾM GIÁO VIÊN THEO TÊN (GIỮ NGUYÊN) ==========
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    console.log('🔍 Searching for teacher:', searchTerm);
    
    try {
      const response = await teacherApi.getAll(1, 50, { name: searchTerm });
      console.log('📥 Search response:', response);
      
      if (response.success && response.data && response.data.length > 0) {
        const results = response.data.map((teacher: any) => ({
          userId: teacher.id,
          name: teacher.fullName,
          email: teacher.email
        }));
        console.log('✅ Found users:', results);
        setSearchResults(results);
        setShowDropdown(true);
      } else {
        console.log('❌ No teachers found');
        setSearchResults([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      showToast('Không thể tìm kiếm giáo viên', 'error');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchTerm, showToast]);

  // Debounce tìm kiếm (GIỮ NGUYÊN)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm && searchTerm.length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, handleSearch]);

  // ========== 2. CHỌN GIÁO VIÊN (GIỮ NGUYÊN) ==========
  const handleSelectTeacher = async (user: { userId: number; name: string; email?: string }) => {
    console.log('👤 Selected user ID:', user.userId);
    setSearching(true);
    
    try {
      const response = await teacherApi.getTeacherIdByUserId(user.userId);
      console.log('📥 Teacher ID response:', response);
      
      const teacherId = response.teacherId;
      
      if (!teacherId) {
        showToast('Không tìm thấy mã giáo viên cho người dùng này', 'error');
        return;
      }
      
      setSelectedTeacher({ teacherId: teacherId, name: user.name });
      setSearchTerm(user.name);
      setShowDropdown(false);
      setPreviewData(null);
      showToast(`Đã chọn giáo viên: ${user.name}`, 'success');
    } catch (error) {
      console.error('Failed to get teacher ID:', error);
      showToast('Không thể lấy thông tin giáo viên', 'error');
    } finally {
      setSearching(false);
    }
  };

  // ========== 3. XEM TRƯỚC LƯƠNG (GIỮ NGUYÊN) ==========
  const handlePreview = async () => {
    if (!selectedTeacher) {
      showToast('Vui lòng chọn giáo viên từ danh sách tìm kiếm', 'info');
      return;
    }

    console.log('📊 Previewing payroll for Teacher ID:', selectedTeacher.teacherId);

    setLoading(true);
    try {
      const data = await payrollApi.previewPayroll({
        teacherId: selectedTeacher.teacherId,
        month: filters.month || new Date().getMonth() + 1,
        year: filters.year || new Date().getFullYear()
      });
      console.log('📊 Preview data:', data);
      setPreviewData(data);
      showToast(`Đã tìm thấy ${data.totalSessions} buổi dạy`, 'success');
    } catch (error: any) {
      console.error('Preview error:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Không thể xem trước bảng lương';
      
      if (errorMsg.includes('Teacher not found')) {
        showToast(`Không tìm thấy giáo viên với ID ${selectedTeacher.teacherId} trong hệ thống`, 'error');
      } else if (errorMsg.includes('not found') || error?.response?.status === 500) {
        showToast('Giáo viên không có buổi dạy trong tháng này', 'error');
      } else {
        showToast(errorMsg, 'error');
      }
      setPreviewData(null);
    } finally {
      setLoading(false);
    }
  };

  // ========== 4. TẠO BẢNG LƯƠNG (GIỮ NGUYÊN) ==========
  const handleGeneratePayroll = async () => {
    if (!selectedTeacher) return;

    setGenerating(true);
    try {
      await payrollApi.generatePayroll({
        teacherId: selectedTeacher.teacherId,
        month: filters.month || new Date().getMonth() + 1,
        year: filters.year || new Date().getFullYear(),
        overwriteExisting: false
      });
      showToast(`Tạo bảng lương cho ${selectedTeacher.name} thành công!`, 'success');
      onSuccess();
    } catch (error: any) {
      console.error('Generate error:', error);
      const errorMsg = error?.response?.data?.message || error?.message || '';
      if (errorMsg.includes('already generated')) {
        showToast('Bảng lương cho giáo viên này trong tháng đã được tạo trước đó', 'error');
      } else if (errorMsg.includes('Teacher not found')) {
        showToast('Giáo viên không tồn tại trong hệ thống', 'error');
      } else {
        showToast(errorMsg || 'Không thể tạo bảng lương', 'error');
      }
    } finally {
      setGenerating(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  // ========== 5. GIAO DIỆN CẢI TIẾN ==========
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Left: Teacher Search Panel */}
      <motion.div variants={itemVariants} className="lg:col-span-1">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-700">Chọn giáo viên</h4>
                <p className="text-xs text-slate-400">Tìm kiếm theo tên để xem trước lương</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Search Input */}
            <div className="relative mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="    Nhập tên giáo viên (tối thiểu 2 ký tự)..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedTeacher(null);
                  }}
                  onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                  className="w-full px-4 py-3 pl-11 pr-10 rounded-xl border border-slate-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 focus:outline-none bg-white text-slate-700 text-sm transition-all placeholder:text-slate-400"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-500 animate-spin" />
                )}
              </div>
              
              {/* Dropdown kết quả tìm kiếm */}
              <AnimatePresence>
                {showDropdown && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-20 mt-2 w-full bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden"
                  >
                    {searchResults.map((teacher, idx) => (
                      <motion.div
                        key={teacher.userId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => handleSelectTeacher(teacher)}
                        className="p-3 hover:bg-purple-50 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0 group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-700 group-hover:text-purple-700 transition-colors">{teacher.name}</p>
                            {teacher.email && (
                              <p className="text-xs text-slate-400 mt-0.5">{teacher.email}</p>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-purple-400 transition-colors" />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Thông báo khi không tìm thấy */}
              {searchTerm.length >= 2 && !searching && searchResults.length === 0 && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-amber-600 mt-1 flex items-center gap-1"
                >
                  <AlertCircle className="h-3 w-3" />
                  Không tìm thấy giáo viên nào với tên "{searchTerm}"
                </motion.p>
              )}
            </div>

            {/* Selected Teacher Info */}
            <AnimatePresence>
              {selectedTeacher && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-4 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/30 border border-purple-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-200">
                      <UserCheck className="h-3.5 w-3.5 text-purple-700" />
                    </div>
                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Đã chọn</span>
                  </div>
                  <p className="font-semibold text-slate-800">{selectedTeacher.name}</p>
                  <p className="text-xs text-purple-500 mt-0.5">Teacher ID: {selectedTeacher.teacherId}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePreview}
              disabled={!selectedTeacher || loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all btn-gradient from-purple-600 to-purple-700 text-white shadow-sm shadow-purple-200 hover:shadow-md hover:shadow-purple-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xem trước...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Xem trước lương
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Right: Preview Details */}
      <div className="lg:col-span-2">
        {loading ? (
          <PreviewSkeleton />
        ) : previewData ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            {/* Teacher Info Card - Premium */}
            <motion.div variants={itemVariants} className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="relative h-24 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600">
                <div className="absolute -bottom-8 left-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg border border-slate-100">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="pt-10 px-6 pb-6">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{previewData.teacherName}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">ID: {previewData.teacherId}</span>
                      <span className="text-xs text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
                        Tháng {previewData.month}/{previewData.year}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Tổng số buổi</p>
                    <p className="text-3xl font-bold text-purple-600">{previewData.totalSessions}</p>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Tổng lương dự kiến</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(previewData.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Sessions List - Premium */}
            <motion.div variants={itemVariants} className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <h4 className="text-sm font-semibold text-slate-700">Chi tiết các buổi dạy</h4>
                  <span className="ml-auto text-xs text-slate-400">{previewData.sessions.length} buổi</span>
                </div>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  <AnimatePresence>
                    {previewData.sessions.map((session, idx) => (
                      <motion.div
                        key={idx}
                        custom={idx}
                        variants={sessionVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ scale: 1.01 }}
                        className="group p-4 rounded-xl bg-slate-50/50 hover:bg-purple-50/30 transition-all duration-200 border border-transparent hover:border-purple-100"
                      >
                        <div className="flex flex-wrap justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-slate-700 group-hover:text-purple-700 transition-colors">
                                {session.subjectName}
                              </p>
                              {session.replacement && (
                                <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                  <Clock className="h-3 w-3" />
                                  Dạy thay
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {session.sessionDate}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {session.startTime} - {session.endTime}
                              </span>
                              <span className="flex items-center gap-1">
                                ⏱️ {session.workedHours} giờ
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-purple-600">
                              {formatCurrency(session.amount)}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {session.salaryType === 'PER_HOUR' ? '💰 Theo giờ' : '📅 Theo buổi'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Action Button */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGeneratePayroll}
              disabled={generating}
              className="w-full py-4 rounded-xl font-semibold text-white btn-gradient from-emerald-500 to-emerald-600 shadow-sm shadow-emerald-200 hover:shadow-md hover:shadow-emerald-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang tạo bảng lương...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-5 w-5" />
                  Tạo bảng lương
                </>
              )}
            </motion.button>
          </motion.div>
        ) : (
          <EmptyPreviewState />
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </motion.div>
  );
};

export default PayrollPreviewTab;