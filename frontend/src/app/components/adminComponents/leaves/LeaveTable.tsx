// src/app/components/leaves/LeaveTable.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LeaveTableRow } from './LeaveTableRow';
import type { LeaveRequest } from '../../../utils/types/teacherLeave';

interface LeaveTableProps {
  leaves: LeaveRequest[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetail?: (id: string) => void;
}

export const LeaveTable: React.FC<LeaveTableProps> = ({
  leaves,
  selectedIds,
  onSelectAll,
  onSelectRow,
  onApprove,
  onReject,
  onViewDetail,
}) => {
  const allSelected = leaves.length > 0 && selectedIds.length === leaves.length;

  if (leaves.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-100">
        Không có dữ liệu
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-5 w-12 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
              </th>
              <th className="p-5 font-bold text-gray-500 text-sm uppercase tracking-wider">Giáo viên</th>
              <th className="p-5 font-bold text-gray-500 text-sm uppercase tracking-wider">Mã GV</th>
              <th className="p-5 font-bold text-gray-500 text-sm uppercase tracking-wider">Loại nghỉ</th>
              <th className="p-5 font-bold text-gray-500 text-sm uppercase tracking-wider">Ngày nghỉ</th>
              <th className="p-5 font-bold text-gray-500 text-sm uppercase tracking-wider">Số ngày</th>
              <th className="p-5 font-bold text-gray-500 text-sm uppercase tracking-wider">Trạng thái</th>
              <th className="p-5 font-bold text-gray-500 text-sm uppercase tracking-wider text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leaves.map((leave) => (
              <LeaveTableRow
                key={leave.id}
                leave={leave}
                isSelected={selectedIds.includes(leave.id)}
                onSelect={onSelectRow}
                onApprove={onApprove}
                onReject={onReject}
                onViewDetail={onViewDetail}
              />
            ))}
          </tbody>
        </table>
      </div>
      {/* Nếu bạn có phân trang riêng thì giữ lại, nếu không thì bỏ phần dưới */}
    </div>
  );
};