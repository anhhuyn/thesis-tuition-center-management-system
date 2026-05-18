// src/app/teachers/page.tsx (corrected)
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus } from 'lucide-react';
import TeacherStats from '../../../components/adminComponents/teachers/TeacherStats';
import type { TeacherStat }  from '../../../components/adminComponents/teachers/TeacherStats';
import TeacherToolbar from '../../../components/adminComponents/teachers/TeacherToolbar';
import TeacherTable from '../../../components/adminComponents/teachers/TeacherTable';
import QuickActions from '../../../components/adminComponents/teachers/QuickActions';
import RecentActivities from '../../../components/adminComponents/teachers/RecentActivities';
import AddTeacherModal from '../../../components/adminComponents/teachers/AddTeacherModal';
import EditTeacherModal from '../../../components/adminComponents/teachers/EditTeacherModal';
import { teacherApi, buildTeacherFormData } from '../../../utils/api/teacher.api';
import type { Teacher, TeacherFilterParams } from '../../../utils/types/teacher';

export function TeacherManagementPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const { setAlert } = useOutletContext<any>()
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });
  const [filters, setFilters] = useState<TeacherFilterParams>({});
  
  // Stats from API (totals, new this month, percentage)
  const [apiStats, setApiStats] = useState({
    totalTeachers: 0,
    newThisMonth: 0,
    percentageIncrease: 0,
  });
  
  // Derived stats from teachers list
  const [derivedStats, setDerivedStats] = useState({
    active: 0,
    inactive: 0,
    male: 0,
    female: 0,
  });
  
  const navigate = useNavigate();

  // Fetch teachers
  const fetchTeachers = useCallback(async (page: number = 1, currentFilters: TeacherFilterParams = filters) => {
    setLoading(true);
    try {
      const response = await teacherApi.getAll(page, pagination.pageSize, currentFilters);
      if (response.success && response.data) {
        setTeachers(response.data);
        setPagination({
          currentPage: response.page,
          totalPages: response.totalPages,
          totalItems: response.total,
          pageSize: response.limit,
        });
      } else {
        setTeachers([]);
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      setTeachers([]);
      setAlert?.({ type: 'error', message: 'Không thể tải danh sách giáo viên' });
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize, filters, setAlert]);

  // Fetch API statistics (totals, new this month)
  const fetchStatistics = async () => {
    try {
      const stats = await teacherApi.getStatistics();
      setApiStats({
        totalTeachers: stats.totalTeachers,
        newThisMonth: stats.totalTeachersThisMonth,
        percentageIncrease: stats.percentageIncreaseTeacher,
      });
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
       setAlert?.({ type: 'error', message: 'Không thể tải thống kê giáo viên' });
    }
  };

  // Compute derived stats from the teachers list (active/inactive, male/female)
  const computeDerivedStats = useCallback(() => {
    const active = teachers.filter(t => t.status === true).length;
    const inactive = teachers.filter(t => t.status === false).length;
    const male = teachers.filter(t => t.gender === true).length;
    const female = teachers.filter(t => t.gender === false).length;
    setDerivedStats({ active, inactive, male, female });
  }, [teachers]);

  // Initial load
  useEffect(() => {
    fetchTeachers(1);
    fetchStatistics();
  }, []);

  // Recompute derived stats whenever teachers change
  useEffect(() => {
    computeDerivedStats();
  }, [teachers, computeDerivedStats]);

  // Build stats array for TeacherStats component (6 cards)
  const teacherStatsData: TeacherStat[] = [
    {
      title: 'Tổng giáo viên',
      value: apiStats.totalTeachers,
      trend: apiStats.percentageIncrease,
      trendDirection: apiStats.percentageIncrease >= 0 ? 'up' : 'down',
      subText: 'so với tháng trước',
    },
    {
      title: 'Mới trong tháng',
      value: apiStats.newThisMonth,
      subText: 'giáo viên',
    },
    {
      title: 'Đang hoạt động',
      value: derivedStats.active,
      chartData: apiStats.totalTeachers ? [(derivedStats.active / apiStats.totalTeachers) * 100] : [0],
      subText: `${Math.round((derivedStats.active / apiStats.totalTeachers) * 100) || 0}%`,
    },
    {
      title: 'Ngưng hoạt động',
      value: derivedStats.inactive,
      chartData: apiStats.totalTeachers ? [(derivedStats.inactive / apiStats.totalTeachers) * 100] : [0],
      subText: `${Math.round((derivedStats.inactive / apiStats.totalTeachers) * 100) || 0}%`,
    },
    {
      title: 'Nam',
      value: derivedStats.male,
      chartData: apiStats.totalTeachers ? [(derivedStats.male / apiStats.totalTeachers) * 100] : [0],
      subText: `${Math.round((derivedStats.male / apiStats.totalTeachers) * 100) || 0}%`,
    },
    {
      title: 'Nữ',
      value: derivedStats.female,
      chartData: apiStats.totalTeachers ? [(derivedStats.female / apiStats.totalTeachers) * 100] : [0],
      subText: `${Math.round((derivedStats.female / apiStats.totalTeachers) * 100) || 0}%`,
    },
  ];

  // Handlers (unchanged)
  const handleSearch = (query: string) => {
    const newFilters = { ...filters, name: query || undefined };
    setFilters(newFilters);
    fetchTeachers(1, newFilters);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    const newFilters = { ...filters };
    switch (filterType) {
      case 'specialty':
        newFilters.specialty = value || undefined;
        break;
      case 'gender':
        if (value === 'male') newFilters.gender = true;
        else if (value === 'female') newFilters.gender = false;
        else newFilters.gender = undefined;
        break;
      case 'status':
        if (value === 'active') newFilters.status = true;
        else if (value === 'inactive') newFilters.status = false;
        else newFilters.status = undefined;
        break;
      case 'clear':
        setFilters({});
        fetchTeachers(1, {});
        return;
      default:
        break;
    }
    setFilters(newFilters);
    fetchTeachers(1, newFilters);
  };

  const handlePageChange = (page: number) => fetchTeachers(page);

  const handleBulkAction = async (action: string) => {
    if (action === 'delete') {
      if (window.confirm(`Bạn có chắc muốn xóa ${selectedIds.length} giáo viên?`)) {
        try {
          const response = await teacherApi.deleteMultiple(selectedIds);
          setAlert?.({ type: 'success', message: response.message || `Đã xóa ${selectedIds.length} giáo viên` });
          setSelectedIds([]);
          fetchTeachers(pagination.currentPage);
          fetchStatistics();
        } catch (error: any) {
          setAlert?.({ type: 'error', message: error.response?.data?.message || 'Xóa thất bại' });
        }
      }
    } 
      
  };
  const handleExportExcel = async () => {
    try {
      const blob = await teacherApi.exportExcel(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'danh-sach-giao-vien.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
       setAlert?.({ type: 'success', message: 'Xuất file Excel thành công' });
    } catch (error) {
      setAlert?.({ type: 'error', message: 'Xuất file thất bại' });
    }
  };
  

  const handleSelectionChange = (ids: number[]) => setSelectedIds(ids);
  const handleAddTeacher = () => setIsAddModalOpen(true);
  const handleViewTeacher = (teacher: Teacher) => navigate(`/admin/teacher/${teacher.id}`);
  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsEditModalOpen(true);
  };

  const handleSaveTeacher = async (updatedTeacher: any, file?: File) => {
    const formData = buildTeacherFormData(updatedTeacher, file);
    try {
      const response = await teacherApi.update(updatedTeacher.id, formData);
      if (response.errCode === 0) {
        setAlert?.({ type: 'success', message: response.message || 'Cập nhật giáo viên thành công' });
        setIsEditModalOpen(false);
        setSelectedTeacher(null);
        fetchTeachers(pagination.currentPage);
        fetchStatistics();
     } else {
        setAlert?.({ type: 'error', message: response.message || 'Cập nhật thất bại' });
      }
    } catch (error: any) {
      setAlert?.({ type: 'error', message: error.response?.data?.message || 'Cập nhật thất bại' });
    }
  };

  const handleDeleteTeacher = async (teacherId: number | string) => {
    const id = typeof teacherId === 'string' ? parseInt(teacherId, 10) : teacherId;
    if (window.confirm('Bạn có chắc muốn xóa giáo viên này?')) {
      try {
        const response = await teacherApi.delete(id);
        setAlert?.({ type: 'success', message: response.message || 'Xóa giáo viên thành công' });
        fetchTeachers(pagination.currentPage);
        fetchStatistics();
      } catch (error: any) {
        setAlert?.({ type: 'error', message: error.response?.data?.message || 'Xóa thất bại' });      }
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    fetchTeachers(1, {});
  };

  const handleViewModeChange = (mode: 'table' | 'card') => {
    setViewMode(mode);
    if (mode === 'card') navigate('/admin/teacher/cards');
  };

  const handleSubmitTeacher = async (data: any) => {
    const formData = buildTeacherFormData(data, data.file);
    try {
      const response = await teacherApi.create(formData);
      if (response.errCode === 0) {
        setAlert?.({ type: 'success', message: response.message || 'Thêm giáo viên thành công' });
        setIsAddModalOpen(false);
        fetchTeachers(pagination.currentPage);
        fetchStatistics();
       } else {
        setAlert?.({ type: 'error', message: response.message || 'Thêm giáo viên thất bại' });
      }
    } catch (error: any) {
      setAlert?.({ type: 'error', message: error.response?.data?.message || 'Thêm giáo viên thất bại' });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-800">Quản lý giáo viên</h1>
              <p className="text-sm text-slate-500">Quản lý và tổ chức tất cả giáo viên trong hệ thống</p>
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
            <TeacherStats stats={teacherStatsData} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-9">
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
                  currentFilters={{
                    specialty: filters.specialty,
                    gender: filters.gender === true ? 'male' : filters.gender === false ? 'female' : undefined,
                    status: filters.status === true ? 'active' : filters.status === false ? 'inactive' : undefined,
                  }}
                />
              </div>
              <TeacherTable
                teachers={teachers}
                loading={loading}
                total={pagination.totalItems}
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                onSelectionChange={handleSelectionChange}
                onEditTeacher={handleEditTeacher}
                onViewTeacher={handleViewTeacher}
              />
            </div>
            <div className="col-span-12 lg:col-span-3">
              <div className="space-y-6 sticky top-6">
                <QuickActions onExport={handleExportExcel} />
                <RecentActivities activities={[]} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddTeacherModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleSubmitTeacher} />
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