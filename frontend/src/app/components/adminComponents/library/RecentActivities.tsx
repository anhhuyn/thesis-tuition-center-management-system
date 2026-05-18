// src/app/components/library/RecentActivities.tsx
import React from 'react';
import { Upload, Edit, Eye } from 'lucide-react';
import type { Activity } from '../../../utils/types/library';

interface RecentActivitiesProps {
  activities: Activity[];
  onViewAll: () => void;
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities, onViewAll }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload': return <Upload className="w-3 h-3" />;
      case 'edit': return <Edit className="w-3 h-3" />;
      default: return <Eye className="w-3 h-3" />;
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case 'upload': return 'bg-purple-600';
      case 'edit': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Hoạt động gần đây</h3>
        <button onClick={onViewAll} className="text-[10px] font-bold text-purple-600 hover:underline">
          Tất cả
        </button>
      </div>
      <div className="space-y-5">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-4 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden ring-2 ring-white flex items-center justify-center">
                <span className="text-xs font-bold text-slate-600">{activity.user.charAt(0)}</span>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getActivityBg(activity.type)} text-white rounded-full flex items-center justify-center ring-2 ring-white`}>
                {getActivityIcon(activity.type)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-800 leading-snug">
                <span className="font-bold">{activity.user}</span> {activity.action}{' '}
                <span className="font-bold text-purple-600">{activity.target}</span>
              </p>
              <span className="text-[10px] font-bold text-slate-400 mt-1 block">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};