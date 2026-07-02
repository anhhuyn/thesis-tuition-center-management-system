// src/components/StudentDetailPanel.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../../utils/cn";
import { formatDate } from "../../../../utils/helpers";
import type { StudentSubject } from "../../../../utils/types/studentSubject";
import type { Subject } from "../../../../utils/types/subject";
import {
  X,
  User,
  Calendar,
  School,
  Phone,
  Mail,
  Users,
  BarChart3,
  TrendingUp,
  Award,
  BookOpen,
  Target,
  LineChart,
  TrendingDown,
  Star,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  ClipboardCheck,
  Calendar as CalendarIcon,
} from "lucide-react";

// Avatar component (có thể import từ file chung hoặc tái sử dụng)
const Avatar = ({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(name);
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base",
  };
  return (
    <div className={cn(
      "rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-600 font-semibold shadow-sm",
      sizeClasses[size]
    )}>
      {initials}
    </div>
  );
};

// Info Card component
const InfoCard = ({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) => (
  <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50/50 border border-slate-100">
    {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />}
    <div className="flex flex-col gap-0">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-xs font-medium text-slate-700">{value || "—"}</span>
    </div>
  </div>
);

// Mock data interface
interface StudentDetailData {
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    gender: boolean | null;
    phone: string;
    email: string;
    address: string;
    schoolName: string;
    studentCode: string;
    parentName: string;
    parentPhone: string;
  };
  academicData: {
    overallProgress: number;
    averageScore: number;
    attendanceRate: number;
    completedAssignments: number;
    totalAssignments: number;
    rank: string;
    rankColor: string;
    scoreBreakdown: {
      midterm: number;
      final: number;
      quizzes: number[];
      assignments: number[];
      practical: number;
    };
  };
  attendanceRecords: Array<{
    date: string;
    status: string;
    note: string;
    checkInTime: string | null;
  }>;
  chapters: Array<{
    name: string;
    progress: number;
    score: number | null;
    completed: boolean;
  }>;
  strengths: string[];
  weaknesses: string[];
  feedbacks: Array<{
    date: string;
    content: string;
    type: string;
    author: string;
  }>;
  trendData: number[];
}

type Props = {
  student: StudentSubject | null;
  subject: Subject | null;
  onClose: () => void;
};

export const StudentDetailPanel = ({ student, subject, onClose }: Props) => {
  const [activeTab, setActiveTab] = useState<"overview" | "academic" | "attendance" | "scores" | "feedback">("overview");

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

  // Comprehensive student data (mock)
  const studentData: StudentDetailData = {
    personalInfo: {
      fullName: student.fullName,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      phone: student.phoneNumber || "Chưa cập nhật",
      email: student.email || "Chưa cập nhật",
      address: student.address || "Chưa cập nhật",
      schoolName: student.schoolName || "Chưa có",
      studentCode: student.studentCode || student.id.toString(),
      parentName: student.parentName || "Chưa cập nhật",
      parentPhone: student.parentPhone || "Chưa cập nhật",
    },
    academicData: {
      overallProgress: 78,
      averageScore: 8.2,
      attendanceRate: 94,
      completedAssignments: 18,
      totalAssignments: 22,
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
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "text-emerald-600 bg-emerald-50";
      case "late": return "text-amber-600 bg-amber-50";
      case "absent": return "text-red-600 bg-red-50";
      default: return "text-slate-600 bg-slate-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present": return <CheckCircle size={12} />;
      case "late": return <AlertCircle size={12} />;
      case "absent": return <XCircle size={12} />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "present": return "Có mặt";
      case "late": return "Đi trễ";
      case "absent": return "Vắng";
      default: return status;
    }
  };

  const avgQuizScore = studentData.academicData.scoreBreakdown.quizzes.reduce((a, b) => a + b, 0) /
    studentData.academicData.scoreBreakdown.quizzes.length;
  const avgAssignmentScore = studentData.academicData.scoreBreakdown.assignments.reduce((a, b) => a + b, 0) /
    studentData.academicData.scoreBreakdown.assignments.length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
    >
      {/* Header with student info */}
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
                <span className="text-[10px] text-slate-500">Mã HS: {studentData.personalInfo.studentCode}</span>
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

      {/* Tabs */}
      <div className="flex gap-0.5 p-2 bg-slate-50/50 border-b border-slate-100">
        {[
          { id: "overview", label: "Tổng quan", icon: <User size={13} /> },
          { id: "academic", label: "Học tập", icon: <BookOpen size={13} /> },
          { id: "attendance", label: "Chuyên cần", icon: <CalendarIcon size={13} /> },
          { id: "scores", label: "Điểm số", icon: <Award size={13} /> },
          { id: "feedback", label: "Đánh giá", icon: <ClipboardCheck size={13} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
              activeTab === tab.id
                ? "bg-white text-violet-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {tab.icon}
            <span className="hidden lg:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <OverviewTab studentData={studentData} />
        )}

        {/* Academic Tab */}
        {activeTab === "academic" && (
          <AcademicTab studentData={studentData} />
        )}

        {/* Attendance Tab */}
        {activeTab === "attendance" && (
          <AttendanceTab studentData={studentData} getStatusColor={getStatusColor} getStatusIcon={getStatusIcon} getStatusText={getStatusText} />
        )}

        {/* Scores Tab */}
        {activeTab === "scores" && (
          <ScoresTab studentData={studentData} avgQuizScore={avgQuizScore} avgAssignmentScore={avgAssignmentScore} />
        )}

        {/* Feedback Tab */}
        {activeTab === "feedback" && (
          <FeedbackTab studentData={studentData} />
        )}
      </div>
    </motion.div>
  );
};

// Sub-components for each tab
const OverviewTab = ({ studentData }: { studentData: StudentDetailData }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
    <div>
      <h3 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
        <User size={12} className="text-violet-500" />
        Thông tin cá nhân
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <InfoCard label="Ngày sinh" value={formatDate(studentData.personalInfo.dateOfBirth)} icon={Calendar} />
        <InfoCard label="Trường" value={studentData.personalInfo.schoolName} icon={School} />
        <InfoCard label="Số điện thoại" value={studentData.personalInfo.phone} icon={Phone} />
        <InfoCard label="Email" value={studentData.personalInfo.email} icon={Mail} />
        <InfoCard label="Phụ huynh" value={studentData.personalInfo.parentName} icon={Users} />
        <InfoCard label="SĐT phụ huynh" value={studentData.personalInfo.parentPhone} icon={Phone} />
      </div>
    </div>

    <div>
      <h3 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
        <BarChart3 size={12} className="text-violet-500" />
        Thống kê nhanh
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-lg">
          <div className="flex items-center justify-between mb-0.5">
            <TrendingUp size={14} className="text-violet-600" />
            <span className="text-lg font-bold text-violet-700">{studentData.academicData.overallProgress}%</span>
          </div>
          <p className="text-[10px] text-slate-600">Tiến độ tổng thể</p>
          <div className="mt-1 h-1 bg-violet-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
              style={{ width: `${studentData.academicData.overallProgress}%` }} />
          </div>
        </div>

        <div className="p-2 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg">
          <div className="flex items-center justify-between mb-0.5">
            <Award size={14} className="text-emerald-600" />
            <span className="text-lg font-bold text-emerald-700">{studentData.academicData.averageScore}</span>
          </div>
          <p className="text-[10px] text-slate-600">Điểm trung bình</p>
        </div>

        <div className="p-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
          <div className="flex items-center justify-between mb-0.5">
            <Users size={14} className="text-blue-600" />
            <span className="text-lg font-bold text-blue-700">{studentData.academicData.attendanceRate}%</span>
          </div>
          <p className="text-[10px] text-slate-600">Tỉ lệ chuyên cần</p>
        </div>

        <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
          <div className="flex items-center justify-between mb-0.5">
            <FileText size={14} className="text-amber-600" />
            <span className="text-sm font-bold text-amber-700">{studentData.academicData.completedAssignments}/{studentData.academicData.totalAssignments}</span>
          </div>
          <p className="text-[10px] text-slate-600">Bài tập đã nộp</p>
        </div>
      </div>
    </div>

    <div className="p-3 bg-slate-50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-slate-500" />
          <span className="text-xs text-slate-600">Xếp hạng trong lớp</span>
        </div>
        <span className={cn("px-2 py-0.5 text-xs font-semibold rounded-full", studentData.academicData.rankColor)}>
          {studentData.academicData.rank}
        </span>
      </div>
    </div>
  </motion.div>
);

const AcademicTab = ({ studentData }: { studentData: StudentDetailData }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
    <div>
      <h3 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
        <BookOpen size={12} className="text-violet-500" />
        Tiến độ theo chương
      </h3>
      <div className="space-y-2">
        {studentData.chapters.map((chapter, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between text-[10px] mb-0.5">
              <span className="text-slate-600 truncate flex-1">{chapter.name}</span>
              <span className="text-slate-500 ml-2">{chapter.progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", chapter.completed ? "bg-emerald-500" : "bg-violet-500")}
                style={{ width: `${chapter.progress}%` }}
              />
            </div>
            {chapter.score && (
              <div className="text-[9px] text-slate-400 mt-0.5">Điểm: {chapter.score}</div>
            )}
          </div>
        ))}
      </div>
    </div>

    <div>
      <h3 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
        <LineChart size={12} className="text-violet-500" />
        Xu hướng học tập (6 tuần gần nhất)
      </h3>
      <div className="flex items-end gap-1.5 h-24">
        {studentData.trendData.map((score, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-0.5">
            <div
              className="w-full bg-gradient-to-t from-violet-500 to-indigo-500 rounded-t transition-all"
              style={{ height: `${(score / 10) * 100}%`, minHeight: '4px' }}
            />
            <span className="text-[8px] text-slate-500">T{idx + 1}</span>
            <span className="text-[9px] font-medium text-slate-600">{score}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2">
      <div className="p-2 bg-emerald-50/50 rounded-lg">
        <div className="flex items-center gap-1 mb-1.5">
          <TrendingUp size={11} className="text-emerald-600" />
          <h3 className="text-[9px] font-semibold text-emerald-700 uppercase">Điểm mạnh</h3>
        </div>
        <div className="flex flex-wrap gap-1">
          {studentData.strengths.map((s) => (
            <span key={s} className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] rounded-full">
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="p-2 bg-red-50/50 rounded-lg">
        <div className="flex items-center gap-1 mb-1.5">
          <TrendingDown size={11} className="text-red-600" />
          <h3 className="text-[9px] font-semibold text-red-700 uppercase">Cần cải thiện</h3>
        </div>
        <div className="flex flex-wrap gap-1">
          {studentData.weaknesses.map((w) => (
            <span key={w} className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] rounded-full">
              {w}
            </span>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

const AttendanceTab = ({ 
  studentData, 
  getStatusColor, 
  getStatusIcon, 
  getStatusText 
}: { 
  studentData: StudentDetailData;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => JSX.Element | null;
  getStatusText: (status: string) => string;
}) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
    <div className="grid grid-cols-3 gap-2">
      <div className="text-center p-2 bg-emerald-50 rounded-lg">
        <p className="text-lg font-bold text-emerald-600">
          {studentData.attendanceRecords.filter(r => r.status === "present").length}
        </p>
        <p className="text-[9px] text-slate-600">Có mặt</p>
      </div>
      <div className="text-center p-2 bg-amber-50 rounded-lg">
        <p className="text-lg font-bold text-amber-600">
          {studentData.attendanceRecords.filter(r => r.status === "late").length}
        </p>
        <p className="text-[9px] text-slate-600">Đi trễ</p>
      </div>
      <div className="text-center p-2 bg-red-50 rounded-lg">
        <p className="text-lg font-bold text-red-600">
          {studentData.attendanceRecords.filter(r => r.status === "absent").length}
        </p>
        <p className="text-[9px] text-slate-600">Vắng</p>
      </div>
    </div>

    <div>
      <h3 className="text-xs font-semibold text-slate-700 mb-2">Lịch sử điểm danh gần đây</h3>
      <div className="space-y-1.5">
        {studentData.attendanceRecords.map((record, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <CalendarIcon size={11} className="text-slate-400" />
              <span className="text-[11px] text-slate-600">
                {new Date(record.date).toLocaleDateString("vi-VN")}
              </span>
              {record.checkInTime && (
                <span className="text-[9px] text-slate-400">• {record.checkInTime}</span>
              )}
            </div>
            <span className={cn("px-1.5 py-0.5 text-[9px] font-medium rounded-full flex items-center gap-0.5", getStatusColor(record.status))}>
              {getStatusIcon(record.status)}
              {getStatusText(record.status)}
            </span>
          </div>
        ))}
      </div>
    </div>

    {studentData.attendanceRecords.some(r => r.note) && (
      <div className="p-2 bg-amber-50/50 rounded-lg">
        <p className="text-[9px] text-amber-600 font-medium mb-1">Ghi chú:</p>
        {studentData.attendanceRecords.filter(r => r.note).map((record, idx) => (
          <p key={idx} className="text-[9px] text-slate-600">
            • {new Date(record.date).toLocaleDateString("vi-VN")}: {record.note}
          </p>
        ))}
      </div>
    )}
  </motion.div>
);

const ScoresTab = ({ studentData, avgQuizScore, avgAssignmentScore }: { 
  studentData: StudentDetailData;
  avgQuizScore: number;
  avgAssignmentScore: number;
}) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
    <div className="grid grid-cols-2 gap-2">
      <div className="p-2 bg-slate-50 rounded-lg text-center">
        <p className="text-[9px] text-slate-500">Giữa kỳ</p>
        <p className="text-lg font-bold text-violet-600">{studentData.academicData.scoreBreakdown.midterm}</p>
      </div>
      <div className="p-2 bg-slate-50 rounded-lg text-center">
        <p className="text-[9px] text-slate-500">Cuối kỳ</p>
        <p className="text-lg font-bold text-violet-600">{studentData.academicData.scoreBreakdown.final}</p>
      </div>
      <div className="p-2 bg-slate-50 rounded-lg text-center">
        <p className="text-[9px] text-slate-500">Thực hành</p>
        <p className="text-lg font-bold text-violet-600">{studentData.academicData.scoreBreakdown.practical}</p>
      </div>
      <div className="p-2 bg-slate-50 rounded-lg text-center">
        <p className="text-[9px] text-slate-500">TBKT</p>
        <p className="text-lg font-bold text-violet-600">
          {((studentData.academicData.scoreBreakdown.midterm +
            studentData.academicData.scoreBreakdown.final * 2 +
            studentData.academicData.scoreBreakdown.practical) / 4).toFixed(1)}
        </p>
      </div>
    </div>

    <div>
      <h3 className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
        <Star size={12} className="text-amber-500" />
        Điểm kiểm tra (TB: {avgQuizScore.toFixed(1)})
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {studentData.academicData.scoreBreakdown.quizzes.map((score, idx) => (
          <div key={idx} className="w-9 h-9 rounded-lg bg-slate-50 flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-slate-700">{score}</span>
            <span className="text-[8px] text-slate-400">KT{idx + 1}</span>
          </div>
        ))}
      </div>
    </div>

    <div>
      <h3 className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
        <FileText size={12} className="text-blue-500" />
        Điểm bài tập (TB: {avgAssignmentScore.toFixed(1)})
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {studentData.academicData.scoreBreakdown.assignments.slice(0, 8).map((score, idx) => (
          <div key={idx} className="w-9 h-9 rounded-lg bg-slate-50 flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-slate-700">{score}</span>
            <span className="text-[8px] text-slate-400">BT{idx + 1}</span>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

const FeedbackTab = ({ studentData }: { studentData: StudentDetailData }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
    <div className="space-y-2">
      {studentData.feedbacks.map((feedback, idx) => (
        <div key={idx} className="p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              {feedback.type === "positive" ? (
                <CheckCircle size={12} className="text-emerald-500" />
              ) : (
                <AlertCircle size={12} className="text-amber-500" />
              )}
              <span className="text-[10px] text-slate-400">
                {new Date(feedback.date).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <span className="text-[9px] text-slate-400">{feedback.author}</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">{feedback.content}</p>
        </div>
      ))}
    </div>

    <div className="pt-3 border-t border-slate-200">
      <label className="text-xs font-medium text-slate-700 mb-1.5 block">Thêm đánh giá</label>
      <textarea
        placeholder="Nhập nhận xét..."
        className="w-full p-2.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none"
        rows={2}
      />
      <div className="flex gap-2 mt-2">
        <button className="flex-1 px-2 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-lg hover:bg-emerald-100 transition-colors">
          Tích cực
        </button>
        <button className="flex-1 px-2 py-1.5 bg-amber-50 text-amber-600 text-xs font-medium rounded-lg hover:bg-amber-100 transition-colors">
          Cần cải thiện
        </button>
      </div>
    </div>
  </motion.div>
);