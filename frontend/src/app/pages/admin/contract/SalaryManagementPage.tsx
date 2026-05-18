// src/app/salary/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { teacherSubjectApi } from '../../../utils/api/teacherSubject.api';
import { SalaryStats } from '../../../components/adminComponents/salary/SalaryStats';
import { SalaryToolbar } from '../../../components/adminComponents/salary/SalaryToolbar';
import { TeacherCard } from '../../../components/adminComponents/salary/TeacherCard';
import { SalaryPagination } from '../../../components/adminComponents/salary/SalaryPagination';
import { SalaryAgreementModal } from '../../../components/adminComponents/salary/SalaryAgreementModal';
import type { TeacherSubject, TeacherSubjectRequest } from '../../../utils/types/teacherSubject';
import { useOutletContext } from 'react-router-dom';

export function SalaryManagementPage() {
    const { setAlert } = useOutletContext<any>();
    const [agreements, setAgreements] = useState<TeacherSubject[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>();
    const [selectedGrade, setSelectedGrade] = useState<number | undefined>();
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAgreement, setEditingAgreement] = useState<TeacherSubject | null>(null);
    const itemsPerPage = 8;

    const fetchAgreements = useCallback(async () => {
        setLoading(true);
        try {
            const data = await teacherSubjectApi.getAll({
                teacherName: searchQuery || undefined,
                subjectName: undefined,
                grade: selectedGrade,
            });
            let filtered = Array.isArray(data) ? data : [];
            if (selectedSubjectId) {
                filtered = filtered.filter(a => a.subjectId === selectedSubjectId);
            }
            if (searchQuery) {
                filtered = filtered.filter(a =>
                    a.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }
            setAgreements(filtered);
            setCurrentPage(1);
        } catch (error: any) {
            console.error('Fetch error:', error);
            setAlert?.({ type: 'error', message: error.response?.data?.message || 'Không thể tải dữ liệu' });
            setAgreements([]); // Quan trọng: đặt lại mảng rỗng
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedSubjectId, selectedGrade, setAlert]);
    useEffect(() => {
        fetchAgreements();
    }, [fetchAgreements]);

    const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa thỏa thuận này?')) return;
    try {
        const res = await teacherSubjectApi.delete(id);
        console.log('Delete response:', res); // debug
        // Xóa thành công nếu không có lỗi hoặc res.errCode === 0
        if (!res || res.errCode === 0 || res.code === 0 || res.success === true) {
            setAlert?.({ type: 'success', message: 'Xóa thành công' });
            fetchAgreements();
        } else {
            setAlert?.({ type: 'error', message: res?.message || 'Xóa thất bại' });
        }
    } catch (error: any) {
        setAlert?.({ type: 'error', message: error.response?.data?.message || 'Xóa thất bại' });
    }
};

    const handleAdd = () => {
        setEditingAgreement(null);
        setIsModalOpen(true);
    };

    const handleEdit = (agreement: TeacherSubject) => {
        setEditingAgreement(agreement);
        setIsModalOpen(true);
    };

    const handleSave = async (data: TeacherSubjectRequest) => {
        try {
            let res;
            if (editingAgreement) {
                res = await teacherSubjectApi.update(editingAgreement.id, data);
            } else {
                res = await teacherSubjectApi.create(data);
            }
            if (res.errCode === 0) {
                setAlert?.({ type: 'success', message: editingAgreement ? 'Cập nhật thành công' : 'Thêm thành công' });
                setIsModalOpen(false);
                fetchAgreements();
            }  else {
            setAlert?.({ type: 'error', message: res?.message || 'Lưu thất bại' });
            }
        } catch (error: any) {
            setAlert?.({ type: 'error', message: error.response?.data?.message || 'Lưu thất bại' });
        }
    };

    const paginatedAgreements = (agreements || []).slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(agreements.length / itemsPerPage);

    // Tính toán thống kê từ agreements thực tế
    const stats = {
        totalAgreements: agreements.length,
        totalTeachers: new Set(agreements.map(a => a.teacherId)).size,
        averageRate: agreements.length
            ? Math.round(agreements.reduce((sum, a) => sum + parseSalaryRate(a.salaryRate), 0) / agreements.length / 1000)
            : 0,
        highestRate: agreements.length
            ? Math.round(Math.max(...agreements.map(a => parseSalaryRate(a.salaryRate))) / 1000)
            : 0,
    };

    function parseSalaryRate(rateStr: string): number {
        const match = rateStr.match(/(\d+(?:,\d+)*)/);
        if (!match) return 0;
        return parseInt(match[0].replace(/,/g, ''), 10);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <main className="flex-grow px-8 py-12 max-w-7xl mx-auto w-full">
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-3 font-headline">
                        Quản lý Thỏa thuận Lương
                    </h1>
                    <p className="text-gray-500 max-w-2xl leading-relaxed">
                        Hệ thống hóa quy trình thỏa thuận thù lao giảng dạy. Theo dõi, cập nhật và quản lý mức lương
                        của đội ngũ giảng viên một cách minh bạch và hiệu quả.
                    </p>
                </div>

                <SalaryStats stats={stats} />

                <SalaryToolbar
                    searchQuery={searchQuery}
                    onSearchChange={(e) => setSearchQuery(e.target.value)}
                    selectedSubjectId={selectedSubjectId}
                    onSubjectChange={setSelectedSubjectId}
                    selectedGrade={selectedGrade}
                    onGradeChange={setSelectedGrade}
                    onAddAgreement={handleAdd}
                    onClearFilters={() => {
                        setSearchQuery('');
                        setSelectedSubjectId(undefined);
                        setSelectedGrade(undefined);
                    }}
                />

                {loading ? (
                    <div className="text-center py-20">Đang tải dữ liệu...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                            {paginatedAgreements.map((agreement) => (
                                <TeacherCard
                                    key={agreement.id}
                                    agreement={agreement}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <SalaryPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </>
                )}
            </main>

            <SalaryAgreementModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingAgreement}
                isEdit={!!editingAgreement}
            />
        </div>
    );
}