// src/app/pages/StudentDetail.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StudentProfileHeaderSection } from '../../components/adminComponents/students/StudentProfileHeaderSection';
import { StudentDetailsSection } from '../../components/adminComponents/students/StudentDetailsSection';
import { StudentSidebarSection } from '../../components/adminComponents/students/StudentSidebarSection';
import type { Student } from '../../utils/types/student';
import { studentApi } from '../../utils/api/student.api';

// Helper tạo full URL cho ảnh
const getFullImageUrl = (imagePath: string | null | undefined): string | undefined => {
  if (!imagePath) return undefined;
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_BACKEND_URL_IMAGE || import.meta.env.VITE_BACKEND_URL || '';
  const cleanBaseUrl = baseUrl.replace(/\/v1\/api$/, '');
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${cleanBaseUrl}${path}`;
};

export const StudentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchStudent(parseInt(id));
    }
  }, [id]);

  const fetchStudent = async (studentId: number) => {
    try {
      setLoading(true);
      const data = await studentApi.getById(studentId);
      if (data) {
        setStudent(data);
      } else {
        setError('Không tìm thấy học sinh');
      }
    } catch (err: any) {
      console.error('Fetch student error:', err);
      setError(err.response?.data?.message || 'Lỗi khi tải thông tin học sinh');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/student');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7f8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-[#f6f7f8] flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <p className="text-red-600 mb-4">{error || 'Không có dữ liệu'}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f8]">
      <StudentProfileHeaderSection
        onBack={handleBack}
        studentName={student.fullName}
        studentId={student.id.toString()}
        studentClass={`Lớp ${student.grade}`}
        studentStatus={student.status ? "Đang học" : "Ngưng học"}
        studentAvatar={getFullImageUrl(student.image)}   // 👈 sửa tại đây
        studentEmail={student.email}
        studentPhone={student.phoneNumber}
        enrollmentDate={student.createdAt}
      />
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          <div className="flex-1">
            <StudentDetailsSection student={student} />
          </div>
          <div className="w-[389px] flex-shrink-0">
            {/* Nếu StudentSidebarSection hiển thị ảnh, bạn cũng cần truyền URL đã xử lý hoặc sửa bên trong component đó */}
            <StudentSidebarSection student={student} />
          </div>
        </div>
      </div>
    </div>
  );
}