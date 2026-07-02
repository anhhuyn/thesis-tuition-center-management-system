// src/app/teachers/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, Sparkles, Download, Search, Users, TrendingUp, Shield, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import TeacherStats from '../../../components/adminComponents/teachers/TeacherStats';
import type { TeacherStat } from '../../../components/adminComponents/teachers/TeacherStats';
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

  // Stats from API (totals, new this month, percentage) - KHÔNG BỊ ẢNH HƯỞNG BỞI FILTER
  const [apiStats, setApiStats] = useState({
    totalTeachers: 0,
    newThisMonth: 0,
    percentageIncrease: 0,
  });

  // Derived stats from ALL teachers - KHÔNG BỊ ẢNH HƯỞNG BỞI FILTER
  const [allTeachersStats, setAllTeachersStats] = useState({
    active: 0,
    inactive: 0,
    male: 0,
    female: 0,
  });

  const navigate = useNavigate();

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const headerVariants: Variants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const contentVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 15,
      },
    },
  };

  const statsVariants: Variants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        delay: 0.2,
      },
    },
  };

  // Fetch teachers với filter
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

  // Fetch ALL teachers để tính stats (không filter)
  const fetchAllTeachersForStats = useCallback(async () => {
    try {
      // Fetch tất cả giáo viên không filter để tính stats tổng
      const response = await teacherApi.getAll(1, 10000, {});
      if (response.success && response.data) {
        const allTeachers = response.data;
        const active = allTeachers.filter((t: Teacher) => t.status === true).length;
        const inactive = allTeachers.filter((t: Teacher) => t.status === false).length;
        const male = allTeachers.filter((t: Teacher) => t.gender === true).length;
        const female = allTeachers.filter((t: Teacher) => t.gender === false).length;
        
        setAllTeachersStats({ active, inactive, male, female });
      }
    } catch (error) {
      console.error('Failed to fetch all teachers for stats:', error);
    }
  }, []);

  // Fetch API statistics (totals, new this month) - KHÔNG FILTER
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

  // Initial load
  useEffect(() => {
    fetchTeachers(1);
    fetchStatistics();
    fetchAllTeachersForStats();
  }, []);

  // Build stats array - SỬ DỤNG DỮ LIỆU TỔNG, KHÔNG BỊ ẢNH HƯỞNG BỞI FILTER
  const teacherStatsData: TeacherStat[] = [
    {
      title: 'Tổng giáo viên',
      value: apiStats.totalTeachers,
      trend: apiStats.percentageIncrease,
      trendDirection: apiStats.percentageIncrease >= 0 ? 'up' : 'down',
      type: 'default',
    },
    {
      title: 'Mới trong tháng',
      value: apiStats.newThisMonth,
      trend: apiStats.percentageIncrease,
      trendDirection: apiStats.percentageIncrease >= 0 ? 'up' : 'down',
      subText: 'giáo viên mới',
      type: 'default',
    },
    {
      title: 'Đang hoạt động',
      value: allTeachersStats.active,
      chartData: apiStats.totalTeachers ? [(allTeachersStats.active / apiStats.totalTeachers) * 100] : [0],
      subText: `${Math.round((allTeachersStats.active / apiStats.totalTeachers) * 100) || 0}% tổng số`,
      type: 'status',
    },
    {
      title: 'Phân bố giới tính',
      value: `${allTeachersStats.male} | ${allTeachersStats.female}`,
      type: 'gender',
    },
  ];

  // Handlers
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
          fetchAllTeachersForStats(); // Refresh stats sau khi xóa
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
        fetchAllTeachersForStats(); // Refresh stats sau khi cập nhật
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
        fetchAllTeachersForStats(); // Refresh stats sau khi xóa
      } catch (error: any) {
        setAlert?.({ type: 'error', message: error.response?.data?.message || 'Xóa thất bại' });
      }
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
        fetchAllTeachersForStats(); // Refresh stats sau khi thêm
      } else {
        setAlert?.({ type: 'error', message: response.message || 'Thêm giáo viên thất bại' });
      }
    } catch (error: any) {
      setAlert?.({ type: 'error', message: error.response?.data?.message || 'Thêm giáo viên thất bại' });
    }
  };

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen"
    >
      {/* Header Section với Gradient Background */}
      <section className="relative overflow-visible bg-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-200 via-indigo-300 to-cyan-200 opacity-30"></div>
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-sky-300 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

        <div className="absolute bottom-0 left-0 w-full pointer-events-none z-0">
          <svg
            className="relative w-full h-auto"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 250"
            preserveAspectRatio="none"
          >
            <path
              fill="#f3f5f7"
              fillOpacity="0.9"
              d="M0,256L48,240C96,224,192,192,288,186.7C384,181,480,203,576,208C672,213,768,203,864,186.7C960,171,1056,149,1152,138.7C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>

        <motion.div
          variants={headerVariants}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10"
        >
          <motion.div
            variants={contentVariants}
            className="relative overflow-hidden"
          >
            <div className="relative px-6 py-6 lg:px-8">
              {/* Header Content */}
              <div className="w-full flex flex-col space-y-6">
                {/* Header Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5">
                      <Sparkles size={14} className="text-indigo-500" />
                      <span className="text-indigo-500 text-xs font-medium">Quản trị viên</span>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <h1 className="text-gray-900 text-3xl lg:text-4xl font-bold tracking-tight">
                        Quản lý <span className="gradient-text">giáo viên</span>
                      </h1>
                      <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                        <span>Quản lý và tổ chức tất cả giáo viên trong hệ thống</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="flex items-center gap-1">
                          <TrendingUp size={14} className="text-blue-500" />
                          Đang có {apiStats.totalTeachers} giáo viên
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="search"
                          placeholder="Tìm kiếm giáo viên..."
                          className="peer w-80 pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl text-sm text-gray-700 outline-none border border-gray-200 focus:ring-2 focus:ring-indigo-400/50 transition-all placeholder:text-gray-400"
                          onChange={(e) => handleSearch(e.target.value)}
                        />
                        <Search
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors peer-focus:text-indigo-500"
                        />
                      </div>
                      <button
                        onClick={handleExportExcel}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl shadow-sm hover:bg-gray-50 transition-all duration-200"
                      >
                        <Download className="w-4 h-4" />
                        Xuất Excel
                      </button>
                      <button
                        onClick={handleAddTeacher}
                        className="group relative flex items-center gap-2 px-5 py-2.5 btn-gradient rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        <Plus size={18} className="text-white group-hover:rotate-90 transition-transform duration-300" />
                        <span>Thêm giáo viên</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Teacher Stats - KHÔNG BỊ ẢNH HƯỞNG BỞI FILTER */}
                <motion.div
                  variants={statsVariants}
                  className="w-full"
                >
                  <TeacherStats stats={teacherStatsData} />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Main Content */}
      <motion.div
        variants={contentVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        <div className="grid grid-cols-12 gap-6">
          {/* Left Content */}
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

          {/* Right Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="space-y-6 sticky top-6">
              <QuickActions onExport={handleExportExcel} />
              <RecentActivities  />

            </div>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AddTeacherModal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onSubmit={handleSubmitTeacher}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && selectedTeacher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}