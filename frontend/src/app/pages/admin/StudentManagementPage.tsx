// src/app/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Sparkles, Download } from 'lucide-react';
import StudentStats from '../../components/adminComponents/students/StudentStats';
import StudentToolbar from '../../components/adminComponents/students/StudentToolbar';
import StudentTable from '../../components/adminComponents/students/StudentTable';
import QuickActions from '../../components/adminComponents/students/QuickActions';
import RecentActivities from '../../components/adminComponents/students/RecentActivities';

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

  // Thêm useEffect để theo dõi students state
  useEffect(() => {
  }, [students]);

  useEffect(() => {
    fetchStudents(1);
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
        // value từ toolbar là 'true' hoặc 'false' (string)
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
    } else {
      setAlert?.({ type: 'error', message: response?.message || 'Cập nhật thất bại' });
      throw new Error(response?.message || 'Cập nhật thất bại'); // 👈 throw
    }
  } catch (error: any) {
    console.error('Update error:', error);
    const msg = error.response?.data?.message || error.message || 'Cập nhật thất bại';
    setAlert?.({ type: 'error', message: msg });
    throw error; // 👈 throw lại để modal biết
  }
};

  const handleDeleteStudent = async (studentId: number) => {
    if (window.confirm('Bạn có chắc muốn xóa học sinh này?')) {
      try {
        const response = await studentApi.delete(studentId);
        if (response.errCode === 0) {
          setAlert?.({ type: 'success', message: response.message || 'Xóa thành công' });
          fetchStudents(pagination.currentPage);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-800">
              Quản lý học sinh
            </h1>
            <p className="text-sm text-gray-500">
              Quản lý và tổ chức tất cả học sinh trong hệ thống
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleBulkAction('export')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Xuất Excel
            </button>
            <button
              onClick={handleAddStudent}
              className="inline-flex items-center gap-2 px-4 py-2 btn-gradient from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Thêm học sinh
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-6">
          <StudentStats students={students} />
        </div>

        {/* Main Content Grid */}
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
              <QuickActions onAddStudent={handleAddStudent} />
              <RecentActivities activities={[]} />

              {/* Pro Feature Card */}
              <div className="bg-purple-600 from-purple-600 to-indigo-600 rounded-xl p-5 text-white shadow-lg shadow-purple-500/20 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80">Tính năng Pro</p>
                  </div>
                  <h4 className="text-lg font-bold mt-1">Phân tích thông minh</h4>
                  <p className="text-xs mt-2 opacity-90 leading-relaxed">
                    Dự đoán tỷ lệ thành công của học sinh với các mô hình AI mới. Có sẵn trong gói của bạn!
                  </p>
                  <button className="mt-4 bg-white text-purple-600 px-4 py-1.5 rounded-lg text-[10px] font-bold hover:bg-gray-100 transition-colors uppercase flex items-center gap-1">
                    Khám phá ngay
                    <Sparkles className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSubmitStudent}
      />
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
    </div>
  );
}