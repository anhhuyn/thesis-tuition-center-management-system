import { BookOpen, DollarSign, Calendar, Clock, Users, School, User, ChevronRight, Sparkles, GraduationCap } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { UpcomingSession } from '../../utils/types/session';
import { sessionApi } from '../../utils/api';
import { activityLogApi } from '../../utils/api/activity-log.api';
import type { ActivityLog } from '../../utils/types/activity-log';

const getMetaSafe = (metaString: string | null) => {
  if (!metaString) return null;
  try {
    return JSON.parse(metaString);
  } catch (error) {
    console.warn('Failed to parse meta JSON:', metaString);
    return null;
  }
};

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

const getActivityIcon = (activity: ActivityLog) => {
  const { targetType } = activity;

  if (targetType === 'STUDENT') {
    return { icon: User, color: 'bg-blue-50 text-blue-500' };
  }
  if (targetType === 'PAYMENT') {
    return { icon: DollarSign, color: 'bg-green-50 text-green-500' };
  }
  if (targetType === 'SUBJECT') {
    return { icon: BookOpen, color: 'bg-purple-50 text-purple-500' };
  }
  if (targetType === 'SCHEDULE') {
    return { icon: Calendar, color: 'bg-orange-50 text-orange-500' };
  }
  if (targetType === 'CLASSROOM') {
    return { icon: School, color: 'bg-indigo-50 text-indigo-500' };
  }
  if (targetType === 'ANNOUNCEMENT') {
    return { icon: School, color: 'bg-yellow-50 text-yellow-500' };
  }

  return { icon: BookOpen, color: 'bg-gray-50 text-gray-500' };
};

const getTimeRemaining = (date: string, time: string) => {
  const now = new Date()
  const sessionDate = new Date(`${date}T${time}`)
  const diffMs = sessionDate.getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours <= 0) return { text: 'Đang diễn ra', type: 'live' }
  if (diffHours < 24) return { text: `${diffHours}h`, type: 'hours' }
  return { text: `${Math.floor(diffHours / 24)}d`, type: 'days' }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    weekday: date.toLocaleDateString('vi-VN', { weekday: 'short' })
  }
}

const formatTime = (start: string, end: string) => {
  return `${start.slice(0, 5)} - ${end.slice(0, 5)}`
}

export function RecentActivities() {
  const [classes, setClasses] = useState<UpcomingSession[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loadingActivities, setLoadingActivities] = useState(true)
  const [loadingClasses, setLoadingClasses] = useState(true)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await sessionApi.getUpcomingSessions()
        setClasses(data)
      } catch (error) {
        console.error('Error fetching sessions', error)
      } finally {
        setLoadingClasses(false)
      }
    }

    fetchClasses()
  }, [])

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoadingActivities(true)
        const data = await activityLogApi.getRecentActivities(10)
        setActivities(data)
      } catch (error) {
        console.error('Error fetching activities', error)
      } finally {
        setLoadingActivities(false)
      }
    }

    fetchActivities()
  }, [])

  return (
    <>
      <div className="dashboard-grid">
        {/* Recent Activities */}
        <div className="activity-card">
          <div className="activity-header">
            <h3 className="activity-title">Hoạt động gần đây</h3>
            <button className="view-all-link">
              Xem tất cả
              <ChevronRight className="link-icon" />
            </button>
          </div>

          <div className="activity-list">
            {loadingActivities ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton-activity">
                    <div className="skeleton-icon"></div>
                    <div className="skeleton-content">
                      <div className="skeleton-line"></div>
                      <div className="skeleton-line short"></div>
                    </div>
                  </div>
                ))}
              </>
            ) : activities.length === 0 ? (
              <div className="empty-activities">
                <BookOpen className="empty-icon" />
                <p>Chưa có hoạt động nào</p>
              </div>
            ) : (
              activities.map((activity) => {
                const { icon: Icon, color } = getActivityIcon(activity)
                const meta = getMetaSafe(activity.meta)

                let description = activity.description
                if (meta?.title && activity.targetType === 'ANNOUNCEMENT') {
                  description = `${meta.title}`
                }

                return (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon ${color}`}>
                      <Icon className="icon" />
                    </div>
                    <div className="activity-details">
                      <p className="activity-user">{activity.userName}</p>
                      <p className="activity-description">{description}</p>
                      {meta?.title && activity.targetType === 'ANNOUNCEMENT' && (
                        <p className="activity-announcement">📌 {meta.title}</p>
                      )}
                    </div>
                    <span className="activity-time">{formatRelativeTime(activity.createdAt)}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Upcoming Classes - Modern Minimal Design */}
        <div className="classes-card">
          <div className="classes-header">
            <div>
              <h3 className="classes-title">Lớp học sắp tới</h3>
              <p className="classes-subtitle">
                {!loadingClasses && `${classes.length} lớp học trong tuần`}
              </p>
            </div>
           <button className="view-all-link">
              Xem tất cả
              <ChevronRight className="link-icon" />
            </button>
          </div>

          <div className="classes-list">
            {loadingClasses ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton-class">
                    <div className="skeleton-class-content">
                      <div className="skeleton-line"></div>
                      <div className="skeleton-line short"></div>
                    </div>
                  </div>
                ))}
              </>
            ) : classes.length === 0 ? (
              <div className="empty-classes">
                <Calendar className="empty-icon" />
                <p className="empty-title">Không có lớp học</p>
                <p className="empty-subtitle">Tận hưởng thời gian rảnh nhé!</p>
              </div>
            ) : (
              classes.map((item, index) => {
                const date = formatDate(item.sessionDate)
                const remaining = getTimeRemaining(item.sessionDate, item.startTime)
                
                return (
                  <div key={index} className="class-item">
                    {/* Date Column */}
                    <div className="class-date">
                      <span className="date-day">{date.day}</span>
                      <span className="date-month">Th{date.month}</span>
                      <span className="date-weekday">{date.weekday}</span>
                    </div>

                    {/* Content Column */}
                    <div className="class-content-wrapper">
                      <div className="class-info">
                        <h4 className="class-name">{item.subjectName}</h4>
                        <div className="class-meta">
                          <span className="meta-grade">Lớp {item.grade}</span>
                          <span className="meta-divider">•</span>
                          <span className="meta-teacher">{item.teacherName}</span>
                        </div>
                      </div>
                      
                      <div className="class-footer">
                        <div className="class-time">
                          <Clock className="time-icon" />
                          <span>{formatTime(item.startTime, item.endTime)}</span>
                        </div>
                        <button className="class-action">
                          <ChevronRight className="action-icon" />
                        </button>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`status-badge status--${remaining.type}`}>
                      {remaining.text}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      <style>{`
        /* Dashboard Grid */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          padding: 0;
          align-items: start; /* Quan trọng: các card sẽ cao bằng nội dung */
        }

        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }

        /* Activity Card Styles */
        .activity-card {
          background: #ffffff;
          border-radius: 1rem;
          padding: 1.25rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          border: 1px solid #f0f0f0;
          transition: all 0.2s ease;
          height: fit-content; /* Quan trọng: chiều cao tự động theo nội dung */
        }

        .activity-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        /* Classes Card - Chiều cao tự động theo nội dung */
        .classes-card {
          background: #ffffff;
          border-radius: 1rem;
          padding: 1.25rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          border: 1px solid #f0f0f0;
          transition: all 0.2s ease;
          height: fit-content; /* Quan trọng: chiều cao tự động theo nội dung */
          display: flex;
          flex-direction: column;
        }

        .classes-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .classes-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.75rem;
          flex-shrink: 0; /* Không co lại */
        }

        .classes-title {
          font-size: 0.938rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .classes-subtitle {
          font-size: 0.688rem;
          color: #9ca3af;
          margin: 0.25rem 0 0 0;
        }

        .view-all-btn {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          background: transparent;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-all-btn:hover {
          color: #3b82f6;
          background: #f9fafb;
        }

        .btn-icon {
          width: 0.875rem;
          height: 0.875rem;
          transition: transform 0.2s;
        }

        .view-all-btn:hover .btn-icon {
          transform: translateX(2px);
        }

        /* Classes List */
        .classes-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        /* Class Item - Modern Minimal */
        .class-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem;
          background: #ffffff;
          border-radius: 0.75rem;
          transition: all 0.2s;
          border: 1px solid #f5f5f5;
          cursor: pointer;
        }

        .class-item:hover {
          border-color: #e5e7eb;
          background: #fafafa;
          transform: translateX(2px);
        }

        /* Date Column */
        .class-date {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 56px;
          padding-right: 0.75rem;
          border-right: 1px solid #f0f0f0;
        }

        .date-day {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.2;
        }

        .date-month {
          font-size: 0.625rem;
          font-weight: 500;
          color: #6b7280;
          text-transform: uppercase;
        }

        .date-weekday {
          font-size: 0.563rem;
          font-weight: 500;
          color: #9ca3af;
          margin-top: 0.125rem;
        }

        /* Content Wrapper */
        .class-content-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .class-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .class-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .class-meta {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.688rem;
          color: #6b7280;
        }

        .meta-grade {
          color: #8b5cf6;
          font-weight: 500;
        }

        .meta-divider {
          color: #e5e7eb;
        }

        .meta-teacher {
          color: #6b7280;
        }

        .class-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .class-time {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.688rem;
          color: #9ca3af;
        }

        .time-icon {
          width: 0.75rem;
          height: 0.75rem;
        }

        .class-action {
          background: transparent;
          border: none;
          width: 1.5rem;
          height: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 0.375rem;
          transition: all 0.2s;
          color: #9ca3af;
        }

        .class-action:hover {
          background: #f0f0f0;
          color: #3b82f6;
        }

        .action-icon {
          width: 1rem;
          height: 1rem;
          transition: transform 0.2s;
        }

        .class-action:hover .action-icon {
          transform: translateX(2px);
        }

        /* Status Badge - Minimal */
        .status-badge {
          font-size: 0.688rem;
          font-weight: 500;
          padding: 0.25rem 0.625rem;
          border-radius: 2rem;
          white-space: nowrap;
          background: #f5f5f5;
          color: #6b7280;
        }

        .status--live {
          background: #fee2e2;
          color: #dc2626;
        }

        .status--hours {
          background: #fef3c7;
          color: #d97706;
        }

        .status--days {
          background: #e0e7ff;
          color: #4f46e5;
        }

        /* Activity Header */
        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .activity-title {
          font-size: 0.938rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .view-all-link {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #6b7280;
          font-size: 0.75rem;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-all-link:hover {
          color: #3b82f6;
          gap: 0.375rem;
        }

        .link-icon {
          width: 0.875rem;
          height: 0.875rem;
          transition: transform 0.2s;
        }

        .view-all-link:hover .link-icon {
          transform: translateX(2px);
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.625rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
          cursor: pointer;
        }

        .activity-item:hover {
          background: #f9fafb;
        }

        .activity-icon {
          width: 2rem;
          height: 2rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .activity-icon .icon {
          width: 1rem;
          height: 1rem;
        }

        .activity-details {
          flex: 1;
          min-width: 0;
        }

        .activity-user {
          font-size: 0.813rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 0.125rem 0;
        }

        .activity-description {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0;
          word-break: break-word;
        }

        .activity-announcement {
          font-size: 0.688rem;
          color: #3b82f6;
          margin-top: 0.125rem;
        }

        .activity-time {
          font-size: 0.688rem;
          color: #9ca3af;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* Skeletons */
        .skeleton-activity {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem;
        }

        .skeleton-icon {
          width: 2rem;
          height: 2rem;
          background: #f0f0f0;
          border-radius: 0.5rem;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .skeleton-content {
          flex: 1;
        }

        .skeleton-line {
          height: 0.75rem;
          background: #f0f0f0;
          border-radius: 0.25rem;
          margin-bottom: 0.5rem;
          width: 80%;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .skeleton-line.short {
          width: 50%;
          margin-bottom: 0;
        }

        .skeleton-class {
          padding: 0.875rem;
          background: #ffffff;
          border-radius: 0.75rem;
          border: 1px solid #f5f5f5;
        }

        .skeleton-class-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Empty States */
        .empty-activities {
          text-align: center;
          padding: 2rem;
        }

        .empty-activities .empty-icon {
          width: 2rem;
          height: 2rem;
          color: #d1d5db;
          margin-bottom: 0.5rem;
        }

        .empty-activities p {
          color: #9ca3af;
          font-size: 0.75rem;
        }

        .empty-classes {
          text-align: center;
          padding: 2rem;
        }

        .empty-classes .empty-icon {
          width: 2rem;
          height: 2rem;
          color: #d1d5db;
          margin-bottom: 0.5rem;
        }

        .empty-title {
          font-size: 0.813rem;
          font-weight: 500;
          color: #6b7280;
          margin: 0 0 0.25rem 0;
        }

        .empty-subtitle {
          font-size: 0.688rem;
          color: #9ca3af;
          margin: 0;
        }

        /* Background color utilities */
        .bg-blue-50 {
          background-color: #eff6ff;
        }
        .text-blue-500 {
          color: #3b82f6;
        }
        .bg-green-50 {
          background-color: #f0fdf4;
        }
        .text-green-500 {
          color: #10b981;
        }
        .bg-purple-50 {
          background-color: #faf5ff;
        }
        .text-purple-500 {
          color: #a855f7;
        }
        .bg-orange-50 {
          background-color: #fff7ed;
        }
        .text-orange-500 {
          color: #f97316;
        }
        .bg-indigo-50 {
          background-color: #eef2ff;
        }
        .text-indigo-500 {
          color: #6366f1;
        }
        .bg-yellow-50 {
          background-color: #fefce8;
        }
        .text-yellow-500 {
          color: #eab308;
        }
        .bg-gray-50 {
          background-color: #f9fafb;
        }
        .text-gray-500 {
          color: #6b7280;
        }
      `}</style>
    </>
  );
}