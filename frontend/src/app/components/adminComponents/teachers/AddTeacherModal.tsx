// src/app/components/adminComponents/teachers/AddTeacherModal.tsx
'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  UserPlus,
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  BookOpen,
  FileText,
  Info,
  Upload,
  Home,
} from 'lucide-react';

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

const AddTeacherModal: React.FC<AddTeacherModalProps> = ({ isOpen, onClose, onSubmit }) => {
  // Chỉ giữ các trường có trong database
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'male',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    specialty: '',
    status: 'active',
    addressDetails: '',
    addressWard: '',
    addressProvince: '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview state
  const [previewName, setPreviewName] = useState('');
  const [previewSubject, setPreviewSubject] = useState('');
  const [previewStatus, setPreviewStatus] = useState<'active' | 'inactive'>('active');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'fullName') setPreviewName(value);
    if (name === 'specialty') setPreviewSubject(value);
    if (name === 'status') setPreviewStatus(value as 'active' | 'inactive');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.specialty) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc: Họ tên, Email, Số điện thoại, Môn học chính');
      return;
    }

    const payload = {
      email: formData.email,
      password: '123456',
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      gender: formData.gender === 'male',
      roleId: 'R1',
      dateOfBirth: formData.dateOfBirth,
      specialty: formData.specialty,
      status: formData.status === 'active',
      address: {
        details: formData.addressDetails,
        ward: formData.addressWard,
        province: formData.addressProvince,
      },
      file: avatarFile,
    };

    onSubmit?.(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[1000px] max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-8 py-6 flex justify-between items-center border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Thêm giáo viên mới</h1>
              <p className="text-gray-500 text-sm">Nhập thông tin để tạo hồ sơ giáo viên</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-10">
          {/* Form bên trái */}
          <form onSubmit={handleSubmit} className="md:col-span-7 p-8 space-y-8">
            {/* Thông tin cá nhân */}
            <section className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                Thông tin cá nhân
              </h2>

              <div className="flex items-start gap-6">
                {/* Avatar upload */}
                <div className="shrink-0 flex flex-col items-center gap-2">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-gray-400">
                          <Upload className="w-6 h-6" />
                          <span className="text-[10px] mt-1">Tải ảnh</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/jpeg,image/png,image/gif"
                      className="hidden"
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ảnh đại diện</span>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-600">Họ và tên *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-600">Giới tính</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/20"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-600">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3"
                      placeholder="example@school.edu.vn"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-600">Số điện thoại *</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3"
                      placeholder="090 123 4567"
                      required
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-600">Ngày sinh</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Địa chỉ */}
            <section className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Home className="w-5 h-5 text-purple-600" />
                Địa chỉ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-600">Số nhà, đường</label>
                  <input
                    type="text"
                    name="addressDetails"
                    value={formData.addressDetails}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3"
                    placeholder="123 Đường Lê Lợi"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-600">Phường/Xã</label>
                  <input
                    type="text"
                    name="addressWard"
                    value={formData.addressWard}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3"
                    placeholder="Phường Bến Nghé"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-600">Tỉnh/Thành phố</label>
                  <input
                    type="text"
                    name="addressProvince"
                    value={formData.addressProvince}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3"
                    placeholder="TP Hồ Chí Minh"
                  />
                </div>
              </div>
            </section>

            {/* Chuyên môn */}
            <section className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                Thông tin chuyên môn
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-600">Môn học chính *</label>
                  <select
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3"
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
              </div>
            </section>

            {/* Trạng thái */}
            <section className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Trạng thái
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="relative flex items-center p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-purple-600"
                  />
                  <div className="ml-4">
                    <span className="block font-bold text-gray-900">Đang hoạt động</span>
                    <span className="text-xs text-gray-500">Có thể phân lịch giảng dạy</span>
                  </div>
                </label>
                <label className="relative flex items-center p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={formData.status === 'inactive'}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-purple-600"
                  />
                  <div className="ml-4">
                    <span className="block font-bold text-gray-900">Tạm nghỉ</span>
                    <span className="text-xs text-gray-500">Không xuất hiện trong phân lịch</span>
                  </div>
                </label>
              </div>
            </section>
          </form>

          {/* Preview bên phải */}
          <aside className="md:col-span-3 bg-gray-50 p-8 border-l border-gray-200 overflow-y-auto">
            <div className="sticky top-0 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-32 h-32 rounded-3xl bg-white shadow-xl p-1 overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">{previewName || 'Chưa nhập'}</h3>
                </div>
                <div className={`px-4 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 ${previewStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${previewStatus === 'active' ? 'bg-green-500' : 'bg-amber-500'}`} />
                  {previewStatus === 'active' ? 'Đang hoạt động' : 'Tạm nghỉ'}
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-purple-600 shadow-sm">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Môn học</p>
                    <p className="text-sm font-semibold text-gray-900">{previewSubject || 'Chưa chọn'}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <p className="text-xs text-purple-700 font-medium flex items-start gap-2">
                  <Info className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  Thông tin sẽ được đồng bộ vào hệ thống sau khi xác nhận.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="px-8 py-6 bg-white border-t border-gray-200 flex justify-between items-center">
          <button onClick={onClose} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-all">
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/20 hover:scale-105 transition-all"
          >
            <UserPlus className="w-5 h-5" />
            Thêm giáo viên
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AddTeacherModal;