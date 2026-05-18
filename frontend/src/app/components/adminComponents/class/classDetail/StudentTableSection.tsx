import { useState, useMemo, useEffect } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Plus,
  User,
  School,
  Calendar,
  TrendingUp,
  Award,
} from "lucide-react";
import type { StudentSubject } from "../../../../utils/types/studentSubject";
import { studentSubjectApi } from "../../../../utils/api";
import type { Subject } from "../../../../utils/types/subject";
import { AddStudentModal } from "./AddStudentModal";
import { useOutletContext } from "react-router-dom";

type Props = {
  subject: Subject | null;
  isTeacher?: boolean;
};

// Helper: Generate initials from full name
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Avatar component with initials fallback
const Avatar = ({ name }: { name: string }) => {
  const initials = getInitials(name);
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center text-violet-700 text-xs font-semibold shadow-sm">
      {initials}
    </div>
  );
};

// Skeleton row component for loading state
const SkeletonRow = ({ isTeacher }: { isTeacher: boolean }) => (
  <div className={`${isTeacher ? 'grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_0.8fr]' : 'grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_0.8fr_0.8fr]'} items-center px-5 py-3 border-t border-slate-100 animate-pulse`}>
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-200"></div>
      <div className="flex flex-col gap-1.5">
        <div className="h-3.5 w-28 bg-slate-200 rounded"></div>
        <div className="h-2.5 w-12 bg-slate-100 rounded"></div>
      </div>
    </div>
    <div className="h-3 w-20 bg-slate-200 rounded"></div>
    <div className="h-3 w-28 bg-slate-200 rounded"></div>
    <div className="flex flex-col gap-1.5">
      <div className="h-1.5 w-full bg-slate-100 rounded-full"></div>
      <div className="h-2.5 w-8 bg-slate-200 rounded"></div>
    </div>
    <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
    <div className="h-4 w-8 bg-slate-200 rounded"></div>
    {!isTeacher && (
      <div className="flex justify-end gap-1">
        <div className="w-7 h-7 rounded-md bg-slate-200"></div>
        <div className="w-7 h-7 rounded-md bg-slate-200"></div>
        <div className="w-7 h-7 rounded-md bg-slate-200"></div>
      </div>
    )}
  </div>
);

export const StudentTableSection = ({ subject, isTeacher = false }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [students, setStudents] = useState<StudentSubject[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const { setAlert } = useOutletContext<any>();

  useEffect(() => {
    if (!subject) return;

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await studentSubjectApi.getStudentBySubject(subject.id);
        setStudents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [subject?.id]);

  const filteredStudents = useMemo(() => {
    let result = students.filter(
      (s) =>
        s.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortOption === "nameAsc") {
      result = [...result].sort((a, b) => a.fullName.localeCompare(b.fullName));
    }

    if (sortOption === "nameDesc") {
      result = [...result].sort((a, b) => b.fullName.localeCompare(a.fullName));
    }

    return result;
  }, [students, searchQuery, sortOption]);

  const handleRemoveStudent = async (studentId: number) => {
    if (!subject) return;

    const confirmDelete = window.confirm("Bạn có chắc muốn xóa học sinh khỏi môn này?");
    if (!confirmDelete) return;

    try {
      await studentSubjectApi.removeStudentFromSubject({
        studentId,
        subjectId: subject.id,
      });

      // update UI
      setStudents((prev) => prev.filter((s) => s.id !== studentId));

      setAlert?.({
        type: "success",
        message: "Xóa học sinh khỏi môn học thành công",
      });

    } catch (err: any) {
      setAlert?.({
        type: "error",
        message:
          err?.response?.data?.message ||
          "Không thể xóa học sinh khỏi môn học",
      });
    }
  };
  // Hardcoded values from constraints
  const progress = 75;
  const status = "ỔN ĐỊNH";
  const score = 8.5;

  return (
    <div className="flex flex-col gap-6 w-full p-6 md:p-8 bg-slate-50/40">
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div className="flex flex-1 flex-wrap items-center gap-2 w-full sm:max-w-xl">
          {/* SEARCH */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors"
            />
            <input
              type="text"
              placeholder="Tìm kiếm học sinh theo tên hoặc ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 hover:border-slate-300 placeholder:text-slate-400"
            />
          </div>

          {/* FILTER BUTTON */}
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 focus:ring-2 focus:ring-violet-500/20">
            <Filter size={16} className="text-slate-500" />
          </button>

          {/* SORT DROPDOWN */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="pl-4 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm appearance-none cursor-pointer hover:border-slate-300 transition-all duration-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-slate-700"
            >
              <option value="default">Sắp xếp theo</option>
              <option value="nameAsc">Tên A-Z</option>
              <option value="nameDesc">Tên Z-A</option>
              <option value="idAsc">ID tăng dần</option>
              <option value="idDesc">ID giảm dần</option>
            </select>
            <ArrowUpDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 focus:ring-2 focus:ring-violet-500/20">
            <Download size={16} />
            <span className="hidden sm:inline">Xuất danh sách</span>
          </button>

          {!isTeacher && (
            <button
              onClick={() => setOpenModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl shadow-sm hover:bg-violet-700 hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-violet-500/20 active:scale-[0.98]"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Thêm học sinh</span>
            </button>
          )}
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
        {/* TABLE HEADER - sticky */}
        <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200">
          {isTeacher ? (
            // Teacher view: 6 columns
            <div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_0.8fr] items-center px-5 py-3.5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <User size={12} /> Học sinh
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <Calendar size={12} /> Ngày sinh
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <School size={12} /> Trường học
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <TrendingUp size={12} /> Tỉ lệ HTBT
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Trạng thái
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <Award size={12} /> Điểm TB
              </div>
            </div>
          ) : (
            // Admin view: 7 columns
            <div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_0.8fr_0.8fr] items-center px-5 py-3.5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <User size={12} /> Học sinh
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <Calendar size={12} /> Ngày sinh
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <School size={12} /> Trường học
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <TrendingUp size={12} /> Tỉ lệ HTBT
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Trạng thái
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <Award size={12} /> Điểm TB
              </div>
              <div className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Thao tác
              </div>
            </div>
          )}
        </div>

        {/* TABLE BODY */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            // Skeleton loading state
            <>
              <SkeletonRow isTeacher={isTeacher} />
              <SkeletonRow isTeacher={isTeacher} />
              <SkeletonRow isTeacher={isTeacher} />
              <SkeletonRow isTeacher={isTeacher} />
            </>
          ) : filteredStudents.length === 0 ? (
            // Empty state with icon and friendly text
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <User size={28} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">Không có học sinh nào</p>
              <p className="text-slate-400 text-sm mt-1">Hãy thêm học sinh đầu tiên để bắt đầu</p>
              {!isTeacher && (
                <button
                  onClick={() => setOpenModal(true)}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-600 text-sm font-medium rounded-xl hover:bg-violet-100 transition-all duration-200"
                >
                  <Plus size={14} />
                  Thêm học sinh
                </button>
              )}
            </div>
          ) : (
            filteredStudents.map((student, idx) => (
              <div
                key={student.id}
                className={`${isTeacher ? 'grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_0.8fr]' : 'grid grid-cols-[2fr_1fr_1.5fr_1.5fr_1fr_0.8fr_0.8fr]'} items-center px-5 py-3 transition-all duration-150 ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                } hover:bg-slate-50/80 group`}
              >
                {/* STUDENT with Avatar */}
                <div className="flex items-center gap-3">
                  <Avatar name={student.fullName} />
                  <div>
                    <p className="font-semibold text-sm text-slate-800 leading-tight">
                      {student.fullName}
                    </p>
                    <p className="text-[11px] font-mono text-violet-500 mt-0.5">
                      ID: {student.id}
                    </p>
                  </div>
                </div>

                {/* DATE OF BIRTH */}
                <div className="text-xs text-slate-500 font-medium">
                  {new Date(student.dateOfBirth).toLocaleDateString("vi-VN")}
                </div>

                {/* SCHOOL NAME */}
                <div className="text-xs text-slate-600 truncate pr-2">
                  {student.schoolName}
                </div>

                {/* PROGRESS BAR with gradient */}
                <div className="pr-4">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[11px] font-semibold text-violet-600 mt-1.5">
                    {progress}%
                  </p>
                </div>

                {/* STATUS BADGE */}
                <div>
                  <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                    {status}
                  </span>
                </div>

                {/* SCORE */}
                <div className="font-bold text-sm text-slate-800">
                  {score}
                </div>

                {/* ACTIONS - Icon buttons with tooltip feel */}
                {!isTeacher && (
                  <div className="flex justify-end gap-1">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200">
                      <Eye size={16} />
                    </button>
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200">
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleRemoveStudent(student.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ADD STUDENT MODAL */}
      <AddStudentModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        subjectId={subject?.id || 0}
        grade={subject?.grade || ""}
        existingStudentIds={students.map(s => s.id)}
        onSuccess={() => {
          setOpenModal(false);
          studentSubjectApi.getStudentBySubject(subject!.id).then(res => {
            setStudents(res.data);
          });
        }}
      />
    </div>
  );
};