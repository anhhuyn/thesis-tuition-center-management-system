// scheduleUtils.ts
import { AlertCircle } from "lucide-react";
import type { SessionStatus, TeacherLeaveInfo } from "../../../utils/types/session";

export const extractClassCode = (subjectName: string): string => {
  if (subjectName.includes('Toán')) return 'TOÁN';
  if (subjectName.includes('Lý')) return 'LÝ';
  if (subjectName.includes('Hóa')) return 'HÓA';
  if (subjectName.includes('Văn')) return 'VĂN';
  if (subjectName.includes('Anh')) return 'ENG';
  if (subjectName.includes('KHOA HỌC TỰ NHIÊN') || subjectName.includes('KHTN')) return 'KHTN';
  return 'SJ';
};

export const getStatusDisplay = (status: SessionStatus) => {
  switch (status) {
    case 'ongoing':
      return { text: 'ĐANG DIỄN RA', bg: 'bg-violet-100', textColor: 'text-violet-700' };
    case 'scheduled':
      return { text: 'SẮP TỚI', bg: 'bg-slate-100', textColor: 'text-slate-400' };
    case 'completed':
      return { text: 'HOÀN THÀNH', bg: 'bg-green-100', textColor: 'text-green-700' };
    case 'canceled':
      return { text: 'ĐÃ HỦY', bg: 'bg-red-100', textColor: 'text-red-700' };
    case 'expired':
      return { text: 'CHƯA XỬ LÝ', bg: 'bg-gray-100', textColor: 'text-gray-600' };
    default:
      return { text: 'KHÔNG XÁC ĐỊNH', bg: 'bg-gray-100', textColor: 'text-gray-600' };
  }
};

export const getVietnameseStatus = (status: SessionStatus): string => {
  return getStatusDisplay(status).text;
};

export const getStatusBgColor = (status: SessionStatus): string => {
  return getStatusDisplay(status).bg;
};

export const getStatusTextColor = (status: SessionStatus): string => {
  return getStatusDisplay(status).textColor;
};

export const getTeacherLeaveDisplay = (leaveInfo?: TeacherLeaveInfo) => {
  if (!leaveInfo || leaveInfo.type === 'NONE') {
    return null;
  }

  switch (leaveInfo.type) {
    case 'PENDING':
      return {
        message: 'GV xin nghỉ - Cần xử lý',
        buttonText: 'Điều phối',
        buttonAction: 'dispatch',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
        iconColor: 'text-rose-700'
      };
    case 'APPROVED':
      return {
        message: 'Đã duyệt - Chưa thay thế',
        buttonText: 'Điều phối',
        buttonAction: 'dispatch',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        iconColor: 'text-orange-700'
      };
    case 'AWAITING_REPLACEMENT':
      return {
        message: 'Chờ GV thay thế xác nhận',
        buttonText: 'Xem thay đổi',
        buttonAction: 'view',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-700'
      };
    case 'RESOLVED':
      return {
        message: leaveInfo.replacementTeacherName
          ? `Đã thay thế bởi ${leaveInfo.replacementTeacherName}`
          : 'Đã thay thế giáo viên',
        buttonText: 'Xem thay đổi',
        buttonAction: 'view',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-700'
      };
    default:
      return null;
  }
};