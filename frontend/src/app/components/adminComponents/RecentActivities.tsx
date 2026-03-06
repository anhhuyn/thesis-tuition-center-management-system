import { UserPlus, BookOpen, DollarSign, Calendar, Clock, Users } from 'lucide-react';

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

const classes = [
  {
    id: 1,
    name: 'Toán 10 - Lớp A1',
    teacher: 'Thầy Nguyễn Văn Nam',
    time: '14:00 - 16:00',
    date: 'Thứ 2, 27/01/2026',
    students: 25,
    maxStudents: 30,
    color: 'bg-blue-500'
  },
  {
    id: 2,
    name: 'Vật lý 11 - Lớp B2',
    teacher: 'Cô Trần Thị Mai',
    time: '16:00 - 18:00',
    date: 'Thứ 2, 27/01/2026',
    students: 18,
    maxStudents: 25,
    color: 'bg-green-500'
  },
  {
    id: 3,
    name: 'Hóa 12 - Lớp C1',
    teacher: 'Thầy Lê Quang Minh',
    time: '18:00 - 20:00',
    date: 'Thứ 2, 27/01/2026',
    students: 22,
    maxStudents: 25,
    color: 'bg-purple-500'
  },
  {
    id: 4,
    name: 'Tiếng Anh 9 - Lớp D3',
    teacher: 'Cô Phạm Thu Hà',
    time: '08:00 - 10:00',
    date: 'Thứ 3, 28/01/2026',
    students: 30,
    maxStudents: 30,
    color: 'bg-orange-500'
  },
];

export function RecentActivities() {
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
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Lớp học sắp tới</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Xem lịch
          </button>
        </div>
        <div className="space-y-4">
          {classes.map((classItem) => (
            <div key={classItem.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className={`${classItem.color} w-1 h-full rounded-full`}></div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{classItem.name}</h4>
                      <p className="text-sm text-gray-500">{classItem.teacher}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${classItem.students === classItem.maxStudents
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                      }`}>
                      {classItem.students === classItem.maxStudents ? 'Đầy' : 'Còn chỗ'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{classItem.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{classItem.students}/{classItem.maxStudents}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{classItem.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

