import axios from '../axios'
import type {
  StudentStatistics,
  StudentResponse,
  StudentStatisticsGender,
  StudentStatisticsGrade,
  StudentFilterParams,
  Student,
  ParentContact
} from '../types/student'

// Interface cho response từ BE
interface BEStudentResponse {
  errCode: number
  message: string
  data: Student[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface ApiResponse {
  errCode: number;
  message: string;
  data?: any;
  newId?: number;
}


export const studentApi = {
  async getStatistics(): Promise<StudentStatistics> {
    try {
      const response = await axios.get('/students/statistics') as any
      console.log('Statistics from BE:', response)

      // Map từ response của BE sang interface FE
      return {
        totalStudents: response.totalStudents || 0,
        totalStudentsThisMonth: response.newStudentsThisMonth || 0,
        percentageIncreaseStudent: response.percentageIncrease || 0
      }
    } catch (error: any) {
      console.error('getStatistics error:', error.response?.data || error.message)
      return {
        totalStudents: 0,
        totalStudentsThisMonth: 0,
        percentageIncreaseStudent: 0
      }
    }
  },

  // Thống kê theo giới tính - Tạm thời tính từ danh sách students
  async getStatisticsGender(students: Student[]): Promise<StudentStatisticsGender> {
    const male = students.filter(s => s.gender === true).length
    const female = students.filter(s => s.gender === false).length
    return { male, female }
  },

  // Thống kê theo khối lớp - Tạm thời tính từ danh sách students
  async getStatisticsGrade(students: Student[]): Promise<StudentStatisticsGrade[]> {
    const gradeMap = new Map<string, number>()
    students.forEach(student => {
      const grade = student.grade
      gradeMap.set(grade, (gradeMap.get(grade) || 0) + 1)
    })
    const result: StudentStatisticsGrade[] = Array.from(gradeMap.entries())
      .map(([grade, total]) => ({ grade, total }))
      .sort((a, b) => Number(a.grade) - Number(b.grade))
    return result
  },

  // Lấy danh sách học sinh (có phân trang và lọc)
  async getAll(
    page = 1,
    limit = 10,
    filters?: StudentFilterParams
  ): Promise<StudentResponse> {
    try {
      // Gọi API đúng với cấu trúc BE
      const response = await axios.get('/students', {
        params: {
          page, limit,
          name: filters?.search,
          grade: filters?.grade,
          schoolName: filters?.schoolName,
          gender: filters?.gender !== undefined ? (filters.gender ? 'true' : 'false') : undefined,
          status: filters?.status !== undefined ? (filters.status ? 'true' : 'false') : undefined
        }
      }) as BEStudentResponse

      // Chuyển đổi response từ BE sang format FE
      return {
        total: response.pagination?.total || 0,
        data: response.data || [],
        success: response.errCode === 0,
        limit: response.pagination?.limit || limit,
        totalPages: response.pagination?.totalPages || 0,
        page: response.pagination?.page || page,
        errCode: response.errCode,
        message: response.message
      }
    } catch (error: any) {
      console.error('getAll error:', error.response?.data || error.message)
      return {
        total: 0,
        data: [],
        success: false,
        limit: limit,
        totalPages: 0,
        page: page,
        errCode: error.response?.status || 500,
        message: error.response?.data?.message || 'Failed to fetch students'
      }
    }
  },

  getSchools: async (): Promise<string[]> => {
    const response = await axios.get('/students/schools');
    console.log('Full response:', response); // Kiểm tra cấu trúc
    // Trường hợp 1: response.data là mảng trực tiếp
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // Trường hợp 2: response.data.data là mảng
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    // Fallback: trả về mảng rỗng
    console.error('Unexpected schools response structure:', response.data);
    return [];
  },
  // Lấy chi tiết 1 học sinh theo ID
  async getById(id: number): Promise<Student | null> {
    try {
      const response = await axios.get(`/students/${id}`) as { errCode: number; message: string; data: Student }
      if (response.errCode === 0) {
        return response.data
      }
      return null
    } catch (error: any) {
      console.error('getById error:', error.response?.data || error.message)
      return null
    }
  },


  async create(formData: FormData): Promise<any> {
    try {
      const response = await axios.post('/students', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Không tự động chuyển đổi data
        transformRequest: [(data) => data],
      })
      return response
    } catch (error: any) {
      console.error('Create student error:', error.response?.data || error.message)
      throw error
    }
  },

  // Cập nhật học sinh
  async update(id: number, formData: FormData): Promise<ApiResponse> {
    try {
      const response = await axios.put(`/students/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Tương tự: nếu axios đã unwrap thì response là data, nếu chưa thì lấy response.data
      const result = (response as any).data ?? response;
      console.log('Update API result:', result); // Debug
      return result;
    } catch (error: any) {
      console.error('Update student error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Xóa 1 học sinh
  delete(id: number): Promise<{ errCode: number; message: string }> {
    return axios.delete(`/students/${id}`)
  },

  // Xóa nhiều học sinh (gọi POST /students/delete-multiple)
  deleteMultiple(ids: number[]): Promise<{ errCode: number; message: string }> {
    return axios.post('/students/delete-multiple', { ids })
  },



  // Thêm phụ huynh cho học sinh
  addParents(studentId: number, parentIds: number[]): Promise<{ success: boolean; message?: string }> {
    return axios.post(`/students/${studentId}/parents`, { parentIds })
  },

  // Xóa phụ huynh của học sinh
  removeParent(studentId: number, parentId: number): Promise<{ success: boolean; message?: string }> {
    return axios.delete(`/students/${studentId}/parents/${parentId}`)
  },

  // Xuất danh sách học sinh ra file Excel
  exportExcel(filters?: StudentFilterParams): Promise<Blob> {
    return axios.get('/students/export', {
      params: {
        name: filters?.search,
        grade: filters?.grade,
        schoolName: filters?.schoolName,
        gender: filters?.gender !== undefined ? (filters.gender ? 'true' : 'false') : undefined
      },
      responseType: 'blob'
    })
  },

  // Import danh sách học sinh từ file Excel
  importExcel(file: File): Promise<{ success: boolean; importedCount: number; message?: string }> {
    const formData = new FormData()
    formData.append('file', file)
    return axios.post('/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  updateAvatar: (id: number, formData: FormData): Promise<ApiResponse> => {
    return axios.post(`/students/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data);
  },

}


export const buildStudentFormData = (
  data: {
    id?: number;
    fullName: string;
    phoneNumber: string;
    gender: boolean;
    status: boolean;
    dateOfBirth: string;
    grade: string;
    schoolName: string;
    address: { details: string; ward: string; province: string };
    parents: ParentContact[];
  },
  file?: File
): FormData => {
  const formData = new FormData();
  formData.append('fullName', data.fullName.trim());
  formData.append('phoneNumber', data.phoneNumber.trim());
  formData.append('gender', data.gender ? 'true' : 'false');
  formData.append('status', data.status ? 'true' : 'false');
  formData.append('dateOfBirth', data.dateOfBirth);
  formData.append('grade', data.grade);
  formData.append('schoolName', data.schoolName.trim());
  formData.append('roleId', 'R2');
  formData.append('password', '123456'); // default

  formData.append('address.details', data.address.details);
  formData.append('address.ward', data.address.ward);
  formData.append('address.province', data.address.province);

  data.parents.forEach((parent, idx) => {
    formData.append(`parents[${idx}].fullName`, parent.fullName);
    formData.append(`parents[${idx}].phoneNumber`, parent.phoneNumber);
    formData.append(`parents[${idx}].relationship`, parent.relationship);
  });

  if (file) {
    formData.append('file', file);
  }

  return formData;
};