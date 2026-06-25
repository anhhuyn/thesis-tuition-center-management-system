import { Clock, RefreshCw, XCircle, Bell, Phone, FileText, ChevronDown, ChevronUp, UserCheck, CalendarX, CheckCircle, AlertCircle, BookOpen, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { sessionApi } from "../../../utils/api";
import type { SessionDetail } from "../../../utils/types/session";
import { getInitials, getImageSrc } from "../../../utils/helpers";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: number;
  isTeacher?: boolean;
}

export const RescheduleModal = ({ 
  isOpen, 
  onClose, 
  sessionId,
  isTeacher = false
}: RescheduleModalProps) => {
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    students: true,
    content: true,
  });

  useEffect(() => {
    if (isOpen && sessionId !== undefined && sessionId !== null) {
      fetchSessionDetail();
    }
  }, [isOpen, sessionId]);

  const fetchSessionDetail = async () => {
    if (!sessionId) {
      setError("Không có ID buổi học");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await sessionApi.getSessionDetail(sessionId);
      setSessionDetail(data);
    } catch (err) {
      console.error("Error fetching session detail:", err);
      setError("Không thể tải thông tin buổi học");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusText = (status?: string) => {
    const statusMap: Record<string, string> = {
      scheduled: "CHƯA DIỄN RA",
      ongoing: "ĐANG DIỄN RA",
      completed: "ĐÃ HOÀN THÀNH",
      canceled: "ĐÃ HỦY",
      expired: "CHƯA XỬ LÝ"
    };
    return statusMap[status || ""] || "ĐANG DIỄN RA";
  };

  const getStatusColor = (status?: string) => {
    const colorMap: Record<string, string> = {
      ongoing: "bg-emerald-100 text-emerald-700",
      scheduled: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      canceled: "bg-red-100 text-red-700",
      expired: "bg-yellow-100 text-yellow-700"
    };
    return colorMap[status || ""] || "bg-emerald-100 text-emerald-700";
  };

  const getAttendanceColor = (status?: string | null) => {
    switch (status) {
      case "present": return "bg-green-500";
      case "absent": return "bg-red-500";
      case "late": return "bg-yellow-500";
      default: return "bg-gray-300";
    }
  };

  const formatDateTime = (date?: string, startTime?: string, endTime?: string) => {
    if (!date || !startTime || !endTime) return "Đang cập nhật...";
    const formattedDate = new Date(date).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    return `${formattedDate}, ${startTime.substring(0, 5)} - ${endTime.substring(0, 5)} (${sessionDetail?.totalMinutes || 0} phút)`;
  };

  const presentCount = sessionDetail?.studentAttendances?.filter(
    s => s.attendanceStatus === 'present' || s.attendanceStatus === 'late'
  ).length || 0;
  
  const totalStudents = sessionDetail?.studentAttendances?.length || 0;
  const absentCount = totalStudents - presentCount;

  const displayedStudents = showAllStudents 
    ? sessionDetail?.studentAttendances || []
    : sessionDetail?.studentAttendances?.slice(0, 3) || [];
  
  const remainingCount = (sessionDetail?.studentAttendances?.length || 0) - 3;

  const getRandomColor = (name: string) => {
    const colors = [
      { bg: "bg-blue-100", text: "text-blue-700" },
      { bg: "bg-purple-100", text: "text-purple-700" },
      { bg: "bg-orange-100", text: "text-orange-700" },
      { bg: "bg-green-100", text: "text-green-700" },
      { bg: "bg-pink-100", text: "text-pink-700" },
      { bg: "bg-indigo-100", text: "text-indigo-700" }
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const renderTeacherAvatar = () => {
    if (!sessionDetail?.teacher) return null;
    
    const imageSrc = getImageSrc(sessionDetail.teacher.image);
    
    if (imageSrc) {
      return (
        <img 
          src={imageSrc} 
          alt={sessionDetail.teacher.fullName}
          className="w-12 h-12 rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = 'w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg';
              fallback.textContent = getInitials(sessionDetail.teacher?.fullName);
              parent.appendChild(fallback);
            }
          }}
        />
      );
    }
    
    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
        {getInitials(sessionDetail.teacher.fullName)}
      </div>
    );
  };

  const handleAttendance = () => {
    console.log("Điểm danh cho buổi học:", sessionId);
  };

  const handleRequestLeave = () => {
    console.log("Xin nghỉ cho buổi học:", sessionId);
  };

  const handleReschedule = () => {
    console.log("Đổi lịch cho buổi học:", sessionId);
  };

  const handleCancelSession = () => {
    console.log("Hủy ca học:", sessionId);
  };

  const handleNotify = () => {
    console.log("Thông báo cho phụ huynh về buổi học:", sessionId);
  };

  const toggleSection = (section: 'students' | 'content') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex overflow-hidden">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className="ml-auto w-[480px] h-full bg-white flex flex-col relative z-10 shadow-xl">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex overflow-hidden">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className="ml-auto w-[480px] h-full bg-white flex flex-col relative z-10 shadow-xl">
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6">
              <XCircle size={48} className="text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={fetchSessionDetail}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionDetail) return null;

  const canTakeAttendance = sessionDetail.status === 'ongoing' || sessionDetail.status === 'scheduled';
  const canRequestLeave = sessionDetail.status === 'scheduled' || sessionDetail.status === 'ongoing';
  const isTeacherAlreadyAttended = sessionDetail.teacherAttendance?.status === 'present';
  const hasTeacherRequestedLeave = sessionDetail.teacherAttendance?.status === 'absent';

  // Kiểm tra xem có nội dung buổi học không
  const hasContent = sessionDetail.displayTopic || sessionDetail.displayContent || sessionDetail.displayHomework;

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="ml-auto w-[480px] h-full bg-white flex flex-col relative z-10 shadow-2xl animate-slide-in">
        {/* HEADER - Thêm thông tin phòng học */}
        <div className="relative flex items-start justify-between pt-6 pb-4 px-6 border-b">
          <div className="flex-1">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(sessionDetail.status)}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                sessionDetail.status === 'ongoing' ? 'bg-emerald-600 animate-pulse' :
                sessionDetail.status === 'scheduled' ? 'bg-blue-600' :
                'bg-gray-600'
              }`} />
              {getStatusText(sessionDetail.status)}
            </div>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">
              {sessionDetail.subjectName}
            </h2>
            {/* Thông tin thời gian và phòng học chung */}
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock size={14} className="stroke-[1.5]" />
                <span>{formatDateTime(
                  sessionDetail.sessionDate,
                  sessionDetail.startTime,
                  sessionDetail.endTime
                )}</span>
              </div>
              {sessionDetail.room && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={14} className="stroke-[1.5]" />
                  <span>{sessionDetail.room.name}</span>
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Teacher Card */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">GIÁO VIÊN GIẢNG DẠY</p>
            {sessionDetail.teacher ? (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                {renderTeacherAvatar()}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{sessionDetail.teacher.fullName}</p>
                  <p className="text-xs text-gray-500">{sessionDetail.teacher.specialty || 'Giáo viên'}</p>
                  {sessionDetail.teacherAttendance && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        sessionDetail.teacherAttendance.status === 'present' ? 'bg-green-500' :
                        sessionDetail.teacherAttendance.status === 'absent' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <span className="text-xs font-medium text-gray-600">
                        {sessionDetail.teacherAttendance.status === 'present' ? 'Đã điểm danh' :
                          sessionDetail.teacherAttendance.status === 'absent' ? 'Đã xin nghỉ' : 'Chưa điểm danh'}
                      </span>
                    </div>
                  )}
                </div>
                {sessionDetail.teacher.phoneNumber && (
                  <a href={`tel:${sessionDetail.teacher.phoneNumber}`} 
                     className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Phone size={18} />
                  </a>
                )}
              </div>
            ) : (
              <div className="flex items-center p-4 border border-dashed rounded-xl text-gray-400">
                <AlertCircle size={18} className="mr-2" />
                Chưa có thông tin giáo viên
              </div>
            )}
          </div>

          {/* Students Section - Đặt lên trước */}
          <div>
            <button 
              onClick={() => toggleSection('students')}
              className="w-full flex justify-between items-center mb-2"
            >
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">DANH SÁCH HỌC SINH</p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                  <CheckCircle size={10} /> {presentCount}/{totalStudents}
                </span>
                {absentCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
                    <XCircle size={10} /> {absentCount}
                  </span>
                )}
                {expandedSections.students ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
              </div>
            </button>
            
            {expandedSections.students && (
              <div className="space-y-2 pr-1">
                {displayedStudents.map((student) => {
                  const colors = getRandomColor(student.fullName);
                  const isPresent = student.attendanceStatus === 'present';
                  const isLate = student.attendanceStatus === 'late';
                  const isAbsent = student.attendanceStatus === 'absent';
                  
                  return (
                    <div key={student.studentId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full ${colors.bg}`}>
                        <span className={`text-xs font-semibold ${colors.text}`}>
                          {getInitials(student.fullName)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{student.fullName}</p>
                        {student.attendanceNote && (
                          <p className="text-xs text-gray-500 truncate">{student.attendanceNote}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getAttendanceColor(student.attendanceStatus)}`} />
                        <span className={`text-xs font-medium ${
                          isPresent ? 'text-green-600' :
                          isLate ? 'text-yellow-600' :
                          isAbsent ? 'text-red-600' : 'text-gray-400'
                        }`}>
                          {isPresent ? 'Có mặt' :
                           isLate ? 'Đi muộn' :
                           isAbsent ? 'Vắng mặt' : 'Chưa điểm danh'}
                        </span>
                      </div>
                    </div>
                  );
                })}
                
                {totalStudents > 3 && (
                  <button 
                    onClick={() => setShowAllStudents(!showAllStudents)}
                    className="w-full flex items-center justify-center gap-1 text-xs text-blue-600 mt-3 py-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {showAllStudents ? (
                      <>
                        <ChevronUp size={14} /> Thu gọn
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} /> Xem thêm {remainingCount} học sinh
                      </>
                    )}
                  </button>
                )}
                
                {totalStudents === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <FileText size={32} className="mx-auto mb-2 stroke-[1.5]" />
                    <p className="text-sm">Chưa có học sinh đăng ký</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* NỘI DUNG BUỔI HỌC - Đặt xuống dưới danh sách học sinh */}
          <div>
            <button 
              onClick={() => toggleSection('content')}
              className="w-full flex justify-between items-center mb-2"
            >
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">NỘI DUNG BUỔI HỌC</p>
              {expandedSections.content ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>
            
            {expandedSections.content && (
              <div className="space-y-3">
                {/* Badge trạng thái dạy đúng/lệch kế hoạch */}
                <div className={`flex items-center gap-2 p-3 rounded-xl ${
                  sessionDetail.isFollowingPlan
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-amber-50 border border-amber-200'
                }`}>
                  {sessionDetail.isFollowingPlan ? (
                    <CheckCircle size={16} className="text-emerald-600" />
                  ) : (
                    <AlertCircle size={16} className="text-amber-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    sessionDetail.isFollowingPlan ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {sessionDetail.isFollowingPlan ? 'Dạy đúng kế hoạch' : 'Dạy lệch kế hoạch'}
                  </span>
                </div>

                {/* Chủ đề */}
                {sessionDetail.displayTopic && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">CHỦ ĐỀ</label>
                    <p className="text-sm text-gray-800 mt-1">{sessionDetail.displayTopic}</p>
                  </div>
                )}

                {/* Nội dung */}
                {sessionDetail.displayContent && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">NỘI DUNG</label>
                    <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{sessionDetail.displayContent}</div>
                  </div>
                )}

                {/* Bài tập */}
                {sessionDetail.displayHomework && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">BÀI TẬP</label>
                    <p className="text-sm text-gray-700 mt-1">{sessionDetail.displayHomework}</p>
                  </div>
                )}

                {/* Kế hoạch tham khảo (khi dạy lệch) */}
                {!sessionDetail.isFollowingPlan && sessionDetail.plannedTopic && (
                  <div className="p-3 bg-gray-100 rounded-lg border-l-2 border-gray-400">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">KẾ HOẠCH THAM KHẢO</label>
                    <p className="text-sm text-gray-500 line-through mt-1">{sessionDetail.plannedTopic}</p>
                  </div>
                )}

                {/* Lý do thay đổi */}
                {sessionDetail.deviationReason && (
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <label className="text-xs font-medium text-amber-600 uppercase tracking-wider">LÝ DO THAY ĐỔI</label>
                    <p className="text-sm text-amber-700 mt-1 italic">{sessionDetail.deviationReason}</p>
                  </div>
                )}

                {/* Ghi chú cho buổi sau */}
                {sessionDetail.noteForNextSession && (
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                    <label className="text-xs font-medium text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                      <Clock size={12} /> GHI CHÚ CHO BUỔI SAU
                    </label>
                    <p className="text-sm text-indigo-700 mt-1">{sessionDetail.noteForNextSession}</p>
                  </div>
                )}

                {!hasContent && (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <BookOpen size={24} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Chưa cập nhật nội dung buổi học</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes - Ghi chú giáo viên */}
          {sessionDetail.teacherAttendance?.note && (
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">GHI CHÚ GIÁO VIÊN</p>
              <div className="p-3 bg-yellow-50 rounded-xl text-sm text-yellow-800 border border-yellow-100">
                {sessionDetail.teacherAttendance.note}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t bg-gray-50">
          {isTeacher ? (
            // Teacher buttons
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleAttendance}
                  disabled={!canTakeAttendance || isTeacherAlreadyAttended}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    canTakeAttendance && !isTeacherAlreadyAttended
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg active:scale-95'
                      : isTeacherAlreadyAttended
                        ? 'bg-green-100 text-green-600 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <UserCheck size={18} /> 
                  {isTeacherAlreadyAttended ? 'Đã điểm danh' : 'Điểm danh'}
                </button>
                <button 
                  onClick={handleRequestLeave}
                  disabled={!canRequestLeave || hasTeacherRequestedLeave}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    canRequestLeave && !hasTeacherRequestedLeave
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-md hover:shadow-lg active:scale-95'
                      : hasTeacherRequestedLeave
                        ? 'bg-orange-100 text-orange-600 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <CalendarX size={18} />
                  {hasTeacherRequestedLeave ? 'Đã xin nghỉ' : 'Xin nghỉ'}
                </button>
              </div>
              {(isTeacherAlreadyAttended || hasTeacherRequestedLeave) && (
                <p className="text-xs text-center text-gray-500">
                  {isTeacherAlreadyAttended && '✓ Bạn đã điểm danh cho buổi học này'}
                  {hasTeacherRequestedLeave && '✓ Bạn đã gửi yêu cầu xin nghỉ'}
                </p>
              )}
            </div>
          ) : (
            // Admin buttons
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleReschedule}
                  className="flex items-center justify-center gap-2 py-3 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 active:scale-95"
                >
                  <RefreshCw size={18} /> Đổi lịch
                </button>
                <button 
                  onClick={handleCancelSession}
                  className="flex items-center justify-center gap-2 py-3 bg-red-50 border border-red-200 rounded-xl font-semibold text-red-600 hover:bg-red-100 transition-all duration-200 active:scale-95"
                >
                  <XCircle size={18} /> Hủy ca học
                </button>
              </div>
             
            </div>
          )}
        </div>
      </div>
    </div>
  );
};