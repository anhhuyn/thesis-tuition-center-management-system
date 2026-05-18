import { UserPlus, BookOpen, DollarSign, Calendar, Clock, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { UpcomingSession } from '../../utils/types/session';
import { sessionApi } from '../../utils/api';

const activities = [
  {
    id: 1,
    type: 'enrollment',
    icon: UserPlus,
    color: 'bg-blue-100 text-blue-600',
    title: 'Học viên mới đăng ký',
    description: 'Nguyễn Văn An đăng ký khóa Toán 10',
    time: '5 phút trước'
  },
  {
    id: 2,
    type: 'payment',
    icon: DollarSign,
    color: 'bg-green-100 text-green-600',
    title: 'Thanh toán thành công',
    description: 'Trần Thị Bình thanh toán ₫2.5M',
    time: '15 phút trước'
  },
  {
    id: 3,
    type: 'course',
    icon: BookOpen,
    color: 'bg-purple-100 text-purple-600',
    title: 'Khóa học mới',
    description: 'Khóa Vật lý 11 đã được mở',
    time: '1 giờ trước'
  },
  {
    id: 4,
    type: 'schedule',
    icon: Calendar,
    color: 'bg-orange-100 text-orange-600',
    title: 'Lịch học cập nhật',
    description: 'Lịch học tuần sau đã được cập nhật',
    time: '2 giờ trước'
  },
  {
    id: 5,
    type: 'enrollment',
    icon: UserPlus,
    color: 'bg-blue-100 text-blue-600',
    title: 'Học viên mới đăng ký',
    description: 'Lê Minh Châu đăng ký khóa Hóa 12',
    time: '3 giờ trước'
  },
];


const getStatusColor = (remaining: string) => {
  if (remaining.includes('giờ')) return 'bg-purple-100 text-purple-600'
  if (remaining.includes('ngày')) return 'bg-blue-100 text-blue-600'
  return 'bg-gray-100 text-gray-600'
}

const getTimeRemaining = (date: string, time: string) => {
  const now = new Date()
  const sessionDate = new Date(`${date}T${time}`)

  const diffMs = sessionDate.getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours <= 0) return 'Đang diễn ra'
  if (diffHours < 24) return `Còn ${diffHours} giờ`
  return `Còn ${Math.floor(diffHours / 24)} ngày`
}

const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500']

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const formatTime = (start: string, end: string) => {
  return `${start.slice(0, 5)} - ${end.slice(0, 5)}`
}

export function RecentActivities() {
  const [classes, setClasses] = useState<UpcomingSession[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await sessionApi.getUpcomingSessions()
        setClasses(data)
      } catch (error) {
        console.error('Error fetching sessions', error)
      }
    }

    fetchData()
  }, [])
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Xem tất cả
          </button>
        </div>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start gap-4">
                <div className={`${activity.color} p-2 rounded-lg`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500 truncate">{activity.description}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Classes */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">

            <h3 className="text-lg font-semibold text-gray-900">
              Lớp học sắp tới
            </h3>
          </div>

          <button className="mt-4 sm:mt-0 text-blue-600 font-medium hover:underline flex items-center gap-1 text-sm">
            Xem tất cả giáo viên
          </button>
        </div>

        {/* List */}
        <div className="space-y-3">
          {classes.map((item, index) => {
            const color = colors[index % colors.length]
            const remaining = getTimeRemaining(item.sessionDate, item.startTime)

            return (
              <div
                key={index}
                className="flex gap-3 p-4 rounded-xl border border-gray-100 bg-white 
                   hover:shadow-md hover:bg-gray-50 transition-all duration-200"
              >
                {/* Color bar */}
                <div className={`${color} w-1.5 rounded-full`}></div>

                {/* Content */}
                <div className="flex-1">
                  {/* Title + badge */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {item.subjectName} - Lớp {item.grade}
                      </h4>

                      {/* Teacher */}
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Users className="w-3 h-3" />
                        {item.teacherName}
                      </div>
                    </div>

                    {/* Remaining */}
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(remaining)}`}
                    >
                      {remaining}
                    </span>
                  </div>

                  {/* Time + Date */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(item.startTime, item.endTime)}
                    </div>

                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.sessionDate)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

