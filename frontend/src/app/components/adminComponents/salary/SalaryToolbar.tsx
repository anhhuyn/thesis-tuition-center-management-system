// src/app/components/salary/SalaryToolbar.tsx
import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { subjectApi } from '../../../utils/api/subject.api';
import type { Subject } from '../../../utils/types/subject';

interface SalaryToolbarProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedSubjectId: number | undefined;
  onSubjectChange: (id: number | undefined) => void;
  selectedGrade: number | undefined;
  onGradeChange: (grade: number | undefined) => void;
  onAddAgreement: () => void;
  onClearFilters: () => void;
}

export const SalaryToolbar: React.FC<SalaryToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedSubjectId,
  onSubjectChange,
  selectedGrade,
  onGradeChange,
  onAddAgreement,
  onClearFilters,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const grades = [6, 7, 8, 9, 10, 11, 12];

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await subjectApi.getAll(1, 100);
        if (res.data) setSubjects(res.data);
      } catch (error) {
        console.error('Không thể tải môn học', error);
      }
    };
    fetchSubjects();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-8 items-center">
      <div className="relative w-full lg:flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={onSearchChange}
          className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all"
          placeholder="Tìm kiếm theo tên giảng viên..."
        />
      </div>
      <div className="flex gap-4 w-full lg:w-auto flex-wrap">
        <select
          value={selectedSubjectId || ''}
          onChange={(e) => onSubjectChange(e.target.value ? Number(e.target.value) : undefined)}
          className="bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-purple-500/20 min-w-[140px]"
        >
          <option value="">Tất cả môn học</option>
          {subjects.map((sub) => (
            <option key={sub.id} value={sub.id}>{sub.name}</option>
          ))}
        </select>
        <select
          value={selectedGrade || ''}
          onChange={(e) => onGradeChange(e.target.value ? Number(e.target.value) : undefined)}
          className="bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-purple-500/20 min-w-[140px]"
        >
          <option value="">Tất cả khối</option>
          {grades.map(g => <option key={g} value={g}>Lớp {g}</option>)}
        </select>
        <button
          onClick={onClearFilters}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-3 rounded-xl text-sm font-medium transition"
        >
          Xóa lọc
        </button>
        <button
          onClick={onAddAgreement}
          className="btn-gradient from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Thêm thỏa thuận
        </button>
      </div>
    </div>
  );
};