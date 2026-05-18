export interface StudentSubject {
  id: number
  fullName: string
  gender: boolean | null
  dateOfBirth: string
  schoolName: string
  grade: string
}

export interface AddStudentToSubjectRequest {
  studentId: number
  subjectId: number
}

export interface StudentSubjectResponse {
  id: number
  enrollmentDate: string
  student: {
    id: number
    fullName: string
  }
  subject: {
    id: number
    name: string
  }
}