// src/utils/helpers/sessionStatus.ts

import { 
  Clock, 
  UserCheck, 
  UserX, 
  CheckCircle, 
  XCircle,
} from 'lucide-react';

export interface StatusConfig {
  label: string;
  labelEn: string;
  bg: string;
  border: string;
  text: string;
  icon: any;
  iconColor: string;
  badgeColor: string;
}

export const getSessionStatusConfig = (status: string): StatusConfig => {
  const configs: Record<string, StatusConfig> = {
    PENDING: {
      label: 'Chờ phân công',
      labelEn: 'Pending',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      icon: Clock,
      iconColor: 'text-amber-500',
      badgeColor: 'bg-amber-100 text-amber-700'
    },
    ASSIGNED: {
      label: 'Đã chỉ định',
      labelEn: 'Assigned',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: UserCheck,
      iconColor: 'text-blue-500',
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    DECLINED: {
      label: 'Đã từ chối',
      labelEn: 'Declined',
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: UserX,
      iconColor: 'text-red-500',
      badgeColor: 'bg-red-100 text-red-700'
    },
    RESOLVED: {
      label: 'Đã nhận dạy',
      labelEn: 'Resolved',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
      badgeColor: 'bg-emerald-100 text-emerald-700'
    },
    SKIPPED: {
      label: 'Đã hủy',
      labelEn: 'Skipped',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-500',
      icon: XCircle,
      iconColor: 'text-gray-400',
      badgeColor: 'bg-gray-100 text-gray-500'
    }
  };
  
  return configs[status] || configs.PENDING;
};

export const formatDisplayTime = (timeStr?: string): string => {
  if (!timeStr) return 'N/A';
  return timeStr.substring(0, 5);
};

export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const cleanDisplayName = (name: string): string => {
  if (!name) return 'Chưa cập nhật';
  
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
  
  if (cleaned.includes(' - ')) {
    const parts = cleaned.split(' - ');
    cleaned = parts[parts.length - 1];
  }
  
  cleaned = cleaned.trim();
  
  if (!cleaned || cleaned.length === 0 || cleaned === '-') {
    return 'Chưa cập nhật';
  }
  
  return cleaned;
};