// student.ts

export interface StudentStatistics {
  totalStudents: number
  totalStudentsThisMonth: number
  percentageIncreaseStudent: number
}

export interface StudentStatisticsGender {
  male: number
  female: number
}

export interface StudentStatisticsGrade {
  grade: string
  total: number
}

export interface StudentResponse {
  total: number
  data: Student[]
  stats?: {
    all: number
    active: number
    inactive?: number
  }
  success: boolean
  limit: number
  totalPages: number
  page: number
  errCode?: number
  message?: string
}

export interface Student {
  id: number
  email: string
  fullName: string
  phoneNumber: string
  gender: boolean // true: Nam, false: Nữ
  image: string | null
  roleId: string
  status: boolean; 
  roleName: string
  dateOfBirth: string // ISO date format
  grade: string
  schoolName: string
  createdAt: string
  updatedAt: string
  
  // Nested objects
  address: Address | null
  parents: Parent[]
  subjects: SubjectEnrolled[]
}

export interface Address {
  id: number
  details: string | null
  ward: string | null
  province: string | null
}

export interface Parent {
  id: number
  fullName: string
  phoneNumber: string
  relationship: string // "Ba", "Mẹ", etc.
  email?: string // Optional field
}

export interface SubjectEnrolled {
  id: number
  name: string
  grade?: string // Optional: lớp của môn học
  status?: 'active' | 'upcoming' | 'ended' // Optional: trạng thái môn học
  price?: number // Optional: giá môn học
}

export interface RecentActivity {
  id: string | number
  type: 'join' | 'payment' | 'miss' | 'update' | 'create' | 'delete'
  user: string
  target?: string
  time: string
  description?: string
}

// src/utils/types/student.ts

export interface CreateStudentRequest {
  email: string
  fullName: string
  phoneNumber: string
  gender: boolean
  dateOfBirth: string
  grade: string
  schoolName: string
  roleId: string  // THÊM: Bắt buộc phải có roleId = "R2"
  password?: string  // THÊM: Có thể có hoặc không (mặc định "123456")
  status?: boolean;
  address?: {
    details: string
    ward: string
    province: string
  }
  parents?: ParentContact[]  // THAY ĐỔI: Từ parentIds sang parents (BE dùng object)
  subjectIds?: number[]
}

// THÊM INTERFACE MỚI
export interface ParentContact {
  fullName: string
  phoneNumber: string
  relationship: string
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {
  id: number
}

export interface StudentFilterParams {
  page?: number
  limit?: number
  grade?: string
  gender?: boolean
  schoolName?: string
   status?: boolean;
  search?: string // Tìm kiếm theo tên hoặc email
  sortBy?: 'fullName' | 'createdAt' | 'grade'
  sortOrder?: 'asc' | 'desc'
}

// Utility types
export type StudentFormData = Omit<CreateStudentRequest, 'parentIds' | 'subjectIds'> & {
  parentIds: number[]
  subjectIds: number[]
}

// Helper functions (optional)
export const getGenderLabel = (gender: boolean): string => {
  return gender ? 'Nam' : 'Nữ'
}

export const getFullAddress = (address: Address | null): string => {
  if (!address) return 'Chưa cập nhật'
  const parts = [address.details, address.ward, address.province].filter(Boolean)
  return parts.join(', ') || 'Chưa cập nhật'
}

export const formatDateOfBirth = (dateOfBirth: string): string => {
  return new Date(dateOfBirth).toLocaleDateString('vi-VN')
}