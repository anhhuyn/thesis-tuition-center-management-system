import { useState, useEffect } from 'react';
import { subjectApi } from '../../../utils/api';
import type { Subject } from '../../../utils/types/subject';
import {
  Plus, Search, BookOpen, Users, User,
  CalendarClock, BadgeCheck, Layers, Activity, NotebookPen, CalendarDays
} from 'lucide-react';
import { ClassModal } from './ClassModal';
import { CustomSelect } from '../../ui/CustomSelect';

interface ClassDashboardProps {
  onSelectClass: (classData: Subject) => void;
}

const colors = ["#EDE9FE", "#DBEAFE", "#EBFCEF", "#FFFDE7", "#FFF5F5"];

export function ClassDashboard({ onSelectClass }: ClassDashboardProps) {

  const [classes, setClasses] = useState<Subject[]>([]);

  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    all: 0,
    active: 0,
    upcoming: 0,
    ended: 0,
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ================= FETCH DATA =================
  const fetchSubjects = async () => {
  try {
    setLoading(true);

    const res = await subjectApi.getAll(
      page,
      12,
      filterStatus !== "all" ? filterStatus : undefined
    );

    setStats(res.stats);
    setClasses(res.data);
    setTotalPages(res.totalPages);

  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchSubjects();
  }, [filterStatus, page]);

  useEffect(() => {
    setPage(1);
  }, [filterStatus]);


  // ================= FILTER LOCAL =================
  const filteredClasses = classes.filter(cls => {
    const teacherName =
      cls.teacherSubjects?.[0]?.teacher?.user?.fullName || '';

    const specialty =
      cls.teacherSubjects?.[0]?.teacher?.specialty || '';

    const matchesSearch =
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacherName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade =
      filterGrade === 'all' || cls.grade === filterGrade;

    return matchesSearch && matchesGrade;
  });

  // ================= UI =================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#f093fb] bg-clip-text text-transparent">
          Quản lý lớp học
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Tổng số lớp",
            value: stats.all,
            icon: Layers,
            bgClass: "bg-purple-100 text-purple-600",
          },
          {
            title: "Lớp đang hoạt động",
            value: stats.active,
            icon: Activity,
            bgClass: "bg-blue-100 text-blue-600",
          },
          {
            title: "Lớp sắp diễn ra",
            value: stats.upcoming,
            icon: CalendarClock,
            bgClass: "bg-orange-100 text-orange-600",
          },
          {
            title: "Lớp đã kết thúc",
            value: stats.ended,
            icon: BadgeCheck,
            bgClass: "bg-red-100 text-red-600",
          },
        ].map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </h3>
                </div>

                <div className={`p-3 rounded-lg ${stat.bgClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 hover:shadow-xl transition-shadow border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          {/* Search */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên lớp, môn học, giáo viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 h-10 border border-gray-300 rounded-lg
              hover:border-purple-400
              focus:border-purple-500 focus:ring-2 focus:ring-purple-200
              outline-none transition-all duration-200"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">

            <CustomSelect
              value={filterGrade}
              onChange={setFilterGrade}
              placeholder="Tất cả khối"
              options={[
                { label: "Tất cả khối", value: "all" },
                { label: "Khối 6", value: "6" },
                { label: "Khối 7", value: "7" },
                { label: "Khối 8", value: "8" },
                { label: "Khối 9", value: "9" },
                { label: "Khối 10", value: "10" },
                { label: "Khối 11", value: "11" },
                { label: "Khối 12", value: "12" },
              ]}
            />

            <CustomSelect
              value={filterStatus}
              onChange={setFilterStatus}
              placeholder="Tất cả trạng thái"
              options={[
                { label: "Tất cả trạng thái", value: "all" },
                { label: "Đang hoạt động", value: "active" },
                { label: "Sắp khai giảng", value: "upcoming" },
                { label: "Đã kết thúc", value: "ended" },
              ]}
            />

            <button
              onClick={() => {
                setIsModalOpen(true);
              }}
              className="text-white px-5 h-10 rounded-lg flex items-center gap-2
              shadow-md hover:scale-105 transition-all duration-200"
              style={{
                background:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
              }}
            >
              <Plus className="w-5 h-5" />
              Thêm lớp học
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-6 text-gray-500">
          Đang tải dữ liệu...
        </div>
      )}

      {/* Classes Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredClasses.map((classData, index) => (
            <div
              key={classData.id}
              onClick={() => onSelectClass(classData)}
              className="rounded-lg shadow-sm border border-gray-200 
              overflow-hidden hover:shadow-md transition-all duration-200 
              cursor-pointer"
              style={{ backgroundColor: colors[index % colors.length] }}
            >
              <div className="relative h-40 overflow-hidden">

                <img
                  src={
                    classData.image
                      ? classData.image.startsWith("http")
                        ? classData.image
                        : `${import.meta.env.VITE_BACKEND_URL_IMAGE}${classData.image}`
                      : "/default-class.jpg"
                  }
                  alt={classData.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/default-class.jpg";
                  }}
                />

                <span
                  className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-sm text-white
    ${classData.status === "active"
                      ? "bg-blue-600"
                      : classData.status === "upcoming"
                        ? "bg-orange-600"
                        : "bg-red-600"
                    }`}
                >
                  {classData.status === "active"
                    ? "Đang hoạt động"
                    : classData.status === "upcoming"
                      ? "Sắp khai giảng"
                      : "Đã kết thúc"}
                </span>
              </div>


              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base text-gray-900 mb-0.5">
                      {classData.name}
                    </h3>
                    <p className="text-xs text-gray-600">
                      Khối {classData.grade}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-3">

                  <div className="flex items-center text-xs text-gray-600">
                    <User className="w-3.5 h-3.5 mr-1.5" />
                    GV: {classData.teacherSubjects?.[0]?.teacher?.user?.fullName}
                  </div>

                  <div className="flex items-center text-xs text-gray-600">
                    <Users className="w-3.5 h-3.5 mr-1.5" />
                    {classData.currentStudents}/{classData.maxStudents} học sinh
                  </div>


                  <div className="flex items-center text-xs text-gray-600">
                    <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
                    {classData.sessionsPerWeek} buổi/tuần
                  </div>

                  <div className="flex items-center text-xs text-gray-600">
                    <NotebookPen className="w-3.5 h-3.5 mr-1.5" />
                    Ghi chú: {classData.note}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    <Users className="w-4 h-4 mr-1.5" />
                    {classData.currentStudents}/{classData.maxStudents}
                  </div>

                  <span className="text-sm font-semibold text-gray-900">
                    {classData.price.toLocaleString("vi-VN")}đ/giờ
                  </span>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2 flex-wrap">
          <button
            disabled={page === 1}
            onClick={() => setPage(prev => prev - 1)}
            className="px-3 py-1 rounded border text-sm disabled:opacity-40"
          >
            Trước
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 rounded border text-sm
          ${p === page
                  ? "bg-purple-600 text-white border-purple-600"
                  : "hover:bg-gray-100"
                }`}
            >
              {p}
            </button>
          ))}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(prev => prev + 1)}
            className="px-3 py-1 rounded border text-sm disabled:opacity-40"
          >
            Sau
          </button>
        </div>
      )}

      {filteredClasses.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            Không tìm thấy lớp học nào
          </p>
        </div>
      )}

      {isModalOpen && (
        <ClassModal
          onClose={() => {
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
