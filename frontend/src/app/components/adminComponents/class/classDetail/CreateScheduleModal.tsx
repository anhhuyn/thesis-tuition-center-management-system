import { Calendar } from "lucide-react";
import React, { useState, useEffect } from "react";
import { roomApi } from "../../../../utils/api/room.api";
import type { Room } from "../../../../utils/types/room";
import { subjectScheduleApi } from "../../../../utils/api/subjectSchedule.api";

interface FormData {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  roomId: number | null;
  startDate: string;
  endDate: string;
}

interface Errors {
  startDate?: string;
  endDate?: string;
  endTime?: string;
   roomId?: string;
}

interface CreateScheduleModalProps {
  subjectId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateScheduleModal({
  subjectId,
  onClose,
  onSuccess
}: CreateScheduleModalProps) {
  const [formData, setFormData] = useState<FormData>({
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "10:00",
    roomId: null,
    startDate: "",
    endDate: "",
  });

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    const fetchRooms = async (): Promise<void> => {
      try {
        const res = await roomApi.getAll()
        setRooms(res.data || [])
      } catch (err) {
        console.error("Lỗi khi fetch phòng học:", err)
      }
    }

    fetchRooms()
  }, [])

  const handleCreateSchedule = async (): Promise<void> => {
  const { startDate, endDate, startTime, endTime, roomId, dayOfWeek } = formData;
  const newErrors: Errors = {};

  if (!startDate) newErrors.startDate = "Vui lòng chọn ngày bắt đầu!";
  if (!endDate) newErrors.endDate = "Vui lòng chọn ngày kết thúc!";
  if (endTime <= startTime) newErrors.endTime = "Giờ kết thúc phải sau giờ bắt đầu!";
  if (!roomId) newErrors.roomId = "Vui lòng chọn phòng!";

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) newErrors.endDate = "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu!";
  }

  setErrors(newErrors);
  if (Object.keys(newErrors).length > 0) return;

  setLoading(true);
  try {
    const res = await subjectScheduleApi.create({
      subjectId,
      dayOfWeek,
      startTime,
      endTime,
      roomId,
      startDate,
      endDate
    });

    alert(res.message || "Tạo lịch học thành công!");
    onSuccess();
    onClose();
  } catch (error: any) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Có lỗi xảy ra khi tạo lịch học!";
    alert(msg);
  } finally {
    setLoading(false);
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
              Tạo lịch học định kỳ
            </h2>
          </div>

          {/* Body */}
          <div className="px-6 py-5 flex-1 overflow-y-auto flex flex-col gap-4 scrollbar-custom">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#7f13ec] focus:ring-1 focus:ring-[#7f13ec] focus:outline-none transition-all"
              />
              {errors.startDate && (
                <div className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                  {errors.startDate}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#7f13ec] focus:ring-1 focus:ring-[#7f13ec] focus:outline-none transition-all"
              />
              {errors.endDate && (
                <div className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                  {errors.endDate}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Thứ trong tuần <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#7f13ec] focus:ring-1 focus:ring-[#7f13ec] focus:outline-none transition-all"
              >
                <option value={0}>Chủ nhật</option>
                <option value={1}>Thứ 2</option>
                <option value={2}>Thứ 3</option>
                <option value={3}>Thứ 4</option>
                <option value={4}>Thứ 5</option>
                <option value={5}>Thứ 6</option>
                <option value={6}>Thứ 7</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Giờ bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#7f13ec] focus:ring-1 focus:ring-[#7f13ec] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Giờ kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
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
                value={formData.roomId ?? ""}
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

            {/* Thông tin bổ sung */}
            <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-700 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Tạo lịch học định kỳ hàng tuần
              </p>
              <p className="text-xs text-blue-700 mt-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Mã môn học: {subjectId}
              </p>
              <p className="text-xs text-blue-700 mt-1 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Lịch sẽ được tạo từ ngày bắt đầu đến ngày kết thúc
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 flex justify-end gap-3 flex-shrink-0 border-t border-gray-100 bg-gray-50">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleCreateSchedule}
              disabled={loading}
              className="px-4 py-2 bg-[#7f13ec] text-white rounded-lg text-sm font-medium hover:bg-[#6a0fd4] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            >
              {loading && (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
              )}
              {loading ? "Đang tạo..." : "Tạo lịch học"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}