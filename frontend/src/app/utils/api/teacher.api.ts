import axios from '../axios'
import type { Teacher, TeacherBasic, TeacherFilterParams, TeacherIdResponse, TeacherResponse, TeacherStatistics } from '../types/teacher'

interface ApiResponse<T> {
  errCode: number
  message: string
  data: T
}

interface ApiTeacherResponse {
  errCode: number;
  message: string;
  data?: any;
  newId?: number;
}

interface TeacherBasicResponse {
  errCode: number;
  message: string;
  data: TeacherBasic[];
}

interface TeacherListResponse {
  errCode: number;
  message: string;
  data: Teacher[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const teacherApi = {
  async getBasicTeachers(): Promise<TeacherBasic[]> {
    const res: ApiResponse<TeacherBasic[]> = await axios.get('/teachers/basic')
    return res.data
  },

  getStatistics(): Promise<TeacherStatistics> {
    return axios.get('/teachers/statistics')
  },

  async getTeacherIdByUserId(userId: number): Promise<TeacherIdResponse> {
    return axios.get(`/teachers/userId/${userId}`)
  },

  async getBasicList(): Promise<TeacherBasic[]> {
    const response = await axios.get('/teachers/basic') as TeacherBasicResponse;
    return response.errCode === 0 ? response.data : [];
  },

  async getAll(
    page = 1,
    limit = 10,
    filters?: TeacherFilterParams
  ): Promise<TeacherResponse> {
    try {
      const params: any = { page, limit };
      if (filters?.name) params.name = filters.name;
      if (filters?.specialty) params.specialty = filters.specialty;
      if (filters?.gender !== undefined) params.gender = filters.gender ? 'true' : 'false';
      if (filters?.status !== undefined) params.status = filters.status ? 'true' : 'false';
      // alias search -> name
      if (filters?.search) params.name = filters.search;

      const response = await axios.get('/teachers', { params }) as TeacherListResponse;

      return {
        total: response.pagination?.total || 0,
        data: response.data || [],
        success: response.errCode === 0,
        limit: response.pagination?.limit || limit,
        totalPages: response.pagination?.totalPages || 0,
        page: response.pagination?.page || page,
        errCode: response.errCode,
        message: response.message,
      };
    } catch (error: any) {
      console.error('getAll teachers error:', error.response?.data || error.message);
      return {
        total: 0,
        data: [],
        success: false,
        limit,
        totalPages: 0,
        page,
        errCode: error.response?.status || 500,
        message: error.response?.data?.message || 'Failed to fetch teachers',
      };
    }
  },


  async getById(id: number): Promise<Teacher | null> {
    try {
      const response = await this.getAll(1, 1, { name: '' }); 
      const teacher = response.data.find(t => t.id === id);
      return teacher || null;
    } catch (error) {
      console.error('getById teacher error:', error);
      return null;
    }
  },


  async create(formData: FormData): Promise<ApiTeacherResponse> {
    try {
      const response = await axios.post('/teachers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: [(data) => data],
      });
      const result = (response as any).data ?? response;
      console.log('Create API result:', result);
      return result;
    } catch (error: any) {
      console.error('Create teacher error:', error.response?.data || error.message);
      throw error;
    }
  },

  async update(id: number, formData: FormData): Promise<ApiTeacherResponse> {
    try {
      const response = await axios.put(`/teachers/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const result = (response as any).data ?? response;
      console.log('Update API result:', result);
      return result;
    } catch (error: any) {
      console.error('Update teacher error:', error.response?.data || error.message);
      throw error;
    }
  },

  delete(id: number): Promise<{ errCode: number; message: string }> {
    return axios.delete(`/teachers/${id}`).then(res => (res as any).data ?? res);
  },

  deleteMultiple(ids: number[]): Promise<{ errCode: number; message: string }> {
    return axios.post('/teachers/delete-multiple', { ids }).then(res => (res as any).data ?? res);
  },

  exportExcel(filters?: TeacherFilterParams): Promise<Blob> {
    const params: any = {};
    if (filters?.name) params.name = filters.name;
    if (filters?.specialty) params.specialty = filters.specialty;
    if (filters?.gender !== undefined) params.gender = filters.gender ? 'true' : 'false';
    if (filters?.status !== undefined) params.status = filters.status ? 'true' : 'false';
    if (filters?.search) params.name = filters.search;

    return axios.get('/teachers/export', {
      params,
      responseType: 'blob',
    });
  },

  // Thống kê số lượng giáo viên
  async getTeacherStatistics(): Promise<TeacherStatistics> {
    try {
      const response = await axios.get('/teachers/statistics') as any;
      return {
        totalTeachers: response.totalTeachers || 0,
        totalTeachersThisMonth: response.newTeachersThisMonth || 0,
        percentageIncreaseTeacher: response.percentageIncreaseTeacher || 0,
      };
    } catch (error: any) {
      console.error('getStatistics error:', error.response?.data || error.message);
      return {
        totalTeachers: 0,
        totalTeachersThisMonth: 0,
        percentageIncreaseTeacher: 0,
      };
    }
  },
};

export const buildTeacherFormData = (data: any, file?: File): FormData => {
  const formData = new FormData();
  formData.append('email', data.email);
  formData.append('password', data.password || '123456');
  formData.append('fullName', data.fullName);
  formData.append('phoneNumber', data.phoneNumber);
  formData.append('gender', data.gender ? 'true' : 'false');
  formData.append('roleId', 'R1');
  formData.append('dateOfBirth', data.dateOfBirth);

  formData.append('specialty', data.specialty);

  if (data.status !== undefined) {
    formData.append('status', data.status ? 'true' : 'false');
  }

  if (data.address) {
    formData.append('address.details', data.address.details);
    formData.append('address.ward', data.address.ward);
    formData.append('address.province', data.address.province);
  }

  if (file) {
    formData.append('file', file);
  }

  return formData;
};

