import { useEffect, useState, useMemo } from "react";
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
  ArrowRight,
  ChevronRight,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { UpcomingSession } from "../../utils/types/session";
import { sessionApi, subjectApi } from "../../utils/api";
import type { Subject } from "../../utils/types/subject";
import { getImageSrc, getInitials } from "../../utils/helpers";
import AddClassModal from "./AddClassModal";

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highcharts3d from 'highcharts/highcharts-3d';

// Kích hoạt module 3D
if (typeof Highcharts === 'object') {
  const initialize3d = highcharts3d as any;

  if (typeof initialize3d === 'function') {
    initialize3d(Highcharts);
  } else if (initialize3d && typeof initialize3d.default === 'function') {
    initialize3d.default(Highcharts);
  }
}

const bluePalette = ['#224D7A', '#417BB9', '#A8C7E5', '#7BB0DF'];

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

interface FilterState {
  grade: string;
  subjectTypeId: string;
  teacherId: string;
  status: string;
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

  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    grade: '',
    subjectTypeId: '',
    teacherId: '',
    status: ''
  });

  // Data for filter dropdowns
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjectTypes, setSubjectTypes] = useState<any[]>([]);
  const [grades, setGrades] = useState<string[]>([]);

  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingSession[]>([]);
  const [levelData, setLevelData] = useState<any[]>([]);
  const [totalSubjectsCount, setTotalSubjectsCount] = useState<number>(0);

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
        const raw = res;
        const data = raw.map((item: any) => ({
          name: item.level,
          y: item.total,
          sliced: true,
          slicedOffset: 12
        }));

        setLevelData(data);
        const total = raw.reduce((sum: number, item: any) => sum + item.total, 0);
        setTotalSubjectsCount(total);
      })
      .catch(console.error);
  }, []);

  // Fetch all subjects for filter options
  useEffect(() => {
    const fetchAllSubjects = async () => {
      try {
        const res = await subjectApi.getAll(1, 1000);
        setAllSubjects(res.data);

        // Extract unique grades
        const uniqueGrades = [...new Set(res.data.map((s: Subject) => s.grade).filter(Boolean))];
        setGrades(uniqueGrades.sort());

        // Extract unique subject types
        const uniqueSubjectTypes = [...new Map(
          res.data.map((s: Subject) => [s.subjectType?.id, s.subjectType])
        ).values()].filter(Boolean);
        setSubjectTypes(uniqueSubjectTypes);

        // Extract unique teachers
        const uniqueTeachers = [...new Map(
          res.data.flatMap((s: Subject) =>
            s.teacherSubjects?.map(ts => ts.teacher) || []
          ).filter(Boolean).map((t: any) => [t.id, t])
        ).values()];
        setTeachers(uniqueTeachers);
      } catch (error) {
        console.error("Error fetching all subjects", error);
      }
    };
    fetchAllSubjects();
  }, []);

  // Filtered subjects based on search and filters
  const filteredSubjects = useMemo(() => {
    let filtered = [...allSubjects];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(subject =>
        subject.name.toLowerCase().includes(query) ||
        subject.subjectType?.name?.toLowerCase().includes(query) ||
        subject.teacherSubjects?.[0]?.teacher?.user?.fullName?.toLowerCase().includes(query)
      );
    }

    // Apply grade filter
    if (filters.grade) {
      filtered = filtered.filter(subject => subject.grade === filters.grade);
    }

    // Apply subject type filter
    if (filters.subjectTypeId) {
      filtered = filtered.filter(subject => subject.subjectType?.id === Number(filters.subjectTypeId));
    }

    // Apply teacher filter
    if (filters.teacherId) {
      filtered = filtered.filter(subject =>
        subject.teacherSubjects?.some(ts => ts.teacher?.id === Number(filters.teacherId))
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(subject => subject.status === filters.status);
    }

    return filtered;
  }, [allSubjects, searchQuery, filters]);

  // Update pagination based on filtered results
  const totalFilteredPages = Math.ceil(filteredSubjects.length / classesPerPage);
  const paginatedSubjects = useMemo(() => {
    const start = (currentPage - 1) * classesPerPage;
    const end = start + classesPerPage;
    return filteredSubjects.slice(start, end);
  }, [filteredSubjects, currentPage]);

  const fetchSubjects = async (page: number = currentPage) => {
    try {
      const res = await subjectApi.getAll(page, classesPerPage)
      setSubjects(res.data)
      setTotalSubjects(res.total)
    } catch (error) {
      console.error("Error fetching subjects", error)
    }
  }

  useEffect(() => {
    fetchSubjects(currentPage)
  }, [currentPage])

  const handleModalSuccess = () => {
    fetchSubjects(currentPage);
    if (onRefresh) onRefresh();
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

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const clearAllFilters = () => {
    setFilters({
      grade: '',
      subjectTypeId: '',
      teacherId: '',
      status: ''
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const clearFilter = (key: keyof FilterState) => {
    handleFilterChange(key, '');
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(v => v && v !== '').length;
  };

  const pie3dOptions: Highcharts.Options = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      options3d: {
        enabled: true,
        alpha: 60,
        beta: 0
      },
      height: '240px',
      margin: [0, 0, 0, 0]
    },
    title: { text: undefined },
    accessibility: { enabled: false },
    credits: { enabled: false },
    colors: bluePalette,
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        depth: 32,
        dataLabels: {
          enabled: true,
          format: '{point.percentage:.0f}%',
          distance: -30,
          style: {
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: '600',
            textOutline: 'none'
          }
        },
        showInLegend: false
      }
    },
    series: [{
      type: 'pie',
      name: 'Số lượng lớp',
      data: levelData
    }]
  };

  const ClassCard = ({ subject, palette }: ClassCardProps) => {
    const teacher = subject.teacherSubjects?.[0]?.teacher;
    const teacherImage = getImageSrc(teacher?.user?.image);
    const subjectImage = getImageSrc(subject.image);

    const current = Number(subject.currentStudents) || 0;
    const max = Number(subject.maxStudents) || 0;

    const percent = max > 0
      ? Math.min(100, Math.round((current / max) * 100))
      : 0;

    const getProgressClass = () => {
      if (percent >= 80) return 'gradient-secondary';
      if (percent >= 50) return 'gradient-primary';
      if (percent >= 30) return 'gradient-accent';
      return 'gradient-danger';
    };

    const getStatusStyle = () => {
      switch (subject.status) {
        case "active":
          return { bg: "bg-white/95 backdrop-blur-sm text-emerald-600 border-emerald-200", text: "ĐANG HỌC", dot: "bg-emerald-500" };
        case "upcoming":
          return { bg: "bg-white/95 backdrop-blur-sm text-indigo-600 border-indigo-200", text: "SẮP KHAI GIẢNG", dot: "bg-indigo-500" };
        default:
          return { bg: "bg-white/95 backdrop-blur-sm text-slate-500 border-slate-200", text: "KẾT THÚC", dot: "bg-slate-400" };
      }
    };

    const statusStyle = getStatusStyle();

    return (
      <div
        onClick={() => navigate(`/admin/class/${subject.id}`)}
        className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 cursor-pointer relative"
      >
        {/* Premium Gradient Border on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/0 via-purple-400/0 to-pink-400/0 group-hover:from-indigo-400/15 group-hover:via-purple-400/15 group-hover:to-pink-400/15 transition-all duration-500 rounded-2xl pointer-events-none" />

        {/* Image Section - Giữ nguyên chiều cao h-28 */}
        <div className="relative h-28 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
          {subjectImage ? (
            <>
              <img
                src={subjectImage}
                alt={subject.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x150?text=No+Image";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
              <svg className="w-12 h-12 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Status Badge - Modern Glassmorphism */}
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full ${statusStyle.bg} border shadow-sm`}>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
              <span className="font-bold text-[9px] leading-none tracking-wide">
                {statusStyle.text}
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <div className="mb-2 flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors duration-300 line-clamp-1">
                {subject.name}
              </h3>
              {subject.subjectType && (
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {subject.subjectType.name} - {subject.subjectType.academicLevel?.name}
                </p>
              )}
            </div>
            <span className={`px-2 py-0.5 rounded-lg bg-gradient-to-r ${palette.bg} shadow-sm flex items-center justify-center ml-2`}>
              <span className={`font-bold text-[9px] ${palette.text}`}>
                Khối {subject.grade}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 py-2 border-t border-b border-slate-50 mb-2">
            <div className="relative">
              <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center font-bold text-white text-[9px] btn-gradient shadow-md shrink-0">
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
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-[10px] truncate">
                {teacher?.user?.fullName || "Chưa sắp xếp"}
              </p>
              <p className="text-slate-400 text-[9px] truncate">
                {teacher?.specialty || "Giáo viên"}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <div className="flex-1 bg-gradient-to-br from-slate-50 to-white rounded-lg p-1.5 border border-slate-100">
              <p className="text-slate-400 font-bold text-[8px] mb-0.5 uppercase tracking-wider">LỊCH HỌC</p>
              <p className="font-medium text-slate-800 text-[10px] flex items-center gap-1">
                <Clock size={10} className="text-indigo-500" />
                {subject.sessionsPerWeek} buổi/tuần
              </p>
            </div>
            <div className="flex-1 bg-gradient-to-br from-slate-50 to-white rounded-lg p-1.5 border border-slate-100">
              <p className="text-slate-400 font-bold text-[8px] mb-0.5 uppercase tracking-wider">HỌC PHÍ</p>
              <p className="font-bold gradient-text text-[10px]">
                {subject.price.toLocaleString()}đ
              </p>
              <p className="text-[8px] text-slate-400">/tháng</p>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Sĩ số</span>
              <span className={`font-bold text-[10px] ${percent === 100 ? "text-emerald-600" : "text-slate-800"}`}>
                {percent === 100
                  ? `Đầy (${subject.currentStudents}/${subject.maxStudents})`
                  : `${subject.currentStudents}/${subject.maxStudents} (${percent}%)`}
              </span>
            </div>
            <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out group-hover:shadow-md ${getProgressClass()}`}
                style={{
                  width: `${percent}%`,
                  minWidth: percent > 0 ? '2px' : '0'
                }}
              />

              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          </div>

          {subject.note && (
            <div className="p-2 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-lg border border-indigo-100/50">
              <p className="text-slate-500 font-bold text-[9px] mb-0.5 uppercase tracking-wider">GHI CHÚ</p>
              <p className="text-slate-600 text-[10px] italic line-clamp-1 group-hover:line-clamp-none transition-all duration-300" title={subject.note}>
                {subject.note}
              </p>
            </div>
          )}

          {!subject.note && (
            <div className="p-2 bg-slate-50/50 rounded-lg">
              <p className="text-slate-400 font-bold text-[9px] mb-0.5 uppercase tracking-wider">GHI CHÚ</p>
              <p className="text-slate-400 text-[10px] italic">Không có ghi chú</p>
            </div>
          )}
        </div>
      </div>
    );
  };


  const subjectChartData = [...paginatedSubjects]
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

  const maxFillRate = Math.max(...subjectChartData.map(d => d.value), 100);
  const chartHeight = 160;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subjects Chart */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="p-4">
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-100 rounded-lg shadow-sm">
                        <BarChart size={14} className="text-indigo-500" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        Tỷ lệ lấp đầy lớp học
                      </h3>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Hiệu suất tuyển sinh theo từng lớp</p>
                </div>

                <div className="relative mt-2">
                  <div className="absolute left-0 right-0 h-full flex flex-col justify-between pointer-events-none">
                    {[100, 75, 50, 25, 0].map((line) => (
                      <div key={line} className="relative">
                        <div className="border-t border-slate-100"></div>
                        <span className="absolute -left-2 -top-2 text-[9px] text-slate-400">{line}%</span>
                      </div>
                    ))}
                  </div>

                  <div className="h-44 flex items-end justify-between gap-2 ml-6">
                    {subjectChartData.map((subject, idx) => {
                      const barHeight = (subject.value / maxFillRate) * chartHeight;
                      const isHigh = subject.value >= 80;
                      const isMedium = subject.value >= 50 && subject.value < 80;
                      const isLow = subject.value < 50;

                      let barColor = "from-emerald-500 to-emerald-400";
                      let barBg = "bg-emerald-100";
                      if (isMedium) {
                        barColor = "from-blue-500 to-blue-400";
                        barBg = "bg-blue-100";
                      } else if (isLow) {
                        barColor = "from-amber-500 to-amber-400";
                        barBg = "bg-amber-100";
                      }

                      return (
                        <div key={idx} className="flex flex-col items-center flex-1 group">
                          <div className="relative w-full flex justify-center">
                            {/* Tooltip */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 w-max max-w-[160px] 
                            bg-slate-800 text-white text-[10px] px-2 py-1 rounded-lg shadow-lg 
                            pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 
                            flex items-center gap-1.5 whitespace-nowrap">
                              <span className="font-semibold">{subject.name}</span>
                              <span className="text-emerald-400">{subject.displayValue}</span>
                              <span>({subject.value}%)</span>
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                            </div>

                            {/* Bar */}
                            <div
                              className={`w-10 rounded-t-lg transition-all duration-500 ease-out cursor-pointer relative overflow-hidden shadow-sm group-hover:shadow-md ${barBg}`}
                              style={{ height: `${Math.max(barHeight, 4)}px` }}
                            >
                              <div
                                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${barColor} transition-all duration-500`}
                                style={{ height: `${subject.value}%` }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              </div>
                              {subject.value >= 25 && (
                                <span className="absolute bottom-1 left-0 right-0 text-center text-white font-bold text-[9px] drop-shadow-sm z-10">
                                  {subject.value}%
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="mt-1.5 text-[9px] text-slate-500 font-medium truncate w-full text-center px-1">
                            {subject.name.length > 10 ? subject.name.slice(0, 8) + '…' : subject.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex justify-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[8px] text-slate-500">Tốt (≥80%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-[8px] text-slate-500">Trung bình (50-79%)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-[8px] text-slate-500">Cần cải thiện (&lt;50%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grade Distribution */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="p-4">
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-100 rounded-lg shadow-sm">
                        <PieChart size={14} className="text-indigo-500" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        Phân bố lớp học
                      </h3>
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {totalSubjectsCount} lớp
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Chi tiết theo cấp học</p>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="w-full h-[220px]">
                    {levelData.length > 0 ? (
                      <HighchartsReact highcharts={Highcharts} options={pie3dOptions} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                        Đang tải dữ liệu...
                      </div>
                    )}
                  </div>

                  <div className="w-full space-y-1 mt-1">
                    {levelData.map((level, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 transition-all duration-200"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full shadow-sm"
                            style={{ backgroundColor: bluePalette[i % bluePalette.length] }}
                          />
                          <span className="font-medium text-xs text-slate-700">{level.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-800">
                            {level.y}
                          </span>
                          <span className="text-[10px] text-slate-400">lớp</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Section - Modern & Premium */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-lg shadow-slate-100/50">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-sm">
                  <Filter size="16" className="text-indigo-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800 text-base tracking-tight">
                    Bộ lọc lớp học
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tìm kiếm và lọc danh sách lớp theo tiêu chí
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpenModal(true)}
                className="group flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:from-slate-700 hover:to-slate-600 rounded-xl text-white text-xs font-semibold shadow-md shadow-slate-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus size="14" className="group-hover:rotate-90 transition-transform duration-300" />
                Thêm lớp mới
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-slate-500 font-medium text-[10px] uppercase tracking-wider block mb-1.5 ml-1">
                  KHỐI LỚP
                </label>
                <div className="relative group">
                  <select
                    value={filters.grade}
                    onChange={(e) => handleFilterChange('grade', e.target.value)}
                    className="w-full bg-slate-50/80 hover:bg-white rounded-xl border border-slate-200/80 px-3 py-2.5 text-xs font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all duration-200 cursor-pointer"
                  >
                    <option value="">Tất cả khối lớp</option>
                    {grades.map(grade => (
                      <option key={grade} value={grade}>Khối {grade}</option>
                    ))}
                  </select>
                  <ChevronDown size="14" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-slate-500 font-medium text-[10px] uppercase tracking-wider block mb-1.5 ml-1">
                  MÔN HỌC
                </label>
                <div className="relative group">
                  <select
                    value={filters.subjectTypeId}
                    onChange={(e) => handleFilterChange('subjectTypeId', e.target.value)}
                    className="w-full bg-slate-50/80 hover:bg-white rounded-xl border border-slate-200/80 px-3 py-2.5 text-xs font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all duration-200 cursor-pointer"
                  >
                    <option value="">Tất cả môn</option>
                    {subjectTypes.map((type: any) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                  <ChevronDown size="14" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-slate-500 font-medium text-[10px] uppercase tracking-wider block mb-1.5 ml-1">
                  GIÁO VIÊN
                </label>
                <div className="relative group">
                  <select
                    value={filters.teacherId}
                    onChange={(e) => handleFilterChange('teacherId', e.target.value)}
                    className="w-full bg-slate-50/80 hover:bg-white rounded-xl border border-slate-200/80 px-3 py-2.5 text-xs font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all duration-200 cursor-pointer"
                  >
                    <option value="">Tất cả giáo viên</option>
                    {teachers.map((teacher: any) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.user?.fullName || `GV${teacher.id}`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size="14" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-slate-500 font-medium text-[10px] uppercase tracking-wider block mb-1.5 ml-1">
                  TRẠNG THÁI
                </label>
                <div className="relative group">
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full bg-slate-50/80 hover:bg-white rounded-xl border border-slate-200/80 px-3 py-2.5 text-xs font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all duration-200 cursor-pointer"
                  >
                    <option value="">Mọi trạng thái</option>
                    <option value="active">Đang học</option>
                    <option value="upcoming">Sắp khai giảng</option>
                    <option value="ended">Kết thúc</option>
                  </select>
                  <ChevronDown size="14" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-2">
              <div className="relative group">
                <Search size="15" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="search"
                  placeholder="Tìm kiếm lớp học theo tên, giáo viên, môn học..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full lg:w-96 pl-10 pr-4 py-2.5 bg-slate-50/80 hover:bg-white rounded-xl border border-slate-200/80 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 transition-all duration-200"
                />
              </div>
            </div>

            {/* Active filters preview */}
            {(getActiveFilterCount() > 0 || searchQuery) && (
              <div className="mt-5 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100/80">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Bộ lọc đang dùng:</span>
                <div className="flex flex-wrap gap-1.5">
                  {filters.grade && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 rounded-lg text-[10px] font-medium text-indigo-600 border border-indigo-100/50">
                      Khối {filters.grade}
                      <button onClick={() => clearFilter('grade')} className="hover:text-indigo-800">
                        <X size={10} />
                      </button>
                    </span>
                  )}
                  {filters.subjectTypeId && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 rounded-lg text-[10px] font-medium text-indigo-600 border border-indigo-100/50">
                      {subjectTypes.find(t => t.id === Number(filters.subjectTypeId))?.name || 'Môn học'}
                      <button onClick={() => clearFilter('subjectTypeId')} className="hover:text-indigo-800">
                        <X size={10} />
                      </button>
                    </span>
                  )}
                  {filters.teacherId && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 rounded-lg text-[10px] font-medium text-indigo-600 border border-indigo-100/50">
                      {teachers.find(t => t.id === Number(filters.teacherId))?.user?.fullName || 'Giáo viên'}
                      <button onClick={() => clearFilter('teacherId')} className="hover:text-indigo-800">
                        <X size={10} />
                      </button>
                    </span>
                  )}
                  {filters.status && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 rounded-lg text-[10px] font-medium text-indigo-600 border border-indigo-100/50">
                      {filters.status === 'active' ? 'Đang học' : filters.status === 'upcoming' ? 'Sắp khai giảng' : 'Kết thúc'}
                      <button onClick={() => clearFilter('status')} className="hover:text-indigo-800">
                        <X size={10} />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 rounded-lg text-[10px] font-medium text-indigo-600 border border-indigo-100/50">
                      Tìm kiếm: {searchQuery}
                      <button onClick={() => setSearchQuery('')} className="hover:text-indigo-800">
                        <X size={10} />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={clearAllFilters}
                    className="ml-1 text-[10px] text-indigo-400 hover:text-indigo-600 transition-colors font-medium"
                  >
                    Đặt lại tất cả
                  </button>
                </div>
              </div>
            )}

            {/* Results count */}
            <div className="mt-4 text-right">
              <span className="text-xs text-slate-500">
                Tìm thấy <span className="font-semibold text-indigo-600">{filteredSubjects.length}</span> lớp học
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100/80 shadow-lg shadow-slate-200/20 overflow-hidden backdrop-blur-sm">
            <div className="relative px-5 pt-5 pb-3">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl -z-0" />
              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-slate-900">
                    Lịch học sắp tới
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="text-[11px] font-semibold text-indigo-500 hover:text-indigo-600 transition-colors flex items-center gap-0.5 group">
                    Xem tất cả
                    <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            <div className="relative px-3 py-1">
              <div className="absolute left-[27px] top-0 bottom-0 w-px bg-gradient-to-b from-indigo-200/60 via-slate-200 to-transparent" />

              <div className="space-y-2 max-h-[420px] pr-1 custom-scrollbar">
                {upcomingClasses.map((item, index) => {
                  const remaining = getTimeRemaining(item.sessionDate, item.startTime);
                  const isSoon = remaining.includes('giờ');
                  const isToday = remaining === 'Đang diễn ra';

                  let borderGradient = "from-indigo-500 to-purple-500";
                  let badgeColor = "bg-indigo-50 text-indigo-600";
                  let iconBg = "bg-indigo-100";

                  if (isToday) {
                    borderGradient = "from-emerald-500 to-teal-500";
                    badgeColor = "bg-emerald-50 text-emerald-600";
                    iconBg = "bg-emerald-100";
                  } else if (isSoon) {
                    borderGradient = "from-amber-500 to-orange-500";
                    badgeColor = "bg-amber-50 text-amber-600";
                    iconBg = "bg-amber-100";
                  }

                  return (
                    <div key={index} className="relative group">
                      <div className="absolute left-[7px] top-5 -translate-x-1/2 z-10">
                        <div className={`relative w-2.5 h-2.5 rounded-full ring-4 ring-white shadow-sm ${isToday ? 'bg-emerald-500 animate-pulse' : isSoon ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                      </div>

                      <div className={`ml-6 p-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] cursor-pointer relative overflow-hidden group`}>
                        <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{ background: `linear-gradient(120deg, transparent 30%, ${isToday ? 'rgba(16,185,129,0.05)' : isSoon ? 'rgba(245,158,11,0.05)' : 'rgba(99,102,241,0.05)'} 70%)` }} />

                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-800 text-sm truncate leading-tight">
                              {item.subjectName}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-medium text-slate-400">Lớp {item.grade}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <div className="flex items-center gap-0.5">
                                <Users size={9} className="text-slate-400" />
                                <span className="text-[10px] text-slate-500 truncate">{item.teacherName}</span>
                              </div>
                            </div>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${badgeColor} shadow-sm`}>
                            {remaining}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 pt-1 border-t border-slate-50">
                          <div className="flex items-center gap-1.5 bg-slate-50/80 px-2 py-1 rounded-lg">
                            <Clock size={11} className={`${isToday ? 'text-emerald-500' : isSoon ? 'text-amber-500' : 'text-indigo-400'}`} />
                            <span className="font-mono text-[11px] font-medium text-slate-700">{formatTime(item.startTime, item.endTime)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-slate-50/80 px-2 py-1 rounded-lg">
                            <Calendar size={11} className="text-slate-400" />
                            <span className="text-[11px] text-slate-600 font-medium">{formatDate(item.sessionDate).slice(0, -5)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-2 p-4 border-t border-slate-100/80 bg-gradient-to-r from-slate-50/50 to-transparent">
              <button className="w-full py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1 group">
                <span>Xem tất cả lịch học</span>
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }
          `}</style>
        </aside>
      </div>

      {/* Class List */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedSubjects.map((subject, index) => {
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
        {filteredSubjects.length > 0 && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {paginatedSubjects.slice(0, 3).map((subject) => {
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
                Hiển thị <span className="text-slate-900 font-bold">{(currentPage - 1) * classesPerPage + 1}–{Math.min(currentPage * classesPerPage, filteredSubjects.length)}</span> trên tổng số <span className="text-slate-900 font-bold">{filteredSubjects.length}</span> lớp học
              </p>
            </div>

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
                {Array.from({ length: totalFilteredPages }, (_, i) => i + 1).map(page => {
                  const isCurrent = currentPage === page;
                  const isEdge = page === 1 || page === totalFilteredPages;
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
                disabled={currentPage === totalFilteredPages || totalFilteredPages === 0}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all group"
              >
                <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {filteredSubjects.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-slate-100 rounded-full">
                <Search size={32} className="text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-700">Không tìm thấy lớp học</h3>
              <p className="text-sm text-slate-500">Vui lòng thử lại với bộ lọc khác</p>
              <button
                onClick={clearAllFilters}
                className="mt-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          </div>
        )}
      </div>
      <AddClassModal
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        mode="create"
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};