import type { BaseSession } from "./session"

export interface AttendanceToday {
  sessionId: number
  date: string
  teacherStatus: "not_marked" | "present" | "absent" | "late" | "completed"
  totalStudents: number
  presentStudents: number
  absentStudents: number
  lateStudents: number
}

export interface AttendanceItem {
  sessionId: number
  status: "" | "present" | "absent" | "late" | "not_enrolled" | "removed" | "pending"
  note: string | null
}

export interface StudentAttendance {
  studentId: number
  fullName: string
  gender: boolean | null;     
  schoolName: string | null;   
  attendances: AttendanceItem[]
  enrollmentDate?: string  
  deletedAt?: string | null  
}
export interface AttendanceResponse {
  subjectId: number
  sessions: BaseSession[]
  students: StudentAttendance[]
}

export type AttendanceStatus = "" | "present" | "absent" | "late"

export interface UpdateAttendanceStatusPayload {
  sessionId: number
  studentId: number
  status: AttendanceStatus
}

export interface UpdateAttendanceNotePayload {
  sessionId: number
  studentId: number
  note: string | null
}


export interface AttendanceHistoryItem {
  attendanceId: number
  sessionId: number
  sessionDate: string        // LocalDate -> string
  startTime: string          // LocalTime -> string
  endTime: string            // LocalTime -> string
  status: "present" | "absent" | "late"
  note: string | null
  roomName: string | null
}

export interface AttendanceStatistics {
  studentId: number
  studentName: string
  subjectId: number
  subjectName: string
  totalSessions: number      // Tổng số buổi tham gia
  presentCount: number       // Số buổi có mặt
  absentCount: number        // Số buổi vắng
  lateCount: number          // Số buổi trễ
  attendanceRate: number     // Tỉ lệ chuyên cần (%)
  history: AttendanceHistoryItem[]
}


export interface GetAttendanceStatisticsParams {
  studentId: number
  subjectId: number
}
