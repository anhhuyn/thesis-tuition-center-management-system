import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import type { TuitionCalculationDTO } from '../../../utils/types/tuition';

interface TuitionInvoiceItemProps {
  invoice: TuitionCalculationDTO;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onPayment: (id: number) => void;
  index: number;
  formatCurrency: (amount: number) => string;
  month?: number;
  year?: number;
}

const TuitionInvoiceItem: React.FC<TuitionInvoiceItemProps> = ({
  invoice,
  onView,
  onEdit,
  onPayment,
  index,
  formatCurrency,
  month,
  year,
}) => {
  const navigate = useNavigate();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PAID':
        return {
          label: 'Đã thanh toán',
          icon: CheckCircle,
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-700',
          dotColor: 'bg-emerald-500',
          progressColor: 'bg-emerald-500',
          progressWidth: '100%',
        };
      case 'PARTIAL_PAID':
        const paidPercent = invoice.totalAmount > 0 ? (invoice.paidAmount / invoice.totalAmount) * 100 : 0;
        return {
          label: 'Một phần',
          icon: Clock,
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-700',
          dotColor: 'bg-amber-500',
          progressColor: 'bg-amber-500',
          progressWidth: `${Math.min(paidPercent, 100)}%`,
        };
      default:
        return {
          label: 'Chờ thanh toán',
          icon: AlertCircle,
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          dotColor: 'bg-red-500',
          progressColor: 'bg-red-500',
          progressWidth: '0%',
        };
    }
  };

  const statusConfig = getStatusConfig(invoice.status);
  const StatusIcon = statusConfig.icon;
  const initials = invoice.fullName
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleViewDetail = () => {
    console.log('🔍 Student ID:', invoice.studentId); // Debug
    console.log('🔍 Month:', month);
    console.log('🔍 Year:', year);

    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();
    navigate(`/admin/tuition/${invoice.studentId}?month=${currentMonth}&year=${currentYear}`);
  };

  return (
    <div
      className="grid grid-cols-12 gap-3 items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 group"
      style={{ transitionDelay: `${index * 0.05}s` }}
    >
      {/* Student Info */}
      <div className="col-span-4 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center font-semibold text-indigo-600 text-sm font-headline flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <h4 className="font-medium text-sm text-gray-900 truncate">{invoice.fullName}</h4>
          <p className="text-[10px] text-gray-400">Mã: #{invoice.studentId}</p>
        </div>
      </div>

      {/* Class */}
      <div className="col-span-2">
        <p className="text-sm font-medium text-gray-600">
          Lớp {invoice.grade}
        </p>
        <p className="text-[10px] text-gray-400 truncate">{invoice.phoneNumber}</p>
      </div>

      {/* Payment Progress */}
      <div className="col-span-3">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-gray-500">
            Đã đóng: {formatCurrency(invoice.paidAmount)}
          </span>
          {invoice.remainingAmount > 0 && (
            <span className="font-semibold text-red-500">
              Nợ: {formatCurrency(invoice.remainingAmount)}
            </span>
          )}
        </div>
        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
          <div
            className={`${statusConfig.progressColor} h-full rounded-full transition-all duration-500`}
            style={{ width: statusConfig.progressWidth }}
          ></div>
        </div>
      </div>

      {/* Status */}
      <div className="col-span-2">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor} text-[10px] font-medium`}>
          <StatusIcon className="w-3 h-3" />
          {statusConfig.label}
        </span>
      </div>

      {/* Actions */}
      <div className="col-span-1 flex justify-end gap-0.5">
        
        <button
          onClick={handleViewDetail}
          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          title="Xem chi tiết"
        >
          <Eye className="w-4 h-4" />
        </button>
      
      </div>
    </div>
  );
};

export default TuitionInvoiceItem;