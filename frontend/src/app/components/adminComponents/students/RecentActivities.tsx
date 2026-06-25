// src/app/components/students/RecentActivities.tsx
import React, { useState, useEffect } from 'react';
import { UserPlus, CreditCard, CalendarX, Edit, History, ArrowRight, Clock, UserMinus, PlusCircle, Trash2, CheckCircle, XCircle, LogIn, LogOut } from 'lucide-react';
import type { ActivityLog } from '../../../utils/types/activity-log';
import { activityLogApi } from '../../../utils/api/activity-log.api';

interface RecentActivitiesProps {
  limit?: number;
  onViewAll?: () => void;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ 
  limit = 5,
  onViewAll 
}) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function để parse meta an toàn
  const getMetaSafe = (metaString: string | null) => {
    if (!metaString) return null;
    try {
      return JSON.parse(metaString);
    } catch (error) {
      console.warn('Failed to parse meta JSON:', metaString);
      return null;
    }
  };

  // Format thời gian tương đối
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  // Map action type sang icon và màu sắc
  const getActivityStyle = (actionType: string) => {
    switch (actionType) {
      case 'CREATE':
        return { 
          icon: UserPlus, 
          bg: 'bg-green-100', 
          color: 'text-green-600',
          hoverBg: 'hover:bg-green-200',
        };
      case 'UPDATE':
        return { 
          icon: Edit, 
          bg: 'bg-blue-100', 
          color: 'text-blue-600',
          hoverBg: 'hover:bg-blue-200',
        };
      case 'DELETE':
        return { 
          icon: Trash2, 
          bg: 'bg-red-100', 
          color: 'text-red-600',
          hoverBg: 'hover:bg-red-200',
        };
      case 'APPROVE':
        return { 
          icon: CheckCircle, 
          bg: 'bg-emerald-100', 
          color: 'text-emerald-600',
          hoverBg: 'hover:bg-emerald-200',
        };
      case 'REJECT':
        return { 
          icon: XCircle, 
          bg: 'bg-amber-100', 
          color: 'text-amber-600',
          hoverBg: 'hover:bg-amber-200',
        };
      case 'LOGIN':
        return { 
          icon: LogIn, 
          bg: 'bg-purple-100', 
          color: 'text-purple-600',
          hoverBg: 'hover:bg-purple-200',
        };
      case 'LOGOUT':
        return { 
          icon: LogOut, 
          bg: 'bg-gray-100', 
          color: 'text-gray-600',
          hoverBg: 'hover:bg-gray-200',
        };
      case 'CHECKIN':
        return { 
          icon: Clock, 
          bg: 'bg-indigo-100', 
          color: 'text-indigo-600',
          hoverBg: 'hover:bg-indigo-200',
        };
      default:
        return { 
          icon: History, 
          bg: 'bg-gray-100', 
          color: 'text-gray-600',
          hoverBg: 'hover:bg-gray-200',
        };
    }
  };

  // Lấy tên từ description (ví dụ: "đã cập nhật thông tin học sinh: Nguyễn Đình Khôi")
  const extractNameFromDescription = (description: string) => {
    const match = description.match(/: (.+)$/);
    return match ? match[1] : null;
  };

  // Fetch activities từ API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const data = await activityLogApi.getRecentActivities(100);
        
        // Lọc chỉ lấy STUDENT_LIST
        const filteredData = data.filter(
          activity => activity.targetType === 'STUDENT_LIST'
        );
        
        setActivities(filteredData.slice(0, limit));
      } catch (err) {
        console.error('Error fetching activities:', err);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [limit]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-100 rounded"></div>
            <div className="h-10 bg-gray-100 rounded"></div>
            <div className="h-10 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
          <div className="p-1 bg-purple-100 rounded-lg">
            <History className="w-3.5 h-3.5 text-purple-600" />
          </div>
          Hoạt động gần đây
        </h3>
        {onViewAll && activities.length > 0 && (
          <button 
            onClick={onViewAll}
            className="text-purple-600 text-[10px] font-semibold uppercase tracking-wider hover:underline flex items-center gap-1 transition-colors"
          >
            Xem tất cả
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
      
      {activities.length === 0 ? (
        <div className="text-center py-6">
          <History className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-500">Chưa có hoạt động nào</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activities.map((activity, index) => {
            const IconComponent = getActivityStyle(activity.actionType).icon;
            const iconStyle = getActivityStyle(activity.actionType);
            const isLast = index === activities.length - 1;
            const meta = getMetaSafe(activity.meta);
            
            // Lấy tên từ description nếu có
            const nameInDescription = extractNameFromDescription(activity.description);

            return (
              <div key={activity.id} className="relative flex gap-2.5 group">
                {!isLast && (
                  <div className="absolute left-[11px] top-6 bottom-[-14px] w-px bg-gray-200"></div>
                )}
                
                {/* Icon - luôn hiển thị icon theo action type */}
                <div className="relative z-10">
                  <div className={`w-6 h-6 rounded-full ${iconStyle.bg} flex items-center justify-center transition-colors ${iconStyle.hoverBg}`}>
                    <IconComponent className={`w-3 h-3 ${iconStyle.color}`} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Nội dung description với kích thước chữ nhỏ hơn */}
                  <div className="text-xs text-gray-700 leading-relaxed">
                    <span className="font-semibold text-gray-900">{activity.userName}</span>
                    {' '}
                    <span>{activity.description}</span>
                  </div>
                  
                  {/* Thời gian và thông tin bổ sung - kích thước nhỏ hơn */}
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-2.5 h-2.5 text-gray-400" />
                    <span className="text-[10px] text-gray-400">
                      {formatRelativeTime(activity.createdAt)}
                    </span>
                    
                    {/* Hiển thị meta status nếu có */}
                    {meta?.status && (
                      <>
                        <span className="text-[10px] text-gray-300">•</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          meta.status === 'APPROVED' ? 'bg-green-100 text-green-600' :
                          meta.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {meta.status.toLowerCase()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick stats footer */}
      {activities.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>Tổng hoạt động: {activities.length}</span>
            <span>Cập nhật gần nhất</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentActivities;