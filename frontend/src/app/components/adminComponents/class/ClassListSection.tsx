import { useEffect, useState } from "react";
import {
  Clock,
  Filter,
  Plus,
  BarChart,
  PieChart,
  ChevronDown,
  Search,
  Users,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { UpcomingSession } from "../../../utils/types/session";
import { sessionApi, subjectApi } from "../../../utils/api";
import type { Subject } from "../../../utils/types/subject";
import { getImageSrc, getInitials } from "../../../utils/helpers";
import AddClassModal from "./AddClassModal";

const getColorByLevel = (level: string) => {
  switch (level) {
    case 'Cấp 1 (Tiểu học)':
      return '#14b8a6';
    case 'Cấp 2 (THCS)':
      return '#f97316';
    case 'Cấp 3 (THPT)':
      return '#8b5cf6';
    default:
      return '#94a3b8';
  }
};

const palettes = [
  { bg: "bg-purple-50", text: "text-violet-600", bar: "bg-violet-500" },
  { bg: "bg-blue-50", text: "text-blue-600", bar: "bg-blue-500" },
  { bg: "bg-emerald-50", text: "text-emerald-600", bar: "bg-emerald-500" },
  { bg: "bg-orange-50", text: "text-orange-600", bar: "bg-orange-500" },
  { bg: "bg-rose-50", text: "text-rose-600", bar: "bg-rose-500" },
];

interface ClassCardProps {
  subject: Subject;
  palette: { bg: string; text: string; bar: string };
}

export const ClassListSection = ({
  isOpenModal,
  setIsOpenModal,
  onRefresh 
}: {
  isOpenModal: boolean;
  setIsOpenModal: (v: boolean) => void;
  onRefresh?: () => void; 
}) => {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);

  const [subjects, setSubjects] = useState<Subject[]>([])

  const [totalSubjects, setTotalSubjects] = useState(0)
  const classesPerPage = 20
  const [searchQuery, setSearchQuery] = useState("");

  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingSession[]>([]);
  const [levelData, setLevelData] = useState<any[]>([]);

  // Fetch upcoming classes
  useEffect(() => {
    const fetchUpcomingClasses = async () => {
      try {
        const data = await sessionApi.getUpcomingSessions();
        setUpcomingClasses(data);
      } catch (error) {
        console.error("Error fetching upcoming classes", error);
      }
    };

    fetchUpcomingClasses();
  }, []);


  // Fetch statistics level (CHART)
  useEffect(() => {
    subjectApi.getStatisticsLevel()
      .then((res) => {
        const total = res.reduce(
          (sum: number, item: any) => sum + item.total,
          0
        ) || 1;

        const data = res.map((item: any) => ({
          name: item.level,
          value: item.total,
          percentage: Math.round((item.total / total) * 100),
          color: getColorByLevel(item.level),
        }));

        setLevelData(data);
      })
      .catch(console.error);
  }, []);

   const fetchSubjects = async (page: number = currentPage) => {
    try {
      const res = await subjectApi.getAll(page, classesPerPage)
      setSubjects(res.data)
      setTotalSubjects(res.total)
    } catch (error) {
      console.error("Error fetching subjects", error)
    }
  }

  // Fetch subjects khi page thay đổi
  useEffect(() => {
    fetchSubjects(currentPage)
  }, [currentPage])

    const handleModalSuccess = () => {
    fetchSubjects(currentPage); // Refresh lại trang hiện tại
    if (onRefresh) onRefresh(); // Gọi refresh từ parent nếu có
  };


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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatTime = (start: string, end: string) => `${start.slice(0, 5)} - ${end.slice(0, 5)}`;

  const totalPages = Math.ceil(totalSubjects / classesPerPage)

  const ClassCard = ({ subject, palette }: ClassCardProps) => {
    const teacher = subject.teacherSubjects?.[0]?.teacher;
    const teacherImage = getImageSrc(teacher?.user?.image);
    const subjectImage = getImageSrc(subject.image);

    const current = Number(subject.currentStudents) || 0;
    const max = Number(subject.maxStudents) || 0;

    const percent = max > 0
      ? Math.min(100, Math.round((current / max) * 100))
      : 0;

    return (
      <div
        onClick={() => navigate(`/admin/class/${subject.id}`)}
        className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer" >

        <div className="relative h-28 bg-slate-100">
          {subjectImage ? (
            <img
              src={subjectImage}
              alt={subject.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x150?text=No+Image";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Status */}
          <span
            className={`absolute top-2 right-2 px-2 py-1.5 rounded-full shadow-sm flex items-center ${subject.status === "active"
              ? "bg-emerald-500"
              : subject.status === "upcoming"
                ? "bg-indigo-500"
                : "bg-red-500"
              }`}
          >
            <span className="text-white font-bold text-[9px] leading-none">
              {subject.status === "active"
                ? "ĐANG HỌC"
                : subject.status === "upcoming"
                  ? "SẮP KHAI GIẢNG"
                  : "KẾT THÚC"}
            </span>
          </span>
        </div>

        <div className="p-4">
          <div className="mb-2 flex items-start justify-between">

            {/* LEFT: name + subject type */}
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                {subject.name}
              </h3>

              {subject.subjectType && (
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Môn học: {subject.subjectType.name} - {subject.subjectType.academicLevel?.name}
                </p>
              )}
            </div>

            {/* RIGHT: grade */}
            <span className={`px-2 py-0.5 ${palette.bg} rounded flex items-center justify-center`}>
              <span className={`font-bold text-[9px] ${palette.text}`}>
                Khối {subject.grade}
              </span>
            </span>

          </div>
          {/* Teacher */}
          <div className="flex items-center gap-2 py-2 border-t border-b border-slate-50 mb-2">
            {/* Avatar giáo viên */}
            <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center font-bold text-white text-[9px] bg-blue-700 shrink-0">
              {getImageSrc(teacherImage) ? (
                <img
                  src={getImageSrc(teacher?.user?.image)!}
                  alt={teacher?.user?.fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerText = getInitials(teacher?.user?.fullName);
                  }}
                />
              ) : (
                <span>{getInitials(teacher?.user?.fullName)}</span>
              )}
            </div>

            {/* Thông tin giáo viên */}
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-[10px] truncate">
                {teacher?.user?.fullName || "Chưa sắp xếp"}
              </p>
              <p className="text-slate-400 text-[9px] truncate">
                Chuyên môn: {teacher?.specialty || ""}
              </p>
            </div>
          </div>

          {/* Schedule + Fee */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <p className="text-slate-400 font-bold text-[8px] mb-0.5">
                LỊCH HỌC
              </p>
              <p className="font-medium text-slate-900 text-[10px]">
                {subject.sessionsPerWeek} buổi/tuần
              </p>
            </div>

            <div className="flex-1">
              <p className="text-slate-400 font-bold text-[8px] mb-0.5">
                HỌC PHÍ
              </p>
              <p className="font-bold text-violet-600 text-[10px]">
                {subject.price.toLocaleString()}đ/tháng
              </p>
            </div>
          </div>

          {/* Capacity */}
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-slate-400 font-bold text-[10px]">
                Sĩ số
              </span>
              <span
                className={`font-bold text-[10px] ${percent === 100 ? "text-emerald-600" : "text-slate-900"
                  }`}
              >
                {percent === 100
                  ? `Đầy (${subject.currentStudents}/${subject.maxStudents})`
                  : `${subject.currentStudents}/${subject.maxStudents} (${percent}%)`}
              </span>
            </div>

            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${palette.bar}`}
                style={{
                  width: `${percent}%`,
                  display: 'block',
                  minWidth: percent > 0 ? '2px' : '0'
                }}
              />
            </div>
          </div>

          {/* Note */}
          <div className="p-2 bg-slate-50 rounded-lg mb-3">
            <p className="text-slate-400 font-bold text-[9px] mb-0.5">
              GHI CHÚ
            </p>
            <p
              className="text-slate-600 text-[10px] italic truncate"
              title={subject.note}
            >
              {subject.note || "Không có ghi chú"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Tính toán tỉ lệ lấp đầy cho từng lớp
  const subjectChartData = [...subjects]
    .map((s) => {
      const current = Number(s.currentStudents) || 0;
      const max = Number(s.maxStudents) || 1;
      const fillRate = Math.round((current / max) * 100);

      return {
        name: s.name,
        value: fillRate,
        displayValue: `${current}/${max}`
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subjects Chart */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                  <h2 className="font-bold text-slate-800 text-xs uppercase">Tỷ lệ lấp đầy lớp học</h2>
                  <p className="text-[10px] text-slate-400">Hiệu suất tuyển sinh (%)</p>
                </div>
                <BarChart size={16} className="text-slate-500" />
              </div>

              <div className="h-44 flex items-end justify-between gap-3 px-2">
                {subjectChartData.map((subject, idx) => (
                  <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-20 w-max max-w-[180px] 
                    bg-slate-800 text-white text-[10px] px-3 py-2 rounded-lg shadow-xl 
                    pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 
                    flex flex-col items-center gap-1">
                      <p className="font-bold text-center leading-tight">{subject.name}</p>
                      <p className="text-slate-300 text-[9px]">Sĩ số: {subject.displayValue} ({subject.value}%)</p>

                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                    </div>

                    <div
                      className={`w-full max-w-[32px] rounded-t-lg transition-all duration-500 ${subject.value >= 90 ? "bg-emerald-500" :
                        subject.value >= 50 ? "bg-violet-500" : "bg-rose-400"
                        }`}
                      style={{ height: `${subject.value}%` }}
                    >
                      {subject.value > 10 && (
                        <span className="flex justify-center text-[9px] text-white font-bold pt-1">
                          {subject.value}%
                        </span>
                      )}
                    </div>

                    <span className="mt-3 text-[10px] text-slate-500 font-medium truncate w-full text-center">
                      {subject.name.split(' ')[0]} {subject.name.split(' ')[1] || ''}
                    </span>


                  </div>
                ))}
              </div>
            </div>
            {/* Grade Distribution */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-slate-800 text-xs">
                  THỐNG KÊ THEO CẤP
                </h2>
                <PieChart size={16} className="text-slate-500" />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                {/* Chart */}
                <div className="relative" style={{ width: '150px', height: '150px' }}>
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    {levelData.map((item, i) => {
                      const circumference = 2 * Math.PI * 45;
                      const dash = (item.percentage / 100) * circumference;

                      return (
                        <circle
                          key={i}
                          cx="60"
                          cy="60"
                          r="45"
                          fill="transparent"
                          stroke={item.color}
                          strokeWidth="10"
                          strokeDasharray={`${dash} ${circumference}`}
                          strokeDashoffset={levelData
                            .slice(0, i)
                            .reduce(
                              (acc, g) =>
                                acc - (g.percentage / 100) * circumference,
                              0
                            )}
                          strokeLinecap="round"
                        />
                      );
                    })}
                  </svg>

                  {/* Center */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {levelData[0] && (
                      <>
                        <span className="text-lg font-bold text-slate-900">
                          {levelData[0].percentage}%
                        </span>
                        <span className="text-xs text-slate-400">
                          {levelData[0].name}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                  {levelData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-600 text-xs">
                        {item.name}: {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-500" />
                <h2 className="font-bold text-slate-900 text-sm">Lọc danh sách lớp học</h2>
              </div>
              <button
                onClick={() => setIsOpenModal(true)}
                className="flex items-center gap-1 px-4 py-2 bg-slate-900 rounded-lg text-white text-xs font-semibold hover:bg-slate-800"
              >
                <Plus size={14} />
                Thêm lớp
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-slate-400 font-bold text-[9px] block mb-1">KHỐI LỚP</label>
                <div className="relative">
                  <select className="w-full bg-white rounded-lg border border-slate-100 px-3 py-2 text-xs font-medium appearance-none">
                    <option>Tất cả khối lớp</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-slate-400 font-bold text-[9px] block mb-1">MÔN HỌC</label>
                <div className="relative">
                  <select className="w-full bg-white rounded-lg border border-slate-100 px-3 py-2 text-xs font-medium appearance-none">
                    <option>Tất cả môn</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-slate-400 font-bold text-[9px] block mb-1">GIÁO VIÊN</label>
                <div className="relative">
                  <select className="w-full bg-white rounded-lg border border-slate-100 px-3 py-2 text-xs font-medium appearance-none">
                    <option>Tất cả giáo viên</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-slate-400 font-bold text-[9px] block mb-1">TRẠNG THÁI</label>
                <div className="relative">
                  <select className="w-full bg-white rounded-lg border border-slate-100 px-3 py-2 text-xs font-medium appearance-none">
                    <option>Mọi trạng thái</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder="Tìm kiếm lớp học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 pl-9 pr-4 py-2 bg-slate-50 rounded-lg  border boder-slate-100 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 text-sm">Lịch học sắp tới</h2>
              <button className="text-blue-600 font-medium text-xs hover:underline">
                Xem tất cả
              </button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {upcomingClasses.map((item, index) => {
                const remaining = getTimeRemaining(item.sessionDate, item.startTime);

                return (
                  <div
                    key={index}
                    className={`flex gap-3 p-3 rounded-xl border-l-4 
    ${[
                        "border-l-violet-500",
                        "border-l-teal-400",
                        "border-l-amber-400",
                        "border-l-blue-500"
                      ][index % 4]}
    hover:shadow-md hover:bg-gray-50 transition-all duration-200
  `}
                  >
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title + badge */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm truncate">
                            {item.subjectName} - Lớp {item.grade}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 truncate">
                            <Users className="w-3 h-3" />
                            {item.teacherName}
                          </div>
                        </div>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${getStatusColor(remaining)}`}
                        >
                          {remaining}
                        </span>
                      </div>

                      {/* Time + Date */}
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
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
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* Class List */}
      <div className="space-y-4">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6  ">
          {subjects.map((subject, index) => {
            const palette = palettes[index % palettes.length];
            return (
              <ClassCard
                key={subject.id}
                subject={subject}
                palette={palette}
              />
            );
          })}
        </div>

        {/* Pagination Section */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between p-4  gap-4">
          {/* Thông tin số lượng */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {/* Hiển thị ảnh của tối đa 3 lớp học đầu tiên trong trang hiện tại */}
              {subjects.slice(0, 3).map((subject) => {
                const subjectImage = getImageSrc(subject.image);
                return (
                  <div
                    key={subject.id}
                    className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm"
                  >
                    {subjectImage ? (
                      <img
                        src={subjectImage}
                        alt={subject.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-indigo-400">
                          {getInitials(subject.name)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 font-medium ml-2">
              Hiển thị <span className="text-slate-900 font-bold">{(currentPage - 1) * classesPerPage + 1}–{Math.min(currentPage * classesPerPage, totalSubjects)}</span> trên tổng số <span className="text-slate-900 font-bold">{totalSubjects}</span> lớp học
            </p>
          </div>

          {/* Nút điều hướng */}
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                const isCurrent = currentPage === page;
                const isEdge = page === 1 || page === totalPages;
                const isNear = Math.abs(page - currentPage) <= 1;

                if (isEdge || isNear) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[36px] h-9 flex items-center justify-center text-xs font-bold rounded-lg transition-all ${isCurrent
                        ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:bg-white hover:text-slate-900"
                        }`}
                    >
                      {page}
                    </button>
                  );
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-1 text-slate-400 text-xs font-bold">...</span>;
                }
                return null;
              })}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all group"
            >
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <AddClassModal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        mode="create"
        onSuccess={handleModalSuccess} // Thêm callback
      />
    </div>
  );
};