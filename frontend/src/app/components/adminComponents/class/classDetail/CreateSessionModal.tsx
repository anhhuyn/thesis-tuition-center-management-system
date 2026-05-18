import React, { useState, useEffect } from "react";
import { Calendar, Plus } from "lucide-react";
import { roomApi } from "../../../../utils/api/room.api";
import type { Room } from "../../../../utils/types/room";

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
}

interface CreateSessionModalProps {
  subjectId: number;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: SessionData | null;
  isEdit?: boolean;
  sessionId?: number;
}

// Mock API - sẽ thay bằng API thật sau
const createSessionApi = async (data: any): Promise<any> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  console.log("Tạo buổi học mới:", data);
  return {
    success: true,
    message: "Tạo buổi học thành công!",
    data: { id: Math.floor(Math.random() * 1000), ...data }
  };
};

// Mock API - sẽ thay bằng API thật sau
const updateSessionApi = async (id: number, data: any): Promise<any> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  console.log("Cập nhật buổi học:", id, data);
  return {
    success: true,
    message: "Cập nhật buổi học thành công!",
    data: { id, ...data }
  };
};

export default function CreateSessionModal({
  subjectId,
  onClose,
  onSuccess,
  initialData = null,
  isEdit = false,
  sessionId,
}: CreateSessionModalProps) {
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

  useEffect(() => {
    const fetchRooms = async (): Promise<void> => {
      setLoading(true);
      try {
        const res = await roomApi.getAll();
        setRooms(res.data || []);
      } catch (err) {
        console.error("Lỗi khi tải danh sách phòng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

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

  const handleSubmit = async (): Promise<void> => {
    const { sessionDate, startTime, endTime } = formData;

    const newErrors: Errors = {};

    if (!sessionDate) newErrors.sessionDate = "Vui lòng chọn ngày học!";
    if (!startTime) newErrors.startTime = "Vui lòng chọn giờ bắt đầu!";
    if (!endTime) newErrors.endTime = "Vui lòng chọn giờ kết thúc!";

    if (sessionDate && startTime && endTime) {
      const sessionStart = new Date(`${sessionDate}T${startTime}`);
      const sessionEnd = new Date(`${sessionDate}T${endTime}`);

      if (sessionEnd <= sessionStart) {
        newErrors.endTime = "Giờ kết thúc phải sau giờ bắt đầu!";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    try {
      let res;
      if (isEdit && sessionId) {
        res = await updateSessionApi(sessionId, formData);
      } else {
        res = await createSessionApi({ subjectId, ...formData });
      }

      if (res?.success === false || res?.error) {
        const msg = res?.error || res?.message || "Có lỗi xảy ra khi lưu buổi học!";
        alert(msg);
        return;
      }

      alert(res?.message || (isEdit ? "Cập nhật buổi học thành công!" : "Tạo buổi học thành công!"));

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Lỗi khi lưu session:", error);
      alert("Có lỗi xảy ra khi lưu buổi học!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .scrollbar-custom {
          scrollbar-width: thin;
          scrollbar-color: #c1c1c1 #f1f1f1;
        }

        .scrollbar-custom::-webkit-scrollbar {
          width: 8px;
        }

        .scrollbar-custom::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 8px;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb {
          background-color: #c1c1c1;
          border-radius: 8px;
          border: 2px solid #f1f1f1;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background-color: #a8a8a8;
        }
      `}</style>

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000]">
        <div className="bg-white rounded-xl w-[500px] max-w-[90%] max-h-[90vh] flex flex-col overflow-hidden fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[99999] shadow-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
            <div className="bg-[#7f13ec]/10 p-2 rounded-lg">
              <Calendar className="text-[#7f13ec]" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEdit ? "Chỉnh sửa buổi học" : "Thêm buổi học thủ công"}
            </h2>
          </div>

          {/* Body */}
          <div className="px-6 py-5 flex-1 overflow-y-auto flex flex-col gap-4 scrollbar-custom">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7f13ec]"></div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Ngày học <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.sessionDate}
                    onChange={(e) =>
                      setFormData({ ...formData, sessionDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#7f13ec] focus:ring-1 focus:ring-[#7f13ec] focus:outline-none transition-all"
                  />
                  {errors.sessionDate && (
                    <div className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                      {errors.sessionDate}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Giờ bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#7f13ec] focus:ring-1 focus:ring-[#7f13ec] focus:outline-none transition-all"
                    />
                    {errors.startTime && (
                      <div className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                        {errors.startTime}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Giờ kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#7f13ec] focus:ring-1 focus:ring-[#7f13ec] focus:outline-none transition-all"
                    />
                    {errors.endTime && (
                      <div className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                        {errors.endTime}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phòng học
                  </label>
                  <select
                    value={formData.roomId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        roomId: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#7f13ec] focus:ring-1 focus:ring-[#7f13ec] focus:outline-none transition-all"
                  >
                    <option value="">-- Chọn phòng --</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} (Sức chứa: {room.seatCapacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#7f13ec] focus:ring-1 focus:ring-[#7f13ec] focus:outline-none transition-all"
                  >
                    <option value="scheduled">Đã lên lịch</option>
                    <option value="completed">Đã hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>

                {/* Thông tin bổ sung */}
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-700 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Mã môn học: {subjectId}
                  </p>
                  <p className="text-xs text-blue-700 mt-1 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    {isEdit ? "Đang chỉnh sửa buổi học" : "Thêm buổi học mới vào lịch"}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 flex justify-end gap-3 flex-shrink-0 border-t border-gray-100 bg-gray-50">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || loading}
              className="px-4 py-2 bg-[#7f13ec] text-white rounded-lg text-sm font-medium hover:bg-[#6a0fd4] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            >
              {submitting && (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
              )}
              {submitting ? (isEdit ? "Đang cập nhật..." : "Đang tạo...") : (isEdit ? "Cập nhật" : "Tạo buổi học")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}