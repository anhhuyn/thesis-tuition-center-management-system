// src/app/pages/admin/TuitionDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Printer,
  FileText,
  CreditCard,
  TrendingUp,
  Calendar,
  Clock,
  History,
  MessageCircle,
  X,
  Trash2,
  PlusCircle,
  Landmark,
  AlertCircle,
  User,
  Loader2,
  CheckCircle,
  ArrowLeft,
  Download,
  Share2,
  MoreVertical,
  Receipt,
  BookOpen,
  Users,
  DollarSign,
  Award,
} from 'lucide-react';
import { ProtectedRoute } from '../../routes/ProtectedRoute';
import { tuitionApi } from '../../utils/api/tuition.api';
import type { TuitionDetailResponse, TuitionDetailItem } from '../../utils/types/tuition';

interface TuitionDetailData {
  id: number;
  studentName: string;
  studentCode: string;
  grade: string;
  avatar: string;
  status: 'PAID' | 'PARTIAL' | 'PENDING' | 'WAITING_PAYMENT';
  totalTuition: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  courses: number;
  attendance: number;
  totalHours: number;
  scholarship: number;
  items: TuitionItem[];
  transactions: Transaction[];
}

interface TuitionItem {
  id: number;
  name: string;
  code: string;
  teacher: string;
  sessions: number;
  unitPrice: number;
  total: number;
  discount?: number;
}

interface Transaction {
  id: number;
  description: string;
  date: string;
  method: string;
  amount: number;
  type: 'income' | 'pending';
}

export const TuitionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TuitionDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchTuitionDetail();
    }
  }, [id]);

  const fetchTuitionDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams(window.location.search);
      const studentId = parseInt(id || '0');
      const month = parseInt(params.get('month') || new Date().getMonth().toString());
      const year = parseInt(params.get('year') || new Date().getFullYear().toString());

      console.log('📤 Fetching detail for:', { studentId, month, year });

      const response = await tuitionApi.getTuitionDetail(studentId, month, year);
      console.log('📊 API Response:', response);

      if (!response) {
        setError(`Không tìm thấy học phí của học sinh ID ${studentId} trong tháng ${month}/${year}`);
        setLoading(false);
        return;
      }

      const transformedData: TuitionDetailData = {
        id: response.id || 0,
        studentName: response.student?.userInfo?.fullName || response.studentName || 'Học sinh',
        studentCode: response.studentCode || `#SCH${response.student?.id || response.studentId || studentId}`,
        grade: response.student?.grade || '',
        avatar: response.student?.userInfo?.image || '',
        status: mapStatus(response.status || 'WAITING_PAYMENT'),
        totalTuition: response.totalAmount || 0,
        paidAmount: response.paidAmount || 0,
        remainingAmount: response.remainingAmount || 0,
        dueDate: response.dueDate || new Date(response.createdAt || Date.now()).toLocaleDateString('vi-VN'),
        courses: response.details?.length || 0,
        attendance: 94,
        totalHours: calculateTotalHours(response.details),
        scholarship: response.details?.reduce((sum, d) => sum + (d.totalMoney || 0) * 0.2, 0) || 0,
        items: response.details?.map((d, index) => ({
          id: d.id || index,
          name: d.subject?.name || d.subjectName || `Môn học ${index + 1}`,
          code: d.subject?.id?.toString() || d.subjectCode || '',
          teacher: d.teacher || '',
          sessions: d.attendedSessions || d.sessions || 0,
          unitPrice: d.unitPrice || (d.totalMoney || 0) / (d.attendedSessions || 1),
          total: d.totalMoney || d.amount || 0,
          discount: d.discount || 0,
        })) || [],
        transactions: []
      };

      setData(transformedData);

    } catch (err) {
      console.error('❌ Failed to fetch tuition detail:', err);
      setError('Không thể tải thông tin học phí. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const mapStatus = (status: string): 'PAID' | 'PARTIAL' | 'PENDING' | 'WAITING_PAYMENT' => {
    if (status === 'PAID') return 'PAID';
    if (status === 'PARTIAL_PAID') return 'PARTIAL';
    return 'PENDING';
  };

  const calculateTotalHours = (details?: TuitionDetailItem[]): number => {
    return details?.reduce((sum, d) => sum + (d.totalHours || 0), 0) || 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return {
          label: 'Đã thanh toán',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'PARTIAL':
        return {
          label: 'Một phần',
          className: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      default:
        return {
          label: 'Chờ thanh toán',
          className: 'bg-red-50 text-red-700 border-red-200'
        };
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    const amount = parseInt(paymentAmount.replace(/\D/g, ''));
    if (amount <= 0) {
      alert('Vui lòng nhập số tiền thanh toán!');
      return;
    }
    if (amount > data.remainingAmount) {
      alert(`Số tiền không được vượt quá số dư nợ (${formatCurrency(data.remainingAmount)})`);
      return;
    }

    setShowPaymentModal(false);
    setShowLoadingOverlay(true);

    try {
      await tuitionApi.payTuition(data.id, amount);
      await fetchTuitionDetail();
      alert(`✅ Thanh toán thành công ${formatCurrency(amount)}!`);
      setPaymentAmount('');
    } catch (err) {
      console.error('Payment failed:', err);
      alert('❌ Thanh toán thất bại. Vui lòng thử lại!');
    } finally {
      setShowLoadingOverlay(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['R0']}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin"></div>
            </div>
            <p className="text-slate-500 font-medium">Đang tải thông tin học phí...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !data) {
    return (
      <ProtectedRoute allowedRoles={['R0']}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy dữ liệu</h2>
            <p className="text-slate-500">{error || 'Không tìm thấy thông tin học phí'}</p>
            <button
              onClick={() => navigate('/admin/tuition')}
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const statusBadge = getStatusBadge(data.status);
  const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
  const totalAfterDiscount = subtotal - data.scholarship;
  const paymentProgress = data.totalTuition > 0 ? (data.paidAmount / data.totalTuition) * 100 : 0;

  return (
    <ProtectedRoute allowedRoles={['R0']}>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
          

          {/* Header Section */}
          <header className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  {data.avatar ? (
                    <img
                      src={data.avatar}
                      alt={data.studentName}
                      className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-50"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center ring-4 ring-indigo-50">
                      <User className="w-10 h-10 text-indigo-600" />
                    </div>
                  )}
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${data.status === 'PAID' ? 'bg-emerald-500' : data.status === 'PARTIAL' ? 'bg-amber-500' : 'bg-red-500'
                    }`}></div>
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{data.studentName}</h1>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusBadge.className} flex items-center gap-1.5`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${data.status === 'PAID' ? 'bg-emerald-500' : data.status === 'PARTIAL' ? 'bg-amber-500' : 'bg-red-500'
                        }`}></span>
                      {statusBadge.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500">
                    <span className="font-medium">{data.studentCode}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>Lớp {data.grade}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                
                {data.status !== 'PAID' && (
                  <button
                    onClick={() => {
                      setPaymentAmount(data.remainingAmount.toString());
                      setShowPaymentModal(true);
                    }}
                    className="flex-1 md:flex-none px-6 py-2.5 btn-gradient text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-600/30"
                  >
                    <CreditCard className="w-4 h-4" />
                    Thanh toán ngay
                  </button>
                )}
               
              </div>
            </div>
          </header>

          {/* KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Tổng học phí</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1.5">{formatCurrency(data.totalTuition)}</h3>
                </div>
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Landmark className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                +5% so với kỳ trước
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Đã thanh toán</p>
                  <h3 className="text-2xl font-bold text-emerald-600 mt-1.5">{formatCurrency(data.paidAmount)}</h3>
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-slate-600 min-w-[40px] text-right">
                  {Math.round(paymentProgress)}%
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Còn phải thu</p>
                  <h3 className="text-2xl font-bold text-amber-600 mt-1.5">{formatCurrency(data.remainingAmount)}</h3>
                </div>
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>Hạn chót: <span className="font-medium text-slate-700">{data.dueDate}</span></span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Tổng giờ học</p>
                  <h3 className="text-2xl font-bold text-purple-600 mt-1.5">{data.totalHours}h</h3>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{data.courses} môn học</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Invoice */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-50/50 to-white">
                  <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-indigo-600" />
                      Chi tiết học phần
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Học kỳ 1 - Năm học 2023-2024</p>
                  </div>
                  <span className="text-xs font-medium text-slate-400 bg-white px-3 py-1 rounded-lg border border-slate-200">
                    {data.items.length} môn học
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                        <th className="px-6 py-4 font-semibold">Môn học / Nội dung</th>
                        <th className="px-6 py-4 font-semibold text-center">Số buổi</th>
                        <th className="px-6 py-4 font-semibold text-right">Đơn giá</th>
                        <th className="px-6 py-4 font-semibold text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {data.items.map((item, index) => (
                        <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{item.name}</div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              <span>Mã: {item.code}</span>
                              {item.teacher && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                  <span>GV: {item.teacher}</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-medium text-slate-700">{item.sessions}</td>
                          <td className="px-6 py-4 text-right font-medium text-slate-700">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-6 py-4 text-right font-bold text-slate-900">{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50/50 border-t border-slate-100">
                      
                      <tr className="border-t-2 border-slate-200 bg-gradient-to-r from-indigo-50/30 to-purple-50/30">
                        <td className="px-6 py-5 text-right font-bold text-lg text-slate-900" colSpan={3}>Tổng cộng:</td>
                        <td className="px-6 py-5 text-right font-bold text-2xl gradient-text">
                          {formatCurrency(totalAfterDiscount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  Tổng quan
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                      <span>Số môn học</span>
                    </div>
                    <span className="font-bold text-slate-900">{data.courses}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span>Tổng số buổi</span>
                    </div>
                    <span className="font-bold text-slate-900">{data.items.reduce((sum, item) => sum + item.sessions, 0)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>Giáo viên</span>
                    </div>
                    <span className="font-bold text-slate-900">{new Set(data.items.map(item => item.teacher).filter(Boolean)).size}</span>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Tình trạng thanh toán
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Đã thanh toán</span>
                    <span className="font-semibold text-emerald-600">{formatCurrency(data.paidAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Còn lại</span>
                    <span className="font-semibold text-amber-600">{formatCurrency(data.remainingAmount)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-center text-xs text-slate-400 mt-2">
                    {Math.round(paymentProgress)}% hoàn thành
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md relative shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-4 duration-300">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-t-2xl">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  Xác nhận thanh toán
                </h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form className="p-6 space-y-6" onSubmit={handlePayment}>
                {/* Student Info */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Học sinh:</span>
                    <span className="font-medium text-slate-900">{data.studentName}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Lớp:</span>
                    <span className="font-medium text-slate-900">Lớp {data.grade}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                    <span className="text-slate-500">Số tiền còn lại:</span>
                    <span className="font-bold text-amber-600">{formatCurrency(data.remainingAmount)}</span>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Số tiền thanh toán
                  </label>
                  <div className="relative">
                    <input
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-lg font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      type="text"
                      value={new Intl.NumberFormat('vi-VN').format(parseInt(paymentAmount.replace(/\D/g, '')) || 0)}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setPaymentAmount(value);
                      }}
                      placeholder="Nhập số tiền..."
                      autoFocus
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400">VNĐ</span>
                  </div>
                  <div className="flex items-center justify-between mt-2.5">
                    <p className="text-xs text-amber-600 font-medium">
                      * Tối đa: {formatCurrency(data.remainingAmount)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setPaymentAmount(data.remainingAmount.toString())}
                      className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                    >
                      Thanh toán toàn bộ
                    </button>
                  </div>
                </div>

                {/* Payment Method Info */}
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <div className="flex items-center gap-2 text-sm text-emerald-700">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Xác nhận qua admin</span>
                    <span className="text-xs text-emerald-500 ml-auto">(Ghi nhận thanh toán)</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 btn-gradient text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                  >
                    <CheckCircle className="w-5 h-5 inline mr-2" />
                    Xác nhận
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {showLoadingOverlay && (
          <div className="fixed inset-0 z-[200] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Đang xử lý giao dịch...</h2>
            <p className="text-slate-500 mt-2 font-medium">Vui lòng không đóng trình duyệt</p>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
};

export default TuitionDetailPage;