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