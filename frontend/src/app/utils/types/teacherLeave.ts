export interface TeacherAbsentResponse {
  leaveId: number
  teacherId: number
  teacherName: string
  teacherImage: string
  startDate: string
  endDate: string
  leaveType: string
  reason: string
}

export interface WeeklyAbsentTeacherResponse {
  totalAbsentTeachers: number
  teachers: TeacherAbsentResponse[]
}

// ========== UI Types ==========
export interface LeaveRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherCode: string;
  department: string;
  avatar?: string;
  leaveType: 'Nghỉ phép năm' | 'Nghỉ ốm' | 'Việc riêng' | 'Nghỉ không lương' | 'Khác';
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  days: number;
  status: 'Chờ duyệt' | 'Đã duyệt' | 'Từ chối' | 'Đã hủy';
  reason?: string;
  createdAt: string;
  description?: string;
}

export interface LeaveStat {
  title: string;
  value: number;
  icon: string;
  color: string;
  bgColor: string;
}

export interface LeaveActivity {
  id: string;
  user?: string;
  action: string;
  target?: string;
  time: string;
  type: 'approve' | 'reject' | 'submit' | 'system';
  icon: string;
  bgColor: string;
  textColor: string;
}

export interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  leaves: LeaveRequest[];
}

// ========== API Types ==========
export interface TeacherLeave {
  id: number;
  teacherId: number;
  teacherName: string;
  teacherEmail: string;
  teacherPhone?: string;
  teacherCode?: string;
  department?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
  leaveType: string; // SICK, ANNUAL, PERSONAL, UNPAID, OTHER
  status: string;    // PENDING, APPROVED, REJECTED, CANCELLED
  approverId?: number;
  approverName?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  affectType?: 'CANCEL' | 'REPLACE';
  processed?: boolean;
  affectedSessions?: PreviewAffectedSessionResponse[];
}

export interface TeacherLeaveRequest {
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
  leaveType: string;
}

export interface ReplacementSelection {
  sessionId: number;
  replacementTeacherId: number;
}

export interface TeacherLeaveApproveRequest {
  action: 'APPROVED' | 'REJECTED';
  affectType?: 'CANCEL' | 'REPLACE';
  comment?: string;
  replacements?: ReplacementSelection[];
}

export interface TeacherLeaveFilter {
  page?: number;
  size?: number;
  status?: string;
}

export interface TeacherLeaveStats {
  pendingCount: number;
}

export interface ApiResponse {
  errCode: number;
  message: string;
  data?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
}

export interface ReplacementTeacher {
  id: number;
  name: string;
}

export interface SuggestedTeacher {
  id: number;
  name: string;
}

export interface AffectedSession {
  id: number;
  sessionId: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  subjectId: number;
  subjectName?: string;
  originalTeacherId: number;
  replacementTeacherId?: number;
  replacementTeacherName?: string;
  status: 'PENDING' | 'RESOLVED' | 'SKIPPED';
  suggestedTeachers?: SuggestedTeacher[];
  date: string;
  className: string;
  room: string;
  substituteTeacher?: string;
}

export interface PreviewAffectedSessionRequest {
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
}

export interface PreviewAffectedSessionResponse {
  sessionId: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  subjectId: number;
  className?: string;
  roomName?: string;
  replacementTeacherId?: number;
  replacementTeacherName?: string;
}

export interface AvailableReplacementTeacher {
  teacherId: number;
  teacherName: string;
  teacherEmail: string;
}
export interface PreviewReplacementPlanRequest {
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  replacements?: ReplacementSelection[];
}