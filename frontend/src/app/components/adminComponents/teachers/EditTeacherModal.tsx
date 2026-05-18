// src/app/components/adminComponents/teachers/EditTeacherModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Save, Edit, User, Mail, Phone, Home } from 'lucide-react';
import type { Teacher } from '../../../utils/types/teacher';

interface EditTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  onSave: (teacher: Teacher, file?: File) => void;
  onDelete: (teacherId: number) => void;
}

// Helper to get full image URL using Vite environment variables
const getFullImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_BACKEND_URL_IMAGE || import.meta.env.VITE_BACKEND_URL || '';
  // Remove trailing /v1/api if present (since image paths are under /uploads)
  const cleanBaseUrl = baseUrl.replace(/\/v1\/api$/, '');
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${cleanBaseUrl}${path}`;
};

const EditTeacherModal: React.FC<EditTeacherModalProps> = ({
  isOpen,
  onClose,
  teacher,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: true,
    dateOfBirth: '',
    specialty: '',
    status: true,
    addressDetails: '',
    addressWard: '',
    addressProvince: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (teacher) {
      setFormData({
        fullName: teacher.fullName || '',
        email: teacher.email || '',
        phoneNumber: teacher.phoneNumber || '',
        gender: teacher.gender === true,
        dateOfBirth: teacher.dateOfBirth?.split('T')[0] || '',
        specialty: teacher.specialty || '',
        status: teacher.status === true,
        addressDetails: teacher.address?.details || '',
        addressWard: teacher.address?.ward || '',
        addressProvince: teacher.address?.province || '',
      });
      // ✅ Convert relative image path to full URL
      setAvatarPreview(getFullImageUrl(teacher.image));
      setAvatarFile(null);
    }
  }, [teacher]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (value: string) => {
    setFormData(prev => ({ ...prev, gender: value === 'male' }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value === 'active' }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    try {
      if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.specialty) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }
      if (!teacher) return;

      const updatedTeacher: Teacher = {
        ...teacher,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        specialty: formData.specialty,
        status: formData.status,
        address: {
          id: teacher.address?.id || 0,
          details: formData.addressDetails,
          ward: formData.addressWard,
          province: formData.addressProvince,
        },
      };
      onSave(updatedTeacher, avatarFile || undefined);
    } catch (err) {
      console.error('Save error:', err);
      alert('Có lỗi xảy ra khi lưu thông tin');
    }
  };

  const handleDelete = () => {
    try {
      if (window.confirm('Bạn có chắc chắn muốn xóa giáo viên này?')) {
        if (teacher) onDelete(teacher.id);
        onClose();
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Có lỗi xảy ra khi xóa giáo viên');
    }
  };

  if (!isOpen || !teacher) return null;

  const fullAddress = [formData.addressDetails, formData.addressWard, formData.addressProvince]
    .filter(Boolean)
    .join(', ') || 'Chưa nhập';

  // For initials fallback when no image
  const initials = formData.fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Left Column: Form Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-4 bg-white">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Edit className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Chỉnh sửa giáo viên</h1>
              <p className="text-sm text-slate-500">Cập nhật thông tin và hồ sơ giảng dạy</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
            {/* Thông tin cá nhân */}
            <section className="space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-indigo-600 rounded-full" />
                <h2 className="text-lg font-bold text-slate-800">Thông tin cá nhân</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Họ và tên *</label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500/20"
                    type="text"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Email *</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    type="email"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Số điện thoại *</label>
                  <input
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    type="tel"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Giới tính</label>
                  <select
                    value={formData.gender ? 'male' : 'female'}
                    onChange={(e) => handleGenderChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Ngày sinh</label>
                  <input
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    type="date"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Ảnh đại diện</label>
                <div className="flex items-center gap-4">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
                      onError={(e) => {
                        // If image fails to load, fallback to initials
                        e.currentTarget.style.display = 'none';
                        // We'll show the initials fallback via the condition below
                      }}
                    />
                  ) : null}
                  {!avatarPreview && (
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-slate-200">
                      <User className="w-6 h-6" />
                    </div>
                  )}
                  <label className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Thay đổi ảnh
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
              </div>
            </section>

            {/* Địa chỉ */}
            <section className="space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-indigo-600 rounded-full" />
                <h2 className="text-lg font-bold text-slate-800">Địa chỉ</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Số nhà, đường</label>
                  <input
                    name="addressDetails"
                    value={formData.addressDetails}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    placeholder="123 Đường Lê Lợi"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Phường/Xã</label>
                  <input
                    name="addressWard"
                    value={formData.addressWard}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    placeholder="Phường Bến Nghé"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Tỉnh/Thành phố</label>
                  <input
                    name="addressProvince"
                    value={formData.addressProvince}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    placeholder="TP Hồ Chí Minh"
                  />
                </div>
              </div>
            </section>

            {/* Chuyên môn */}
            <section className="space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-indigo-600 rounded-full" />
                <h2 className="text-lg font-bold text-slate-800">Thông tin chuyên môn</h2>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Môn học chính *</label>
                <select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  required
                >
                  <option value="">Chọn môn học</option>
                  <option>Toán học</option>
                  <option>Vật lý</option>
                  <option>Hóa học</option>
                  <option>Ngữ văn</option>
                  <option>Lịch sử</option>
                  <option>Địa lý</option>
                  <option>Tiếng Anh</option>
                  <option>Tin học</option>
                </select>
              </div>
            </section>

            {/* Trạng thái */}
            <section className="space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-indigo-600 rounded-full" />
                <h2 className="text-lg font-bold text-slate-800">Trạng thái hoạt động</h2>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.status === true}
                    onChange={() => handleStatusChange('active')}
                    className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Đang hoạt động</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.status === false}
                    onChange={() => handleStatusChange('inactive')}
                    className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Tạm nghỉ</span>
                </label>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <div className="flex gap-3 w-full sm:w-auto">
              <button onClick={handleDelete} className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
                Xóa giáo viên
              </button>
              <button onClick={onClose} className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
                Hủy
              </button>
            </div>
            <button onClick={handleSave} className="w-full sm:w-auto px-8 py-3 rounded-xl btn-gradient from-indigo-600 to-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              Lưu thay đổi
            </button>
          </div>
        </div>

        {/* Right Sidebar Preview */}
        <div className="hidden lg:flex w-80 bg-slate-50 flex-col items-center p-6 text-center space-y-6 border-l border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Xem trước hồ sơ</h3>
          <div className="space-y-5 flex flex-col items-center w-full">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={formData.fullName}
                  className="w-28 h-28 rounded-2xl object-cover shadow-xl border-4 border-white"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    // fallback will show the initials div via condition
                  }}
                />
              ) : null}
              {!avatarPreview && (
                <div className="w-28 h-28 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400 shadow-xl border-4 border-white">
                  <User className="w-10 h-10" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">{formData.fullName || 'Chưa nhập'}</h2>
              <p className="text-xs text-indigo-600 font-semibold mt-1">{formData.specialty || 'Chưa có chuyên môn'}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${formData.status ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {formData.status ? 'Đang hoạt động' : 'Tạm nghỉ'}
            </span>
            <div className="w-full space-y-3 pt-3">
              <div className="bg-white p-3 rounded-xl text-left flex items-center gap-3 shadow-sm border">
                <Mail className="w-4 h-4 text-indigo-500" />
                <div><p className="text-[10px] uppercase font-bold text-slate-400">Email</p><p className="text-sm font-bold text-slate-700">{formData.email || 'Chưa nhập'}</p></div>
              </div>
              <div className="bg-white p-3 rounded-xl text-left flex items-center gap-3 shadow-sm border">
                <Phone className="w-4 h-4 text-orange-500" />
                <div><p className="text-[10px] uppercase font-bold text-slate-400">Điện thoại</p><p className="text-sm font-bold text-slate-700">{formData.phoneNumber || 'Chưa nhập'}</p></div>
              </div>
              <div className="bg-white p-3 rounded-xl text-left flex items-center gap-3 shadow-sm border">
                <Home className="w-4 h-4 text-blue-500" />
                <div><p className="text-[10px] uppercase font-bold text-slate-400">Địa chỉ</p><p className="text-sm font-bold text-slate-700">{fullAddress}</p></div>
              </div>
            </div>
          </div>
          <div className="mt-auto pt-6">
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <p className="text-xs text-indigo-700 leading-relaxed italic">"Tất cả thông tin được cập nhật sẽ hiển thị ngay lập tức trong danh sách và thời khóa biểu của hệ thống."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTeacherModal;