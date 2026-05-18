import React, { useEffect, useMemo, useState } from 'react';
import {
    X,
    Plus,
    Delete,
    CloudUpload,
    Link,
    ChevronDown,
    Phone,
    BadgePlus,
    Sparkles
} from 'lucide-react';
import { ModalPortal } from '../../../pages/ModalPortal';
import type { TeacherBasic } from '../../../utils/types/teacher';
import { sessionApi, subjectApi, teacherApi } from '../../../utils/api';
import { getImageSrc, getInitials } from '../../../utils/helpers';
import type { SessionOfTeacher } from '../../../utils/types/session';
import type { CreateSubjectRequest, Subject } from '../../../utils/types/subject';
import { useOutletContext } from 'react-router-dom';

interface AddClassModalProps {
    isOpen: boolean;
    onClose: () => void;

    mode?: "create" | "update";
    initialData?: Subject | null;

    onSubmit?: (data: CreateSubjectRequest) => void;
    onSuccess?: (updated: Subject) => void;
}

export const AddClassModal: React.FC<AddClassModalProps> = ({ isOpen, onClose, mode, initialData, onSubmit, onSuccess }) => {
    const { setAlert } = useOutletContext<any>()
    const [formData, setFormData] = useState<CreateSubjectRequest>({
        name: '',
        grade: '',
        price: undefined,
        status: 'active',
        maxStudents: '',
        sessionsPerWeek: '',
        note: '',
        teacherId: undefined,
        image: null,
    })
    const [teacherList, setTeacherList] = useState<TeacherBasic[]>([])
    const [loadingTeachers, setLoadingTeachers] = useState(false)
    const [schedule, setSchedule] = useState<SessionOfTeacher[]>([]);
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null)
    const [showAiSuggestions] = useState(true);

    const [subjectTypes, setSubjectTypes] = useState<any[]>([])
    const [selectedSubjectType, setSelectedSubjectType] = useState<number | null>(null)

    const selectedTeacherData = teacherList.find(
        t => t.id === selectedTeacher
    )

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                setLoadingTeachers(true)
                const data = await teacherApi.getBasicTeachers()
                setTeacherList(data)
            } catch (err) {
                console.error('Lỗi lấy giáo viên:', err)
            } finally {
                setLoadingTeachers(false)
            }
        }

        fetchTeachers()
    }, [])

    useEffect(() => {
        if (mode === "update" && initialData) {
            setFormData({
                name: initialData.name,
                grade: initialData.grade,
                price: initialData.price,
                status: initialData.status,
                maxStudents: String(initialData.maxStudents),
                sessionsPerWeek: String(initialData.sessionsPerWeek),
                note: initialData.note,
                teacherId: initialData.teacherSubjects?.[0]?.teacher?.id,
                image: null,
                imageUrl: initialData.image || ""
            })

            setSelectedTeacher(
                initialData.teacherSubjects?.[0]?.teacher?.id || null
            )
            setSelectedSubjectType(initialData.subjectType?.id || null);

            setPreviewImage(initialData.image || null)
        }
    }, [mode, initialData])

    useEffect(() => {
        if (selectedTeacher === null) return;
        const fetchSchedule = async () => {
            try {
                setLoading(true);
                const startDate = "2026-03-10";
                const endDate = "2026-04-15";
                const data = await sessionApi.getTeacherSchedule(selectedTeacher, startDate, endDate);
                console.log(selectedTeacher, startDate, endDate);
                console.log(data);
                setSchedule(data);
            } catch (err) {
                console.error('Lỗi lấy lịch giáo viên:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [selectedTeacher]);

    useEffect(() => {
        return () => {
            if (previewImage) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [previewImage]);

    useEffect(() => {
        const fetchSubjectTypes = async () => {
            try {
                const data = await subjectApi.getSubjectTypes()
                setSubjectTypes(data)
            } catch (err) {
                console.error(err)
            }
        }

        fetchSubjectTypes()
    }, [])

    // Thêm state cho schedule của tất cả giáo viên
    const [teacherSchedules, setTeacherSchedules] = useState<Map<number, SessionOfTeacher[]>>(new Map());
    const [loadingSchedules, setLoadingSchedules] = useState(false);

    // Fetch schedule cho tất cả giáo viên
    useEffect(() => {
        const fetchAllTeacherSchedules = async () => {
            if (teacherList.length === 0) return;

            setLoadingSchedules(true);
            const startDate = new Date().toISOString().split('T')[0]; // Ngày hiện tại
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 2); // Lấy lịch 2 tháng tới
            const endDateStr = endDate.toISOString().split('T')[0];

            const schedulesMap = new Map<number, SessionOfTeacher[]>();

            // Fetch schedule cho từng giáo viên (có thể tối ưu bằng Promise.all)
            await Promise.all(
                teacherList.map(async (teacher) => {
                    try {
                        const schedule = await sessionApi.getTeacherSchedule(
                            teacher.id,
                            startDate,
                            endDateStr
                        );
                        schedulesMap.set(teacher.id, schedule);
                    } catch (err) {
                        console.error(`Lỗi lấy lịch cho giáo viên ${teacher.id}:`, err);
                        schedulesMap.set(teacher.id, []);
                    }
                })
            );

            setTeacherSchedules(schedulesMap);
            setLoadingSchedules(false);
        };

        fetchAllTeacherSchedules();
    }, [teacherList]);

    const handleInputChange = (
        field: keyof CreateSubjectRequest,
        value: any
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleTeacherSelect = (teacherId: number) => {
        setSelectedTeacher(teacherId)

        handleInputChange('teacherId', teacherId)
    }

    const handleRemoveTeacher = () => {
        setSelectedTeacher(null)
        handleInputChange('teacherId', undefined)
    }

    const handleImageUpload = (file: File) => {
        const imageUrl = URL.createObjectURL(file);
        setPreviewImage(imageUrl);

        handleInputChange('image', file);
        handleInputChange('imageUrl', undefined);
    };
    const handleImageUrlChange = (url: string) => {
        handleInputChange('imageUrl', url)
        handleInputChange('image', null)

        setPreviewImage(url || null)
    }

    const handleRemoveImage = () => {
        setPreviewImage(null);
        handleInputChange('image', null)
        handleInputChange('imageUrl', '')
    };

    // AddClassModal.tsx - Cập nhật handleSubmit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (mode === "update" && initialData) {
                await subjectApi.update(initialData.id, {
                    name: formData.name,
                    grade: formData.grade,
                    price: formData.price,
                    teacherId: formData.teacherId,
                    note: formData.note,
                    subjectTypeId: formData.subjectTypeId,
                    status: formData.status,
                    maxStudents: Number(formData.maxStudents),
                    sessionsPerWeek: Number(formData.sessionsPerWeek),

                });
                setAlert?.({
                    type: "success",
                    message: "Cập nhật lớp học thành công"
                });

                onClose();

                // Gọi onSuccess với initialData để báo hiệu cần refresh
                if (onSuccess) {
                    onSuccess(initialData);
                }
            } else {
                await subjectApi.create(formData);
                setAlert?.({
                    type: "success",
                    message: "Tạo lớp học thành công"
                });
                onClose();

                // Gọi onSuccess sau khi create thành công
                if (onSuccess) {
                    onSuccess(formData as any);
                }
            }

        } catch (err: any) {
            const code = err.response?.data?.code;

            if (code === "TEACHER_UNPAID_CHANGE") {
                setAlert?.({
                    type: "error",
                    message: "Không thể đổi giáo viên vì còn nợ lương"
                });
            } else {
                setAlert?.({
                    type: "error",
                    message: "Có lỗi xảy ra, vui lòng thử lại"
                });
            }
        }
    };

    // Hàm tính số buổi trống trong khung giờ mong muốn
    const calculateAvailabilityScore = (
        teacherSchedule: SessionOfTeacher[],
        desiredTimeSlots?: { dayOfWeek: number; startTime: string; endTime: string }[]
    ): number => {
        if (!desiredTimeSlots || desiredTimeSlots.length === 0) {
            // Nếu không có khung giờ mong muốn, ưu tiên giáo viên có ít lịch hơn
            const totalSessions = teacherSchedule.length;
            if (totalSessions === 0) return 100;
            if (totalSessions <= 5) return 80;
            if (totalSessions <= 10) return 60;
            if (totalSessions <= 15) return 40;
            return 20;
        }

        // Đếm số khung giờ trống
        let availableSlots = 0;

        for (const desiredSlot of desiredTimeSlots) {
            const isOccupied = teacherSchedule.some(session => {
                const sessionDate = new Date(session.startTime);
                const sessionDayOfWeek = sessionDate.getDay(); // 0-6 (Chủ nhật - Thứ 7)

                // Kiểm tra cùng ngày trong tuần
                if (sessionDayOfWeek !== desiredSlot.dayOfWeek) return false;

                // Kiểm tra thời gian có trùng không
                const sessionStart = session.startTime.substring(11, 16);
                const sessionEnd = session.endTime.substring(11, 16);

                return (
                    (sessionStart >= desiredSlot.startTime && sessionStart < desiredSlot.endTime) ||
                    (sessionEnd > desiredSlot.startTime && sessionEnd <= desiredSlot.endTime) ||
                    (sessionStart <= desiredSlot.startTime && sessionEnd >= desiredSlot.endTime)
                );
            });

            if (!isOccupied) availableSlots++;
        }

        // Tính điểm dựa trên số khung giờ trống
        return (availableSlots / desiredTimeSlots.length) * 100;
    };

    // Hàm tính điểm dựa trên lịch rảnh trong tương lai
    const calculateFutureAvailabilityScore = (teacherSchedule: SessionOfTeacher[]): number => {
        const now = new Date();
        const twoWeeksLater = new Date();
        twoWeeksLater.setDate(now.getDate() + 14);

        // Đếm số buổi dạy trong 2 tuần tới
        const upcomingSessions = teacherSchedule.filter(session => {
            const sessionDate = new Date(session.startTime);
            return sessionDate >= now && sessionDate <= twoWeeksLater;
        });

        // Giáo viên càng ít lịch trong tương lai càng được ưu tiên
        if (upcomingSessions.length === 0) return 100;
        if (upcomingSessions.length <= 2) return 80;
        if (upcomingSessions.length <= 4) return 60;
        if (upcomingSessions.length <= 6) return 40;
        return 20;
    };

    const suggested = useMemo(() => {
        if (!formData.name) return [];

        // Khung giờ mong muốn (có thể lấy từ form hoặc để mặc định)
        const desiredTimeSlots = [
            { dayOfWeek: 2, startTime: "18:00", endTime: "21:00" }, // Thứ 3 tối
            { dayOfWeek: 4, startTime: "18:00", endTime: "21:00" }, // Thứ 5 tối
            { dayOfWeek: 6, startTime: "18:00", endTime: "21:00" }, // Thứ 7 tối
        ];

        return teacherList
            .map((teacher) => {
                let score = 0;

                // 1. Điểm chuyên môn (60%)
                if (teacher.specialty.toLowerCase().includes(formData.name.toLowerCase())) {
                    score += 60;
                }

                // 2. Điểm kinh nghiệm dạy khối lớp (10%)
                if (formData.grade.includes('12')) {
                    score += 10;
                }

                // 3. Điểm dựa trên lịch trống (20%)
                const teacherSchedule = teacherSchedules.get(teacher.id) || [];
                const availabilityScore = calculateAvailabilityScore(teacherSchedule, desiredTimeSlots);
                score += availabilityScore * 0.2;

                // 4. Điểm dựa trên lịch rảnh tương lai gần (5%)
                const futureAvailabilityScore = calculateFutureAvailabilityScore(teacherSchedule);
                score += futureAvailabilityScore * 0.05;

                // 5. Random nhỏ để tạo đa dạng (5%)
                score += Math.floor(Math.random() * 5);

                return {
                    ...teacher,
                    match: Math.min(Math.floor(score), 100),
                    availableSlots: teacherSchedule.length, // Thêm thông tin số buổi đã có lịch
                };
            })
            .sort((a, b) => b.match - a.match)
            .slice(0, 3);
    }, [teacherList, teacherSchedules, formData.name, formData.grade]);

    if (!isOpen) return null;

    return (
        <ModalPortal isOpen={isOpen}>
            <div onClick={onClose} className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300"
                    onClick={(e) => e.stopPropagation()}>
                    {/* Modal Header */}
                    <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 shadow-sm">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {mode === "update" ? "Cập nhật lớp học" : "Thêm lớp học mới"}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">Khởi tạo lộ trình học tập cho học sinh</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Information Section */}
                            <section className="space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-violet-600 rounded-full"></div>
                                    <h4 className="text-xs font-bold text-violet-600 uppercase tracking-wider">Thông tin cơ bản</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                    {/* Tên môn học */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-semibold text-slate-900 px-1">
                                            Tên môn học <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <input
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className="h-11 px-4 rounded-xl bg-gray-100 border border-transparent hover:border-gray-300 hover:bg-white focus:ring-4 focus:ring-violet-600/10 focus:bg-white focus:border-violet-600 transition-all duration-200 text-sm outline-none placeholder:text-gray-400"
                                            placeholder="VD: Toán học nâng cao"
                                            type="text"
                                            required
                                        />
                                    </div>

                                    {/* Subject Type */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-semibold text-slate-900 px-1">
                                            Loại môn học <span className="text-red-500">*</span>
                                        </label>

                                        <div className="relative">
                                            <select
                                                value={selectedSubjectType ?? ''}
                                                onChange={(e) => {
                                                    const id = Number(e.target.value)
                                                    setSelectedSubjectType(id)
                                                    handleInputChange('subjectTypeId', id)
                                                }}
                                                className="appearance-none w-full h-11 px-4 rounded-xl bg-gray-100 border border-transparent hover:border-gray-300 hover:bg-white focus:ring-4 focus:ring-violet-600/10 focus:bg-white focus:border-violet-600 transition-all duration-200 text-sm outline-none cursor-pointer text-gray-700 pr-10"
                                                required
                                            >
                                                <option value="">Chọn loại môn</option>

                                                {subjectTypes.map((type) => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.name} - {type.academicLevel?.name}
                                                    </option>
                                                ))}
                                            </select>

                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Khối/lớp */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-semibold text-slate-900 px-1">
                                            Khối / Lớp <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formData.grade}
                                                onChange={(e) => handleInputChange('grade', e.target.value)}
                                                className="appearance-none w-full h-11 px-4 rounded-xl bg-gray-100 border border-transparent hover:border-gray-300 hover:bg-white focus:ring-4 focus:ring-violet-600/10 focus:bg-white focus:border-violet-600 transition-all duration-200 text-sm outline-none cursor-pointer text-gray-700 pr-10"
                                                required
                                            >
                                                <option value="" className="text-gray-500">
                                                    Chọn khối học
                                                </option>

                                                <option value="1">Lớp 1</option>
                                                <option value="2">Lớp 2</option>
                                                <option value="3">Lớp 3</option>
                                                <option value="4">Lớp 4</option>
                                                <option value="5">Lớp 5</option>
                                                <option value="6">Lớp 6</option>
                                                <option value="7">Lớp 7</option>
                                                <option value="8">Lớp 8</option>
                                                <option value="9">Lớp 9</option>
                                                <option value="10">Lớp 10</option>
                                                <option value="11">Lớp 11</option>
                                                <option value="12">Lớp 12</option>

                                                <option value="university">Ôn thi Đại học</option>
                                            </select>

                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 w-4 h-4" />
                                        </div>
                                    </div>

                                    {/* Học phí */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-semibold text-slate-900 px-1">
                                            Học phí hàng tháng <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                value={formData.price ?? ''}
                                                onChange={(e) => handleInputChange('price', Number(e.target.value))}
                                                className="w-full h-11 px-4 pr-16 rounded-xl bg-gray-100 border border-transparent hover:border-gray-300 hover:bg-white focus:ring-4 focus:ring-violet-600/10 focus:bg-white focus:border-violet-600 transition-all duration-200 text-sm outline-none placeholder:text-gray-400"
                                                placeholder="500,000"
                                                type="number"
                                                required
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded">VNĐ</span>
                                        </div>
                                    </div>

                                    {/* Trạng thái */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-semibold text-slate-900 px-1">
                                            Trạng thái vận hành <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formData.status}
                                                onChange={(e) => handleInputChange('status', e.target.value)}
                                                className="appearance-none w-full h-11 px-4 rounded-xl bg-gray-100 border border-transparent hover:border-gray-300 hover:bg-white focus:ring-4 focus:ring-violet-600/10 focus:bg-white focus:border-violet-600 transition-all duration-200 text-sm outline-none cursor-pointer text-gray-700 pr-10"
                                            >
                                                <option value="active">Đang học</option>
                                                <option value="upcoming">Sắp khai giảng</option>
                                                <option value="ended">Đã kết thúc</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 w-4 h-4" />
                                        </div>
                                    </div>

                                    {/* Số học sinh tối đa */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-semibold text-slate-900 px-1">
                                            Sĩ số tối đa <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                value={formData.maxStudents}
                                                onChange={(e) => handleInputChange('maxStudents', e.target.value)}
                                                className="w-full h-11 px-4 rounded-xl bg-gray-100 border border-transparent hover:border-gray-300 hover:bg-white focus:ring-4 focus:ring-violet-600/10 focus:bg-white focus:border-violet-600 transition-all duration-200 text-sm outline-none placeholder:text-gray-400 pr-10"
                                                placeholder="30"
                                                type="number"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Số buổi học/tuần */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-semibold text-slate-900 px-1">
                                            Tần suất học (buổi/tuần) <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                value={formData.sessionsPerWeek ?? ''}
                                                onChange={(e) => handleInputChange('sessionsPerWeek', e.target.value)}
                                                className="w-full h-11 px-4 rounded-xl bg-gray-100 border border-transparent hover:border-gray-300 hover:bg-white focus:ring-4 focus:ring-violet-600/10 focus:bg-white focus:border-violet-600 transition-all duration-200 text-sm outline-none placeholder:text-gray-400 pr-10"
                                                placeholder="2"
                                                type="number"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Ghi chú */}
                                <div className="flex flex-col gap-2 pt-1">
                                    <label className="text-xs font-semibold text-slate-900 px-1">Ghi chú &amp; Lộ trình học tập</label>
                                    <textarea
                                        value={formData.note}
                                        onChange={(e) => handleInputChange('note', e.target.value)}
                                        className="p-3 rounded-xl bg-gray-100 border border-transparent hover:border-gray-300 hover:bg-white focus:ring-4 focus:ring-violet-600/10 focus:bg-white focus:border-violet-600 transition-all duration-200 text-sm outline-none resize-none min-h-[90px] placeholder:text-gray-400"
                                        placeholder="Nhập các lưu ý về giáo trình, tài liệu tham khảo hoặc lộ trình ôn tập cụ thể cho lớp học này..."
                                    />
                                </div>
                            </section>

                            {/* Instructor & Media Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-200">
                                {/* Teacher Selection */}
                                <section className="space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-6 bg-blue-700 rounded-full"></div>
                                            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">Giáo viên</h4>
                                        </div>

                                        {showAiSuggestions && (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 text-white rounded-full animate-pulse border border-violet-200">
                                                <Sparkles className="w-3 h-3" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">AI Gợi ý</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {/* AI Suggested Teachers List */}
                                        {showAiSuggestions && (
                                            <div className="bg-slate-900 rounded-xl p-3 border border-violet-100">
                                                <p className="text-[10px] font-semibold text-white px-1 mb-2">
                                                    Đề xuất phù hợp nhất:
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {suggested.map((teacher) => (
                                                        <button
                                                            key={teacher.id}
                                                            type="button"
                                                            onClick={() => handleTeacherSelect(teacher.id)}
                                                            className="inline-flex flex-shrink-0 justify-between items-center px-3 py-1 bg-gradient-to-r from-purple-600/10 via-pink-400/10 to-indigo-500/10 border border-purple-300 rounded-xl text-[10px] font-medium text-white hover:from-purple-500/20 hover:via-pink-300/20 hover:to-indigo-400/20 transition-all shadow-md gap-1"
                                                        >
                                                            <span>
                                                                {(teacher.gender ? 'Thầy' : 'Cô')} {teacher.fullName}
                                                            </span>

                                                            <span className="text-[10px] font-bold bg-purple-700/30 text-white px-1 py-0.5 rounded-full">
                                                                {teacher.match}%
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="relative">
                                            <select
                                                value={selectedTeacher ?? ''}
                                                onChange={(e) => handleTeacherSelect(Number(e.target.value))}
                                                className="appearance-none w-full h-11 px-4 rounded-xl bg-gray-100 border border-transparent hover:border-gray-300 hover:bg-white focus:ring-4 focus:ring-violet-600/10 focus:bg-white focus:border-violet-600 transition-all duration-200 text-sm outline-none cursor-pointer pr-10 text-gray-700"
                                            >
                                                <option value="" className="text-gray-500">
                                                    {loadingTeachers ? 'Đang tải giáo viên...' : 'Chọn giảng viên phụ trách'}
                                                </option>

                                                {teacherList.map((teacher) => (
                                                    <option
                                                        key={teacher.id}
                                                        value={teacher.id}
                                                        className="text-gray-700 font-semibold"
                                                    >
                                                        {(teacher.gender ? 'Thầy' : 'Cô')} {teacher.fullName} ({teacher.specialty})
                                                    </option>
                                                ))}
                                            </select>

                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 w-4 h-4" />
                                        </div>

                                        {/* Teacher Card (Selected State) */}
                                        {selectedTeacherData && (
                                            <div className="bg-white border border-gray-200 p-3 rounded-xl flex items-center gap-3 shadow-sm">

                                                <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-blue-700 text-white font-bold text-sm shrink-0">
                                                    {getImageSrc(selectedTeacherData.image) ? (
                                                        <img
                                                            src={getImageSrc(selectedTeacherData.image)!}
                                                            alt={selectedTeacherData.fullName}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                                (e.target as HTMLImageElement).parentElement!.innerText =
                                                                    getInitials(selectedTeacherData.fullName);
                                                            }}
                                                        />
                                                    ) : (
                                                        <span>{getInitials(selectedTeacherData.fullName)}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="text-sm font-bold">
                                                        {(selectedTeacherData.gender ? 'Thầy' : 'Cô')} {selectedTeacherData.fullName}
                                                    </h5>

                                                    <p className="text-xs text-violet-600 font-bold">
                                                        {selectedTeacherData.specialty}
                                                    </p>

                                                    <div className="flex items-center gap-2 mt-1 text-gray-500">
                                                        <Phone className="w-3 h-3" />
                                                        <span className="text-xs">
                                                            {selectedTeacherData.phoneNumber}
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={handleRemoveTeacher}
                                                    className="p-1 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors duration-200"
                                                >
                                                    <Delete className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Class Image Section */}
                                <section className="space-y-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1 h-6 bg-green-700 rounded-full"></div>
                                        <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider">Ảnh môn học</h4>
                                    </div>

                                    <div
                                        className="group relative border-2 border-dashed border-gray-300 
  hover:border-violet-600 hover:bg-violet-50/20 transition-all 
  rounded-xl h-48 flex flex-col items-center justify-center gap-3 
  cursor-pointer bg-gray-50 overflow-hidden"
                                    >
                                        {/* Preview Image */}
                                        {previewImage && (
                                            <img
                                                src={previewImage}
                                                alt="preview"
                                                className="absolute inset-0 w-full h-full object-cover z-0"
                                                onError={() => setPreviewImage(null)}
                                            />
                                        )}

                                        {/* Overlay khi hover (giữ nhẹ nhàng, không đen gắt) */}
                                        {previewImage && (
                                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm 
    opacity-0 group-hover:opacity-100 transition z-10 
    flex items-center justify-center gap-2">

                                                {/* Đổi ảnh */}
                                                <label className="px-3 py-1 bg-white border rounded-lg text-sm cursor-pointer hover:bg-gray-100 shadow">
                                                    Đổi ảnh
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            if (e.target.files?.[0]) {
                                                                handleImageUpload(e.target.files[0]);
                                                            }
                                                        }}
                                                    />
                                                </label>

                                                {/* Xóa ảnh */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // ❗ tránh trigger input file
                                                        handleRemoveImage();
                                                    }}
                                                    className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 shadow"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        )}

                                        {/* Empty state (giữ hiệu ứng hover gốc) */}
                                        {!previewImage && (
                                            <>
                                                <div
                                                    className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center 
        group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white 
        transition-all text-violet-600 z-10"
                                                >
                                                    <CloudUpload className="w-5 h-5" />
                                                </div>

                                                <div className="text-center z-10">
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        Tải lên ảnh môn học
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 mt-1">
                                                        PNG hoặc JPG (Tối đa 2MB)
                                                    </p>
                                                </div>
                                            </>
                                        )}

                                        {/* Input upload (chỉ active khi chưa có ảnh) */}
                                        {!previewImage && (
                                            <input
                                                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        handleImageUpload(e.target.files[0]);
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>

                                    <div className="relative">
                                        <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        <input
                                            value={formData.imageUrl}
                                            onChange={(e) => handleImageUrlChange(e.target.value)}
                                            className="w-full h-11 pl-11 pr-4 rounded-xl bg-gray-100 border border-transparent hover:border-gray-300 hover:bg-white focus:ring-4 focus:ring-violet-600/10 focus:bg-white focus:border-violet-600 transition-all duration-200 text-sm outline-none placeholder:text-gray-400"
                                            placeholder="Hoặc nhập URL ảnh trực tiếp..."
                                            type="text"
                                        />
                                    </div>
                                </section>
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-5 border-t border-gray-200 bg-white flex items-center justify-end gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 h-10 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-600 transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 h-10 rounded-lg text-sm font-semibold text-white btn-gradient hover:shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2 group"
                                >
                                    <BadgePlus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                    {mode === "update" ? "Lưu thay đổi" : "Tạo lớp học"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
};

export default AddClassModal;