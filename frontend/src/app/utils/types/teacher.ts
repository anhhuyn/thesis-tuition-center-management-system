export interface TeacherStatistics {
  totalTeachers: number
  totalTeachersThisMonth: number
  percentageIncreaseTeacher: number
}

export interface TeacherBasic {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: boolean;
  specialty: string;
  image: string;
}

export interface TeacherIdResponse {
  data: any;
  teacherId: number | null;
  userId: number;
  message: string;
}

export interface Teacher {
  id: number;            // user id
  email: string;
  fullName: string;
  phoneNumber: string;
  gender: boolean;
  image: string | null;
  roleId: string;
  roleName: string;
  dateOfBirth: string;   // ISO date
  specialty: string;
  address: Address | null;
  status: boolean;       // true: active, false: inactive
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  id: number;
  details: string | null;
  ward: string | null;
  province: string | null;
}

export interface TeacherResponse {
  total: number;
  data: Teacher[];
  success: boolean;
  limit: number;
  totalPages: number;
  page: number;
  errCode?: number;
  message?: string;
}

export interface TeacherFilterParams {
  page?: number;
  limit?: number;
  name?: string;
  specialty?: string;
  gender?: boolean;
  status?: boolean;
  search?: string;      // map to name
}

export interface CreateTeacherRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  gender: boolean;
  roleId: string;       // "R1"
  dateOfBirth: string;
  specialty: string;
  address?: {
    details: string;
    ward: string;
    province: string;
  };
  status?: boolean;     // default true
}

export interface UpdateTeacherRequest extends Partial<CreateTeacherRequest> {
  id: number;
}

// Helper
export const getGenderLabel = (gender: boolean): string => {
  return gender ? 'Nam' : 'Nữ';
};

export const getFullAddress = (address: Address | null): string => {
  if (!address) return 'Chưa cập nhật';
  const parts = [address.details, address.ward, address.province].filter(Boolean);
  return parts.join(', ') || 'Chưa cập nhật';
};