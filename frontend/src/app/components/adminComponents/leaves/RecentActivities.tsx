// src/app/components/leaves/RecentActivities.tsx
import React from 'react';
import { UserCheck, Clock, XCircle, Upload, ChevronRight } from 'lucide-react';
import type { LeaveActivity } from '../../../utils/types/teacherLeave';

interface RecentActivitiesProps {
  activities: LeaveActivity[];
  onViewAll: () => void;
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities, onViewAll }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'person':
        return <UserCheck className="w-4 h-4" />;
      case 'history':
        return <Clock className="w-4 h-4" />;
      case 'block':
        return <XCircle className="w-4 h-4" />;
      case 'file_upload':
        return <Upload className="w-4 h-4" />;
      default:
        return <UserCheck className="w-4 h-4" />;
    }
  };

  const getIconBg = (iconName: string) => {
    switch (iconName) {
      case 'person':
        return 'bg-purple-100 text-purple-600';
      case 'history':
        return 'bg-blue-100 text-blue-600';
      case 'block':
        return 'bg-red-100 text-red-600';
      case 'file_upload':
        return 'bg-emerald-100 text-emerald-600';
      default:
        return 'bg-purple-100 text-purple-600';
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 font-headline">Hoạt động gần đây</h2>
        <button onClick={onViewAll} className="text-purple-600 text-xs font-semibold hover:underline flex items-center gap-1">
          Xem tất cả
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <div className={`w-8 h-8 rounded-full ${getIconBg(activity.icon)} flex items-center justify-center flex-shrink-0`}>
              {getIcon(activity.icon)}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                {activity.user && <span className="font-semibold text-gray-900">{activity.user}</span>} {activity.action}
                {activity.target && <span className="font-semibold text-purple-600"> {activity.target}</span>}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};