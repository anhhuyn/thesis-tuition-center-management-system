export interface TeacherSubject {
  id: number;
  teacherId: number;
  teacherName: string;
  email: string;
  teacherAvatar?: string;
  dateOfBirth?: string;
  specialty?: string;
  subjectId: number;
  subjectName: string;
  grade?: number;
  salaryRate: string;     
  createdAt: string;       
}

export interface TeacherSubjectRequest {
  teacherId: number;
  subjectId: number;
  salaryRate: number;
}

export interface TeacherSubjectFilter {
  grade?: number;
  teacherName?: string;
  subjectName?: string;
}

export interface ApiResponse {
    errCode?: number;
    code?: number;
    success?: boolean;
    message?: string;
    data?: any;
}