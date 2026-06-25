// src/components/adminComponents/tuition/TuitionTable.tsx
import React from 'react';
import { FileText, Plus } from 'lucide-react';
import type { TuitionCalculationDTO } from '../../../utils/types/tuition';
import TuitionInvoiceItem from './TuitionInvoiceItem';

interface TuitionTableProps {
  invoices: TuitionCalculationDTO[];
  loading: boolean;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onPayment: (id: number) => void;
  onCreateFirst?: () => void;
  month?: number;
  year?: number;
}
const TuitionTable: React.FC<TuitionTableProps> = ({
  invoices,
  loading,
  onView,
  onEdit,
  onPayment,
  onCreateFirst,
  month,
  year,
}) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000_000) {
      return `${(amount / 1_000_000_000).toFixed(1)}B`;
    }
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}M`;
    }
    return amount.toLocaleString();
  };

  if (loading) {
    return (
      <div className="space-y-2.5">
        <div className="grid grid-cols-12 gap-3 px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 rounded-lg">
          <div className="col-span-4">Học sinh</div>
          <div className="col-span-2">Lớp</div>
          <div className="col-span-3">Thanh toán (VNĐ)</div>
          <div className="col-span-2">Trạng thái</div>
          <div className="col-span-1 text-right">Thao tác</div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="grid grid-cols-12 gap-3 items-center bg-gray-50/50 p-4 rounded-lg animate-pulse">
            <div className="col-span-4 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gray-200"></div>
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 bg-gray-200 rounded"></div>
                <div className="h-2.5 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="col-span-2 h-3.5 w-20 bg-gray-200 rounded"></div>
            <div className="col-span-3 space-y-1">
              <div className="h-2.5 w-full bg-gray-200 rounded"></div>
              <div className="h-1.5 w-full bg-gray-200 rounded"></div>
            </div>
            <div className="col-span-2 h-5 w-20 bg-gray-200 rounded-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <FileText className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1.5">Chưa có hóa đơn nào</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5">
          Bắt đầu bằng cách tạo hóa đơn học phí cho học sinh trong tháng này.
        </p>
        <button
          onClick={onCreateFirst}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          Tạo hóa đơn
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* Header */}
      <div className="grid grid-cols-12 gap-3 px-4 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 rounded-lg">
        <div className="col-span-4">Học sinh</div>
        <div className="col-span-2">Lớp</div>
        <div className="col-span-3">Thanh toán (VNĐ)</div>
        <div className="col-span-2">Trạng thái</div>
        <div className="col-span-1 text-right">Thao tác</div>
      </div>

      {/* Items */}
      {invoices.map((invoice, index) => (
        <TuitionInvoiceItem
          key={invoice.tuitionId}
          invoice={invoice}
          onView={onView}
          onEdit={onEdit}
          onPayment={onPayment}
          index={index}
          formatCurrency={formatCurrency}
          month={month}
          year={year}
        />
      ))}
    </div>
  );
};

export default TuitionTable;