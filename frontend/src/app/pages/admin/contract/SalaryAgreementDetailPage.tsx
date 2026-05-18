// src/app/salary/details/[id]/page.tsx (nếu dùng Next.js App Router)
// Hoặc src/app/pages/admin/SalaryAgreementDetailPage.tsx (nếu dùng React Router)

'use client';

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Download,
    School,
    Mail,
    BookOpen,
    Users,
    Timer,
    DollarSign,
    History,
    CheckCircle,
} from 'lucide-react';
import { teacherSubjectApi } from '../../../utils/api/teacherSubject.api';
import type { TeacherSubject } from '../../../utils/types/teacherSubject';

export function SalaryAgreementDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [agreement, setAgreement] = useState<TeacherSubject | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('id from params:', id);
        if (!id) return;
        teacherSubjectApi.getById(Number(id)).then(data => console.log('API data:', data));
        const fetchDetail = async () => {
            try {
                const data = await teacherSubjectApi.getById(Number(id));
                setAgreement(data);
            } catch (err) {
                console.error(err);
                setError('Không thể tải thông tin thỏa thuận.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (error || !agreement) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error || 'Không tìm thấy thỏa thuận'}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    // Lấy các trường từ agreement (đã được transform bởi API)
    const {
        teacherName,
        teacherAvatar,
        email,
        subjectName,
        grade,
        salaryRate,
        teacherId,
    } = agreement;

    // Giả định một số thông tin cố định cho hợp đồng (vì backend chưa trả hết)
    const contractNumber = `HD-${agreement.id || '0000'}`;
    const status = 'active'; // backend trả status có thể dựa vào ngày kết thúc, tạm thời active

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="px-4 md:px-8 py-6 pb-12 max-w-5xl mx-auto">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1 text-gray-500 hover:text-purple-600 mb-2 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm font-medium">Quay lại</span>
                        </button>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Chi tiết Thỏa thuận</h1>
                        <p className="text-gray-500 font-medium">Hợp đồng giảng dạy chính thức</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-gray-600 font-semibold hover:bg-gray-100 transition-all shadow-sm border border-gray-200">
                            <Download className="w-5 h-5" />
                            Xuất PDF
                        </button>
                    </div>
                </div>

                {/* Contract Canvas */}
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 border border-gray-200 relative overflow-hidden">
                    {/* Watermark */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                        <School className="w-80 h-80 text-purple-600" />
                    </div>

                    {/* Header */}
                    <div className="flex flex-col items-center text-center mb-8 relative z-10">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                            <School className="w-8 h-8 text-purple-600" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">EDUCENTER PRO</h2>
                        <p className="text-gray-500 text-sm font-medium tracking-widest uppercase mb-4">
                            Cộng hòa Xã hội Chủ nghĩa Việt Nam
                        </p>
                        <div className="h-[2px] w-24 bg-purple-200 mb-6"></div>
                        <h3 className="text-3xl font-extrabold text-gray-900 tracking-tighter mb-4">THỎA THUẬN GIẢNG DẠY</h3>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <span className="text-sm font-bold bg-gray-100 px-4 py-1.5 rounded-full text-gray-600">
                                Mã số: {contractNumber}
                            </span>
                            <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                                {status === 'active' ? 'Đang hiệu lực' : 'Hết hiệu lực'}
                            </div>
                        </div>
                    </div>

                    {/* Teacher Info Card */}
                    <div className="bg-purple-50 rounded-2xl p-5 mb-8 border border-purple-200">
                        <div className="flex flex-col md:flex-row items-start gap-5">
                            <div className="relative">
                                <img
                                    src={teacherAvatar || '/default-avatar.png'}
                                    alt={teacherName}
                                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-sm"
                                />
                                <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-1.5 rounded-lg shadow-md">
                                    <CheckCircle className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                                <div className="col-span-full">
                                    <p className="text-xs font-bold text-purple-700 uppercase tracking-widest mb-1">Bên B (Giáo viên)</p>
                                    <h4 className="text-2xl font-bold text-gray-900">{teacherName}</h4>
                                    <p className="text-gray-500 text-sm">Mã GV: {teacherId ? `GV${teacherId}` : '---'}</p>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Mail className="w-4 h-4 text-purple-500" />
                                    <span className="text-sm">{email || 'Chưa cập nhật'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Teaching Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-1">
                                <BookOpen className="w-5 h-5 text-purple-600" />
                                <h5 className="font-bold text-gray-900">Môn giảng dạy</h5>
                            </div>
                            <p className="text-lg font-bold text-gray-900 pl-7">{subjectName || 'Chưa cập nhật'}</p>
                            <p className="text-sm text-gray-500 pl-7">{grade ? `Lớp ${grade}` : ''}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Users className="w-5 h-5 text-purple-600" />
                                <h5 className="font-bold text-gray-900">Hình thức dạy</h5>
                            </div>
                            <p className="text-lg font-bold text-gray-900 pl-7">Kèm 1-1</p>
                            <p className="text-sm text-gray-500 pl-7">Trực tuyến (Zoom/Google Meet)</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Timer className="w-5 h-5 text-purple-600" />
                                <h5 className="font-bold text-gray-900">Thời gian tối đa</h5>
                            </div>
                            <p className="text-lg font-bold text-gray-900 pl-7">40 giờ / tháng</p>
                            <p className="text-sm text-gray-500 pl-7">Theo lịch đăng ký hàng tuần</p>
                        </div>
                    </div>

                    {/* Salary Terms */}
                    <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                        <h5 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-purple-600" />
                            Điều khoản Tài chính
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                                <p className="text-sm font-medium text-gray-500 mb-1">Lương theo giờ</p>
                                <p className="text-2xl font-black text-purple-600">{salaryRate || 'Chưa cập nhật'}</p>
                                <p className="text-xs text-gray-400 mt-2">Dựa trên thời gian dạy thực tế</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                                <p className="text-sm font-medium text-gray-500 mb-1">Phụ cấp chuyên cần</p>
                                <p className="text-2xl font-black text-gray-900">500.000 <span className="text-sm font-bold uppercase">VNĐ</span></p>
                                <p className="text-xs text-gray-400 mt-2">Thưởng nếu dạy đủ &gt;95% số buổi</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                                <p className="text-sm font-medium text-gray-500 mb-1">Ngày thanh toán</p>
                                <p className="text-2xl font-black text-gray-900">Mùng 5 <span className="text-sm font-bold uppercase">Hàng tháng</span></p>
                                <p className="text-xs text-gray-400 mt-2">Chuyển khoản vào tài khoản cá nhân</p>
                            </div>
                        </div>
                    </div>

                    {/* Clauses - static */}
                    <div className="space-y-6 mb-8 text-gray-600 leading-relaxed">
                        <div>
                            <h6 className="font-bold text-gray-900 mb-2">Điều 1: Trách nhiệm của Giáo viên</h6>
                            <p className="text-sm mb-2">1.1. Chuẩn bị giáo án đầy đủ và gửi cho Trung tâm duyệt trước mỗi khóa học ít nhất 03 ngày.</p>
                            <p className="text-sm">1.2. Đảm bảo đúng giờ giảng dạy và tác phong sư phạm chuẩn mực trong suốt quá trình làm việc.</p>
                        </div>
                        <div>
                            <h6 className="font-bold text-gray-900 mb-2">Điều 2: Quy định về Nghỉ phép và Thay thế</h6>
                            <p className="text-sm mb-2">2.1. Giáo viên có nhu cầu nghỉ phép phải thông báo trước ít nhất 24 giờ để Trung tâm sắp xếp học sinh.</p>
                            <p className="text-sm">2.2. Trường hợp vắng mặt không lý do chính đáng sẽ bị trừ 10% tổng lương tháng đó vào quỹ phạt chung.</p>
                        </div>
                        <div>
                            <h6 className="font-bold text-gray-900 mb-2">Điều 3: Bảo mật thông tin</h6>
                            <p className="text-sm">Giáo viên cam kết không tiết lộ các tài liệu học thuật độc quyền của Học viện Scholarly cho bất kỳ bên thứ ba nào khi chưa có sự đồng ý bằng văn bản.</p>
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-200">
                        <div className="text-center">
                            <p className="font-bold text-gray-900 mb-8">ĐẠI DIỆN TRUNG TÂM</p>
                            <div className="h-16 flex items-center justify-center">
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB74vIdieo9T_KY0Yjr33NknKCj03Ivi2hKvK6fW5t3OZFgXMJOYohJxQqk2dlNvUoOf6UBIvW2f1eMvkNZpmhZw8_j6glLVEpBfTd6zH0Ck7bXCI2lIjt1jLrizeJ8tqq4Y9E-gN031y7x9ZETJv3_pXJjhyg1GwOGsOhZ6a10PR7vQ_PEL0KCuDcfs7G61JKwBrM4H9OnsFL2id8sWSuQWLP58XDF08G_aORcM34Rn4dqPhTJSlEpl09J3qucQHr-QOVW0SwpEiYq"
                                    alt="Chữ ký quản lý"
                                    className="max-h-full opacity-70 grayscale"
                                />
                            </div>
                            <p className="mt-4 font-bold text-gray-900">Nguyễn Hoàng Anh Duy</p>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Giám đốc Trung Tâm</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-gray-900 mb-8">GIÁO VIÊN (BÊN B)</p>
                            <div className="h-16 flex items-center justify-center">
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6Q1fJmx9-Vf603o5Xld5BqNx8wj7P2iG_dpSXY_G2vbtZghrCs3M_5zBwIJng97owsNWXcpI8ZEaylTL17lTUC9CTl2T2Ud-wh0m0Yfzz85H3aCi5ZzOdJDBwxGeoTbtxvlNj8ei_aL5HWUUfZqoLbf8JKypJgEgfbW2EvNBvQZAkkSTfNGW1k7EfF5b7JgFP8OaJC4dJ-ByVk6rFyyu25WNlALkZAR46E5MPmU60TuVo2FHMXDroStfWKc6BnQ5mErm0ZIZeXeGc"
                                    alt="Chữ ký giáo viên"
                                    className="max-h-full opacity-80"
                                />
                            </div>
                            <p className="mt-4 font-bold text-gray-900">{teacherName}</p>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Giảng viên bộ môn {subjectName}</p>
                        </div>
                    </div>

                    {/* Footer stamp */}
                    <div className="mt-8 flex justify-end">
                        <div className="w-24 h-24 border-4 border-red-300/50 rounded-full flex items-center justify-center text-red-400 rotate-12 font-bold text-[10px] text-center p-2 leading-tight uppercase border-dashed">
                            EDUCENTER PRO<br />Đã kiểm tra<br />{new Date().getFullYear()}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}