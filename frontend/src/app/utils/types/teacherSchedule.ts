export interface TeacherSchedule {
  sessionId: number
  sessionDate: string
  startTime: string
  endTime: string
  status: string
  subjectId: number
  subjectName: string
  roomId: number | null
  roomName: string | null
}

export interface GetTeacherScheduleParams {
  startDate: string  
  endDate: string   
}