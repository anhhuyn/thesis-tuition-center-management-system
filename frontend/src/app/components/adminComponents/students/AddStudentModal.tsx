// src/app/components/students/AddStudentModal.tsx
'use client';

import React, { useState, useRef } from 'react';
import type { CreateStudentRequest, ParentContact } from '../../../utils/types/student';


interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateStudentRequest>({
    email: '',
    fullName: '',
    phoneNumber: '',
    gender: true,
    dateOfBirth: '',
    grade: '',
    schoolName: '',
    roleId: 'R2',
    password: '123456',
    status: true,
    address: {
      details: '',
      ward: '',
      province: ''
    },
    parents: [],
    subjectIds: []
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [guardians, setGuardians] = useState<ParentContact[]>([
    { fullName: '', phoneNumber: '', relationship: 'Mẹ' }
  ]);
  
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [createAnother, setCreateAnother] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ghép họ tên
  React.useEffect(() => {
    const fullName = `${firstName} ${lastName}`.trim();
    setFormData(prev => ({ ...prev, fullName }));
  }, [firstName, lastName]);

  // Đồng bộ guardians vào parents
  React.useEffect(() => {
    const validParents = guardians.filter(g => g.fullName && g.phoneNumber);
    setFormData(prev => ({ ...prev, parents: validParents }));
  }, [guardians]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'gender') {
      setFormData(prev => ({ ...prev, gender: value === 'true' }));
    } else if (name === 'grade') {
      setFormData(prev => ({ ...prev, grade: value }));
    } else if (name === 'schoolName') {
      setFormData(prev => ({ ...prev, schoolName: value }));
    } else if (name === 'email') {
      setFormData(prev => ({ ...prev, email: value }));
    } else if (name === 'phoneNumber') {
      setFormData(prev => ({ ...prev, phoneNumber: value }));
    } else if (name === 'dateOfBirth') {
      setFormData(prev => ({ ...prev, dateOfBirth: value }));
    } else if (name === 'addressDetails') {
      setFormData(prev => ({
        ...prev,
        address: {
          details: value,
          ward: prev.address?.ward ?? '',
          province: prev.address?.province ?? ''
        }
      }));
    } else if (name === 'addressWard') {
      setFormData(prev => ({
        ...prev,
        address: {
          details: prev.address?.details ?? '',
          ward: value,
          province: prev.address?.province ?? ''
        }
      }));
    } else if (name === 'addressProvince') {
      setFormData(prev => ({
        ...prev,
        address: {
          details: prev.address?.details ?? '',
          ward: prev.address?.ward ?? '',
          province: value
        }
      }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGuardianChange = (index: number, field: keyof ParentContact, value: string) => {
    setGuardians(prev => prev.map((g, i) => 
      i === index ? { ...g, [field]: value } : g
    ));
  };

  const handleAddGuardian = () => {
    setGuardians(prev => [
      ...prev,
      { fullName: '', phoneNumber: '', relationship: 'Mẹ' }
    ]);
  };

  const handleRemoveGuardian = (index: number) => {
    if (guardians.length > 1) {
      setGuardians(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.grade) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const submitFormData = new FormData();
    
    submitFormData.append('email', formData.email.trim());
    submitFormData.append('fullName', formData.fullName.trim());
    submitFormData.append('phoneNumber', formData.phoneNumber.trim());
    submitFormData.append('gender', formData.gender ? 'true' : 'false');
    submitFormData.append('dateOfBirth', formData.dateOfBirth);
    submitFormData.append('grade', formData.grade);
    submitFormData.append('schoolName', formData.schoolName.trim());
    submitFormData.append('roleId', 'R2');
    submitFormData.append('status', formData.status ? 'true' : 'false');
    submitFormData.append('password', formData.password || '123456');
    
    // Địa chỉ (luôn có object, các trường có thể rỗng)
    submitFormData.append('address.details', formData.address?.details ?? '');
    submitFormData.append('address.ward', formData.address?.ward ?? '');
    submitFormData.append('address.province', formData.address?.province ?? '');
    
    // Phụ huynh
    const validParents = guardians.filter(g => g.fullName && g.phoneNumber);
    validParents.forEach((parent, idx) => {
      submitFormData.append(`parents[${idx}].fullName`, parent.fullName);
      submitFormData.append(`parents[${idx}].phoneNumber`, parent.phoneNumber);
      submitFormData.append(`parents[${idx}].relationship`, parent.relationship);
    });
    
    if (photoFile) {
      submitFormData.append('file', photoFile);
    }
    
    onSubmit(submitFormData);
    
    if (!createAnother) {
      onClose();
    } else {
      // Reset form
      setFirstName('');
      setLastName('');
      setFormData({
        email: '',
        fullName: '',
        phoneNumber: '',
        gender: true,
        dateOfBirth: '',
        grade: '',
        schoolName: '',
        roleId: 'R2',
        password: '123456',
        status: true,
        address: { details: '', ward: '', province: '' },
        parents: [],
        subjectIds: []
      });
      setGuardians([{ fullName: '', phoneNumber: '', relationship: 'Mẹ' }]);
      setPreviewPhoto(null);
      setPhotoFile(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa nhập';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const calculateAge = (dateString: string) => {
    if (!dateString) return null;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(formData.dateOfBirth);
  const fullAddress = [
    formData.address?.details, 
    formData.address?.ward, 
    formData.address?.province
  ].filter(Boolean).join(', ') || 'Chưa nhập';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="modal-container w-full max-w-[1100px] h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
        {/* Header */}
        <header className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">Thêm học sinh mới</h1>
            <p className="text-sm text-gray-500 mt-0.5">Tạo và đăng ký học sinh vào hệ thống</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-hidden flex flex-row">
          {/* Form Area */}
          <main className="flex-1 overflow-y-auto px-8 py-6 space-y-10">
            <form onSubmit={handleSubmit}>
              {/* Photo & Basic Info */}
              <section className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                      {previewPhoto ? (
                        <img src={previewPhoto} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Tải ảnh lên
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/jpeg,image/png,image/gif"
                      className="hidden"
                    />
                    <p className="text-xs text-gray-400 mt-2">JPG, PNG hoặc GIF. Tối đa 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Họ và tên đệm
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="VD: Nguyễn Văn"
                      className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Tên
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="VD: A"
                      className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Giới tính
                    </label>
                    <select
                      name="gender"
                      value={formData.gender ? 'true' : 'false'}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="true">Nam</option>
                      <option value="false">Nữ</option>
                    </select>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="hocsinh@example.com"
                      className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="0123456789"
                      className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Lớp
                    </label>
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    >
                      <option value="">Chọn lớp</option>
                      <option value="6">Lớp 6</option>
                      <option value="7">Lớp 7</option>
                      <option value="8">Lớp 8</option>
                      <option value="9">Lớp 9</option>
                      <option value="10">Lớp 10</option>
                      <option value="11">Lớp 11</option>
                      <option value="12">Lớp 12</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Tên trường
                    </label>
                    <input
                      type="text"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleInputChange}
                      placeholder="VD: THCS Ngô Chí Quốc"
                      className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  
                  {/* Địa chỉ 3 cột */}
                  <div className="col-span-2 grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Số nhà, đường
                      </label>
                      <input
                        type="text"
                        name="addressDetails"
                        value={formData.address?.details ?? ''}
                        onChange={handleInputChange}
                        placeholder="VD: 123 Đường Lê Lợi"
                        className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Phường/Xã
                      </label>
                      <input
                        type="text"
                        name="addressWard"
                        value={formData.address?.ward ?? ''}
                        onChange={handleInputChange}
                        placeholder="VD: Phường Bến Nghé"
                        className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Tỉnh/Thành phố
                      </label>
                      <input
                        type="text"
                        name="addressProvince"
                        value={formData.address?.province ?? ''}
                        onChange={handleInputChange}
                        placeholder="VD: TP Hồ Chí Minh"
                        className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
                <div>
  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
    Trạng thái
  </label>
  <select
    name="status"
    value={formData.status ? 'true' : 'false'}
    onChange={(e) =>
      setFormData(prev => ({
        ...prev,
        status: e.target.value === 'true'
      }))
    }
    className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
  >
    <option value="true">Đang học</option>
    <option value="false">Đã nghỉ</option>
  </select>
</div>
              </section>

              <hr className="border-gray-100 my-6" />

              {/* Guardian Information */}
              <section className="space-y-5">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Thông tin phụ huynh
                  </h2>
                  <button
                    type="button"
                    onClick={handleAddGuardian}
                    className="text-purple-500 text-xs font-bold hover:underline"
                  >
                    + Thêm phụ huynh
                  </button>
                </div>

                {guardians.map((guardian, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 gap-x-6 gap-y-4 relative">
                    {guardians.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveGuardian(index)}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-200"
                      >
                        ×
                      </button>
                    )}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Họ tên phụ huynh
                      </label>
                      <input
                        type="text"
                        value={guardian.fullName}
                        onChange={(e) => handleGuardianChange(index, 'fullName', e.target.value)}
                        placeholder="VD: Nguyễn Văn A"
                        className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={guardian.phoneNumber}
                        onChange={(e) => handleGuardianChange(index, 'phoneNumber', e.target.value)}
                        placeholder="0123456789"
                        className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Mối quan hệ
                      </label>
                      <select
                        value={guardian.relationship}
                        onChange={(e) => handleGuardianChange(index, 'relationship', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg text-sm px-3 py-2 bg-white"
                      >
                        <option value="Ba">Ba</option>
                        <option value="Mẹ">Mẹ</option>
                        <option value="Anh">Anh</option>
                        <option value="Chị">Chị</option>
                        <option value="Ông">Ông</option>
                        <option value="Bà">Bà</option>
                        <option value="Người giám hộ">Người giám hộ</option>
                      </select>
                    </div>
                  </div>
                ))}
              </section>
            </form>
          </main>

          {/* Right Sidebar Preview */}
          <aside className="w-[340px] bg-gray-50 border-l border-gray-100 p-6 space-y-6 hidden md:block overflow-y-auto">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                Xem trước hồ sơ
              </h3>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 relative">
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                
                <div className="px-4 pb-4 -mt-12 text-center">
                  <div className="inline-block w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-lg bg-gray-200 mb-3">
                    {previewPhoto ? (
                      <img src={previewPhoto} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-600 text-3xl font-bold">
                        {firstName ? firstName[0].toUpperCase() : '?'}
                        {lastName ? lastName[0].toUpperCase() : ''}
                      </div>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {firstName || 'Họ'} {lastName || 'Tên'}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {formData.grade ? `Lớp ${formData.grade}` : 'Chưa chọn lớp'}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Học sinh mới
                  </div>
                </div>

                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  <div className="px-4 py-3 flex justify-between items-center">
                    <span className="text-xs text-gray-500 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                      Email
                    </span>
                    <span className="text-xs font-medium text-gray-700 truncate max-w-[180px]">
                      {formData.email || 'Chưa nhập'}
                    </span>
                  </div>
                  <div className="px-4 py-3 flex justify-between items-center">
                    <span className="text-xs text-gray-500 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                      Điện thoại
                    </span>
                    <span className="text-xs font-medium text-gray-700">
                      {formData.phoneNumber || 'Chưa nhập'}
                    </span>
                  </div>
                  <div className="px-4 py-3 flex justify-between items-center">
                    <span className="text-xs text-gray-500 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                      Ngày sinh
                    </span>
                    <span className="text-xs font-medium text-gray-700">
                      {formatDate(formData.dateOfBirth)} {age !== null && `(${age} tuổi)`}
                    </span>
                  </div>
                  <div className="px-4 py-3 flex justify-between items-center">
                    <span className="text-xs text-gray-500 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                      Trường
                    </span>
                    <span className="text-xs font-medium text-gray-700 truncate max-w-[180px] text-right">
                      {formData.schoolName || 'Chưa nhập'}
                    </span>
                  </div>
                  <div className="px-4 py-3 flex justify-between items-center">
                    <span className="text-xs text-gray-500 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                      Địa chỉ
                    </span>
                    <span className="text-xs font-medium text-gray-700 truncate max-w-[180px] text-right">
                      {fullAddress}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Guardian Preview */}
            {guardians.some(g => g.fullName || g.phoneNumber) && (
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                  Phụ huynh
                </h3>
                <div className="space-y-3">
                  {guardians.map((guardian, idx) => (
                    guardian.fullName && (
                      <div key={idx} className="bg-white rounded-lg border border-gray-200 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 text-xs font-bold">
                              {guardian.fullName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{guardian.fullName}</p>
                            <p className="text-xs text-gray-500">{guardian.relationship}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                          </svg>
                          {guardian.phoneNumber || 'Chưa có SĐT'}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-blue-700">Trạng thái</span>
                </div>
                <p className="text-xs text-gray-600">{formData.status ? 'Đang học' : 'Đã nghỉ'}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-green-700">Năm học</span>
                </div>
                <p className="text-xs text-gray-600">2024 - 2025</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Thông tin nhanh
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Mã số dự kiến:</span>
                  <span className="font-mono text-gray-700">STU-{String(Math.floor(Math.random() * 10000)).padStart(4, '0')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Ngày tạo:</span>
                  <span className="text-gray-700">{new Date().toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Người tạo:</span>
                  <span className="text-gray-700">Admin</span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="px-8 py-5 border-t border-gray-100 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Tạo và thêm tiếp</span>
            <button
              type="button"
              onClick={() => setCreateAnother(!createAnother)}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                createAnother ? 'bg-purple-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  createAnother ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-6 py-2.5 text-sm font-bold text-white btn-gradient from-purple-600 to-indigo-600 rounded-lg shadow-md shadow-purple-200 transition-all hover:scale-[1.02]"
            >
              Thêm học sinh
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AddStudentModal;