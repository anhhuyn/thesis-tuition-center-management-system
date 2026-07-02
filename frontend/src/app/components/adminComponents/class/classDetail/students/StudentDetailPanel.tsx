// StudentDetailPanel.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../../../../utils/cn";
import { X, Users } from "lucide-react";
import { Avatar } from "./Avatar";
import { StudentDetailTabs } from "./StudentDetailTabs";
import { StudentDetailContent } from "./StudentDetailContent";
import type { StudentSubject } from "../../../../../utils/types/studentSubject";
import type { Subject } from "../../../../../utils/types/subject";

type StudentDetailPanelProps = {
  student: StudentSubject | null;
  subject: Subject | null;
  onClose: () => void;
  onProgressUpdate?: (studentId: number) => void;
};

const getStudentDetailData = (student: StudentSubject) => ({
  personalInfo: {
    fullName: student.fullName,
    dateOfBirth: student.dateOfBirth,
    gender: student.gender,
    schoolName: student.schoolName || "Chưa có",
  },
  academicData: {
    overallProgress: 78,
    averageScore: 8.2,
    attendanceRate: 94,
    rank: "Khá",
    rankColor: "text-blue-600 bg-blue-50",
    scoreBreakdown: {
      midterm: 8.5,
      final: 8.0,
      quizzes: [7.5, 8.0, 9.0, 7.0, 8.5],
      assignments: [9.0, 8.5, 7.5, 9.5, 8.0, 8.5, 7.0, 9.0],
      practical: 8.5,
    },
  },
  attendanceRecords: [
    { date: "2024-03-15", status: "present", note: "", checkInTime: "07:55" },
    { date: "2024-03-14", status: "present", note: "", checkInTime: "08:00" },
    { date: "2024-03-12", status: "late", note: "Trễ 5 phút", checkInTime: "08:05" },
    { date: "2024-03-11", status: "present", note: "", checkInTime: "07:58" },
    { date: "2024-03-08", status: "absent", note: "Có phép", checkInTime: null },
    { date: "2024-03-07", status: "present", note: "", checkInTime: "07:52" },
    { date: "2024-03-05", status: "present", note: "", checkInTime: "07:56" },
    { date: "2024-03-04", status: "late", note: "Trễ 10 phút", checkInTime: "08:10" },
  ],
  chapters: [
    { name: "Chương 1: Hàm số", progress: 100, score: 8.5, completed: true },
    { name: "Chương 2: Phương trình", progress: 100, score: 8.0, completed: true },
    { name: "Chương 3: Bất phương trình", progress: 85, score: 7.5, completed: false },
    { name: "Chương 4: Dãy số", progress: 60, score: 7.0, completed: false },
    { name: "Chương 5: Đạo hàm", progress: 30, score: null, completed: false },
  ],
  strengths: ["Giải phương trình", "Đồ thị hàm số", "Biện luận"],
  weaknesses: ["Bất phương trình chứa căn", "Cấp số nhân", "Đạo hàm cấp cao"],
  feedbacks: [
    { date: "2024-03-10", content: "Học sinh có tiến bộ rõ rệt trong việc giải phương trình", type: "positive", author: "GV. Nguyễn Văn A" },
    { date: "2024-03-01", content: "Cần chú ý hơn phần bất phương trình chứa căn", type: "improve", author: "GV. Nguyễn Văn A" },
    { date: "2024-02-20", content: "Tích cực phát biểu xây dựng bài", type: "positive", author: "GV. Trần Thị B" },
  ],
  trendData: [7.5, 7.8, 8.0, 7.9, 8.2, 8.5],
});

export const StudentDetailPanel = ({ student, subject, onClose, onProgressUpdate }: StudentDetailPanelProps) => {
  const [activeTab, setActiveTab] = useState<"overview" | "academic" | "attendance" | "scores" | "feedback">("overview");

  const handleProgressUpdate = () => {
    if (onProgressUpdate && student) {
      onProgressUpdate(student.id);
    }
  };

  if (!student) {
    return (
      <div className="h-full bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Users size={28} className="text-slate-300" />
        </div>
        <h3 className="text-base font-semibold text-slate-600 mb-2">Chưa chọn học sinh</h3>
        <p className="text-xs text-slate-400">Nhấp vào một học sinh để xem chi tiết</p>
      </div>
    );
  }

  const studentData = getStudentDetailData(student);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
    >
      <div className="sticky top-0 bg-white border-b border-slate-100 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={student.fullName} size="lg" />
            <div>
              <h2 className="font-bold text-slate-800">{student.fullName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                  student.gender === true
                    ? "bg-blue-50 text-blue-600"
                    : "bg-pink-50 text-pink-600"
                )}>
                  {student.gender === true ? "Nam" : "Nữ"}
                </span>
                <span className="text-[10px] text-slate-400">•</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={16} className="text-slate-400" />
          </button>
        </div>
      </div>

      <StudentDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <StudentDetailContent
          activeTab={activeTab}
          studentData={studentData}
          student={student}
          studentId={student.id}    
          userId={student.userId}        
          subjectId={subject?.id}
          onProgressUpdate={handleProgressUpdate}
        />
      </div>
    </motion.div>
  );
};