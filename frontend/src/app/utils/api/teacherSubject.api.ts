import axios from '../axios';
import type { TeacherSubject, TeacherSubjectRequest, TeacherSubjectFilter, ApiResponse } from '../types/teacherSubject';

export const teacherSubjectApi = {

    async getAll(filters?: TeacherSubjectFilter): Promise<TeacherSubject[]> {
        const params: any = {};
        if (filters?.grade) params.grade = filters.grade;
        if (filters?.teacherName) params.teacherName = filters.teacherName;
        if (filters?.subjectName) params.subjectName = filters.subjectName;
        try {
            const response = await axios.get('/teacher-subjects', { params });
            const raw = response.data ?? response;
            const data = raw?.data ?? (Array.isArray(raw) ? raw : []);
            console.log('Fetched data:', data);
            return data;
        } catch (error) {
            console.error('API error:', error);
            return [];
        }
    },

    async getById(id: number): Promise<TeacherSubject> {
        const response = await axios.get(`/teacher-subjects/${id}`);
        console.log('Full response:', response);
        console.log('response.data:', response.data);
        const result = (response.data && response.data.data) ? response.data.data : response.data;
        console.log('Extracted result:', result);
        return result;
    },

    // Tạo mới
    async create(data: TeacherSubjectRequest): Promise<ApiResponse> {
        const response = await axios.post('/teacher-subjects', data);
        // Nếu response.data đã là object { errCode, message } thì dùng, nếu chưa thì lấy response.data
        const result = (response as any).data ?? response;
        console.log('Create result:', result); // Debug xem cấu trúc
        return result;
    },

    // Cập nhật
    async update(id: number, data: Partial<TeacherSubjectRequest>): Promise<ApiResponse> {
        const response = await axios.put(`/teacher-subjects/${id}`, data);
        const result = (response as any).data ?? response;
        console.log('Update result:', result);
        return result;
    },

    // Xóa
    async delete(id: number): Promise<ApiResponse> {
        const response = await axios.delete(`/teacher-subjects/${id}`);
        return response.data;
    },
};