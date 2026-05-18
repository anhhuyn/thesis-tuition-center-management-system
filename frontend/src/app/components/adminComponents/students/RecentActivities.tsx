// src/app/components/students/RecentActivities.tsx
import React, { useState, useEffect } from 'react';
import { UserPlus, CreditCard, CalendarX, Edit, History, ArrowRight, Clock, UserMinus, PlusCircle } from 'lucide-react';
import type { RecentActivity } from '../../../utils/types/student';

interface RecentActivitiesProps {
  activities?: RecentActivity[];
  onViewAll?: () => void;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ 
  activities: propActivities, 
  onViewAll 
}) => {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration (có thể thay bằng API call sau)
  const mockActivities: RecentActivity[] = [
    {
      id: 1,
      type: 'join',
      user: 'Nguyễn Đình Khôi',
      target: 'Lớp 8',
      time: '2 giờ trước',
      description: 'Học sinh mới đăng ký vào hệ thống'
    },
    {
      id: 2,
      type: 'payment',
      user: 'Trần Huỳnh Thái Phương',
      time: '5 giờ trước',
      description: 'Đã thanh toán học phí tháng 12'
    },
    {
      id: 3,
      type: 'update',
      user: 'Phạm Trần Ngọc Bảo Trúc',
      time: '1 ngày trước',
      description: 'Cập nhật thông tin cá nhân'
    },
    {
      id: 4,
      type: 'miss',
      user: 'Hoàng Minh Bảo Trân',
      target: 'Buổi học Toán',
      time: '2 ngày trước',
      description: 'Vắng mặt không phép'
    },
    {
      id: 5,
      type: 'create',
      user: 'Admin',
      target: 'Dương Huỳnh An Thy',
      time: '3 ngày trước',
      description: 'Thêm học sinh mới vào hệ thống'
    }
  ];

  useEffect(() => {
    if (propActivities) {
      setActivities(propActivities);
    } else {
      // Sử dụng mock data nếu không có activities từ props
      setActivities(mockActivities);
    }
  }, [propActivities]);

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'join':
        return { 
          icon: UserPlus, 
          bg: 'bg-purple-100', 
          color: 'text-purple-600',
          hoverBg: 'group-hover:bg-purple-600',
          hoverColor: 'group-hover:text-white',
          label: 'Tham gia'
        };
      case 'payment':
        return { 
          icon: CreditCard, 
          bg: 'bg-emerald-100', 
          color: 'text-emerald-600',
          hoverBg: 'group-hover:bg-emerald-600',
          hoverColor: 'group-hover:text-white',
          label: 'Thanh toán'
        };
      case 'miss':
        return { 
          icon: CalendarX, 
          bg: 'bg-amber-100', 
          color: 'text-amber-600',
          hoverBg: 'group-hover:bg-amber-600',
          hoverColor: 'group-hover:text-white',
          label: 'Vắng mặt'
        };
      case 'update':
        return { 
          icon: Edit, 
          bg: 'bg-blue-100', 
          color: 'text-blue-600',
          hoverBg: 'group-hover:bg-blue-600',
          hoverColor: 'group-hover:text-white',
          label: 'Cập nhật'
        };
      case 'create':
        return { 
          icon: PlusCircle, 
          bg: 'bg-green-100', 
          color: 'text-green-600',
          hoverBg: 'group-hover:bg-green-600',
          hoverColor: 'group-hover:text-white',
          label: 'Thêm mới'
        };
      case 'delete':
        return { 
          icon: UserMinus, 
          bg: 'bg-red-100', 
          color: 'text-red-600',
          hoverBg: 'group-hover:bg-red-600',
          hoverColor: 'group-hover:text-white',
          label: 'Xóa'
        };
      default:
        return { 
          icon: History, 
          bg: 'bg-gray-100', 
          color: 'text-gray-600',
          hoverBg: 'group-hover:bg-gray-600',
          hoverColor: 'group-hover:text-white',
          label: 'Hoạt động'
        };
    }
  };

  const getActivityMessage = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'update':
        return (
          <>
            <span className="font-semibold text-gray-900">{activity.user}</span> đã cập nhật hồ sơ
            {activity.description && (
              <span className="text-gray-500 text-xs block mt-0.5">{activity.description}</span>
            )}
          </>
        );
      case 'join':
        return (
          <>
            <span className="font-semibold text-gray-900">{activity.user}</span> đã tham gia{' '}
            <span className="font-semibold text-purple-600">{activity.target || 'hệ thống'}</span>
          </>
        );
      case 'payment':
        return (
          <>
            <span className="font-semibold text-gray-900">{activity.user}</span> đã thanh toán học phí
            {activity.description && (
              <span className="text-gray-500 text-xs block mt-0.5">{activity.description}</span>
            )}
          </>
        );
      case 'miss':
        return (
          <>
            <span className="font-semibold text-gray-900">{activity.user}</span> đã vắng mặt{' '}
            <span className="font-semibold text-amber-600">{activity.target || 'buổi học'}</span>
          </>
        );
      case 'create':
        return (
          <>
            <span className="font-semibold text-gray-900">{activity.user}</span> đã thêm mới{' '}
            <span className="font-semibold text-green-600">{activity.target || 'học sinh'}</span>
          </>
        );
      case 'delete':
        return (
          <>
            <span className="font-semibold text-gray-900">{activity.user}</span> đã xóa{' '}
            <span className="font-semibold text-red-600">{activity.target || 'học sinh'}</span>
          </>
        );
      default:
        return (
          <>
            <span className="font-semibold text-gray-900">{activity.user}</span> đã thực hiện một hoạt động
          </>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-100 rounded"></div>
            <div className="h-12 bg-gray-100 rounded"></div>
            <div className="h-12 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <div className="p-1.5 bg-purple-100 rounded-lg">
            <History className="w-4 h-4 text-purple-600" />
          </div>
          Hoạt động gần đây
        </h3>
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="text-purple-600 text-xs font-semibold uppercase tracking-wider hover:underline flex items-center gap-1 transition-colors"
          >
            Xem tất cả
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Chưa có hoạt động nào</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {activities.map((activity, index) => {
            const IconComponent = getActivityIcon(activity.type).icon;
            const iconStyle = getActivityIcon(activity.type);
            const isLast = index === activities.length - 1;

            return (
              <div key={activity.id} className="relative flex gap-3 group">
                {!isLast && (
                  <div className="absolute left-[13px] top-7 bottom-[-20px] w-px bg-gray-200"></div>
                )}
                <div className={`w-7 h-7 rounded-full ${iconStyle.bg} flex items-center justify-center shrink-0 z-10 transition-all ${iconStyle.hoverBg}`}>
                  <IconComponent className={`w-3.5 h-3.5 ${iconStyle.color} transition-all ${iconStyle.hoverColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-700">
                    {getActivityMessage(activity)}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">{activity.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick stats footer */}
      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Tổng hoạt động: {activities.length}</span>
            <span>Cập nhật gần nhất</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentActivities;