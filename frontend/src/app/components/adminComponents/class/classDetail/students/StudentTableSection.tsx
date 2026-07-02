// StudentTableSection.tsx (phần cập nhật)
import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Users } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { studentSubjectApi } from "../../../../../utils/api";
import type { Subject } from "../../../../../utils/types/subject";
import type { StudentSubject } from "../../../../../utils/types/studentSubject";
import { StudentCard } from "./StudentCard";
import { StudentDetailPanel } from "./StudentDetailPanel";
import { SkeletonCard } from "./SkeletonCard";
import { EmptyState } from "./EmptyState";
import { AddStudentModal } from "../AddStudentModal";
import { evaluationApi } from "../../../../../utils/api/evaluation.api";

type Props = {
  subject: Subject | null;
  isTeacher?: boolean;
};

// Interface mở rộng cho student kèm tiến độ
interface StudentWithProgress extends StudentSubject {
  overallProgress: number;
}

export const StudentTableSection = ({ subject, isTeacher = false }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [students, setStudents] = useState<StudentWithProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<Record<number, boolean>>({});
  const [openModal, setOpenModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentSubject | null>(null);
  const { setAlert } = useOutletContext<any>();

  // Fetch danh sách students
  useEffect(() => {
    if (!subject) return;

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await studentSubjectApi.getStudentBySubject(subject.id);
        const studentsData = res.data;
        
        // Khởi tạo students với progress mặc định là 0
        setStudents(studentsData.map((s: StudentSubject) => ({
          ...s,
          overallProgress: 0
        })));
        
        // Fetch progress cho từng student
        await fetchAllStudentsProgress(studentsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [subject?.id]);

  // Fetch progress cho tất cả students
  const fetchAllStudentsProgress = async (studentsData: StudentSubject[]) => {
    if (!subject) return;

    // Đánh dấu đang loading cho từng student
    const loadingStates: Record<number, boolean> = {};
    studentsData.forEach(s => { loadingStates[s.id] = true; });
    setLoadingProgress(loadingStates);

    try {
      // Fetch curriculum evaluations cho từng student
      const progressPromises = studentsData.map(async (student) => {
        try {
          const curriculumEvals = await evaluationApi.getCurriculumEvaluations(student.id, subject.id);
          
          // Tính tiến độ trung bình từ các curriculum
          let avgProgress = 0;
          let hasAnyEvaluation = false;
          
          if (curriculumEvals.length > 0) {
            // Kiểm tra xem có curriculum nào có đánh giá thực tế không
            // (overallProgress > 0 HOẶC có teacherNotes HOẶC có strengths/weaknesses)
            hasAnyEvaluation = curriculumEvals.some(c => 
              c.overallProgress > 0 || 
              (c.teacherNotes && c.teacherNotes.trim() !== '') ||
              (c.strengths && c.strengths.trim() !== '') ||
              (c.weaknesses && c.weaknesses.trim() !== '')
            );
            
            const totalProgress = curriculumEvals.reduce((sum, c) => sum + (c.overallProgress || 0), 0);
            avgProgress = Math.round(totalProgress / curriculumEvals.length);
          }
          
          return { 
            studentId: student.id, 
            progress: avgProgress,
            hasAnyEvaluation: hasAnyEvaluation
          };
        } catch (error) {
          console.error(`Error fetching progress for student ${student.id}:`, error);
          return { 
            studentId: student.id, 
            progress: 0, 
            hasAnyEvaluation: false 
          };
        }
      });

      const results = await Promise.all(progressPromises);
      
      // Cập nhật state students với progress và hasAnyEvaluation
      setStudents(prev => prev.map(student => {
        const result = results.find(r => r.studentId === student.id);
        return {
          ...student,
          overallProgress: result?.progress || 0,
          hasAnyEvaluation: result?.hasAnyEvaluation || false
        };
      }));
    } catch (error) {
      console.error("Error fetching students progress:", error);
    } finally {
      setLoadingProgress({});
    }
  };

  // Fetch progress cho một student cụ thể (khi cần refresh)
  const fetchStudentProgress = async (studentId: number) => {
    if (!subject) return 0;
    
    try {
      const curriculumEvals = await evaluationApi.getCurriculumEvaluations(studentId, subject.id);
      if (curriculumEvals.length > 0) {
        const totalProgress = curriculumEvals.reduce((sum, c) => sum + (c.overallProgress || 0), 0);
        return Math.round(totalProgress / curriculumEvals.length);
      }
      return 0;
    } catch (error) {
      console.error(`Error fetching progress for student ${studentId}:`, error);
      return 0;
    }
  };

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

    // Sắp xếp theo tiến độ (có thể thêm sau)
    if (sortOption === "progressAsc") {
      result = [...result].sort((a, b) => a.overallProgress - b.overallProgress);
    }
    
    if (sortOption === "progressDesc") {
      result = [...result].sort((a, b) => b.overallProgress - a.overallProgress);
    }

    return result;
  }, [students, searchQuery, sortOption]);

  // Luôn hiển thị tất cả students, không cắt bớt
  const displayedStudents = filteredStudents;

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
      const studentsData = res.data;
      
      setStudents(studentsData.map((s: StudentSubject) => ({
        ...s,
        overallProgress: 0
      })));
      
      await fetchAllStudentsProgress(studentsData);
    }
  };

  // Refresh progress cho một student cụ thể (khi có cập nhật từ detail panel)
  const refreshStudentProgress = async (studentId: number) => {
    const newProgress = await fetchStudentProgress(studentId);
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, overallProgress: newProgress } : s
    ));
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

            {/* Thêm dropdown sort */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 bg-white"
            >
              <option value="default">Mặc định</option>
              <option value="nameAsc">Tên A-Z</option>
              <option value="nameDesc">Tên Z-A</option>
              <option value="progressDesc">Tiến độ cao nhất</option>
              <option value="progressAsc">Tiến độ thấp nhất</option>
            </select>

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
                    overallProgress={student.overallProgress}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>

          {filteredStudents.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50/30">
              <span>Hiển thị {displayedStudents.length} / {filteredStudents.length} học sinh</span>
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-[420px] xl:w-[480px] flex-shrink-0 mt-12">
        <StudentDetailPanel
          student={selectedStudent}
          subject={subject}
          onClose={() => setSelectedStudent(null)}
          onProgressUpdate={refreshStudentProgress}
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