import { motion, AnimatePresence } from "framer-motion";
import {
    Pencil,
    Download,
    TrendingUp,
    Users,
    BookOpen,
    Calendar,
    DollarSign,
    Clock,
    Phone,
    Mail,
    GraduationCap,
    Search,
    FileText,
    Upload,
    UserCheck,
    UserX,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Subject } from "../../../../utils/types/subject";
import { getSubjectStatusLabel } from "../../../../utils/helpers/subjectStatus";
import AddClassModal from "../AddClassModal";
import type { Material } from "../../../../utils/types/material";
import { materialApi } from "../../../../utils/api/material.api";
import { formatDate, formatTime } from "../../../../utils/helpers";
import { getFileIcon } from "../../../../utils/helpers/fileIcon";
import type { StudentSubject } from "../../../../utils/types/studentSubject";
import { studentSubjectApi } from "../../../../utils/api";
import type { AttendanceToday } from "../../../../utils/types/attendance";
import { attendanceApi } from "../../../../utils/api/attendance.api";
import { cn } from "../../../ui/utils";

// ============================================================================
// Types
// ============================================================================

type Props = {
    subject: Subject | null;
    onRefresh?: () => void;
    isTeacher?: boolean;
};

// ============================================================================
// Sub-components
// ============================================================================

const SkeletonLoader = () => (
    <div className="flex gap-6 w-full px-10 animate-pulse">
        <div className="flex-1 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm p-6">
                <div className="h-6 w-32 bg-slate-200 rounded mb-6" />
                <div className="grid grid-cols-2 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-3 w-16 bg-slate-200 rounded" />
                            <div className="h-4 w-24 bg-slate-200 rounded" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm p-6">
                <div className="h-6 w-48 bg-slate-200 rounded mb-4" />
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border-b">
                        <div className="w-8 h-8 bg-slate-200 rounded-full" />
                        <div className="flex-1">
                            <div className="h-4 w-32 bg-slate-200 rounded mb-1" />
                            <div className="h-3 w-24 bg-slate-200 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="w-[340px] flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm p-6">
                <div className="h-6 w-32 bg-slate-200 rounded mb-4" />
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex justify-between py-3">
                        <div className="h-4 w-24 bg-slate-200 rounded" />
                        <div className="h-4 w-16 bg-slate-200 rounded" />
                    </div>
                ))}
            </div>
            <div className="bg-violet-500 rounded-2xl p-6">
                <div className="h-6 w-32 bg-white/30 rounded mb-2" />
                <div className="h-3 w-48 bg-white/30 rounded mb-4" />
                <div className="h-24 bg-white/20 rounded-lg" />
            </div>
        </div>
    </div>
);

const EmptyState = ({ title, description, icon: Icon }: { title: string; description: string; icon: any }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <Icon className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-700">{title}</p>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
    </div>
);

const InfoCard = ({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) => (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
        {Icon && <Icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />}
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
            <span className="text-sm font-medium text-slate-800">{value || "—"}</span>
        </div>
    </div>
);

const StudentCard = ({ student, index }: { student: StudentSubject; index: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:shadow-md hover:border-slate-200 transition-all duration-200"
    >
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-600 font-semibold text-sm">
                {student.fullName?.charAt(0) || "?"}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-800">{student.fullName || "Chưa có tên"}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span
                        className={cn(
                            "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                            student.gender === true
                                ? "bg-blue-50 text-blue-600"
                                : student.gender === false
                                    ? "bg-pink-50 text-pink-600"
                                    : "bg-slate-100 text-slate-500"
                        )}
                    >
                        {student.gender === true ? "Nam" : student.gender === false ? "Nữ" : "Khác"}
                    </span>
                    <span className="text-[10px] text-slate-400">{student.schoolName || "Chưa có trường"}</span>
                </div>
            </div>
        </div>
        <div className="text-xs text-slate-400">{student.dateOfBirth ? formatDate(student.dateOfBirth) : "—"}</div>
    </motion.div>
);

const DocumentItem = ({ doc, index }: { doc: Material; index: number }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isNew = new Date(doc.uploadedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.01, x: 2 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:shadow-sm hover:border-slate-200 transition-all duration-200"
        >
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    {getFileIcon(doc.type)}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-700">{`${doc.title}.${doc.type}`}</p>
                        {isNew && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
                                NEW
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-slate-400">
                        {doc.fileSize} • {formatTime(doc.uploadedAt)}
                    </span>
                </div>
            </div>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-violet-500 hover:bg-violet-50 transition-colors"
            >
                <Download size={16} />
            </motion.button>
        </motion.div>
    );
};

const AttendanceCard = ({
    attendanceDisplay,
    onOpenAttendance,
}: {
    attendanceDisplay: any;
    onOpenAttendance: () => void;
}) => {
    const absentCount = parseInt(attendanceDisplay.absent?.split("/")[0] || "0");
    const totalCount = parseInt(attendanceDisplay.absent?.split("/")[1] || "1");
    const attendanceRate = totalCount > 0 ? ((totalCount - absentCount) / totalCount) * 100 : 100;

    return (
        <div className="space-y-5">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Trạng thái giáo viên</span>
                </div>
                <span
                    className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full",
                        attendanceDisplay.teacher.color
                    )}
                >
                    {attendanceDisplay.teacher.label}
                </span>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <UserX className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">Học sinh vắng mặt</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">{attendanceDisplay.absent}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${attendanceRate}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                    />
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenAttendance}
                className="w-full btn-gradient text-white text-sm font-semibold py-2.5 rounded-xl shadow-sm transition-all duration-200"
            >
                Mở sổ điểm danh
            </motion.button>
        </div>
    );
};

const StatChart = ({ chartData }: { chartData: number[] }) => {
    const [hoveredBar, setHoveredBar] = useState<number | null>(null);
    const maxValue = Math.max(...chartData);

    return (
        <div>
            <div className="flex items-end gap-1.5 h-32">
                {chartData.map((h, i) => {
                    const heightPercent = (h / maxValue) * 100;
                    const isActive = i === 4; // highlight the 5th bar (index 4)

                    return (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ duration: 0.5, delay: i * 0.03 }}
                            onHoverStart={() => setHoveredBar(i)}
                            onHoverEnd={() => setHoveredBar(null)}
                            className={cn(
                                "flex-1 rounded-t-lg cursor-pointer transition-all duration-200",
                                isActive ? "bg-white" : "bg-white/30",
                                hoveredBar === i && "opacity-80"
                            )}
                            style={{ height: `${heightPercent}%`, minHeight: "4px" }}
                        />
                    );
                })}
            </div>
            <div className="flex justify-between items-center mt-4 pt-2 border-t border-white/20">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-white/80">Tăng trưởng</span>
                    <span className="text-sm font-bold text-white">+12%</span>
                </div>
                <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                >
                    <TrendingUp size={16} className="text-white/90" />
                </motion.div>
            </div>
        </div>
    );
};

// ============================================================================
// Main Component
// ============================================================================

export const ClassDetailContent = ({ subject, onRefresh, isTeacher = false }: Props) => {
    const [openEditModal, setOpenEditModal] = useState(false);
    const [localSubject, setLocalSubject] = useState<Subject | null>(subject);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [students, setStudents] = useState<StudentSubject[]>([]);
    const [attendance, setAttendance] = useState<AttendanceToday | null>(null);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [noSessionToday, setNoSessionToday] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAllStudents, setShowAllStudents] = useState(false);

    const getTeacherStatusLabel = (status?: string) => {
        switch (status) {
            case "present":
                return { label: "ĐÃ ĐẾN", color: "bg-emerald-100 text-emerald-700" };
            case "absent":
                return { label: "VẮNG", color: "bg-rose-100 text-rose-700" };
            case "not_marked":
            default:
                return { label: "CHƯA ĐIỂM DANH", color: "bg-amber-100 text-amber-700" };
        }
    };

    const attendanceDisplay = (() => {
        if (noSessionToday || !attendance) {
            return {
                date: "Hôm nay",
                teacher: { label: "KHÔNG CÓ BUỔI", color: "bg-slate-100 text-slate-500" },
                absent: "--",
            };
        }

        const teacher = getTeacherStatusLabel(attendance.teacherStatus);
        const total = attendance.totalStudents || 0;
        const absent = attendance.absentStudents || 0;
        const present = attendance.presentStudents || 0;
        const late = attendance.lateStudents || 0;
        const markedStudents = present + absent + late;

        if (attendance.teacherStatus === "not_marked" && markedStudents === 0) {
            return {
                date: formatDate(attendance.date),
                teacher,
                absent: "--",
            };
        }

        if (attendance.teacherStatus === "not_marked" || markedStudents < total) {
            return {
                date: formatDate(attendance.date),
                teacher,
                absent: `${absent}/${total}`,
            };
        }

        return {
            date: formatDate(attendance.date),
            teacher,
            absent: `${absent}/${total}`,
        };
    })();

    // Data fetching effects
    useEffect(() => {
        setLocalSubject(subject);
    }, [subject]);

    useEffect(() => {
        if (!localSubject?.id) return;
        const fetchMaterials = async () => {
            try {
                const res = await materialApi.getBySubject(localSubject.id);
                setMaterials(res.data.slice(0, 4));
            } catch (err) {
                console.error(err);
            }
        };
        fetchMaterials();
    }, [localSubject?.id]);

    useEffect(() => {
        if (!localSubject?.id) return;
        const fetchStudents = async () => {
            try {
                const res = await studentSubjectApi.getStudentBySubject(localSubject.id);
                setStudents(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStudents();
    }, [localSubject?.id]);

    useEffect(() => {
        if (!localSubject?.id) return;
        const fetchAttendance = async () => {
            setAttendanceLoading(true);
            try {
                const today = new Date().toLocaleDateString("en-CA");
                const res = await attendanceApi.getBySubjectAndDate(localSubject.id, today);
                if (!res.data || !res.data.sessionId) {
                    setNoSessionToday(true);
                    setAttendance(null);
                    return;
                }
                setAttendance(res.data);
                setNoSessionToday(false);
            } catch (err) {
                console.error(err);
            } finally {
                setAttendanceLoading(false);
            }
        };
        fetchAttendance();
    }, [localSubject?.id]);

    const isLoading = !localSubject;
    const handleUpdateSuccess = (updatedSubject: Subject) => {
        setLocalSubject(updatedSubject);
        if (onRefresh) onRefresh();
        setOpenEditModal(false);
    };

    const filteredStudents = students.filter((s) =>
        s.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const displayedStudents = showAllStudents ? filteredStudents : filteredStudents.slice(0, 3);

    const classInfo = {
        className: localSubject?.name || "Chưa có tên",
        grade: localSubject?.grade || "Chưa có",
        tuition: localSubject?.price ? `${localSubject.price}/giờ` : "Chưa có",
        capacity: `${localSubject?.currentStudents || 0}/${localSubject?.maxStudents || 0}`,
        subject: `${localSubject?.subjectType?.name ?? "Chưa có"} - ${localSubject?.subjectType?.academicLevel?.name ?? "?"}`,
        status: localSubject?.status || "inactive",
        schedule: localSubject?.sessionsPerWeek ? `${localSubject.sessionsPerWeek} buổi/tuần` : "Chưa có",
        description: localSubject?.note || "Không có ghi chú",
        teacherName: localSubject?.teacherSubjects?.[0]?.teacher?.user?.fullName || "Chưa sắp xếp",
        teacherPhone: localSubject?.teacherSubjects?.[0]?.teacher?.user?.phoneNumber ?? "Chưa có",
        teacherSpecialty: localSubject?.teacherSubjects?.[0]?.teacher?.specialty ?? "Chưa có",
        teacherEmail: localSubject?.teacherSubjects?.[0]?.teacher?.user?.email ?? "Chưa có",
    };

    const chartData = [40, 60, 55, 80, 95, 70, 85];

    if (isLoading) {
        return <SkeletonLoader />;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col lg:flex-row gap-6 w-full px-4 md:px-6 lg:px-10 py-6"
        >
            {/* LEFT COLUMN */}
            <div className="flex-1 flex flex-col gap-6">
                {/* CLASS INFO CARD - Redesigned */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{classInfo.className}</h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <span
                                        className={cn(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
                                            classInfo.status === "active"
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "bg-slate-100 text-slate-600"
                                        )}
                                    >
                                        {getSubjectStatusLabel(classInfo.status)}
                                    </span>
                                    <span className="text-xs text-slate-400">•</span>
                                    <span className="text-xs text-slate-500">{classInfo.schedule}</span>
                                </div>
                            </div>
                            {!isTeacher && (
                                <button
                                    onClick={() => setOpenEditModal(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-violet-600 text-sm font-medium hover:bg-violet-50 transition-colors"
                                >
                                    <Pencil size={14} />
                                    Chỉnh sửa
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <InfoCard label="Môn học" value={classInfo.subject} icon={BookOpen} />
                            <InfoCard label="Khối" value={classInfo.grade} icon={GraduationCap} />
                            <InfoCard label="Học phí" value={classInfo.tuition} icon={DollarSign} />
                            <InfoCard label="Sĩ số" value={classInfo.capacity} icon={Users} />
                            <InfoCard label="Lịch học" value={classInfo.schedule} icon={Calendar} />
                            <InfoCard label="Số buổi/tuần" value={localSubject?.sessionsPerWeek?.toString() || "—"} icon={Clock} />
                        </div>

                        {/* Teacher Mini Profile */}
                        <div className="mt-6 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full btn-gradient flex items-center justify-center text-white font-semibold text-sm">
                                    {classInfo.teacherName.charAt(0) || "T"}
                                </div>

                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-800">
                                        {classInfo.teacherName}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Giáo viên chủ nhiệm
                                    </p>
                                </div>

                                <div className="flex gap-1">
                                    <div className="p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer group">
                                        <Phone size={14} className="text-slate-400 group-hover:text-violet-500" />
                                    </div>
                                    <div className="p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer group">
                                        <Mail size={14} className="text-slate-400 group-hover:text-violet-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100">

                                <div className="text-xs">
                                    <span className="text-slate-400">Chuyên môn:</span>
                                    <span className="ml-1 text-slate-600">
                                        {classInfo.teacherSpecialty}
                                    </span>
                                </div>

                                <div className="text-xs">
                                    <span className="text-slate-400">Số điện thoại:</span>
                                    <span className="ml-1 text-slate-600">
                                        {classInfo.teacherPhone}
                                    </span>
                                </div>

                                <div className="text-xs">
                                    <span className="text-slate-400">Email:</span>
                                    <span className="ml-1 text-slate-600 whitespace-nowrap overflow-hidden text-ellipsis">
                                        {classInfo.teacherEmail}
                                    </span>
                                </div>

                            </div>
                        </div>

                        {/* Description */}
                        <div className="mt-6 p-4 rounded-xl bg-slate-50/50">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Mô tả khóa học</span>
                            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{classInfo.description}</p>
                        </div>
                    </div>
                </motion.div>

                {/* STUDENTS SECTION - Redesigned as List Cards */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden"
                >
                    <div className="flex flex-wrap justify-between items-center gap-4 p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800">Học sinh</h2>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm học sinh..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 w-48"
                                />
                            </div>
                            {students.length > 3 && (
                                <button
                                    onClick={() => setShowAllStudents(!showAllStudents)}
                                    className="text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors"
                                >
                                    {showAllStudents ? "Thu gọn" : "Xem tất cả"}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-4 space-y-2">
                        <AnimatePresence>
                            {displayedStudents.length > 0 ? (
                                displayedStudents.map((student, idx) => <StudentCard key={student.id} student={student} index={idx} />)
                            ) : (
                                <EmptyState title="Không có học sinh" description="Chưa có học sinh nào trong lớp này" icon={Users} />
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

            {/* RIGHT SIDEBAR */}
            <aside className="w-full lg:w-[360px] flex flex-col gap-6 lg:sticky lg:top-6 self-start">
                {/* DOCUMENTS SECTION - Redesigned */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden"
                >
                    <div className="flex justify-between items-center p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800">Tài liệu</h2>
                        
                    </div>

                    <div className="p-4 space-y-2">
                        {materials.length > 0 ? (
                            materials.map((doc, idx) => <DocumentItem key={doc.id} doc={doc} index={idx} />)
                        ) : (
                            <EmptyState title="Chưa có tài liệu" description="Tải lên tài liệu đầu tiên" icon={FileText} />
                        )}

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-3 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-3 text-sm text-slate-500 hover:border-violet-300 hover:bg-violet-50/30 transition-all"
                        >
                            <Upload size={14} />
                            Tải lên tài liệu
                        </motion.button>
                    </div>
                </motion.div>

                {/* ATTENDANCE SECTION - Redesigned as Analytics Card */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-800">Điểm danh hôm nay</h2>
                            <span className="text-xs text-slate-400">{attendanceDisplay.date}</span>
                        </div>
                    </div>
                    <div className="p-6">
                        <AttendanceCard attendanceDisplay={attendanceDisplay} onOpenAttendance={() => { }} />
                    </div>
                </motion.div>

                {/* STATISTICS CARD - Upgraded */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-2xl p-6 btn-gradient shadow-lg overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                    <div className="relative z-10">
                        <h2 className="text-lg font-bold text-white mb-1">Thống kê nhanh</h2>
                        <p className="text-xs text-white/70 mb-6">Hiệu suất học tập lớp hiện tại so với tháng trước</p>
                        <StatChart chartData={chartData} />
                    </div>
                </motion.div>
            </aside>

            <AddClassModal
                isOpen={openEditModal}
                onClose={() => setOpenEditModal(false)}
                mode="update"
                initialData={localSubject}
                onSuccess={handleUpdateSuccess}
            />
        </motion.div>
    );
};