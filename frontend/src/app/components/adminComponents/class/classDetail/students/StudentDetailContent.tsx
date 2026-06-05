// StudentDetailContent.tsx
import { motion } from "framer-motion";
import { cn } from "../../../../../utils/cn";
import { formatDate } from "../../../../../utils/helpers";
import { InfoCard } from "./InfoCard";
import {
  User, Calendar, School, Phone, Mail, Users, BarChart3,
  TrendingUp, Award, FileText, Target, BookOpen, LineChart,
  TrendingDown, Star, CheckCircle, AlertCircle, XCircle,
  Calendar as CalendarIcon, ClipboardCheck, ChevronDown, ChevronUp
} from "lucide-react";
import { getStatusColor, getStatusIcon, getStatusText } from "./utils";
import { useEffect, useState } from "react";
import type { AttendanceStatistics } from "../../../../../utils/types/attendance";
import { attendanceApi } from "../../../../../utils/api/attendance.api";

type StudentDetailContentProps = {
  activeTab: "overview" | "academic" | "attendance" | "scores" | "feedback";
  studentData: any;
  student: any;
  studentId?: number;
  subjectId?: number;
};

export const StudentDetailContent = ({
  activeTab,
  studentData,
  student,
  studentId,
  subjectId
}: StudentDetailContentProps) => {
  const avgQuizScore = studentData.academicData.scoreBreakdown.quizzes.reduce((a: number, b: number) => a + b, 0) /
    studentData.academicData.scoreBreakdown.quizzes.length;
  const avgAssignmentScore = studentData.academicData.scoreBreakdown.assignments.reduce((a: number, b: number) => a + b, 0) /
    studentData.academicData.scoreBreakdown.assignments.length;

  // State cho attendance statistics từ API
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStatistics | null>(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // State cho pagination của attendance history
  const [visibleCount, setVisibleCount] = useState(5);
  const PAGE_SIZE = 5;

  // Fetch attendance statistics khi activeTab là attendance hoặc overview (cho tỉ lệ chuyên cần)
  useEffect(() => {
    if ((activeTab === "attendance" || activeTab === "overview") && studentId && subjectId) {
      fetchAttendanceStatistics();
    }
    // Reset visible count khi đóng/mở tab
    setVisibleCount(5);
  }, [activeTab, studentId, subjectId]);

  const fetchAttendanceStatistics = async () => {
    if (!studentId || !subjectId) {
      console.log("Missing props:", { studentId, subjectId });
      return;
    }

    console.log("Fetching attendance for:", { studentId, subjectId });

    setLoadingAttendance(true);
    try {
      const response = await attendanceApi.getStudentAttendanceStatistics(studentId, subjectId);
      console.log("Full response:", response);
      console.log("Response structure:", JSON.stringify(response, null, 2));

      // Kiểm tra cấu trúc response
      if (response && response.code === 200) {
        console.log("Setting attendance stats:", response.data);
        setAttendanceStats(response.data);
      } else if (response && response.studentId) {
        // Nếu response trực tiếp là AttendanceStatistics object
        console.log("Response is direct AttendanceStatistics:", response);
        setAttendanceStats(response);
      } else {
        console.warn("Unexpected response format:", response);
      }
    } catch (error) {
      console.error("Error fetching attendance statistics:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Tính attendance rate từ API hoặc từ mock data
  const getAttendanceRate = () => {
    if (attendanceStats) {
      return attendanceStats.attendanceRate;
    }
    return studentData.academicData.attendanceRate;
  };

  // Handlers cho attendance pagination
  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + PAGE_SIZE, attendanceStats?.history.length || 0));
  };

  const handleCollapse = () => {
    setVisibleCount(PAGE_SIZE);
  };

  // Lấy danh sách history hiển thị
  const getVisibleHistory = () => {
    if (!attendanceStats?.history) return [];
    return attendanceStats.history.slice(0, visibleCount);
  };

  const hasMore = attendanceStats?.history && visibleCount < attendanceStats.history.length;
  const hasCollapsed = attendanceStats?.history && visibleCount > PAGE_SIZE;

  if (activeTab === "overview") {
    return (
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
                <span className="text-lg font-bold text-blue-700">
                  {loadingAttendance ? "..." : getAttendanceRate()}%
                </span>
              </div>
              <p className="text-[10px] text-slate-600">Tỉ lệ chuyên cần</p>
              {attendanceStats && (
                <div className="mt-1 h-1 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${getAttendanceRate()}%`,
                      background: "linear-gradient(to right, #3b82f6, #06b6d4)"
                    }}
                  />
                </div>
              )}
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
  }

  if (activeTab === "academic") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <BookOpen size={12} className="text-violet-500" />
            Tiến độ theo chương
          </h3>
          <div className="space-y-2">
            {studentData.chapters.map((chapter: any, idx: number) => (
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
            {studentData.trendData.map((score: number, idx: number) => (
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
              {studentData.strengths.map((s: string) => (
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
              {studentData.weaknesses.map((w: string) => (
                <span key={w} className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] rounded-full">
                  {w}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (activeTab === "attendance") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {loadingAttendance ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          </div>
        ) : attendanceStats ? (
          <>
            {/* Thống kê tổng hợp từ API */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-emerald-50 rounded-lg">
                <p className="text-lg font-bold text-emerald-600">
                  {attendanceStats.presentCount}
                </p>
                <p className="text-[9px] text-slate-600">Có mặt</p>
              </div>
              <div className="text-center p-2 bg-amber-50 rounded-lg">
                <p className="text-lg font-bold text-amber-600">
                  {attendanceStats.lateCount}
                </p>
                <p className="text-[9px] text-slate-600">Đi trễ</p>
              </div>
              <div className="text-center p-2 bg-red-50 rounded-lg">
                <p className="text-lg font-bold text-red-600">
                  {attendanceStats.absentCount}
                </p>
                <p className="text-[9px] text-slate-600">Vắng</p>
              </div>
            </div>

            {/* Thông tin bổ sung */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <p className="text-[9px] text-slate-500">Tổng số buổi</p>
                <p className="text-lg font-bold text-blue-600">{attendanceStats.totalSessions}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <p className="text-[9px] text-slate-500">Tỉ lệ chuyên cần</p>
                <p className="text-lg font-bold text-purple-600">{attendanceStats.attendanceRate}%</p>
              </div>
            </div>

            {/* Lịch sử điểm danh chi tiết từ API với phân trang */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <ClipboardCheck size={12} className="text-violet-500" />
                  Lịch sử điểm danh chi tiết
                </h3>
                <span className="text-[9px] text-slate-400">
                  {visibleCount}/{attendanceStats.history.length} buổi
                </span>
              </div>
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                {getVisibleHistory().length > 0 ? (
                  <>
                    {getVisibleHistory().map((record) => (
                      <div key={record.attendanceId} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CalendarIcon size={11} className="text-slate-400" />
                            <span className="text-[11px] font-medium text-slate-700">
                              {formatDate(record.sessionDate)}
                            </span>
                            {record.startTime && (
                              <span className="text-[9px] text-slate-400">
                                {record.startTime} - {record.endTime}
                              </span>
                            )}
                          </div>
                          {record.roomName && (
                            <div className="text-[9px] text-slate-400 ml-5">
                              Phòng: {record.roomName}
                            </div>
                          )}
                          {record.note && (
                            <div className="text-[9px] text-slate-500 ml-5 mt-0.5 italic">
                              Ghi chú: {record.note}
                            </div>
                          )}
                        </div>
                        <span className={cn("px-1.5 py-0.5 text-[9px] font-medium rounded-full flex items-center gap-0.5", getStatusColor(record.status))}>
                          {record.status === "present" && <CheckCircle size={12} />}
                          {record.status === "late" && <AlertCircle size={12} />}
                          {record.status === "absent" && <XCircle size={12} />}
                          {getStatusText(record.status)}
                        </span>
                      </div>
                    ))}

                    {/* Buttons for pagination */}
                    <div className="flex gap-2 mt-3">
                      {hasMore && (
                        <button
                          onClick={handleLoadMore}
                          className="flex-1 px-2 py-1.5 bg-violet-50 text-violet-600 text-xs font-medium rounded-lg hover:bg-violet-100 transition-colors flex items-center justify-center gap-1"
                        >
                          <ChevronDown size={14} />
                          Xem thêm {Math.min(PAGE_SIZE, attendanceStats.history.length - visibleCount)} buổi
                        </button>
                      )}
                      {hasCollapsed && (
                        <button
                          onClick={handleCollapse}
                          className="flex-1 px-2 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
                        >
                          <ChevronUp size={14} />
                          Thu gọn
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Chưa có dữ liệu điểm danh
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            Không thể tải dữ liệu điểm danh
          </div>
        )}
      </motion.div>
    );
  }

  if (activeTab === "scores") {
    return (
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
            {studentData.academicData.scoreBreakdown.quizzes.map((score: number, idx: number) => (
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
            {studentData.academicData.scoreBreakdown.assignments.slice(0, 8).map((score: number, idx: number) => (
              <div key={idx} className="w-9 h-9 rounded-lg bg-slate-50 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-slate-700">{score}</span>
                <span className="text-[8px] text-slate-400">BT{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (activeTab === "feedback") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <div className="space-y-2">
          {studentData.feedbacks.map((feedback: any, idx: number) => (
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
  }

  return null;
};