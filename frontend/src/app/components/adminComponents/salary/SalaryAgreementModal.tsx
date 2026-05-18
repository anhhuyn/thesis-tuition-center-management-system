// src/app/components/salary/SalaryAgreementModal.tsx
import React, { useEffect, useState } from 'react';
import { X, DollarSign, Clock, Calendar, FileText } from 'lucide-react';
import { teacherApi } from '../../../utils/api/teacher.api';
import { subjectApi } from '../../../utils/api/subject.api';
import type { TeacherBasic } from '../../../utils/types/teacher';
import type { Subject } from '../../../utils/types/subject';
import type { TeacherSubjectRequest } from '../../../utils/types/teacherSubject';

interface SalaryAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TeacherSubjectRequest) => void;
  initialData?: any; // TeacherSubject from backend
  isEdit?: boolean;
}

export const SalaryAgreementModal: React.FC<SalaryAgreementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEdit = false,
}) => {
  const [teachers, setTeachers] = useState<TeacherBasic[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<TeacherSubjectRequest>({
    teacherId: 0,
    subjectId: 0,
    salaryRate: 0,
  });

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        teacherApi.getBasicList(),
        subjectApi.getAll(1, 100)
      ]).then(([teacherList, subjectRes]) => {
        setTeachers(teacherList);
        setSubjects(subjectRes.data || []);
        setLoading(false);
      }).catch(err => {
        console.error('Lỗi tải dữ liệu', err);
        setLoading(false);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        teacherId: initialData.teacherId,
        subjectId: initialData.subjectId,
        salaryRate: parseInt(initialData.salaryRate.replace(/\D/g, ''), 10) || 0,
      });
    } else {
      setFormData({ teacherId: 0, subjectId: 0, salaryRate: 0 });
    }
  }, [initialData]);

  const handleChange = (field: keyof TeacherSubjectRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data before submit:', formData);
    if (!formData.teacherId || !formData.subjectId || !formData.salaryRate) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {isEdit ? 'Chỉnh sửa thỏa thuận lương' : 'Thêm thỏa thuận lương mới'}
              </h3>
              <p className="text-sm text-gray-500">
                {isEdit ? 'Cập nhật các điều khoản tài chính' : 'Tạo thỏa thuận lương mới'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Chọn giáo viên */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Giáo viên <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.teacherId}
                onChange={(e) => handleChange('teacherId', Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-purple-400"
                required
                disabled={loading}
              >
                <option value="">-- Chọn giáo viên --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.fullName} ({t.email})</option>
                ))}
              </select>
            </div>

            {/* Chọn môn học */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Môn học <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => handleChange('subjectId', Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-purple-400"
                required
                disabled={loading}
              >
                <option value="">-- Chọn môn học --</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} (Lớp {s.grade})</option>
                ))}
              </select>
            </div>

            {/* Mức lương / giờ */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Mức lương / Giờ (VNĐ) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.salaryRate}
                  onChange={(e) => handleChange('salaryRate', parseInt(e.target.value) || 0)}
                  className="w-full pl-10 pr-16 py-2.5 border border-gray-200 rounded-xl focus:border-purple-400"
                  placeholder="150000"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">VNĐ/H</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100">
              Hủy
            </button>
            <button type="submit" className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
              {isEdit ? 'Lưu thay đổi' : 'Thêm thỏa thuận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};