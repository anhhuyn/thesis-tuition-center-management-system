// CourseOverviewSection.tsx
import { motion } from "framer-motion";
import { BookOpen, Users, TrendingUp, DollarSign, Calendar, Award } from "lucide-react";
import type { Subject } from "../../../../utils/types/subject";
import { getImageSrc, getInitials } from "../../../../utils/helpers";
import { getSubjectStatusLabel, getSubjectStatusStyle } from "../../../../utils/helpers/subjectStatus";

type Props = {
    subject: Subject | null;
    onEdit?: () => void;
    isTeacher?: boolean; 
};

export const CourseOverviewSection = ({ subject, onEdit, isTeacher = false }: Props) => {
    if (!subject) return <CourseOverviewSkeleton />;

    const courseData = {
        title: subject.name,
        status: subject.status,
        subject: subject.subjectType?.name || "Chưa có",
        subjectLevel: subject.subjectType?.academicLevel?.name || "Chưa có",
        grade: subject.grade,
        teacher: subject.teacherSubjects?.[0]?.teacher?.user?.fullName || "Chưa sắp xếp",
        teacherSpecialty: subject.teacherSubjects?.[0]?.teacher?.specialty || "Chưa có",
        teacherEmail: subject.teacherSubjects?.[0]?.teacher?.user.email,
        enrollment: `${subject.currentStudents}/${subject.maxStudents}`,
        sessionsPerWeek: subject.sessionsPerWeek || 0,
        price: subject.price || 0,
    };

    const teacherImage = getImageSrc(subject.teacherSubjects?.[0]?.teacher?.user?.image);
    const teacherName = courseData.teacher;

    // Mock stats data (replace with real data from API)
    const stats = {
        totalStudents: subject.currentStudents || 0,
        progress: 65,
        attendance: 94.2,
        revenue: (subject.price || 0) * (subject.currentStudents || 0) * 4,
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/50 shadow-sm"
        >
            {/* Decorative gradient background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-50/30 to-indigo-50/30 rounded-full blur-3xl -z-0" />

            <div className="relative z-10 p-6">
                {/* HEADER */}
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                    <div className="flex gap-4">
                        {/* Icon with gradient */}
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            className="w-16 h-16 flex items-center justify-center btn-gradient rounded-2xl shadow-lg"
                        >
                            <BookOpen className="text-white" size={28} />
                        </motion.div>

                        {/* Info */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                                    {courseData.title}
                                </h1>

                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${getSubjectStatusStyle(subject?.status)}`}>
                                    {getSubjectStatusLabel(subject?.status)}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                    <span className="font-medium">Môn:</span> {courseData.subject}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="flex items-center gap-1">
                                    <span className="font-medium">Khối:</span> {courseData.grade}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="flex items-center gap-1">
                                    <span className="font-medium">Cấp học:</span> {courseData.subjectLevel}
                                </span>
                            </div>

                            {/* Teacher info */}
                            <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-2">
                                    {teacherImage ? (
                                        <img
                                            className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                                            src={teacherImage}
                                            alt={teacherName}
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                                            {getInitials(teacherName)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-slate-700">{teacherName}</p>
                                        <p className="text-xs text-slate-400">{courseData.teacherEmail}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                    <Users size={14} />
                                    <span>Sĩ số: {courseData.enrollment}</span>
                                </div>

                                <div className="flex items-center gap-1 text-sm text-slate-500">
                                    <Calendar size={14} />
                                    <span>{courseData.sessionsPerWeek} buổi/tuần</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onEdit}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                        >
                            Chỉnh sửa
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-emerald-600 hover:shadow-md transition-all"
                        >
                            Xuất báo cáo
                        </motion.button>
                    </div>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <StatCard
                        label="Tổng học sinh"
                        value={stats.totalStudents.toString()}
                        subtext="+2% tháng này"
                        icon={<Users size={16} />}
                        trend="up"
                    />
                    <StatCard
                        label="Tiến độ khóa học"
                        value={`${stats.progress}%`}
                        progress={stats.progress}
                        icon={<TrendingUp size={16} />}
                    />
                    <StatCard
                        label="Tỷ lệ chuyên cần"
                        value={`${stats.attendance}%`}
                        subtext="+5.2%"
                        icon={<Award size={16} />}
                        trend="up"
                    />
                    <StatCard
                        label="Doanh thu dự kiến"
                        value={`${(stats.revenue / 1000000).toFixed(1)}M`}
                        subtext="VNĐ"
                        icon={<DollarSign size={16} />}
                    />
                </div>
            </div>
        </motion.section>
    );
};

// Stat Card Component
const StatCard = ({
    label,
    value,
    subtext,
    progress,
    icon,
    trend,
}: {
    label: string;
    value: string;
    subtext?: string;
    progress?: number;
    icon?: React.ReactNode;
    trend?: "up" | "down";
}) => {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="group p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all duration-200"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {label}
                </span>
                {icon && (
                    <div className="text-slate-400 group-hover:text-violet-500 transition-colors">
                        {icon}
                    </div>
                )}
            </div>

            {progress !== undefined ? (
                <>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                        />
                    </div>
                    <span className="text-xl font-bold text-slate-800">{value}</span>
                </>
            ) : (
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-800">{value}</span>
                    {subtext && (
                        <span className={cn(
                            "text-xs font-semibold",
                            trend === "up" ? "text-emerald-600" : "text-slate-400"
                        )}>
                            {subtext}
                        </span>
                    )}
                </div>
            )}
        </motion.div>
    );
};

// Skeleton Loader
const CourseOverviewSkeleton = () => (
    <div className="bg-white rounded-2xl border border-slate-200/50 shadow-sm p-6 animate-pulse">
        <div className="flex gap-4 mb-6">
            <div className="w-16 h-16 bg-slate-200 rounded-2xl" />
            <div className="flex-1">
                <div className="h-7 w-64 bg-slate-200 rounded mb-2" />
                <div className="h-4 w-48 bg-slate-200 rounded mb-2" />
                <div className="h-10 w-72 bg-slate-200 rounded" />
            </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl">
                    <div className="h-3 w-20 bg-slate-200 rounded mb-2" />
                    <div className="h-7 w-16 bg-slate-200 rounded" />
                </div>
            ))}
        </div>
    </div>
);

// Helper function (if cn is not available)
const cn = (...classes: (string | false | undefined)[]) => {
    return classes.filter(Boolean).join(' ');
};