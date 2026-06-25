// src/components/adminComponents/leaves/teacher/CreateLeaveModal.tsx
import { useState, useEffect } from 'react';
import {
  X, Calendar, Clock, AlertCircle, BookOpen, MapPin,
  Info, CheckCircle, GraduationCap, Briefcase, Heart,
  DollarSign, User, Calendar as CalendarIcon, Star, Loader2,
  Globe, Zap, Scroll, Cpu, Activity, Beaker, Shield,
  Sparkles, ChevronDown, CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PreviewAffectedSessionResponse } from '../../../../utils/types/teacherLeave';

interface CreateLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    reason?: string;
    leaveType: string;
  }) => Promise<void>;
  onPreview: (data: {
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
  }) => Promise<PreviewAffectedSessionResponse[]>;
  previewSessions: PreviewAffectedSessionResponse[];
  previewLoading: boolean;
}

// Hàm xử lý tên bị lỗi Hibernate proxy
const cleanDisplayName = (name: string): string => {
  if (!name) return 'Chưa có phòng';

  let cleaned = name;

  const patternsToRemove = [
    /com\.management\.student_center\.entity\.\w+(\$HibernateProxy)?/gi,
    /com\.management\.student_center\.dto\.\w+/gi,
    /\.entity\.\w+(\$HibernateProxy)?/gi,
    /\$HibernateProxy/gi,
    /HibernateProxy/gi,
  ];

  for (const pattern of patternsToRemove) {
    cleaned = cleaned.replace(pattern, '');
  }

  if (!cleaned.match(/^P\.\d+/i) && !cleaned.toLowerCase().startsWith('phòng')) {
    if (cleaned.includes(' - ')) {
      const parts = cleaned.split(' - ');
      cleaned = parts[parts.length - 1];
    }
  }

  cleaned = cleaned.trim();

  if (!cleaned || cleaned.length === 0 || cleaned === '-') {
    return 'Chưa có phòng';
  }

  return cleaned;
};

const LEAVE_TYPES = [
  { value: 'ANNUAL', label: 'Nghỉ phép năm', icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { value: 'SICK', label: 'Nghỉ ốm', icon: Heart, color: 'text-rose-600', bgColor: 'bg-rose-50' },
  { value: 'PERSONAL', label: 'Nghỉ việc riêng', icon: User, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  { value: 'UNPAID', label: 'Nghỉ không lương', icon: DollarSign, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  { value: 'OTHER', label: 'Khác', icon: Star, color: 'text-purple-600', bgColor: 'bg-purple-50' },
];

// Hàm lấy icon cho môn học
const getSubjectIcon = (subjectName: string) => {
  const cleanName_sub = cleanDisplayName(subjectName).toLowerCase();

  const icons: Record<string, { icon: typeof BookOpen, color: string }> = {
    'toán': { icon: GraduationCap, color: 'text-indigo-600' },
    'văn': { icon: BookOpen, color: 'text-purple-600' },
    'ngữ văn': { icon: BookOpen, color: 'text-purple-600' },
    'anh': { icon: Globe, color: 'text-emerald-600' },
    'tiếng anh': { icon: Globe, color: 'text-emerald-600' },
    'lý': { icon: Zap, color: 'text-amber-600' },
    'vật lý': { icon: Zap, color: 'text-amber-600' },
    'hóa': { icon: Beaker, color: 'text-emerald-600' },
    'hóa học': { icon: Beaker, color: 'text-emerald-600' },
    'sinh': { icon: Activity, color: 'text-teal-600' },
    'sinh học': { icon: Activity, color: 'text-teal-600' },
    'sử': { icon: Scroll, color: 'text-orange-600' },
    'lịch sử': { icon: Scroll, color: 'text-orange-600' },
    'địa': { icon: Globe, color: 'text-sky-600' },
    'địa lý': { icon: Globe, color: 'text-sky-600' },
    'gdcd': { icon: Shield, color: 'text-indigo-600' },
    'công dân': { icon: Shield, color: 'text-indigo-600' },
    'tin': { icon: Cpu, color: 'text-slate-600' },
    'tin học': { icon: Cpu, color: 'text-slate-600' },
    'thể dục': { icon: Activity, color: 'text-lime-600' },
    'gdqp': { icon: Shield, color: 'text-red-700' },
  };

  for (const [key, value] of Object.entries(icons)) {
    if (cleanName_sub.includes(key)) {
      return value;
    }
  }
  return { icon: BookOpen, color: 'text-indigo-600' };
};

export const CreateLeaveModal = ({
  isOpen,
  onClose,
  onSubmit,
  onPreview,
  previewSessions,
  previewLoading
}: CreateLeaveModalProps) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    startTime: '07:30',
    endTime: '17:00',
    reason: '',
    leaveType: 'ANNUAL',
  });
  const [isAllDay, setIsAllDay] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        startDate: '',
        endDate: '',
        startTime: '07:30',
        endTime: '17:00',
        reason: '',
        leaveType: 'ANNUAL',
      });
      setIsAllDay(true);
      setError('');
      setShowToast(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && formData.startDate) {
      const timer = setTimeout(() => {
        onPreview({
          startDate: formData.startDate,
          endDate: formData.endDate || formData.startDate,
          startTime: isAllDay ? undefined : formData.startTime,
          endTime: isAllDay ? undefined : formData.endTime,
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.startDate, formData.endDate, formData.startTime, formData.endTime, isAllDay]);

  const handleSubmit = async () => {
  if (!formData.startDate) {
    setError('Vui lòng chọn ngày bắt đầu');
    return;
  }
  if (!formData.leaveType) {
    setError('Vui lòng chọn loại nghỉ');
    return;
  }

  setSubmitting(true);
  setError('');
  try {
    await onSubmit({
      startDate: formData.startDate,
      endDate: formData.endDate || formData.startDate,
      startTime: isAllDay ? undefined : formData.startTime,
      endTime: isAllDay ? undefined : formData.endTime,
      reason: formData.reason,
      leaveType: formData.leaveType,
    });

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    onClose();
  } catch (err: any) {
    if (err?.response?.status === 400 || err?.status === 400) {
      const errorMessage = err?.response?.data?.message || err?.message || '';
      
      if (errorMessage.toLowerCase().includes('đã có đơn') || 
          errorMessage.toLowerCase().includes('trùng') ||
          errorMessage.toLowerCase().includes('duplicate') ||
          errorMessage.toLowerCase().includes('existing leave request')) {
        setError('Bạn đã có đơn xin nghỉ trong khoảng thời gian này. Vui lòng kiểm tra lại!');
      } else {
        setError(errorMessage || 'Dữ liệu không hợp lệ, vui lòng kiểm tra lại');
      }
    } else {
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
    }
  } finally {
    setSubmitting(false);
  }
};

  const getSelectedType = () => {
    return LEAVE_TYPES.find(t => t.value === formData.leaveType) || LEAVE_TYPES[0];
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  const SelectedType = getSelectedType();
  const SelectedIcon = SelectedType.icon;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50"
            >
              {/* Decorative gradient header */}
              <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-indigo-50/80 via-white to-transparent dark:from-indigo-950/30 dark:via-slate-900/50">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-400/10 to-violet-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl btn-gradient text-white shadow-lg shadow-indigo-500/25">
                      <SelectedIcon size={22} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Tạo đơn nghỉ mới
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        Vui lòng điền đầy đủ thông tin để hệ thống rà soát lịch dạy
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-200px)] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Column 1 - Form nhập liệu */}
                  <div className="space-y-5">
                    {/* Loại nghỉ */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        <Briefcase size={16} className="text-indigo-500" />
                        Loại nghỉ <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          className={`
                            w-full px-4 py-2.5 rounded-xl border-2 
                            bg-white dark:bg-slate-800/50
                            text-slate-900 dark:text-white text-sm
                            transition-all duration-200
                            focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                            hover:border-slate-300 dark:hover:border-slate-600
                            cursor-pointer appearance-none
                            pr-10
                            border-slate-200 dark:border-slate-700
                          `}
                          value={formData.leaveType}
                          onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                        >
                          {LEAVE_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Ngày bắt đầu & Kết thúc */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          <Calendar size={16} className="text-indigo-500" />
                          Ngày bắt đầu <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="date"
                          className={`
                            w-full px-4 py-2.5 rounded-xl border-2 
                            bg-white dark:bg-slate-800/50
                            text-slate-900 dark:text-white text-sm
                            transition-all duration-200
                            focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                            hover:border-slate-300 dark:hover:border-slate-600
                            border-slate-200 dark:border-slate-700
                          `}
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          <Calendar size={16} className="text-indigo-500" />
                          Ngày kết thúc
                        </label>
                        <input
                          type="date"
                          className={`
                            w-full px-4 py-2.5 rounded-xl border-2 
                            bg-white dark:bg-slate-800/50
                            text-slate-900 dark:text-white text-sm
                            transition-all duration-200
                            focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                            hover:border-slate-300 dark:hover:border-slate-600
                            border-slate-200 dark:border-slate-700
                          `}
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Checkbox Nghỉ cả ngày - Phiên bản hiện đại */}
                    <div className="relative">
                      <label className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-slate-50/70 to-white dark:from-slate-800/30 dark:to-slate-900/50 border-2 border-slate-200/60 dark:border-slate-700/60 hover:border-indigo-200/60 dark:hover:border-indigo-700/40 transition-all duration-300 cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl transition-all duration-300 ${isAllDay ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-700/40 text-slate-400 dark:text-slate-500'}`}>
                            <CalendarDays size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              Nghỉ cả ngày
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              {isAllDay ? 'Không cần chọn giờ cụ thể' : 'Sẽ chọn giờ bắt đầu và kết thúc'}
                            </p>
                          </div>
                        </div>

                        {/* Custom Radio/Circle Checkbox */}
                        <div className="relative flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={isAllDay}
                            onChange={(e) => setIsAllDay(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`
        w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center
        ${isAllDay
                              ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-600 dark:bg-indigo-400 shadow-lg shadow-indigo-500/25'
                              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-indigo-400 dark:group-hover:border-indigo-500'
                            }
      `}>
                            {isAllDay && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 15, stiffness: 300 }}
                              >
                                <CheckCircle size={14} className="text-white" />
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Giờ học (nếu không nghỉ cả ngày) */}
                    {!isAllDay && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                              <Clock size={16} className="text-indigo-500" />
                              Giờ bắt đầu
                            </label>
                            <input
                              type="time"
                              className={`
                                w-full px-4 py-2.5 rounded-xl border-2 
                                bg-white dark:bg-slate-800/50
                                text-slate-900 dark:text-white text-sm
                                transition-all duration-200
                                focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                                hover:border-slate-300 dark:hover:border-slate-600
                                border-slate-200 dark:border-slate-700
                              `}
                              value={formData.startTime}
                              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                              <Clock size={16} className="text-indigo-500" />
                              Giờ kết thúc
                            </label>
                            <input
                              type="time"
                              className={`
                                w-full px-4 py-2.5 rounded-xl border-2 
                                bg-white dark:bg-slate-800/50
                                text-slate-900 dark:text-white text-sm
                                transition-all duration-200
                                focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                                hover:border-slate-300 dark:hover:border-slate-600
                                border-slate-200 dark:border-slate-700
                              `}
                              value={formData.endTime}
                              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Lý do nghỉ */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        <Info size={16} className="text-indigo-500" />
                        Lý do nghỉ
                      </label>
                      <textarea
                        className={`
                          w-full px-4 py-2.5 rounded-xl border-2 
                          bg-white dark:bg-slate-800/50
                          text-slate-900 dark:text-white text-sm
                          transition-all duration-200
                          focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                          hover:border-slate-300 dark:hover:border-slate-600
                          resize-none
                          border-slate-200 dark:border-slate-700
                          min-h-[100px]
                        `}
                        rows={4}
                        placeholder="Nhập lý do chi tiết..."
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      />
                    </div>

                    {/* Error message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 flex items-start gap-2"
                      >
                        <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
                      </motion.div>
                    )}
                  </div>

                  {/* Column 2 - Danh sách buổi học bị ảnh hưởng */}
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                          <CalendarDays size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Buổi học bị ảnh hưởng
                          </h4>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {previewSessions.length > 0
                              ? `${previewSessions.length} buổi học sẽ bị ảnh hưởng`
                              : 'Chưa có buổi học nào'}
                          </p>
                        </div>
                      </div>
                      {previewSessions.length > 0 && (
                        <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 px-3 py-1.5 rounded-full">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{previewSessions.length} tiết</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                      {previewLoading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                          <div className="relative">
                            <div className="w-12 h-12 border-4 border-indigo-100 dark:border-indigo-900/30 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-3 h-3 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                            </div>
                          </div>
                          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Đang kiểm tra lịch dạy...</p>
                        </div>
                      ) : !formData.startDate ? (
                        <div className="bg-gradient-to-br from-slate-50/70 to-white dark:from-slate-800/30 dark:to-slate-900/50 rounded-2xl p-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                          <CalendarIcon size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-400 dark:text-slate-500 font-medium">Chọn ngày để xem các buổi học bị ảnh hưởng</p>
                          <p className="text-slate-300 dark:text-slate-600 text-xs mt-1">Hệ thống sẽ tự động rà soát lịch dạy của bạn</p>
                        </div>
                      ) : previewSessions.length === 0 ? (
                        <div className="bg-gradient-to-br from-emerald-50/70 to-white dark:from-emerald-950/20 dark:to-slate-900/50 rounded-2xl p-10 text-center border-2 border-emerald-100 dark:border-emerald-800/30">
                          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={28} className="text-emerald-500 dark:text-emerald-400" />
                          </div>
                          <p className="text-emerald-700 dark:text-emerald-400 font-semibold">Không có buổi học nào bị ảnh hưởng</p>
                          <p className="text-emerald-500 dark:text-emerald-500/70 text-sm mt-1">Trong khoảng thời gian này bạn không có lịch dạy</p>
                        </div>
                      ) : (
                        previewSessions.map((session, idx) => {
                          const cleanSubjectName = cleanDisplayName(session.subjectName);
                          const cleanRoomName = cleanDisplayName(session.roomName || '');
                          const { icon: SubjectIcon, color: iconColor } = getSubjectIcon(session.subjectName);
                          const startTimeFormatted = formatTime(session.startTime);
                          const endTimeFormatted = formatTime(session.endTime);

                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="group relative overflow-hidden bg-white dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:shadow-md dark:hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer"
                            >
                              {/* Background decoration */}
                              <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/0 via-indigo-50/0 to-indigo-50/50 dark:from-indigo-950/0 dark:via-indigo-950/0 dark:to-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                              <div className="relative px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {/* Subject Icon */}
                                  <div className={`flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/40 dark:to-indigo-900/30 flex items-center justify-center group-hover:scale-105 transition-transform ${iconColor}`}>
                                    <SubjectIcon size={16} />
                                  </div>

                                  {/* Content - all in one row */}
                                  <div className="flex-1 min-w-0 flex items-center gap-3">
                                    {/* Subject Name */}
                                    <h5 className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate max-w-[140px]">
                                      {cleanSubjectName}
                                    </h5>

                                    {/* Time badge */}
                                    <div className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-full flex-shrink-0">
                                      <Clock size={10} className="text-slate-400 dark:text-slate-500" />
                                      <span className="text-slate-600 dark:text-slate-400 font-medium">{startTimeFormatted}</span>
                                      <span className="text-slate-300 dark:text-slate-600">•</span>
                                      <span className="text-slate-600 dark:text-slate-400 font-medium">{endTimeFormatted}</span>
                                    </div>

                                    {/* Room */}
                                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                                      <MapPin size={11} className="text-slate-400 dark:text-slate-500" />
                                      <span className="truncate max-w-[100px]">{cleanRoomName}</span>
                                    </div>

                                    {/* Status badge */}
                                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
                                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500 animate-pulse" />
                                      <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 tracking-wider whitespace-nowrap">
                                        Có thể dạy bù
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>

                    {/* Info card */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-violet-50/70 dark:from-indigo-950/30 dark:to-violet-950/30 border border-indigo-100/60 dark:border-indigo-800/30"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                          <Info size={14} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400">Thông tin</p>
                      </div>
                      <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 leading-relaxed">
                        Hệ thống sẽ tự động thông báo cho quản trị viên và gửi yêu cầu
                        sắp xếp dạy bù sau khi đơn được duyệt.
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30 flex items-center justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy bỏ
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={submitting || !formData.startDate}
                  className="px-6 py-2.5 rounded-xl btn-gradient text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Tạo đơn nghỉ
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 dark:bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3"
          >
            <CheckCircle size={20} className="text-emerald-400" />
            <span className="text-sm font-medium">Đơn nghỉ của bạn đã được gửi thành công!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};