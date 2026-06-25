import { motion } from "framer-motion";
import { cn } from "../../../../../utils/cn";
import { formatDate } from "../../../../../utils/helpers";
import { InfoCard } from "./InfoCard";
import {
  User, Calendar, School, Phone, Mail, Users, BarChart3,
  TrendingUp, Award, FileText, Target, LineChart,
  TrendingDown, Star, CheckCircle, AlertCircle, XCircle,
  Calendar as CalendarIcon, ClipboardCheck, ChevronDown, ChevronUp,
  Edit2, Save, X, ThumbsUp, ThumbsDown, MessageSquare, Layers,
  ChevronRight
} from "lucide-react";
import { getStatusColor, getStatusText } from "./utils";
import { useEffect, useState } from "react";
import type { AttendanceStatistics } from "../../../../../utils/types/attendance";
import { attendanceApi } from "../../../../../utils/api/attendance.api";
import { evaluationApi } from "../../../../../utils/api/evaluation.api";
import { studentApi } from "../../../../../utils/api/student.api";
import type { Student } from "../../../../../utils/types/student";
import type {
  CurriculumEvaluation,
  CurriculumEvaluationUpdateRequest,
  SessionEvaluation,
  SessionEvaluationUpdateRequest
} from "../../../../../utils/types/evaluation";

type StudentDetailContentProps = {
  activeTab: "overview" | "academic" | "attendance" | "scores" | "feedback";
  studentData: any;
  student: any;
  studentId?: number;
  userId?: number;
  subjectId?: number;
  onProgressUpdate?: () => void;
};

export const StudentDetailContent = ({
  activeTab,
  studentData,
  studentId,
  userId,
  subjectId,
  onProgressUpdate
}: StudentDetailContentProps) => {
  const [studentDetail, setStudentDetail] = useState<Student | null>(null);
  const [loadingStudentDetail, setLoadingStudentDetail] = useState(false);

  const avgQuizScore = studentData.academicData.scoreBreakdown.quizzes.reduce((a: number, b: number) => a + b, 0) /
    studentData.academicData.scoreBreakdown.quizzes.length;
  const avgAssignmentScore = studentData.academicData.scoreBreakdown.assignments.reduce((a: number, b: number) => a + b, 0) /
    studentData.academicData.scoreBreakdown.assignments.length;

  const [attendanceStats, setAttendanceStats] = useState<AttendanceStatistics | null>(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const [visibleCount, setVisibleCount] = useState(5);
  const PAGE_SIZE = 5;

  const [curriculumEvaluations, setCurriculumEvaluations] = useState<CurriculumEvaluation[]>([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);
  const [editingCurriculumId, setEditingCurriculumId] = useState<number | null>(null);
  const [curriculumFormData, setCurriculumFormData] = useState<CurriculumEvaluationUpdateRequest>({
    understandingLevel: 0,
    overallProgress: 0,
    teacherNotes: '',
    strengths: '',
    weaknesses: '',
    recommendations: ''
  });

  const [sessionEvalsByCurriculum, setSessionEvalsByCurriculum] = useState<Record<number, SessionEvaluation[]>>({});
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [sessionFormData, setSessionFormData] = useState<SessionEvaluationUpdateRequest>({
    understandingLevel: 0,
    completionStatus: 'NOT_STARTED',
    teacherNotes: '',
    homeworkQuality: 0,
    participationLevel: 0
  });


  const [expandedCurriculums, setExpandedCurriculums] = useState<Record<number, boolean>>({});

  const [expandedSessions, setExpandedSessions] = useState<Record<number, boolean>>({});

  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'positive' | 'improvement'>('positive');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<number | null>(null);

  const fetchStudentDetail = async (id: number) => {
    setLoadingStudentDetail(true);
    try {
      const result = await studentApi.getById(id);
      if (result) {
        setStudentDetail(result);
        console.log("Fetched student detail:", result);
      }
    } catch (error) {
      console.error("Error fetching student detail:", error);
    } finally {
      setLoadingStudentDetail(false);
    }
  };

  useEffect(() => {

    const idToFetch = userId;
    if (idToFetch && (activeTab === "overview" || activeTab === "academic")) {
      fetchStudentDetail(idToFetch);
    }
  }, [userId, studentId, activeTab]);

  useEffect(() => {
    if ((activeTab === "attendance" || activeTab === "overview") && studentId && subjectId) {
      fetchAttendanceStatistics();
    }
    setVisibleCount(5);
  }, [activeTab, studentId, subjectId]);


  useEffect(() => {
    if ((activeTab === "academic" || activeTab === "overview") && studentId && subjectId) {
      fetchAllEvaluations();
    }
  }, [activeTab, studentId, subjectId]);

  const fetchAttendanceStatistics = async () => {
    if (!studentId || !subjectId) return;

    setLoadingAttendance(true);
    try {
      const response = await attendanceApi.getStudentAttendanceStatistics(studentId, subjectId);
      console.log('Attendance API response:', response);

      if (response) {
        setAttendanceStats(response);
        console.log('Set attendance stats successfully:', response);
      } else {
        console.warn("Unexpected response structure:", response);
      }
    } catch (error) {
      console.error("Error fetching attendance statistics:", error);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Fetch tất cả evaluations (curriculum + session)
  const fetchAllEvaluations = async () => {
    if (!studentId || !subjectId) return;

    setLoadingCurriculum(true);
    setLoadingSessions(true);

    try {
      // Lấy tất cả curriculum evaluations
      const curriculums = await evaluationApi.getCurriculumEvaluations(studentId, subjectId);
      setCurriculumEvaluations(curriculums);

      // Khởi tạo state mở/đóng: mặc định mở curriculum đầu tiên và mở tất cả sessions
      const initialExpanded: Record<number, boolean> = {};
      const initialExpandedSessions: Record<number, boolean> = {};
      curriculums.forEach((curriculum, index) => {
        initialExpanded[curriculum.curriculumId] = index === 0;
        initialExpandedSessions[curriculum.curriculumId] = true; // Mặc định mở sessions
      });
      setExpandedCurriculums(initialExpanded);
      setExpandedSessions(initialExpandedSessions);

      // Nếu có curriculum, chọn curriculum đầu tiên làm mặc định cho feedback
      if (curriculums.length > 0 && !selectedCurriculumId) {
        setSelectedCurriculumId(curriculums[0].curriculumId);
      }

      // Lấy session evaluations theo curriculum
      const sessionEvals = await evaluationApi.getSessionEvaluationsByCurriculum(studentId, subjectId);
      setSessionEvalsByCurriculum(sessionEvals);

    } catch (error) {
      console.error("Error fetching evaluations:", error);
    } finally {
      setLoadingCurriculum(false);
      setLoadingSessions(false);
    }
  };

  // Save curriculum evaluation
  const handleSaveCurriculumEvaluation = async (curriculumId: number) => {
    if (!studentId) return;

    setLoadingCurriculum(true);
    try {
      const existingEval = curriculumEvaluations.find(e => e.curriculumId === curriculumId);
      let result;

      if (existingEval) {
        result = await evaluationApi.updateCurriculumEvaluation(studentId, curriculumId, curriculumFormData);
      } else {
        result = await evaluationApi.createCurriculumEvaluation(studentId, curriculumId, curriculumFormData);
      }

      // Cập nhật state
      setCurriculumEvaluations(prev =>
        prev.map(e => e.curriculumId === curriculumId ? result : e)
      );
      setEditingCurriculumId(null);

      // Gọi callback để refresh progress trên card
      if (onProgressUpdate) {
        onProgressUpdate();
      }
    } catch (error) {
      console.error("Error saving curriculum evaluation:", error);
      alert("Có lỗi xảy ra khi lưu đánh giá");
    } finally {
      setLoadingCurriculum(false);
    }
  };

  // Cập nhật handleSaveSessionEvaluation để gọi onProgressUpdate
  const handleSaveSessionEvaluation = async (sessionDetailId: number) => {
    console.log('=== handleSaveSessionEvaluation được gọi ===');
    console.log('sessionDetailId nhận được:', sessionDetailId);
    console.log('studentId:', studentId);

    if (!studentId) {
      console.error('Thiếu studentId');
      alert('Không tìm thấy ID học sinh');
      return;
    }

    if (!sessionDetailId) {
      console.error('Thiếu sessionDetailId');
      alert('Không tìm thấy ID buổi học');
      return;
    }

    setLoadingSessions(true);
    try {
      const result = await evaluationApi.updateSessionEvaluation(
        studentId,
        sessionDetailId,
        sessionFormData
      );

      // Cập nhật state trong sessionEvalsByCurriculum
      const updatedByCurriculum: Record<number, SessionEvaluation[]> = {};
      for (const [curId, sessions] of Object.entries(sessionEvalsByCurriculum)) {
        updatedByCurriculum[Number(curId)] = sessions.map(s =>
          s.sessionDetailId === sessionDetailId ? result : s
        );
      }
      setSessionEvalsByCurriculum(updatedByCurriculum);
      setEditingSessionId(null);
      setSessionFormData({
        understandingLevel: 0,
        completionStatus: 'NOT_STARTED',
        teacherNotes: '',
        homeworkQuality: 0,
        participationLevel: 0
      });

      // Gọi callback để refresh progress trên card
      if (onProgressUpdate) {
        onProgressUpdate();
      }
    } catch (error) {
      console.error("Error saving session evaluation:", error);
      alert("Có lỗi xảy ra khi lưu đánh giá buổi học");
    } finally {
      setLoadingSessions(false);
    }
  };

  // Cập nhật handleSubmitComment để gọi onProgressUpdate
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !studentId || !selectedCurriculumId) return;

    setSubmittingComment(true);
    try {
      const targetCurriculum = curriculumEvaluations.find(c => c.curriculumId === selectedCurriculumId);
      const existingNotes = targetCurriculum?.teacherNotes || '';

      const updatedFormData = {
        ...curriculumFormData,
        teacherNotes: existingNotes
          ? `${existingNotes}\n[${commentType === 'positive' ? 'Tích cực' : 'Cần cải thiện'}] ${newComment}`
          : `[${commentType === 'positive' ? 'Tích cực' : 'Cần cải thiện'}] ${newComment}`
      };

      const result = await evaluationApi.updateCurriculumEvaluation(studentId, selectedCurriculumId, updatedFormData);

      setCurriculumEvaluations(prev =>
        prev.map(c => c.curriculumId === selectedCurriculumId ? result : c)
      );
      setNewComment('');

      // Gọi callback để refresh progress trên card
      if (onProgressUpdate) {
        onProgressUpdate();
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Có lỗi xảy ra khi gửi nhận xét");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Toggle expand/collapse curriculum
  const toggleCurriculum = (curriculumId: number) => {
    setExpandedCurriculums(prev => ({
      ...prev,
      [curriculumId]: !prev[curriculumId]
    }));
  };

  // Toggle expand/collapse sessions
  const toggleSessions = (curriculumId: number) => {
    setExpandedSessions(prev => ({
      ...prev,
      [curriculumId]: !prev[curriculumId]
    }));
  };

  const getAttendanceRate = () => {
    if (attendanceStats) {
      return attendanceStats.attendanceRate;
    }
    return studentData.academicData.attendanceRate;
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + PAGE_SIZE, attendanceStats?.history.length || 0));
  };

  const handleCollapse = () => {
    setVisibleCount(PAGE_SIZE);
  };

  const getVisibleHistory = () => {
    if (!attendanceStats?.history) return [];
    return attendanceStats.history.slice(0, visibleCount);
  };

  const hasMore = attendanceStats?.history && visibleCount < attendanceStats.history.length;
  const hasCollapsed = attendanceStats?.history && visibleCount > PAGE_SIZE;

  // Render rating stars
  const renderStars = (level: number, onChange?: (value: number) => void) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}  // ← Add this key
            type="button"
            onClick={() => onChange && onChange(star)}
            className={cn(
              "text-xs transition-colors",
              onChange ? "cursor-pointer hover:scale-110" : "cursor-default",
              star <= level ? "text-amber-400" : "text-slate-200"
            )}
          >
            ★
          </button>
        ))}
      </div>
    );
  }

  // Hàm lấy tên phụ huynh chính
  const getMainParentName = (parents: any[] | undefined): string => {
    if (!parents || parents.length === 0) return "Chưa có thông tin";
    const mainParent = parents.find(p => p.relationship === "Ba" || p.relationship === "Mẹ");
    if (mainParent) return mainParent.fullName;
    return parents[0].fullName;
  };

  // Hàm lấy số điện thoại phụ huynh chính
  const getMainParentPhone = (parents: any[] | undefined): string => {
    if (!parents || parents.length === 0) return "Chưa có thông tin";
    const mainParent = parents.find(p => p.relationship === "Ba" || p.relationship === "Mẹ");
    if (mainParent) return mainParent.phoneNumber;
    return parents[0].phoneNumber;
  };

  // Render session evaluations cho một curriculum (dạng lồng)
  const renderSessionEvaluations = (curriculumId: number) => {
    const sessions = sessionEvalsByCurriculum[curriculumId] || [];

    if (sessions.length === 0) {
      return (
        <div className="text-center py-3 text-slate-400 text-[10px]">
          Chưa có buổi học nào trong lộ trình này
        </div>
      );
    }

    return (
      <div className="space-y-1.5 mt-2 pl-3 border-l-2 border-violet-200">
        {sessions.map((session) => (
          <div key={session.sessionDetailId} className="p-2 bg-slate-50 rounded-lg">
            {editingSessionId === session.sessionDetailId ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">
                    Buổi {session.sessionNumber}: {session.topic}
                  </span>
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 block mb-0.5">Mức độ hiểu bài</label>
                  {renderStars(sessionFormData.understandingLevel, (value) =>
                    setSessionFormData({ ...sessionFormData, understandingLevel: value })
                  )}
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 block mb-0.5">Trạng thái hoàn thành</label>
                  <select
                    value={sessionFormData.completionStatus}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, completionStatus: e.target.value })}
                    className="w-full p-1.5 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="PARTIAL">Hoàn thành một phần</option>
                    <option value="NOT_STARTED">Chưa hoàn thành</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 block mb-0.5">Chất lượng bài tập (1-5)</label>
                  {renderStars(sessionFormData.homeworkQuality || 0, (value) =>
                    setSessionFormData({ ...sessionFormData, homeworkQuality: value })
                  )}
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 block mb-0.5">Mức độ tham gia (1-5)</label>
                  {renderStars(sessionFormData.participationLevel || 0, (value) =>
                    setSessionFormData({ ...sessionFormData, participationLevel: value })
                  )}
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 block mb-0.5">Ghi chú</label>
                  <textarea
                    value={sessionFormData.teacherNotes}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, teacherNotes: e.target.value })}
                    rows={1}
                    className="w-full p-1.5 border border-slate-200 rounded-lg text-xs resize-none"
                    placeholder="Nhận xét thêm..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveSessionEvaluation(session.sessionDetailId)}
                    className="flex-1 px-2 py-1 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setEditingSessionId(null)}
                    className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-200"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-medium text-slate-700">
                      Buổi {session.sessionNumber}: {session.topic}
                    </span>
                    <div className="flex items-center gap-2 text-[9px] text-slate-500">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-full",
                        session.completionStatus === 'COMPLETED' && "bg-emerald-100 text-emerald-600",
                        session.completionStatus === 'PARTIAL' && "bg-amber-100 text-amber-600",
                        session.completionStatus === 'NOT_STARTED' && "bg-slate-100 text-slate-500"
                      )}>
                        {session.completionStatus === 'COMPLETED' && "✓ Hoàn thành"}
                        {session.completionStatus === 'PARTIAL' && "⚠️ Một phần"}
                        {session.completionStatus === 'NOT_STARTED' && "○ Chưa hoàn thành"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => startEditSession(session)}
                    className="p-1 text-slate-400 hover:text-violet-600"
                  >
                    <Edit2 size={10} />
                  </button>
                </div>
                <div className="flex items-center gap-3 text-[9px] text-slate-500">
                  <div className="flex items-center gap-0.5">
                    <span>Hiểu bài:</span>
                    {renderStars(session.understandingLevel || 0)}
                  </div>
                  {(session.homeworkQuality || session.participationLevel) && (
                    <>
                      {session.homeworkQuality && session.homeworkQuality > 0 && (
                        <span>BTVN: {session.homeworkQuality}/5</span>
                      )}
                      {session.participationLevel && session.participationLevel > 0 && (
                        <span>Tham gia: {session.participationLevel}/5</span>
                      )}
                    </>
                  )}
                </div>
                {session.teacherNotes && (
                  <p className="text-[9px] text-slate-500 mt-1 italic">{session.teacherNotes}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const startEditCurriculum = (curriculum: CurriculumEvaluation) => {
    setEditingCurriculumId(curriculum.curriculumId);
    setCurriculumFormData({
      understandingLevel: curriculum.understandingLevel,
      overallProgress: curriculum.overallProgress,
      teacherNotes: curriculum.teacherNotes || '',
      strengths: curriculum.strengths || '',
      weaknesses: curriculum.weaknesses || '',
      recommendations: curriculum.recommendations || ''
    });
  };

  // Hàm khởi tạo chỉnh sửa cho session
  const startEditSession = (session: SessionEvaluation) => {
    console.log('Session data:', session);
    setEditingSessionId(session.sessionDetailId);
    setSessionFormData({
      understandingLevel: session.understandingLevel || 0,
      completionStatus: session.completionStatus,
      teacherNotes: session.teacherNotes || '',
      homeworkQuality: session.homeworkQuality || 0,
      participationLevel: session.participationLevel || 0
    });
  };

  // Render một curriculum card (dạng có thể mở/đóng)
  const renderCurriculumCard = (curriculum: CurriculumEvaluation) => {
    const isEditing = editingCurriculumId === curriculum.curriculumId;
    const isExpanded = expandedCurriculums[curriculum.curriculumId];
    const isSessionsExpanded = expandedSessions[curriculum.curriculumId];
    const sessions = sessionEvalsByCurriculum[curriculum.curriculumId] || [];
    const completedSessions = sessions.filter(s => s.completionStatus === 'COMPLETED').length;
    const sessionProgress = sessions.length > 0 ? (completedSessions / sessions.length) * 100 : 0;

    return (
      <div key={curriculum.curriculumId} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {/* Header - Có thể click để mở/đóng curriculum */}
        <div
          className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-slate-200 cursor-pointer hover:bg-gradient-to-r hover:from-violet-100 hover:to-indigo-100 transition-colors"
          onClick={() => toggleCurriculum(curriculum.curriculumId)}
        >
          <div className="flex items-center gap-2 flex-1">
            <ChevronRight
              size={16}
              className={cn(
                "text-violet-600 transition-transform",
                isExpanded && "rotate-90"
              )}
            />
            <Layers size={16} className="text-violet-600" />
            <h3 className="text-sm font-semibold text-slate-800">{curriculum.curriculumTitle}</h3>
            {/* Hiển thị tiến độ tổng thể của curriculum */}
            <div className="flex items-center gap-1 ml-2">
              <div className="h-1.5 w-20 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${curriculum.overallProgress}%` }}
                />
              </div>
              <span className="text-[9px] font-medium text-slate-600">{curriculum.overallProgress}%</span>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                startEditCurriculum(curriculum);
              }}
              className="p-1 text-slate-400 hover:text-violet-600 transition-colors"
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>

        {/* Nội dung curriculum - Hiển thị khi mở */}
        {isExpanded && (
          <div className="p-3 space-y-3">
            {/* Phần đánh giá curriculum */}
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Mức độ hiểu bài</label>
                  {renderStars(curriculumFormData.understandingLevel, (value) =>
                    setCurriculumFormData({ ...curriculumFormData, understandingLevel: value })
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Tiến độ tổng thể (%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={curriculumFormData.overallProgress}
                    onChange={(e) => setCurriculumFormData({ ...curriculumFormData, overallProgress: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-right text-xs text-slate-500 mt-0.5">{curriculumFormData.overallProgress}%</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Điểm mạnh</label>
                  <input
                    type="text"
                    value={curriculumFormData.strengths}
                    onChange={(e) => setCurriculumFormData({ ...curriculumFormData, strengths: e.target.value })}
                    placeholder="Ví dụ: Tư duy logic tốt, chăm chỉ làm bài tập..."
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Điểm cần cải thiện</label>
                  <input
                    type="text"
                    value={curriculumFormData.weaknesses}
                    onChange={(e) => setCurriculumFormData({ ...curriculumFormData, weaknesses: e.target.value })}
                    placeholder="Ví dụ: Cần tập trung hơn trong giờ học..."
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Khuyến nghị</label>
                  <textarea
                    value={curriculumFormData.recommendations}
                    onChange={(e) => setCurriculumFormData({ ...curriculumFormData, recommendations: e.target.value })}
                    placeholder="Gợi ý phương pháp học tập..."
                    rows={2}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveCurriculumEvaluation(curriculum.curriculumId)}
                    className="flex-1 px-3 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Save size={12} />
                    Lưu
                  </button>
                  <button
                    onClick={() => setEditingCurriculumId(null)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <X size={12} />
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Mức độ hiểu bài</span>
                  {renderStars(curriculum.understandingLevel)}
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-0.5">
                    <span>Tiến độ tổng thể</span>
                    <span>{curriculum.overallProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full btn-gradient rounded-full"
                      style={{ width: `${curriculum.overallProgress}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2 bg-emerald-50/50 rounded-lg">
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingUp size={11} className="text-emerald-600" />
                      <span className="text-[9px] font-semibold text-emerald-700 uppercase">Điểm mạnh</span>
                    </div>
                    <p className="text-[10px] text-slate-600">{curriculum.strengths || "Chưa có đánh giá"}</p>
                  </div>
                  <div className="p-2 bg-red-50/50 rounded-lg">
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingDown size={11} className="text-red-600" />
                      <span className="text-[9px] font-semibold text-red-700 uppercase">Cần cải thiện</span>
                    </div>
                    <p className="text-[10px] text-slate-600">{curriculum.weaknesses || "Chưa có đánh giá"}</p>
                  </div>
                </div>
                {curriculum.recommendations && (
                  <div className="p-2 bg-blue-50/50 rounded-lg">
                    <div className="flex items-center gap-1 mb-1">
                      <MessageSquare size={11} className="text-blue-600" />
                      <span className="text-[9px] font-semibold text-blue-700 uppercase">Khuyến nghị</span>
                    </div>
                    <p className="text-[10px] text-slate-600">{curriculum.recommendations}</p>
                  </div>
                )}
                {curriculum.teacherNotes && (
                  <div className="p-2 bg-amber-50/50 rounded-lg">
                    <div className="flex items-center gap-1 mb-1">
                      <FileText size={11} className="text-amber-600" />
                      <span className="text-[9px] font-semibold text-amber-700 uppercase">Ghi chú giáo viên</span>
                    </div>
                    <p className="text-[10px] text-slate-600 whitespace-pre-wrap">{curriculum.teacherNotes}</p>
                  </div>
                )}
                {curriculum.updatedAt && (
                  <div className="text-right text-[9px] text-slate-400">
                    Cập nhật lần cuối: {formatDate(curriculum.updatedAt)}
                  </div>
                )}
              </div>
            )}

            {/* Phần các buổi học lồng bên trong - Có nút thu gọn/mở rộng */}
            <div>
              <div
                className="flex items-center justify-between mb-2 pt-2 border-t border-slate-100 cursor-pointer hover:bg-slate-50/50 rounded-lg transition-colors -mx-1 px-1 py-1"
                onClick={() => toggleSessions(curriculum.curriculumId)}
              >
                <div className="flex items-center gap-1.5">
                  <ChevronRight
                    size={12}
                    className={cn(
                      "text-violet-500 transition-transform",
                      isSessionsExpanded && "rotate-90"
                    )}
                  />
                  <ClipboardCheck size={11} className="text-violet-500" />
                  <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">
                    Các buổi học
                  </span>
                  <span className="text-[9px] text-slate-400 ml-1">
                    ({completedSessions}/{sessions.length})
                  </span>
                  {loadingSessions && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-violet-500 ml-1"></div>
                  )}
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100">
                  <span className="text-[9px] text-slate-500">
                    {isSessionsExpanded ? "Thu gọn" : "Mở rộng"}
                  </span>
                  {isSessionsExpanded ? (
                    <ChevronUp size={12} className="text-slate-500" />
                  ) : (
                    <ChevronDown size={12} className="text-slate-500" />
                  )}
                </div>
              </div>

              {isSessionsExpanded && renderSessionEvaluations(curriculum.curriculumId)}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (activeTab === "overview") {
    // Tính tiến độ trung bình từ các curriculum
    const averageOverallProgress = curriculumEvaluations.length > 0
      ? Math.round(curriculumEvaluations.reduce((sum, c) => sum + c.overallProgress, 0) / curriculumEvaluations.length)
      : studentData.academicData.overallProgress;

    // Lấy thông tin từ studentDetail (từ API) hoặc từ studentData (fallback)
    const displayPhone = studentDetail?.phoneNumber || studentData.personalInfo.phone || "Chưa có thông tin";
    const displayEmail = studentDetail?.email || studentData.personalInfo.email || "Chưa có thông tin";
    const displayParentName = studentDetail?.parents ? getMainParentName(studentDetail.parents) : studentData.personalInfo.parentName || "Chưa có thông tin";
    const displayParentPhone = studentDetail?.parents ? getMainParentPhone(studentDetail.parents) : studentData.personalInfo.parentPhone || "Chưa có thông tin";

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {loadingStudentDetail ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-500"></div>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <User size={12} className="text-violet-500" />
                Thông tin cá nhân
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <InfoCard label="Ngày sinh" value={formatDate(studentData.personalInfo.dateOfBirth)} icon={Calendar} />
                <InfoCard label="Trường" value={studentData.personalInfo.schoolName} icon={School} />
                <InfoCard label="Số điện thoại" value={displayPhone} icon={Phone} />
                <InfoCard label="Email" value={displayEmail} icon={Mail} />
                <InfoCard label="Phụ huynh" value={displayParentName} icon={Users} />
                <InfoCard label="SĐT phụ huynh" value={displayParentPhone} icon={Phone} />
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
                    <span className="text-lg font-bold text-violet-700">{averageOverallProgress}%</span>
                  </div>
                  <p className="text-[10px] text-slate-600">Tiến độ tổng thể</p>
                  <div className="mt-1 h-1 bg-violet-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${averageOverallProgress}%`,
                        background: "linear-gradient(to right, #8b5cf6, #6366f1)"
                      }}
                    />
                  </div>
                  {curriculumEvaluations.length > 1 && (
                    <p className="text-[8px] text-slate-400 mt-1">
                      Trung bình từ {curriculumEvaluations.length} lộ trình
                    </p>
                  )}
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
              </div>
            </div>

            {/* Hiển thị danh sách các curriculum và tiến độ của từng cái */}
            {curriculumEvaluations.length > 1 && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Layers size={14} className="text-violet-500" />
                  <span className="text-xs font-semibold text-slate-700">Tiến độ theo lộ trình</span>
                </div>
                <div className="space-y-2">
                  {curriculumEvaluations.map(curriculum => (
                    <div key={curriculum.curriculumId}>
                      <div className="flex items-center justify-between text-[10px] mb-0.5">
                        <span className="text-slate-600 truncate flex-1">{curriculum.curriculumTitle}</span>
                        <span className="text-slate-500 ml-2">{curriculum.overallProgress}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full btn-gradient rounded-full"
                          style={{ width: `${curriculum.overallProgress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    );
  }

  if (activeTab === "academic") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Đánh giá tổng thể cho từng Curriculum (dạng có thể mở/đóng) */}
        {loadingCurriculum ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-500"></div>
          </div>
        ) : curriculumEvaluations.length > 0 ? (
          <div className="space-y-3">
            {curriculumEvaluations.map(curriculum => renderCurriculumCard(curriculum))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
            <p className="text-xs text-slate-400 mb-2">Chưa có lộ trình học nào</p>
          </div>
        )}

       
      </motion.div>
    );
  }

  // ============ TAB ATTENDANCE (giữ nguyên) ============
  if (activeTab === "attendance") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {loadingAttendance ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          </div>
        ) : attendanceStats ? (
          <>
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

  // ============ TAB SCORES (giữ nguyên) ============
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

  // ============ TAB FEEDBACK (CẬP NHẬT - CHỌN CURRICULUM) ============
  if (activeTab === "feedback") {
    const selectedEval = curriculumEvaluations.find(c => c.curriculumId === selectedCurriculumId);

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        {/* Select curriculum */}
        {curriculumEvaluations.length > 1 && (
          <div className="mb-3">
            <label className="text-[10px] text-slate-500 block mb-1">Chọn lộ trình</label>
            <select
              value={selectedCurriculumId || ''}
              onChange={(e) => setSelectedCurriculumId(Number(e.target.value))}
              className="w-full p-2 border border-slate-200 rounded-lg text-xs"
            >
              {curriculumEvaluations.map(curriculum => (
                <option key={curriculum.curriculumId} value={curriculum.curriculumId}>
                  {curriculum.curriculumTitle}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Feedback content */}
        <div className="space-y-2">
          {selectedEval?.teacherNotes && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <MessageSquare size={12} className="text-violet-500" />
                <span className="text-[10px] text-slate-400">
                  {selectedEval.updatedAt ? formatDate(selectedEval.updatedAt) : "Mới nhất"}
                </span>
              </div>
              <p className="text-xs text-slate-600 whitespace-pre-wrap">{selectedEval.teacherNotes}</p>
            </div>
          )}

          {selectedEval?.recommendations && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <Target size={12} className="text-blue-600" />
                <span className="text-[10px] font-medium text-blue-700">Khuyến nghị</span>
              </div>
              <p className="text-xs text-slate-600">{selectedEval.recommendations}</p>
            </div>
          )}

          {!selectedEval?.teacherNotes && !selectedEval?.recommendations && (
            <div className="text-center py-6 text-slate-400 text-xs">
              Chưa có nhận xét nào cho lộ trình này
            </div>
          )}
        </div>

        {/* Add comment form */}
        {selectedCurriculumId && (
          <div className="pt-3 border-t border-slate-200">
            <label className="text-xs font-medium text-slate-700 mb-2 block">Thêm nhận xét</label>

            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setCommentType('positive')}
                className={cn(
                  "flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1",
                  commentType === 'positive'
                    ? "bg-emerald-500 text-white"
                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                )}
              >
                <ThumbsUp size={12} />
                Tích cực
              </button>
              <button
                onClick={() => setCommentType('improvement')}
                className={cn(
                  "flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1",
                  commentType === 'improvement'
                    ? "bg-amber-500 text-white"
                    : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                )}
              >
                <ThumbsDown size={12} />
                Cần cải thiện
              </button>
            </div>

            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Nhập nhận xét..."
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none"
              rows={2}
            />
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submittingComment}
              className="w-full mt-2 px-3 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingComment ? "Đang gửi..." : "Gửi nhận xét"}
            </button>
          </div>
        )}
      </motion.div>
    );
  }

  return null;
};