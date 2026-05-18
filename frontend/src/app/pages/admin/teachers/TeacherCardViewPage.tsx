// src/app/teachers/card-view/page.tsx
'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import TeacherStats from '../../../components/adminComponents/teachers/TeacherStats';
import TeacherCard from '../../../components/adminComponents/teachers/TeacherCard';
import QuickActions from '../../../components/adminComponents/teachers/QuickActions';
import RecentActivities from '../../../components/adminComponents/teachers/RecentActivities';
import TeacherToolbar from '../../../components/adminComponents/teachers/TeacherToolbar';
import AddTeacherModal from '../../../components/adminComponents/teachers/AddTeacherModal';
import EditTeacherModal from '../../../components/adminComponents/teachers/EditTeacherModal';

import { mockTeachers, teacherStats, teacherActivities } from '../../../utils/mockTeachers';
import type { Teacher } from '../../../utils/types/teacher';

export  function TeacherCardViewPage() {
    const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);


    const navigate = useNavigate();
  
    const handleSearch = (query: string) => {
      const filtered = mockTeachers.filter(teacher =>
        teacher.name.toLowerCase().includes(query.toLowerCase()) ||
        teacher.email.toLowerCase().includes(query.toLowerCase()) ||
        teacher.teacherId.toLowerCase().includes(query.toLowerCase()) ||
        teacher.subject.toLowerCase().includes(query.toLowerCase())
      );
      setTeachers(filtered);
    };
  
    const handleFilterChange = (filterType: string, value: string) => {
      console.log('Filter changed:', filterType, value);
    };
  
    const handleBulkAction = (action: string) => {
      console.log(`Bulk action ${action} on teachers:`, selectedIds);
    };
  
    const handleSelectionChange = (ids: string[]) => {
      setSelectedIds(ids);
    };
  
    const handleAddTeacher = () => {
      setIsModalOpen(true);
    };
  
  
    const handleViewTeacher = (teacher: Teacher) => {
      navigate(`/admin/teacher/${teacher.id}`);
    };
  
    const handleEditTeacher = (teacher: Teacher) => {
      setSelectedTeacher(teacher);
      setIsEditModalOpen(true);
    };
  
    const handleSaveTeacher = (updatedTeacher: Teacher) => {
      setTeachers(prev => prev.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
      setIsEditModalOpen(false);
      setSelectedTeacher(null);
    };
  
    const handleDeleteTeacher = (teacherId: string) => {
      setTeachers(prev => prev.filter(t => t.id !== teacherId));
      setIsEditModalOpen(false);
      setSelectedTeacher(null);
    };

    const handleClearFilters = () => {
      setTeachers(mockTeachers);
    };
  
    const handleViewModeChange = (mode: 'table' | 'card') => {
      setViewMode(mode);
      if (mode === 'table') {
        navigate('/admin/teacher');
      }
      // Nếu ở chế độ card thì không cần chuyển trang vì đang ở trang card
    };
    const handleSubmitTeacher = (data: any) => {
      console.log('New teacher data:', data);
      setIsModalOpen(false);
    };
  
    return (
      <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6">
          {/* Page Header - Không còn view switcher ở đây */}
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-800">
                Danh sách giáo viên
              </h1>
              <p className="text-sm text-slate-500">
                Quản lý và theo dõi đội ngũ giảng viên
              </p>
            </div>
            <button
              onClick={handleAddTeacher}
              className="inline-flex items-center gap-2 px-4 py-2 btn-gradient from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Thêm giáo viên
            </button>
          </div>
  
          {/* Stats Section */}
          <div className="mb-6">
            <TeacherStats stats={teacherStats} />
          </div>
  
          {/* Main Content Grid - 12 columns */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Content - 9 columns */}
            <div className="col-span-12 lg:col-span-9">
              {/* Toolbar - Đã tích hợp view switcher */}
              <div className="mb-4">
                <TeacherToolbar
                  onSearch={handleSearch}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                  selectedCount={selectedIds.length}
                  onBulkAction={handleBulkAction}
                  onAddTeacher={handleAddTeacher}
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                />
              </div>
  
              {/* Teacher Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers.map((teacher) => (
                  <TeacherCard
                    key={teacher.id}
                    teacher={teacher}
                    onView={handleViewTeacher}
                    onEdit={handleEditTeacher}
                  />
                ))}
              </div>
            </div>
  
            {/* Right Sidebar - 3 columns */}
            <div className="col-span-12 lg:col-span-3">
              <div className="space-y-6 sticky top-6">
                <QuickActions />
                <RecentActivities activities={teacherActivities} />
              </div>
            </div>
          </div>
        </div>
      </div>
            {/* Add Teacher Modal */}
            <AddTeacherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitTeacher}
      />
      {/* Edit Teacher Modal */}
      <EditTeacherModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTeacher(null);
        }}
        teacher={selectedTeacher}
        onSave={handleSaveTeacher}
        onDelete={handleDeleteTeacher}
      />
      </>
    );
  }