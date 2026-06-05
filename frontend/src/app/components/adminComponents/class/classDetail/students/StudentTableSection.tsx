// StudentTableSection.tsx
import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Users } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { cn } from "../../../../../utils/cn";
import { studentSubjectApi } from "../../../../../utils/api";
import type { Subject } from "../../../../../utils/types/subject";
import type { StudentSubject } from "../../../../../utils/types/studentSubject";
import { StudentCard } from "./StudentCard";
import { StudentDetailPanel } from "./StudentDetailPanel";
import { SkeletonCard } from "./SkeletonCard";
import { EmptyState } from "./EmptyState";
import { AddStudentModal } from "../AddStudentModal";

type Props = {
  subject: Subject | null;
  isTeacher?: boolean;
};

export const StudentTableSection = ({ subject, isTeacher = false }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [students, setStudents] = useState<StudentSubject[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentSubject | null>(null);
  const [showAllStudents, setShowAllStudents] = useState(false);
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
      (s) => s.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortOption === "nameAsc") {
      result = [...result].sort((a, b) => a.fullName.localeCompare(b.fullName));
    }

    if (sortOption === "nameDesc") {
      result = [...result].sort((a, b) => b.fullName.localeCompare(a.fullName));
    }

    return result;
  }, [students, searchQuery, sortOption]);

  const displayedStudents = showAllStudents ? filteredStudents : filteredStudents.slice(0, 5);

  const handleRemoveStudent = async (studentId: number) => {
    if (!subject) return;

    const confirmDelete = window.confirm("Bạn có chắc muốn xóa học sinh khỏi môn này?");
    if (!confirmDelete) return;

    try {
      await studentSubjectApi.removeStudentFromSubject({
        studentId,
        subjectId: subject.id,
      });

      setStudents((prev) => prev.filter((s) => s.id !== studentId));

      if (selectedStudent?.id === studentId) {
        setSelectedStudent(null);
      }

      setAlert?.({
        type: "success",
        message: "Xóa học sinh khỏi môn học thành công",
      });
    } catch (err: any) {
      setAlert?.({
        type: "error",
        message: err?.response?.data?.message || "Không thể xóa học sinh khỏi môn học",
      });
    }
  };

  const handleViewStudent = (student: StudentSubject) => {
    setSelectedStudent(student);
  };

  const handleEditStudent = (student: StudentSubject) => {
    console.log("Edit student:", student);
  };

  const refreshStudents = async () => {
    if (subject) {
      const res = await studentSubjectApi.getStudentBySubject(subject.id);
      setStudents(res.data);
    }
  };

  return (
    <div className="flex gap-6 w-full h-full min-h-[calc(100vh-200px)] p-4 md:p-6 bg-slate-50/40 transition-all duration-300">
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm học sinh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 w-44 sm:w-56 bg-white"
              />
            </div>

            {!isTeacher && (
              <button
                onClick={() => setOpenModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-violet-700 transition-all"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Thêm học sinh</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-700">
                Danh sách học sinh
              </span>
              <span className="text-xs text-slate-400">({filteredStudents.length})</span>
            </div>
            {filteredStudents.length > 5 && (
              <button
                onClick={() => setShowAllStudents(!showAllStudents)}
                className="text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors"
              >
                {showAllStudents ? "Thu gọn" : "Xem tất cả"}
              </button>
            )}
          </div>

          <div className="p-4 space-y-2">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : displayedStudents.length === 0 ? (
              <EmptyState
                title="Không có học sinh"
                description={searchQuery ? "Không tìm thấy học sinh phù hợp" : "Chưa có học sinh nào trong lớp này"}
                icon={Users}
                onAdd={() => setOpenModal(true)}
                isTeacher={isTeacher}
              />
            ) : (
              <AnimatePresence>
                {displayedStudents.map((student, idx) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    index={idx}
                    isSelected={selectedStudent?.id === student.id}
                    onClick={() => handleViewStudent(student)}
                    onView={() => handleViewStudent(student)}
                    onEdit={() => handleEditStudent(student)}
                    onRemove={() => handleRemoveStudent(student.id)}
                    isTeacher={isTeacher}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>

          {filteredStudents.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50/30">
              <span>Hiển thị {displayedStudents.length} / {filteredStudents.length} học sinh</span>
              {filteredStudents.length > 5 && (
                <div className="flex gap-1">
                  <button
                    onClick={() => setShowAllStudents(false)}
                    className={cn(
                      "px-2 py-0.5 rounded transition-colors",
                      !showAllStudents ? "bg-violet-50 text-violet-600 font-medium" : "hover:bg-slate-100"
                    )}
                  >
                    Thu gọn
                  </button>
                  <button
                    onClick={() => setShowAllStudents(true)}
                    className={cn(
                      "px-2 py-0.5 rounded transition-colors",
                      showAllStudents ? "bg-violet-50 text-violet-600 font-medium" : "hover:bg-slate-100"
                    )}
                  >
                    Tất cả
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-[420px] xl:w-[480px] flex-shrink-0 mt-12">
        <StudentDetailPanel
          student={selectedStudent}
          subject={subject}
          onClose={() => setSelectedStudent(null)}
        />
      </div>

      <AddStudentModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        subjectId={subject?.id || 0}
        grade={subject?.grade || ""}
        existingStudentIds={students.map(s => s.id)}
        onSuccess={refreshStudents}
      />
    </div>
  );
};