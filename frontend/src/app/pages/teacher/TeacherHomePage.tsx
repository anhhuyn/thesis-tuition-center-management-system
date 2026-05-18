import React from 'react';
import {
  School,
  Calendar,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Languages,
  Bell,
  FileEdit,
  Upload,
  FileText,
  Presentation,
  Table,
  Sparkles,
  Plus,
  PresentationIcon,
} from 'lucide-react';

const TeacherHome: React.FC = () => {
  // Mock data for the schedule timeline
  const scheduleItems = [
    {
      id: 1,
      title: "Toán Cao Cấp - Lớp 12A1",
      time: "08:00 - 09:30",
      room: "Phòng 302",
      isActive: true,
      statusText: "ĐANG DIỄN RA"
    },
    {
      id: 2,
      title: "Đại Số Tuyến Tính - Lớp 11B2",
      time: "10:00 - 11:30",
      room: "Phòng Online 1",
      isActive: false,
      statusText: "Sắp tới"
    },
    {
      id: 3,
      title: "Ôn thi Học sinh giỏi",
      time: "14:00 - 16:00",
      room: "Phòng 105",
      isActive: false,
      statusText: "Chiều nay"
    },
  ];

  const upcomingClasses = [
    {
      id: 1,
      title: "Vật Lý Nâng Cao - C3",
      icon: <FlaskConical className="text-[#8B5CF6]" size={20} />,
      iconBg: "bg-[#F5F3FF]",
      badgeText: "Ổn định",
      badgeClass: "bg-[#ECFDF5] text-[#10B981]",
      students: "24/25",
      progress: 85,
      progressColor: "bg-[#8B5CF6]",
      time: "15:30 Hôm nay",
      room: "P.404",
    },
    {
      id: 2,
      title: "Tiếng Anh IELTS 6.5+",
      icon: <Languages className="text-[#3B82F6]" size={20} />,
      iconBg: "bg-[#EFF6FF]",
      badgeText: "Vượt trội",
      badgeClass: "bg-[#F5F3FF] text-[#8B5CF6]",
      students: "12/15",
      progress: 60,
      progressColor: "bg-[#3B82F6]",
      time: "18:00 Hôm nay",
      room: "P.502",
    },
  ];

  return (
    <div className="bg-[#F8F9FD] text-[#1A1C1E] min-h-screen font-sans">
      <main className="max-w-[1200px] mx-auto p-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-[#1A1C1E]">Chào buổi sáng, Thầy Tú!</h3>
          <p className="text-gray-500">Bạn có 4 tiết dạy hôm nay. Hãy chuẩn bị thật tốt nhé.</p>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard icon={<School size={24}/>} label="TOTAL CLASSES" value="12" iconColor="text-[#8B5CF6]" bgColor="bg-white" />
          <StatCard icon={<Users size={24}/>} label="TOTAL STUDENTS" value="148" iconColor="text-[#3B82F6]" bgColor="bg-white" />
          <StatCard icon={<Clock size={24}/>} label="TEACHING HOURS" value="24h" iconColor="text-gray-600" bgColor="bg-white" />
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Left Column */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            
            {/* Today's Schedule */}
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
                <h4 className="font-bold text-[#1A1C1E] flex items-center gap-2">
                  <Calendar size={18} className="text-[#8B5CF6]" />
                  Lịch dạy hôm nay
                </h4>
                <button className="text-[#8B5CF6] text-sm font-semibold hover:underline">Xem tất cả</button>
              </div>
              <div className="p-8">
                <div className="relative space-y-0 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-100">
                  {scheduleItems.map((item) => (
                    <div key={item.id} className="relative flex items-start gap-6 pb-8 last:pb-0">
                      <div className={`w-10 h-10 rounded-full border-4 border-white z-10 shrink-0 shadow-sm ${item.isActive ? 'bg-[#8B5CF6]' : 'bg-gray-200'}`}></div>
                      <div className={`flex-1 flex justify-between items-center ${item.isActive ? 'bg-[#F5F3FF] p-5 rounded-2xl border border-[#DDD6FE]' : 'px-2 py-2'}`}>
                        <div>
                          <p className="font-bold text-[#1A1C1E] text-lg">{item.title}</p>
                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-4">
                            <span className="flex items-center gap-1.5"><Clock size={14}/> {item.time}</span>
                            <span className="flex items-center gap-1.5"><PresentationIcon size={14}/> {item.room}</span>
                          </p>
                        </div>
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-lg ${item.isActive ? 'bg-[#8B5CF6] text-white' : 'text-gray-400'}`}>
                          {item.statusText.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Upcoming Classes */}
            <section>
              <div className="flex justify-between items-center mb-5">
                <h4 className="font-bold text-[#1A1C1E] text-lg">Lớp học sắp tới</h4>
                <div className="flex gap-2">
                  <button className="p-1.5 rounded-lg bg-white border border-gray-100 text-gray-400 hover:bg-gray-50"><ChevronLeft size={18} /></button>
                  <button className="p-1.5 rounded-lg bg-white border border-gray-100 text-gray-400 hover:bg-gray-50"><ChevronRight size={18} /></button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingClasses.map((cls) => (
                  <div key={cls.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`${cls.iconBg} p-3 rounded-xl`}>{cls.icon}</div>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${cls.badgeClass}`}>{cls.badgeText}</span>
                    </div>
                    <h5 className="font-bold text-[#1A1C1E] text-lg mb-1">{cls.title}</h5>
                    <p className="text-sm text-gray-400 mb-6">Sĩ số: {cls.students} học sinh</p>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full mb-6">
                      <div className={`h-full rounded-full ${cls.progressColor}`} style={{ width: `${cls.progress}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
                      <span className="flex items-center gap-1.5"><Clock size={14} /> {cls.time}</span>
                      <span className="flex items-center gap-1.5"><PresentationIcon size={14} /> {cls.room}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            
            {/* Notifications */}
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-bold text-[#1A1C1E] mb-6 flex items-center gap-2">
                <Bell size={18} className="text-[#F87171]" /> Thông báo & Nhắc nhở
              </h4>
              <div className="space-y-4">
                <div className="bg-[#FFF1F2] border border-[#FECDD3] p-4 rounded-2xl">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#F87171] shrink-0"><FileEdit size={18}/></div>
                        <div>
                            <p className="text-sm font-bold text-[#991B1B]">15 bài tập cần chấm</p>
                            <p className="text-xs text-[#991B1B] opacity-70">Hạn chót: Tối nay 23:59</p>
                            <button className="mt-2 text-xs font-bold text-[#F87171] hover:underline">Chấm ngay</button>
                        </div>
                    </div>
                </div>
                <div className="bg-[#F8F9FD] border border-gray-100 p-4 rounded-2xl">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#8B5CF6] shrink-0"><Clock size={18}/></div>
                        <div>
                            <p className="text-sm font-bold text-gray-700">Cập nhật tài liệu</p>
                            <p className="text-xs text-gray-500">Chương 4: Hình học không gian</p>
                            <button className="mt-2 text-xs font-bold text-[#8B5CF6] hover:underline">Tải lên file</button>
                        </div>
                    </div>
                </div>
              </div>
            </section>

            {/* Documents */}
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-bold text-[#1A1C1E] mb-6 flex items-center gap-2">
                <Upload size={18} className="text-[#3B82F6]" /> Tài liệu mới tải lên
              </h4>
              <div className="space-y-5">
                <DocItem icon={<FileText size={18}/>} name="De_cuong_on_tap_HK2.pdf" info="PDF • 2.4 MB" />
                <DocItem icon={<Presentation size={18}/>} name="Bai_giang_tich_phan.pptx" info="PPTX • 15.8 MB" />
                <DocItem icon={<Table size={18}/>} name="Danh_sach_diem_danh.xlsx" info="XLSX • 120 KB" />
              </div>
              <button className="w-full mt-8 py-3 border-2 border-dashed border-gray-100 rounded-2xl text-sm font-bold text-gray-400 hover:border-[#8B5CF6] hover:text-[#8B5CF6] transition-all">
                Xem kho lưu trữ
              </button>
            </section>

            {/* AI Promo */}
            <div className="relative bg-[#F5F3FF] rounded-3xl p-8 overflow-hidden border border-[#DDD6FE]">
              <div className="relative z-10">
                <h4 className="font-bold text-[#5B21B6] text-lg mb-2">Thử nghiệm AI Assistant</h4>
                <p className="text-xs text-[#7C3AED] leading-relaxed mb-6">
                  Sử dụng AI để tự động tạo đề thi và tóm tắt tiến độ học tập của từng học sinh.
                </p>
                <button className="bg-[#8B5CF6] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-200">
                  Khám phá ngay
                </button>
              </div>
              <Sparkles size={140} className="absolute -right-8 -bottom-8 text-[#8B5CF6] opacity-5" fill="currentColor" />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

// Sub-components for cleaner code
const StatCard = ({ icon, label, value, iconColor, bgColor }: any) => (
  <div className={`${bgColor} p-6 rounded-3xl shadow-sm border border-gray-50 flex items-center gap-5`}>
    <div className={`w-14 h-14 bg-[#F8F9FD] rounded-2xl flex items-center justify-center ${iconColor}`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-bold text-[#1A1C1E]">{value}</p>
    </div>
  </div>
);

const DocItem = ({ icon, name, info }: any) => (
  <div className="flex items-center gap-4 group cursor-pointer">
    <div className="text-gray-400 group-hover:text-[#8B5CF6] transition-colors">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-gray-700 truncate">{name}</p>
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{info}</p>
    </div>
  </div>
);

export default TeacherHome;