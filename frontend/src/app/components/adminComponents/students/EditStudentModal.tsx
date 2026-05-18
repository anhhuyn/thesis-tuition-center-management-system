// src/app/components/students/EditStudentModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { ParentContact, Student } from '../../../utils/types/student';
import { buildStudentFormData, studentApi } from '../../../utils/api/student.api';
interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSave: (formData: FormData) => void;
  onDelete: (studentId: number) => void;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  onSave,
  onDelete
}) => {
  // State cho form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState<boolean>(true);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [grade, setGrade] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [address, setAddress] = useState({ details: '', ward: '', province: '' });
  const [guardians, setGuardians] = useState<ParentContact[]>([]);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<boolean>(true); // 1: active, 0: inactive

  const getFullImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_BACKEND_URL_IMAGE || import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
  const cleanBaseUrl = baseUrl.replace(/\/v1\/api$/, '');
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${cleanBaseUrl}${path}`;
};
  // Pre-fill khi student thay đổi
   useEffect(() => {
    if (student) {
      console.log("STUDENT:", student);
      console.log("STATUS FROM API:", student.status);
      setFullName(student.fullName);
      setEmail(student.email);
      setPhoneNumber(student.phoneNumber);
      setGender(student.gender);
      setDateOfBirth(student.dateOfBirth?.split('T')[0] || '');
      setGrade(student.grade);
      setSchoolName(student.schoolName);
      setStatus(student.status ?? true);
      setAddress({
        details: student.address?.details || '',
        ward: student.address?.ward || '',
        province: student.address?.province || ''
      });
      setGuardians(student.parents?.map(p => ({
        fullName: p.fullName,
        phoneNumber: p.phoneNumber,
        relationship: p.relationship
      })) || [{ fullName: '', phoneNumber: '', relationship: 'Mẹ' }]);
      setPreviewPhoto(getFullImageUrl(student.image));
      setPhotoFile(null);
    }
  }, [student]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case 'fullName':
        setFullName(value);
        break;
      case 'phoneNumber':
        setPhoneNumber(value);
        break;
      case 'gender':
        setGender(value === 'true');
        break;
      case 'dateOfBirth':
        setDateOfBirth(value);
        break;
      case 'grade':
        setGrade(value);
        break;
      case 'schoolName':
        setSchoolName(value);
        break;
      case 'status':
        setStatus(value === 'true');
        break;
      case 'addressDetails':
        setAddress(prev => ({ ...prev, details: value }));
        break;
      case 'addressWard':
        setAddress(prev => ({ ...prev, ward: value }));
        break;
      case 'addressProvince':
        setAddress(prev => ({ ...prev, province: value }));
        break;
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGuardianChange = (index: number, field: keyof ParentContact, value: string) => {
    setGuardians(prev => prev.map((g, i) => i === index ? { ...g, [field]: value } : g));
  };

  const handleAddGuardian = () => {
    setGuardians(prev => [...prev, { fullName: '', phoneNumber: '', relationship: 'Mẹ' }]);
  };

  const handleRemoveGuardian = (index: number) => {
    if (guardians.length > 1) {
      setGuardians(prev => prev.filter((_, i) => i !== index));
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!fullName || !phoneNumber || !grade) {
    alert('Vui lòng điền đầy đủ thông tin bắt buộc');
    return;
  }

  setIsSubmitting(true);
  
  const studentData = {
    id: student?.id,
    fullName: fullName.trim(),
    phoneNumber: phoneNumber.trim(),
    gender,
    status,
    dateOfBirth,
    grade,
    schoolName: schoolName.trim(),
    address: {
      details: address.details,
      ward: address.ward,
      province: address.province,
    },
    parents: guardians.filter(g => g.fullName && g.phoneNumber),
  };
  
  const formData = buildStudentFormData(studentData, photoFile || undefined);
  
  await onSave(formData);
  if (photoFile) {
    try {
      const avatarFormData = new FormData();
      avatarFormData.append('file', photoFile);
      const response = await studentApi.updateAvatar(student!.id, avatarFormData);
      if (response.errCode !== 0) {
        console.warn('Upload avatar failed:', response.message);
        // Có thể hiển thị thông báo phụ, nhưng không ảnh hưởng đến cập nhật chính
      } else {
        // Cập nhật lại preview (optional)
        const reader = new FileReader();
        reader.onloadend = () => setPreviewPhoto(reader.result as string);
        reader.readAsDataURL(photoFile);
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
    }
  }
  setIsSubmitting(false);
};

  const handleDelete = () => {
    if (student && window.confirm('Bạn có chắc muốn xóa học sinh này?')) {
      onDelete(student.id);
    }
  };

  if (!isOpen || !student) return null;

  // Helper hiển thị
  const fullAddress = [address.details, address.ward, address.province].filter(Boolean).join(', ') || 'Chưa nhập';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="modal-container w-full max-w-[1100px] h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <header className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Chỉnh sửa học sinh</h1>
            <p className="text-sm text-gray-500 mt-0.5">Cập nhật thông tin học sinh</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-hidden flex flex-row">
          {/* Form */}
          <main className="flex-1 overflow-y-auto px-8 py-6 space-y-10">
            <form onSubmit={handleSubmit}>
              <section className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    {previewPhoto ? (
                      <img src={previewPhoto} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <button type="button" onClick={() => fileInputRef.current?.click()} 
                      className="bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
                      Đổi ảnh
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/jpeg,image/png,image/gif" className="hidden" />
                    <p className="text-xs text-gray-400 mt-2">JPG, PNG hoặc GIF. Tối đa 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Họ và tên</label>
                    <input type="text" name="fullName" value={fullName} onChange={handleInputChange} 
                      className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2" required />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Email</label>
                    <input type="email" value={email} disabled 
                      className="w-full border border-gray-100 bg-gray-50 text-gray-500 rounded-lg text-sm px-3 py-2 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Số điện thoại</label>
                    <input type="tel" name="phoneNumber" value={phoneNumber} onChange={handleInputChange} 
                      className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Giới tính</label>
                    <select name="gender" value={gender ? 'true' : 'false'} onChange={handleInputChange} 
                      className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2">
                      <option value="true">Nam</option>
                      <option value="false">Nữ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Ngày sinh</label>
                    <input type="date" name="dateOfBirth" value={dateOfBirth} onChange={handleInputChange} 
                      className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Lớp</label>
                    <select name="grade" value={grade} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2" required>
                      <option value="">Chọn lớp</option>
                      {[6,7,8,9,10,11,12].map(g => <option key={g} value={g}>Lớp {g}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Tên trường</label>
                    <input type="text" name="schoolName" value={schoolName} onChange={handleInputChange} 
                      className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2" required />
                  </div>
                  <div className="col-span-2 grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Số nhà, đường</label>
                      <input type="text" name="addressDetails" value={address.details} onChange={handleInputChange} 
                        placeholder="123 Đường Lê Lợi" className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Phường/Xã</label>
                      <input type="text" name="addressWard" value={address.ward} onChange={handleInputChange} 
                        placeholder="Phường Bến Nghé" className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Tỉnh/Thành phố</label>
                      <input type="text" name="addressProvince" value={address.province} onChange={handleInputChange} 
                        placeholder="TP Hồ Chí Minh" className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2" />
                    </div>
                  </div>
                </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Trạng thái
                    </label>
                    <select
                      name="status"
                     value={status ? 'true' : 'false'} onChange={handleInputChange} 
                      className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2"
                    >
                      <option value="true">Đang hoạt động</option>
                      <option value="false">Ngưng hoạt động</option>
                    </select>
                  </div>
              </section>

              <hr className="border-gray-100 my-6" />

              <section className="space-y-5">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">Thông tin phụ huynh</h2>
                  <button type="button" onClick={handleAddGuardian} className="text-purple-500 text-xs font-bold">+ Thêm phụ huynh</button>
                </div>
                {guardians.map((g, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 gap-x-6 gap-y-4 relative">
                    {guardians.length > 1 && (
                      <button type="button" onClick={() => handleRemoveGuardian(idx)} 
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full w-5 h-5 text-xs">×</button>
                    )}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Họ tên</label>
                      <input type="text" value={g.fullName} onChange={e => handleGuardianChange(idx, 'fullName', e.target.value)} 
                        className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Số điện thoại</label>
                      <input type="tel" value={g.phoneNumber} onChange={e => handleGuardianChange(idx, 'phoneNumber', e.target.value)} 
                        className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Mối quan hệ</label>
                      <select value={g.relationship} onChange={e => handleGuardianChange(idx, 'relationship', e.target.value)} 
                        className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 bg-white">
                        <option value="Ba">Ba</option><option value="Mẹ">Mẹ</option><option value="Anh">Anh</option>
                        <option value="Chị">Chị</option><option value="Ông">Ông</option><option value="Bà">Bà</option>
                        <option value="Người giám hộ">Người giám hộ</option>
                      </select>
                    </div>
                  </div>
                ))}
              </section>
            </form>
          </main>

          {/* Preview Sidebar (giống AddStudentModal) */}
          <aside className="w-[340px] bg-gray-50 border-l border-gray-100 p-6 space-y-6 hidden md:block overflow-y-auto">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Xem trước hồ sơ</h3>
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
                <div className="px-4 pb-4 -mt-12 text-center">
                  <div className="inline-block w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-lg bg-gray-200 mb-3">
                    {previewPhoto ? <img src={previewPhoto} alt="Preview" className="w-full h-full object-cover" /> :
                      <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-600 text-3xl font-bold">
                        {fullName.charAt(0) || '?'}
                      </div>
                    }
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">{fullName || 'Chưa nhập'}</h4>
                  <p className="text-xs text-gray-500">{grade ? `Lớp ${grade}` : 'Chưa chọn lớp'}</p>
                </div>
                <div className="border-t divide-y">
                  <div className="px-4 py-3 flex justify-between"><span className="text-xs text-gray-500">Email</span><span className="text-xs font-medium">{email || 'Chưa nhập'}</span></div>
                  <div className="px-4 py-3 flex justify-between"><span className="text-xs text-gray-500">Điện thoại</span><span className="text-xs font-medium">{phoneNumber || 'Chưa nhập'}</span></div>
                  <div className="px-4 py-3 flex justify-between"><span className="text-xs text-gray-500">Ngày sinh</span><span className="text-xs font-medium">{dateOfBirth ? new Date(dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa nhập'}</span></div>
                  <div className="px-4 py-3 flex justify-between"><span className="text-xs text-gray-500">Trường</span><span className="text-xs font-medium truncate max-w-[180px]">{schoolName || 'Chưa nhập'}</span></div>
                  <div className="px-4 py-3 flex justify-between"><span className="text-xs text-gray-500">Địa chỉ</span><span className="text-xs font-medium truncate max-w-[180px] text-right">{fullAddress}</span></div>
                </div>
              </div>
            </div>
            {guardians.some(g => g.fullName) && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Phụ huynh</h3>
                {guardians.map((g, idx) => g.fullName && (
                  <div key={idx} className="bg-white rounded-lg border p-3 mb-2">
                    <p className="text-sm font-semibold">{g.fullName}</p>
                    <p className="text-xs text-gray-500">{g.relationship} - {g.phoneNumber}</p>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>

        {/* Footer */}
        <footer className="px-8 py-5 border-t border-gray-100 bg-white flex items-center justify-between">
          <button type="button" onClick={handleDelete} className="text-sm font-bold text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg">
            Xóa học sinh
          </button>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-lg">Hủy</button>
            <button type="submit" onClick={handleSubmit} disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-md disabled:opacity-50">
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default EditStudentModal;