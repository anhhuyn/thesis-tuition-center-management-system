// src/components/teacherComponents/TeacherPayrollTable.tsx
import React from 'react';
import type { TeacherPayrollSummary } from '../../../../utils/types/payroll';

interface TeacherPayrollTableProps {
  payrolls: TeacherPayrollSummary[];
  loading: boolean;
  searchTerm: string;
  onViewDetail: (paymentId: number) => void;
  teacherId: number | null;
}

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { color: string; label: string }> = {
    'DRAFT': { color: 'bg-gray-100 text-gray-800', label: 'Nháp' },
    'WAITING_TEACHER_CONFIRMATION': { color: 'bg-yellow-100 text-yellow-800', label: 'Chờ xác nhận' },
    'TEACHER_CONFIRMED': { color: 'bg-blue-100 text-blue-800', label: 'Đã xác nhận' },
    'FINALIZED': { color: 'bg-green-100 text-green-800', label: 'Đã chốt' },
    'PAID': { color: 'bg-purple-100 text-purple-800', label: 'Đã thanh toán' },
  };
  
  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
};

const TeacherPayrollTable: React.FC<TeacherPayrollTableProps> = ({ 
  payrolls, 
  loading, 
  searchTerm, 
  onViewDetail,
  teacherId 
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!teacherId) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Không tìm thấy ID giáo viên</p>
          <p className="text-gray-400 text-sm mt-2">Vui lòng đăng nhập lại</p>
        </div>
      </div>
    );
  }

  if (payrolls.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Không tìm thấy bảng lương nào</p>
          <p className="text-gray-400 text-sm mt-2">
            {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có dữ liệu bảng lương'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kỳ lương
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số buổi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tổng tiền
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payrolls.map((payroll) => (
              <tr key={payroll.paymentId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {payroll.month}/{payroll.year}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {payroll.totalSessions} buổi
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payroll.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(payroll.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => onViewDetail(payroll.paymentId)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                  >
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Hiển thị {payrolls.length} bảng lương
        </div>
      </div>
    </div>
  );
};

export default TeacherPayrollTable;