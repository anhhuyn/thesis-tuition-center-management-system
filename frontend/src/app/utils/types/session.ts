export interface BaseSession {
  sessionId: number
  sessionDate: string
  startTime: string
  endTime: string
}

export interface UpcomingSession {
  subjectName: string
  grade: string
  teacherName: string
  sessionDate: string
  startTime: string
  endTime: string
}

export interface SessionOfTeacher {
  sessionId: number
  sessionDate: string
  startTime: string
  endTime: string
  status: string
  subjectId: number
  subjectName: string
  roomId: number
  roomName: string
};

export interface RoomDTO {
  name: string
}

export interface SubjectScheduleDTO {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface SessionOfSubject {
  id: number
  subjectId: number
  scheduleId: number
  sessionDate: string
  startTime: string
  endTime: string
  roomId: number
  status: string

  Room: RoomDTO
  SubjectSchedule: SubjectScheduleDTO
}

export interface SubjectScheduleResponse {
  message: string
  sessions: SessionOfSubject[]
}

export type TeacherLeaveType =
  | "NONE"
  | "PENDING"
  | "APPROVED"
  | "AWAITING_REPLACEMENT"
  | "RESOLVED";

export interface TeacherLeaveInfo {
  type: TeacherLeaveType;
  replacementTeacherId: number | null;   // Nếu RESOLVED thì có id
  replacementTeacherName: string | null; // Nếu RESOLVED thì có tên
}

export type SessionStatus =
  | "scheduled"
  | "ongoing"
  | "completed"
  | "canceled"
  | "expired";

export interface DailySession {
  sessionId: number
  sessionDate: string
  subjectName: string
  startTime: string
  endTime: string
  roomName: string | null
  teacher: {
  id: number
  fullName: string
} | null
  status: SessionStatus
   teacherLeaveInfo?: TeacherLeaveInfo;
}

export interface SessionTeacherInfo {
  id: number
  fullName: string
  specialty: string
  email: string
  phoneNumber: string | null
  image: string
}

// Type cho phòng học trong session detail
export interface SessionRoomInfo {
  id: number
  name: string
  seatCapacity: number
}

// Type cho điểm danh học sinh
export interface StudentAttendanceInfo {
  studentId: number
  fullName: string
  email: string
  phoneNumber: string | null
  attendanceStatus: 'present' | 'absent' | 'late' | null
  attendanceNote: string | null
}

// Type cho điểm danh giáo viên
export interface TeacherAttendanceInfo {
  teacherId: number
  teacherName: string
  status: 'present' | 'absent' | 'late'
  note: string | null
}

// Type cho session detail hoàn chỉnh
export interface SessionDetail {
  id: number
  status: SessionStatus
  className: string | null
  subjectName: string
  subjectSlug: string | null
  sessionDate: string
  startTime: string
  endTime: string
  totalMinutes: number
  teacher: SessionTeacherInfo | null
  room: SessionRoomInfo | null
  studentAttendances: StudentAttendanceInfo[]
  teacherAttendance: TeacherAttendanceInfo | null
}

export interface SessionActualContentUpdate {
  isFollowPlan: boolean;
  plannedSessionDetailId?: number | null;
  actualTopic?: string;
  actualContent?: string;
  actualHomework?: string;
  deviationReason?: string;
  noteForNextSession?: string;
}

export interface SessionContent {
  sessionId: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  displayTopic: string | null;
  displayContent: string | null;
  displayHomework: string | null;
  isFollowingPlan: boolean;
  plannedTopic: string | null;
  deviationReason: string | null;
  noteForNextSession: string | null;
}