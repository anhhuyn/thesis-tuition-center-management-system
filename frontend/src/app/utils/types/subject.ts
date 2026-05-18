export interface SubjectStatistics {
  totalSubjects: number
  totalSubjectsThisMonth: number
  percentageIncreaseSubject: number
}

export interface SubjectStatisticsLevel {
  total: number
  level: String
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

  subjectType: {
    id: number
    name: string
    academicLevel: {
      id: number
      name: string
    }
  }

  teacherSubjects: {
    salaryRate: number
    teacher: {
      id: number
      specialty: string
      user: {
        id: number
        fullName: string
        phoneNumber: string
        gender: boolean
        email?: string
        image?: string | null
      }
    }
  }[]
}

export interface SubjectName {
  id: number
  name: string
}

export interface CreateSubjectRequest {
  name: string
  grade: string
  price?: number
  status?: 'active' | 'upcoming' | 'ended'
  maxStudents?: string
  sessionsPerWeek?: string
  note?: string
  teacherId?: number
  image?: File | null
  imageUrl?: string
  subjectTypeId?: number
}

export interface UpdateSubjectRequest {
  name?: string
  grade?: string
  price?: number
  status?: 'active' | 'upcoming' | 'ended'
  maxStudents?: number
  sessionsPerWeek?: number
  note?: string
  teacherId?: number
  subjectTypeId?: number
  imageUrl?: string
}

export interface TeacherSubjectResponse {
  success: boolean;
  data: Subject[];     
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: {
    all: number;
    active: number;
    upcoming: number;
    ended: number;
  };
}