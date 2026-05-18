// src/app/pages/admin/teachers/TeacherDetailPage.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  Verified,
  School,
  Users,
  CheckCircle,
  Download,
  FileText,
  GraduationCap,
  Sparkles,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { teacherApi, buildTeacherFormData } from '../../../utils/api/teacher.api';
import type { Teacher } from '../../../utils/types/teacher';
import EditTeacherModal from '../../../components/adminComponents/teachers/EditTeacherModal';

// Helper to get full address
const getFullAddress = (teacher: Teacher): string => {
  if (!teacher.address) return 'Chưa cập nhật';
  const parts = [teacher.address.details, teacher.address.ward, teacher.address.province].filter(Boolean);
  return parts.join(', ') || 'Chưa cập nhật';
};

// Helper to get full image URL using Vite environment variables
const getFullImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_BACKEND_URL_IMAGE || import.meta.env.VITE_BACKEND_URL || '';
  const cleanBaseUrl = baseUrl.replace(/\/v1\/api$/, '');
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${cleanBaseUrl}${path}`;
};

export function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setAlert } = useOutletContext<any>();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchTeacher = async () => {
    try {
      setLoading(true);
      const response = await teacherApi.getAll(1, 1000);
      if (response.success && response.data) {
        const found = response.data.find(t => t.id === Number(id));
        if (found) {
          setTeacher(found);
        } else {
          setError('Không tìm thấy giáo viên');
        }
      } else {
        setError('Không thể tải dữ liệu');
      }
    } catch (err) {
      console.error('Fetch teacher error:', err);
      setError('Đã xảy ra lỗi khi tải thông tin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTeacher();
    }
  }, [id]);

  const handleBack = () => navigate(-1);
  const handleEdit = () => setIsEditModalOpen(true);

  const handleSaveTeacher = async (updatedTeacher: any, file?: File) => {
    const formData = buildTeacherFormData(updatedTeacher, file);
    try {
      const response = await teacherApi.update(updatedTeacher.id, formData);
      if (response.errCode === 0) {
        setAlert?.({ type: 'success', message: response.message || 'Cập nhật giáo viên thành công' });
        setIsEditModalOpen(false);
        await fetchTeacher(); // refresh data
      } else {
        setAlert?.({ type: 'error', message: response.message || 'Cập nhật thất bại' });
      }
    } catch (error: any) {
      setAlert?.({ type: 'error', message: error.response?.data?.message || 'Cập nhật thất bại' });
    }
  };

  const handleDeleteTeacher = async (teacherId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giáo viên này?')) {
      try {
        const response = await teacherApi.delete(teacherId);
        setAlert?.({ type: 'success', message: response.message || 'Xóa giáo viên thành công' });
        navigate('/admin/teachers');
      } catch (error: any) {
        setAlert?.({ type: 'error', message: error.response?.data?.message || 'Xóa thất bại' });
      }
    }
  };

  const handleDownload = (doc: any) => console.log('Download:', doc.name);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4b41e1]" />
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-[#4b41e1] mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{error || 'Không tìm thấy giáo viên'}</h2>
        <button
          onClick={handleBack}
          className="px-6 py-3 bg-[#4b41e1] text-white rounded-xl font-semibold hover:bg-[#3a32b0] transition-colors"
        >
          Quay lại
        </button>
      </div>
    );
  }

  // Additional display fields
  const teacherId = `GV-${teacher.id}`;
  const department = teacher.specialty ? `Khoa ${teacher.specialty}` : 'Chưa phân khoa';
  const statusText = teacher.status ? 'Đang hoạt động' : 'Tạm nghỉ';
  const statusColor = teacher.status ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200';
  const statusDot = teacher.status ? 'bg-emerald-500' : 'bg-amber-500';
  const genderText = teacher.gender ? 'Nam' : 'Nữ';
  const dateOfBirth = teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật';
  const experience = 'Chưa cập nhật';
  const qualifications = 'Chưa cập nhật';
  const specialization = teacher.specialty || 'Chưa cập nhật';
  const classes: string[] = [];
  const skills: string[] = [teacher.specialty].filter(Boolean);
  const documents: any[] = [];
  const totalClasses = 0;
  const totalStudents = 0;
  const attendanceRate = 0;

  const fullImageUrl = getFullImageUrl(teacher.image);

  return (
    <>
      <div className="min-h-screen bg-[#f7f9fb]">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-[#4b41e1] hover:text-[#3a32b0] transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Quay lại</span>
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-6 py-2.5 btn-gradient from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <Edit className="w-4 h-4" />
                  <span>Chỉnh sửa</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Chi tiết giáo viên</h1>
            <p className="text-gray-500 text-lg mt-1">Thông tin đầy đủ và hồ sơ giảng dạy</p>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm border border-slate-100">
                <div className="relative group">
                  <div className="h-32 w-32 rounded-2xl overflow-hidden ring-4 ring-purple-100 group-hover:ring-[#4b41e1] transition-all">
                    {fullImageUrl ? (
                      <img
                        src={fullImageUrl}
                        alt={teacher.fullName}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : null}
                    {(!fullImageUrl || imageError) && (
                      <div className="w-full h-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                        {teacher.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-md">
                    <Verified className="w-5 h-5 text-[#4b41e1] fill-current" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                    <h2 className="text-3xl font-bold text-gray-800">{teacher.fullName}</h2>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
                      <span className={`w-2 h-2 rounded-full ${statusDot}`} />
                      {statusText}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#4b41e1]" />
                      <span>{teacher.email}</span>
                    </div>
                    {teacher.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#4b41e1]" />
                        <span>{teacher.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#4b41e1] rounded-full" />
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Mã giáo viên</p>
                    <p className="text-lg font-semibold text-gray-800">{teacherId}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Giới tính</p>
                    <p className="text-lg font-semibold text-gray-800">{genderText}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ngày sinh</p>
                    <p className="text-lg font-semibold text-gray-800">{dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Khoa</p>
                    <p className="text-lg font-semibold text-gray-800">{department}</p>
                  </div>
                  <div className="col-span-full">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Địa chỉ</p>
                    <p className="text-lg font-semibold text-gray-800">{getFullAddress(teacher)}</p>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#4b41e1] rounded-full" />
                  Thông tin chuyên môn
                </h3>
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Kinh nghiệm</p>
                        <p className="text-lg font-semibold">{experience}</p>
                      </div>
                      <span className="text-sm font-bold text-[#4b41e1]">Chưa xác định</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: '0%' }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-[#f7f9fb] rounded-xl border border-slate-200">
                      <GraduationCap className="w-6 h-6 text-[#4b41e1] mb-3" />
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Trình độ học vấn</p>
                      <p className="font-semibold">{qualifications}</p>
                    </div>
                    <div className="p-5 bg-[#f7f9fb] rounded-xl border border-slate-200">
                      <Sparkles className="w-6 h-6 text-[#4b41e1] mb-3" />
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Chuyên ngành</p>
                      <p className="font-semibold">{specialization}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Lớp đang giảng dạy</p>
                    <div className="flex flex-wrap gap-2">
                      {classes.length === 0 && <span className="text-gray-500 text-sm">Chưa có lớp</span>}
                      {classes.map((cls, idx) => (
                        <div key={idx} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-semibold flex items-center gap-2 border border-purple-200">
                          <Users className="w-4 h-4" />
                          {cls}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#4b41e1] rounded-full" />
                  Kỹ năng & Phân loại
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <span key={idx} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                  {skills.length === 0 && <span className="text-gray-500 text-sm">Chưa có kỹ năng</span>}
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#4b41e1] rounded-full" />
                  Tài liệu đính kèm
                </h3>
                {documents.length === 0 ? (
                  <p className="text-gray-500 text-sm">Chưa có tài liệu nào</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-[#f7f9fb] rounded-xl group hover:bg-purple-50 cursor-pointer" onClick={() => handleDownload(doc)}>
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-lg shadow-sm text-[#4b41e1] group-hover:bg-[#4b41e1] group-hover:text-white transition-colors">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{doc.name}</p>
                            <p className="text-xs text-gray-400">{doc.size}</p>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Quick Summary Card */}
              <div className="bg-purple-600 from-purple-600 to-indigo-600 text-white rounded-3xl p-8 shadow-xl shadow-purple-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Users className="w-32 h-32" />
                </div>
                <h3 className="text-lg font-bold mb-6 relative z-10">Tóm tắt hoạt động</h3>
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center justify-between border-b border-white/20 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-xl">
                        <School className="w-5 h-5" />
                      </div>
                      <span className="font-medium">Tổng số lớp</span>
                    </div>
                    <span className="text-2xl font-black">{totalClasses}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/20 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-xl">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="font-medium">Tổng học sinh</span>
                    </div>
                    <span className="text-2xl font-black">{totalStudents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-xl">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <span className="font-medium">Tỉ lệ chuyên cần</span>
                    </div>
                    <span className="text-2xl font-black">{attendanceRate}%</span>
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-[#4b41e1] rounded-full" />
                  Hoạt động gần đây
                </h3>
                <div className="space-y-4">
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-1.5 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-purple-600 rounded-full" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Chưa có hoạt động</p>
                      <p className="text-xs text-gray-400 mt-0.5">--</p>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-4 py-2 text-sm font-semibold text-[#4b41e1] hover:bg-purple-50 rounded-lg transition-colors">
                  Xem toàn bộ lịch sử
                </button>
              </div>

              {/* Help & Support */}
              <div className="bg-[#f7f9fb] rounded-2xl p-6 border border-dashed border-slate-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <HelpCircle className="w-5 h-5 text-[#4b41e1]" />
                  </div>
                  <div>
                    <p className="font-bold">Cần hỗ trợ?</p>
                    <p className="text-xs text-gray-500">Liên hệ bộ phận quản lý nhân sự</p>
                  </div>
                </div>
                <button className="w-full py-2.5 bg-white border border-slate-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-all">
                  Gửi yêu cầu hỗ trợ
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Teacher Modal */}
      <EditTeacherModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        teacher={teacher}
        onSave={handleSaveTeacher}
        onDelete={handleDeleteTeacher}
      />
    </>
  );
}