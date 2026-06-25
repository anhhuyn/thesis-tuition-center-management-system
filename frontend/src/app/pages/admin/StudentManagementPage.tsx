// src/app/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Sparkles, Download, Search, Users, TrendingUp, Shield, ArrowRight } from 'lucide-react';
import StudentStats from '../../components/adminComponents/students/StudentStats';
import StudentToolbar from '../../components/adminComponents/students/StudentToolbar';
import StudentTable from '../../components/adminComponents/students/StudentTable';
import QuickActions from '../../components/adminComponents/students/QuickActions';
import RecentActivities from '../../components/adminComponents/students/RecentActivities';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';

import AddStudentModal from '../../components/adminComponents/students/AddStudentModal';
import EditStudentModal from '../../components/adminComponents/students/EditStudentModal';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { Student, StudentFilterParams } from '../../utils/types/student';
import { studentApi } from '../../utils/api/student.api';

export function StudentManagementPage() {
  const { setAlert } = useOutletContext<any>()
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10
  });
  const [filters, setFilters] = useState<StudentFilterParams>({});
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

  const fetchStudents = useCallback(async (page: number = 1, currentFilters: StudentFilterParams = filters) => {
    setLoading(true);
    try {
      const response = await studentApi.getAll(page, pagination.pageSize, currentFilters);

      if (response.success && response.data) {
        setStudents(response.data);
        setPagination({
          currentPage: response.page,
          totalPages: response.totalPages,
          totalItems: response.total,
          pageSize: response.limit
        });
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize]);

  // State để lưu tổng số học sinh (không bị ảnh hưởng bởi search)
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);

  // Fetch tổng số học sinh (không có filter)
  const fetchTotalStudents = useCallback(async () => {
    try {
      const response = await studentApi.getAll(1, 1, {});
      if (response.success) {
        setTotalStudentsCount(response.total);
      }
    } catch (error) {
      console.error('Failed to fetch total students:', error);
    }
  }, []);

  useEffect(() => {
    fetchStudents(1);
    fetchTotalStudents(); // Lấy tổng số học sinh
  }, []);

  const handleSearch = (query: string) => {
    const newFilters = { ...filters, search: query || undefined };
    setFilters(newFilters);
    fetchStudents(1, newFilters);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    const newFilters = { ...filters };

    switch (filterType) {
      case 'clear':
        setFilters({});
        fetchStudents(1, {});
        return;
      case 'grade':
        newFilters.grade = value || undefined;
        break;
      case 'gender':
        if (value === 'male') newFilters.gender = true;
        else if (value === 'female') newFilters.gender = false;
        else newFilters.gender = undefined;
        break;
      case 'school':
        newFilters.schoolName = value || undefined;
        break;
      case 'status':
        if (value === 'true') newFilters.status = true;
        else if (value === 'false') newFilters.status = false;
        else newFilters.status = undefined;
        break;
      case 'sort':
        if (value === 'name_asc') {
          newFilters.sortBy = 'fullName';
          newFilters.sortOrder = 'asc';
        } else if (value === 'name_desc') {
          newFilters.sortBy = 'fullName';
          newFilters.sortOrder = 'desc';
        } else if (value === 'date_asc') {
          newFilters.sortBy = 'createdAt';
          newFilters.sortOrder = 'asc';
        } else if (value === 'date_desc') {
          newFilters.sortBy = 'createdAt';
          newFilters.sortOrder = 'desc';
        } else {
          newFilters.sortBy = undefined;
          newFilters.sortOrder = undefined;
        }
        break;
    }

    setFilters(newFilters);
    fetchStudents(1, newFilters);
  };

  const handlePageChange = (page: number) => {
    fetchStudents(page);
  };

  const handleBulkAction = async (action: string) => {
    if (action === 'delete') {
      if (window.confirm(`Bạn có chắc muốn xóa ${selectedIds.length} học sinh?`)) {
        try {
          const response = await studentApi.deleteMultiple(selectedIds);
          if (response.errCode === 0) {
            setAlert?.({
              type: 'success',
              message: response.message || `Đã xóa ${selectedIds.length} học sinh`,
            });
            setSelectedIds([]);
            fetchStudents(pagination.currentPage);
            fetchTotalStudents(); // Cập nhật lại tổng số
          } else {
            setAlert?.({ type: 'error', message: response.message || 'Xóa thất bại' });
          }
        } catch (error: any) {
          console.error('Delete multiple failed:', error);
          if (error.response?.status === 409 || error.response?.data?.message?.includes('nợ học phí')) {
            setAlert?.({ type: 'error', message: 'Không thể xóa vì một hoặc nhiều học sinh còn nợ học phí' });
          } else if (error.response?.data?.message) {
            setAlert?.({ type: 'error', message: error.response.data.message });
          } else {
            setAlert?.({ type: 'error', message: 'Xóa thất bại' });
          }
        }
      }
    } else if (action === 'export') {
      try {
        const blob = await studentApi.exportExcel(filters);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'danh-sach-hoc-sinh.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        setAlert?.({ type: 'success', message: 'Xuất file thành công' });
      } catch (error) {
        console.error('Export failed:', error);
        setAlert?.({ type: 'error', message: 'Xuất file thất bại' });
      }
    }
  };

  const handleSelectionChange = (ids: number[]) => {
    setSelectedIds(ids);
  };

  const handleAddStudent = () => {
    setIsAddModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleSubmitStudent = async (formData: FormData) => {
    try {
      const response = await studentApi.create(formData);
      if (response.errCode === 0) {
        setIsAddModalOpen(false);
        fetchStudents(pagination.currentPage);
        fetchTotalStudents(); // Cập nhật lại tổng số
        setAlert?.({ type: 'success', message: response.message || 'Thêm học sinh thành công' });
      } else {
        setAlert?.({ type: 'error', message: response.message || 'Thêm học sinh thất bại' });
      }
    } catch (error: any) {
      console.error('Failed to create student:', error);
      if (error.response) {
        setAlert?.({ type: 'error', message: error.response.data?.message || 'Thêm học sinh thất bại' });
      } else {
        setAlert?.({ type: 'error', message: 'Thêm học sinh thất bại' });
      }
    }
  };

  const handleSaveStudent = async (formData: FormData) => {
    try {
      const response = await studentApi.update(selectedStudent!.id, formData);
      if (response && response.errCode === 0) {
        setAlert?.({ type: 'success', message: response.message || 'Cập nhật thành công' });
        setIsEditModalOpen(false);
        setSelectedStudent(null);
        fetchStudents(pagination.currentPage);
        fetchTotalStudents(); // Cập nhật lại tổng số
      } else {
        setAlert?.({ type: 'error', message: response?.message || 'Cập nhật thất bại' });
        throw new Error(response?.message || 'Cập nhật thất bại');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      const msg = error.response?.data?.message || error.message || 'Cập nhật thất bại';
      setAlert?.({ type: 'error', message: msg });
      throw error;
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (window.confirm('Bạn có chắc muốn xóa học sinh này?')) {
      try {
        const response = await studentApi.delete(studentId);
        if (response.errCode === 0) {
          setAlert?.({ type: 'success', message: response.message || 'Xóa thành công' });
          fetchStudents(pagination.currentPage);
          fetchTotalStudents(); // Cập nhật lại tổng số
        } else {
          setAlert?.({ type: 'error', message: response.message || 'Xóa thất bại' });
        }
      } catch (error: any) {
        console.error('Delete student failed:', error);
        if (error.response?.status === 409) {
          setAlert?.({ type: 'error', message: 'Không thể xóa vì học sinh còn nợ học phí hoặc đang tham gia lớp học' });
        } else if (error.response?.data?.message) {
          setAlert?.({ type: 'error', message: error.response.data.message });
        } else {
          setAlert?.({ type: 'error', message: 'Xóa thất bại' });
        }
      }
    }
  };

  const handleViewStudent = (student: Student) => {
    navigate(`/admin/student/${student.id}`);
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
                        Quản lý <span className="gradient-text">học sinh</span>
                      </h1>
                      <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                        <span>Quản lý và tổ chức tất cả học sinh trong hệ thống</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="flex items-center gap-1">
                          <TrendingUp size={14} className="text-blue-500" />
                          {/* Sử dụng totalStudentsCount thay vì pagination.totalItems */}
                          Đang có {totalStudentsCount} học sinh
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="search"
                          placeholder="Tìm kiếm học sinh..."
                          className="peer w-80 pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl text-sm text-gray-700 outline-none border border-gray-200 focus:ring-2 focus:ring-indigo-400/50 transition-all placeholder:text-gray-400"
                          onChange={(e) => handleSearch(e.target.value)}
                        />
                        <Search
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors peer-focus:text-indigo-500"
                        />
                      </div>
                      <button
                        onClick={() => handleBulkAction('export')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl shadow-sm hover:bg-gray-50 transition-all duration-200"
                      >
                        <Download className="w-4 h-4" />
                        Xuất Excel
                      </button>
                      <button
                        onClick={handleAddStudent}
                        className="group relative flex items-center gap-2 px-5 py-2.5 btn-gradient rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                      >
                        <Plus size={18} className="text-white group-hover:rotate-90 transition-transform duration-300" />
                        <span>Thêm học sinh</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Student Stats - Giữ nguyên component cũ */}
                <motion.div
                  variants={statsVariants}
                  className="w-full"
                >
                  <StudentStats students={students} />
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
              <StudentToolbar
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                selectedCount={selectedIds.length}
                onBulkAction={handleBulkAction}
                onAddStudent={handleAddStudent}
                currentFilters={{
                  grade: filters.grade,
                  status: filters.status === undefined ? undefined : (filters.status ? 'active' : 'inactive'),
                  gender: filters.gender === undefined ? undefined : (filters.gender ? 'male' : 'female'),
                  school: filters.schoolName
                }}
              />
            </div>
            <StudentTable
              students={students}
              loading={loading}
              total={pagination.totalItems}
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              onSelectionChange={handleSelectionChange}
              onEditStudent={handleEditStudent}
              onViewStudent={handleViewStudent}
            />
          </div>

          {/* Right Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="space-y-6 sticky top-6">
              <QuickActions onAddStudent={handleAddStudent}
               onExport={() => handleBulkAction('export')} />
              <RecentActivities activities={[]} />

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
            <AddStudentModal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onSubmit={handleSubmitStudent}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <EditStudentModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setSelectedStudent(null);
              }}
              student={selectedStudent}
              onSave={handleSaveStudent}
              onDelete={handleDeleteStudent}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}