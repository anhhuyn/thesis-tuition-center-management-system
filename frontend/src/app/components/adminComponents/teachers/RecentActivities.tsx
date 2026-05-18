// src/app/components/teachers/RecentActivities.tsx
import React from 'react';
import { Edit, UserPlus, CalendarX, User } from 'lucide-react';
import type { TeacherActivity } from '../../../utils/types/teacher';

interface RecentActivitiesProps {
  activities: TeacherActivity[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'profile':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'teacher':
        return <UserPlus className="w-4 h-4 text-purple-600" />;
      case 'leave':
        return <CalendarX className="w-4 h-4 text-orange-600" />;
      default:
        return <User className="w-4 h-4 text-slate-600" />;
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case 'profile':
        return 'bg-blue-50';
      case 'teacher':
        return 'bg-purple-50';
      case 'leave':
        return 'bg-orange-50';
      default:
        return 'bg-slate-50';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h2 className="text-sm font-bold text-slate-700 mb-4">Hoạt động gần đây</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex gap-3">
            <div className={`relative ${index < activities.length - 1 ? 'pb-4' : ''}`}>
              <div className={`w-8 h-8 rounded-full ${getActivityBg(activity.type)} flex items-center justify-center flex-shrink-0`}>
                {getActivityIcon(activity.type)}
              </div>
              {index < activities.length - 1 && (
                <div className="absolute top-8 left-4 w-px h-4 bg-slate-200" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-semibold text-slate-800">{activity.user}</span>
                <span className="text-slate-600"> {activity.action}</span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{activity.description}</p>
              <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">
                {activity.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;