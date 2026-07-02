import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  DoorOpen,
  Tag,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  CalendarPlus2
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { roomApi } from "../../../../utils/api/room.api";
import type { Room } from "../../../../utils/types/room";
import type { AddManualSessionRequest, UpdateSessionRequest } from "../../../../utils/types/subjectSchedule";
import { subjectScheduleApi } from "../../../../utils/api/subjectSchedule.api";

interface SessionData {
  sessionDate: string;
  startTime: string;
  endTime: string;
  roomId: number | null;
  status: string;
}

interface Errors {
  sessionDate?: string;
  startTime?: string;
  endTime?: string;
  roomId?: string;
  status?: string;
  general?: string;
}

interface CreateSessionModalProps {
  subjectId: number;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: SessionData | null;
  isEdit?: boolean;
  sessionId?: number;
}

interface OutletContext {
  setAlert?: (alert: { type: "success" | "error" | "info"; message: string }) => void;
}

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Đã lên lịch", color: "blue" },
  { value: "completed", label: "Đã hoàn thành", color: "emerald" },
  { value: "canceled", label: "Đã hủy", color: "rose" },
];

export default function CreateSessionModal({
  subjectId,
  onClose,
  onSuccess,
  initialData = null,
  isEdit = false,
  sessionId,
}: CreateSessionModalProps) {
  const { setAlert } = useOutletContext<OutletContext>();

  const [formData, setFormData] = useState<SessionData>({
    sessionDate: "",
    startTime: "08:00",
    endTime: "10:00",
    roomId: null,
    status: "scheduled",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchRooms = async (): Promise<void> => {
      setLoading(true);
      try {
        const res = await roomApi.getAll();
        setRooms((res.data || []) as any);
      } catch (err) {
        console.error("Lỗi khi tải danh sách phòng:", err);
        setAlert?.({
          type: "error",
          message: "Không thể tải danh sách phòng học!",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [setAlert]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        sessionDate: initialData.sessionDate || "",
        startTime: initialData.startTime || "08:00",
        endTime: initialData.endTime || "10:00",
        roomId: initialData.roomId || null,
        status: initialData.status || "scheduled",
      });
    }
  }, [initialData]);

  // Clear field error when user starts typing
  const handleFieldChange = (field: keyof SessionData, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: "" }));
    }
    if (errors[field as keyof Errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const { sessionDate, startTime, endTime, roomId, status } = formData;
    const newErrors: Errors = {};
    const newFieldErrors: Record<string, string> = {};

    if (!sessionDate) {
      newErrors.sessionDate = "Vui lòng chọn ngày học";
      newFieldErrors.sessionDate = "Vui lòng chọn ngày học";
    }
    if (!startTime) {
      newErrors.startTime = "Vui lòng chọn giờ bắt đầu";
      newFieldErrors.startTime = "Vui lòng chọn giờ bắt đầu";
    }
    if (!endTime) {
      newErrors.endTime = "Vui lòng chọn giờ kết thúc";
      newFieldErrors.endTime = "Vui lòng chọn giờ kết thúc";
    }

    if (sessionDate && startTime && endTime) {
      const sessionStart = new Date(`${sessionDate}T${startTime}`);
      const sessionEnd = new Date(`${sessionDate}T${endTime}`);

      if (sessionEnd <= sessionStart) {
        newErrors.endTime = "Giờ kết thúc phải sau giờ bắt đầu";
        newFieldErrors.endTime = "Giờ kết thúc phải sau giờ bắt đầu";
      }

      // Check if session date is in the past
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const sessionDateObj = new Date(sessionDate);

      if (sessionDateObj < today && !isEdit) {
        newErrors.sessionDate = "Không thể tạo buổi học trong quá khứ";
        newFieldErrors.sessionDate = "Không thể tạo buổi học trong quá khứ";
      }
    }

    // Validate room selection for completed sessions
    if (status === "completed" && !roomId) {
      newErrors.roomId = "Vui lòng chọn phòng học cho buổi học đã hoàn thành";
      newFieldErrors.roomId = "Vui lòng chọn phòng học cho buổi học đã hoàn thành";
    }

    setErrors(newErrors);
    setFieldErrors(newFieldErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    // Clear previous errors
    setErrors({});
    setFieldErrors({});

    if (!validateForm()) {
      // Scroll to first error field
      const firstErrorField = document.querySelector('.has-error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSubmitting(true);
    try {
      let res;
      if (isEdit && sessionId) {
        const updateData: UpdateSessionRequest = {
          sessionDate: formData.sessionDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          roomId: formData.roomId,
          status: formData.status,
        };
        res = await subjectScheduleApi.updateSession(sessionId, updateData);

        if (res?.success === false) {

          setErrors({ general: res.message || "Có lỗi xảy ra khi cập nhật buổi học!" });
          return;
        }

        setAlert?.({
          type: "success",
          message: res?.message || "Cập nhật buổi học thành công!",
        });
      } else {
        const addData: AddManualSessionRequest = {
          subjectId: subjectId,
          sessionDate: formData.sessionDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          roomId: formData.roomId,
          status: formData.status,
        };
        res = await subjectScheduleApi.addManualSession(addData);

        if (res?.success === false) {
          setErrors({ general: res.message || "Có lỗi xảy ra khi tạo buổi học!" });
          return;
        }

        setAlert?.({
          type: "success",
          message: res?.message || "Tạo buổi học thành công!",
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Lỗi khi lưu session:", error);

      // Handle network errors or other exceptions
      const errorMessage = error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi lưu buổi học!";

      // Check if it's a validation error from the server
      if (error?.response?.data?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([key, value]) => {
          if (typeof value === 'string') {
            apiErrors[key] = value;
          } else if (Array.isArray(value)) {
            apiErrors[key] = value.join(', ');
          }
        });
        setFieldErrors(apiErrors);
        setErrors(apiErrors);
        return;
      }

      setErrors({ general: errorMessage });
      setAlert?.({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to render error message
  const renderError = (field: keyof Errors) => {
    const error = errors[field] || fieldErrors[field];
    if (!error) return null;

    return (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5"
      >
        <AlertCircle size={12} />
        {error}
      </motion.p>
    );
  };

  return (
    <AnimatePresence>
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
          className="relative w-full max-w-[540px] max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50"
        >
          {/* Decorative gradient header */}
          <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-indigo-50/80 via-white to-transparent dark:from-indigo-950/30 dark:via-slate-900/50">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-400/10 to-violet-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl btn-gradient text-white shadow-lg shadow-indigo-500/25">
                  {isEdit ? (
                    <Calendar size={22} className="text-white" />
                  ) : (
                    <CalendarPlus2 size={22} className="text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {isEdit ? "Chỉnh sửa buổi học" : "Thêm buổi học mới"}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {isEdit ? "Cập nhật thông tin buổi học" : "Tạo buổi học thủ công cho môn học"}
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
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-indigo-100 dark:border-indigo-900/30 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* General Error Message */}
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 flex items-start gap-2"
                  >
                    <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-700 dark:text-rose-400">{errors.general}</p>
                  </motion.div>
                )}

                {/* Ngày học */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <Calendar size={16} className="text-indigo-500" />
                    Ngày học <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.sessionDate}
                    onChange={(e) => handleFieldChange("sessionDate", e.target.value)}
                    className={`
                      w-full px-4 py-2.5 rounded-xl border-2 
                      bg-white dark:bg-slate-800/50
                      text-slate-900 dark:text-white text-sm
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                      ${(errors.sessionDate || fieldErrors.sessionDate)
                        ? 'border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/20 has-error'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }
                    `}
                  />
                  {renderError("sessionDate")}
                </div>

                {/* Giờ học */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      <Clock size={16} className="text-indigo-500" />
                      Bắt đầu <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleFieldChange("startTime", e.target.value)}
                      className={`
                        w-full px-4 py-2.5 rounded-xl border-2 
                        bg-white dark:bg-slate-800/50
                        text-slate-900 dark:text-white text-sm
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                        ${(errors.startTime || fieldErrors.startTime)
                          ? 'border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/20 has-error'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }
                      `}
                    />
                    {renderError("startTime")}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      <Clock size={16} className="text-indigo-500" />
                      Kết thúc <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleFieldChange("endTime", e.target.value)}
                      className={`
                        w-full px-4 py-2.5 rounded-xl border-2 
                        bg-white dark:bg-slate-800/50
                        text-slate-900 dark:text-white text-sm
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                        ${(errors.endTime || fieldErrors.endTime)
                          ? 'border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/20 has-error'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }
                      `}
                    />
                    {renderError("endTime")}
                  </div>
                </div>

                {/* Phòng học */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <DoorOpen size={16} className="text-indigo-500" />
                    Phòng học
                  </label>
                  <select
                    value={formData.roomId || ""}
                    onChange={(e) => handleFieldChange("roomId", e.target.value === "" ? null : Number(e.target.value))}
                    className={`
                      w-full px-4 py-2.5 rounded-xl border-2 
                      bg-white dark:bg-slate-800/50
                      text-slate-900 dark:text-white text-sm
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                      hover:border-slate-300 dark:hover:border-slate-600
                      cursor-pointer appearance-none
                      ${(errors.roomId || fieldErrors.roomId)
                        ? 'border-rose-300 dark:border-rose-700 bg-rose-50/50 dark:bg-rose-950/20 has-error'
                        : 'border-slate-200 dark:border-slate-700'
                      }
                    `}
                  >
                    <option value="">-- Chọn phòng học --</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} • {room.seatCapacity} chỗ
                      </option>
                    ))}
                  </select>
                  {renderError("roomId")}
                </div>

                {/* Trạng thái */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <Tag size={16} className="text-indigo-500" />
                    Trạng thái
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((option) => {
                      const isSelected = formData.status === option.value;

                      return (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleFieldChange("status", option.value)}
                          className={`
                            px-4 py-1.5 rounded-full text-sm font-medium
                            transition-all duration-200
                            ${isSelected
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-900/20 dark:shadow-white/10'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }
                          `}
                        >
                          {option.label}
                        </motion.button>
                      );
                    })}
                  </div>
                  {renderError("status")}
                </div>

                {/* Info card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-2 p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-violet-50/70 dark:from-indigo-950/30 dark:to-violet-950/30 border border-indigo-100/60 dark:border-indigo-800/30"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40">
                      <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400">
                      {isEdit ? "Thông tin buổi học sẽ được cập nhật" : "Thông tin buổi học sẽ được tạo"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <span className="text-indigo-500 dark:text-indigo-400 font-medium min-w-[65px]">Ngày học</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {formData.sessionDate ? new Date(formData.sessionDate).toLocaleDateString('vi-VN') : '---'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <span className="text-indigo-500 dark:text-indigo-400 font-medium min-w-[65px]">Giờ học</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {formData.startTime && formData.endTime ? `${formData.startTime} - ${formData.endTime}` : '---'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <span className="text-indigo-500 dark:text-indigo-400 font-medium min-w-[65px]">Phòng học</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {formData.roomId ? rooms.find(r => r.id === formData.roomId)?.name || 'Chưa chọn' : 'Chưa chọn'}
                      </span>
                      {formData.roomId && rooms.find(r => r.id === formData.roomId) && (
                        <span className="text-slate-400 text-[11px]">
                          ({rooms.find(r => r.id === formData.roomId)?.seatCapacity})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <span className="text-indigo-500 dark:text-indigo-400 font-medium min-w-[65px]">Trạng thái</span>
                      <span className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${formData.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : formData.status === 'canceled'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                        {STATUS_OPTIONS.find(s => s.value === formData.status)?.label || '---'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
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
              disabled={submitting || loading}
              className="px-6 py-2.5 rounded-xl btn-gradient text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isEdit ? "Đang cập nhật..." : "Đang tạo..."}
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  {isEdit ? "Cập nhật" : "Tạo buổi học"}
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}