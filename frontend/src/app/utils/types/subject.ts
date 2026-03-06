export interface SubjectStatistics {
    totalSubjects: number
    totalSubjectsThisMonth: number
    percentageIncreaseSubject: number
}

export interface SubjectResponse {
  total: number
  data: Subject[]
  stats: {
    all: number
    ended: number
    active: number
    upcoming: number
  }
  success: boolean
  limit: number
  totalPages: number
  page: number
}

export interface Subject {
  id: number
  name: string
  grade: string
  price: number
  status: 'active' | 'upcoming' | 'ended'
  maxStudents: number
  sessionsPerWeek: number
  image: string | null
  note: string
  currentStudents: number
  teacherSubjects: {
    salaryRate: number
    teacher: {
      id: number
      specialty: string
      user: {
        id: number
        fullName: string
        phoneNumber: string
      }
    }
  }[]
}
