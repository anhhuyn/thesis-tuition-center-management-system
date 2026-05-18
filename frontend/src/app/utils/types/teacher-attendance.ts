export interface TeacherAttendanceItem {
  sessionId: number
  status: "" | "present" | "absent" | "late"
  note: string | null
}

export interface TeacherAttendance {
  teacherId: number
  fullName: string
  attendances: TeacherAttendanceItem[]
}

export interface SessionDTO {
  id: number
  sessionDate: string
  startTime: string
  endTime: string
}

export interface TeacherAttendanceResponse {
  subjectId: number
  sessions: SessionDTO[]
  teachers: TeacherAttendance[]
}

// Payload update
export interface UpdateTeacherStatusPayload {
  sessionId: number
  teacherId: number
  status: "" | "present" | "absent" | "late"
}

export interface UpdateTeacherNotePayload {
  sessionId: number
  teacherId: number
  note: string | null
}