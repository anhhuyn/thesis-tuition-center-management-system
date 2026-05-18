import { useState, useEffect } from "react";
import {
    Layers,
    PlayCircle,
    CalendarCheck,
    Users,
    Clock,
    Calendar,
    Search,
    ChevronDown,
    BarChart,
    PieChart,
    Loader2,
} from "lucide-react";
import type { Subject } from "../../utils/types/subject";
import { getImageSrc, getInitials } from "../../utils/helpers";
import { subjectApi } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// Helper: màu sắc theo cấp học (có thể lấy từ subject.subjectType.academicLevel.name)
const getColorByLevel = (levelName: string) => {
    if (levelName === "THCS") return "#14b8a6";
    if (levelName === "THPT") return "#8b5cf6";
    return "#94a3b8";
};

const palettes = [
    { bg: "bg-purple-50", text: "text-violet-600", bar: "bg-violet-500" },
    { bg: "bg-blue-50", text: "text-blue-600", bar: "bg-blue-500" },
    { bg: "bg-emerald-50", text: "text-emerald-600", bar: "bg-emerald-500" },
    { bg: "bg-orange-50", text: "text-orange-600", bar: "bg-orange-500" },
    { bg: "bg-rose-50", text: "text-rose-600", bar: "bg-rose-500" },
];

// Component Card (giữ nguyên như cũ)
const ClassCard = ({ subject, palette }: { subject: Subject; palette: any }) => {
    const navigate = useNavigate();
    const teacher = subject.teacherSubjects?.[0]?.teacher;
    const teacherImage = getImageSrc(teacher?.user?.image);
    const subjectImage = getImageSrc(subject.image);
    const percent = Math.min(100, Math.round((subject.currentStudents / subject.maxStudents) * 100));

    return (

        <div
            onClick={() => navigate(`/teacher/class/${subject.id}`)} 
            className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
        >
            <div className="relative h-28 bg-slate-100">
                {subjectImage ? (
                    <img src={subjectImage} alt={subject.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                <span
                    className={`absolute top-2 right-2 px-2 py-1.5 rounded-full shadow-sm flex items-center ${subject.status === "active" ? "bg-emerald-500" : subject.status === "upcoming" ? "bg-indigo-500" : "bg-red-500"
                        }`}
                >
                    <span className="text-white font-bold text-[9px] leading-none">
                        {subject.status === "active" ? "ĐANG HỌC" : subject.status === "upcoming" ? "SẮP KHAI GIẢNG" : "KẾT THÚC"}
                    </span>
                </span>
            </div>

            <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">{subject.name}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                            {subject.subjectType?.name} - {subject.subjectType?.academicLevel?.name}
                        </p>
                    </div>
                    <span className={`px-2 py-0.5 ${palette.bg} rounded flex items-center justify-center`}>
                        <span className={`font-bold text-[9px] ${palette.text}`}>Khối {subject.grade}</span>
                    </span>
                </div>

                <div className="flex items-center gap-2 py-2 border-t border-b border-slate-50 mb-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center font-bold text-white text-[9px] bg-blue-700 shrink-0">
                        {teacherImage ? (
                            <img src={teacherImage} alt={teacher?.user?.fullName} className="w-full h-full object-cover" />
                        ) : (
                            <span>{getInitials(teacher?.user?.fullName)}</span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-[10px] truncate">{teacher?.user?.fullName || "Chưa sắp xếp"}</p>
                        <p className="text-slate-400 text-[9px] truncate">Chuyên môn: {teacher?.specialty || ""}</p>
                    </div>
                </div>

                <div className="flex gap-2 mb-3">
                    <div className="flex-1">
                        <p className="text-slate-400 font-bold text-[8px] mb-0.5">LỊCH HỌC</p>
                        <p className="font-medium text-slate-900 text-[10px]">{subject.sessionsPerWeek} buổi/tuần</p>
                    </div>
                    <div className="flex-1">
                        <p className="text-slate-400 font-bold text-[8px] mb-0.5">HỌC PHÍ</p>
                        <p className="font-bold text-violet-600 text-[10px]">{subject.price.toLocaleString()}đ/tháng</p>
                    </div>
                </div>

                <div className="mb-3">
                    <div className="flex justify-between mb-1">
                        <span className="text-slate-400 font-bold text-[10px]">Sĩ số</span>
                        <span className={`font-bold text-[10px] ${percent === 100 ? "text-emerald-600" : "text-slate-900"}`}>
                            {subject.currentStudents}/{subject.maxStudents} ({percent}%)
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${palette.bar}`} style={{ width: `${percent}%` }} />
                    </div>
                </div>

                <div className="p-2 bg-slate-50 rounded-lg mb-3">
                    <p className="text-slate-400 font-bold text-[9px] mb-0.5">GHI CHÚ</p>
                    <p className="text-slate-600 text-[10px] italic truncate" title={subject.note}>
                        {subject.note || "Không có ghi chú"}
                    </p>
                </div>
            </div>
        </div>
    );
};

export const TeacherClassListPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [teacherId, setTeacherId] = useState<number | null>(null);

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSubjects, setTotalSubjects] = useState(0);
    const [stats, setStats] = useState({ all: 0, active: 0, upcoming: 0, ended: 0 });
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>(""); // "" = all, "active", "upcoming", "ended"
    const [levelFilter, setLevelFilter] = useState<string>(""); // chưa tích hợp backend, chỉ UI

    // Dữ liệu cho biểu đồ tròn theo cấp học (tính từ subjects hiện tại)
    const [levelData, setLevelData] = useState<{ name: string; value: number; percentage: number; color: string }[]>([]);

    const classesPerPage = 12;

    useEffect(() => {
        if (user?.id) {
            setTeacherId(user.id);
        }
    }, [user]);

    // Fetch danh sách lớp theo teacher
    const fetchSubjects = async () => {
        if (!teacherId) return;
        setLoading(true);
        try {
            const response = await subjectApi.getSubjectsByTeacher(
                teacherId,
                currentPage,
                classesPerPage,
                statusFilter || undefined
            );
            if (response.success) {
                setSubjects(response.data);
                setTotalPages(response.totalPages);
                setTotalSubjects(response.total);
                setStats(response.stats);
            }
        } catch (error) {
            console.error("Error fetching teacher subjects:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (teacherId) {
            fetchSubjects();
        }
    }, [currentPage, statusFilter, teacherId]);
    // Tính toán levelData (thống kê theo cấp học) từ subjects hiện tại
    useEffect(() => {
        if (!subjects.length) return;
        const levelMap = new Map<string, number>();
        subjects.forEach((sub) => {
            const levelName = sub.subjectType?.academicLevel?.name || "Chưa phân cấp";
            levelMap.set(levelName, (levelMap.get(levelName) || 0) + 1);
        });
        const total = subjects.length;
        const data = Array.from(levelMap.entries()).map(([name, value]) => ({
            name,
            value,
            percentage: Math.round((value / total) * 100),
            color: getColorByLevel(name),
        }));
        setLevelData(data);
    }, [subjects]);

    // Dữ liệu cho biểu đồ cột tỷ lệ lấp đầy (lấy 6 lớp đầu hoặc theo tỷ lệ cao nhất)
    const subjectChartData = [...subjects]
        .map((s) => ({
            name: s.name,
            value: Math.min(100, Math.round((s.currentStudents / s.maxStudents) * 100)),
            displayValue: `${s.currentStudents}/${s.maxStudents}`,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

    // Helper hiển thị thời gian (cho upcoming sessions - chưa có API nên tạm để trống)
    // Nếu sau này có API lấy upcoming sessions riêng thì thay thế, hiện tại tạm ẩn hoặc để trống
    // Để đồng bộ, ta có thể bỏ qua sidebar hoặc hiển thị placeholder

    const summaryCards = [
        { label: "Lớp đang dạy", value: stats.all, icon: Layers, bgColor: "bg-purple-50", iconColor: "text-purple-600" },
        { label: "Đang hoạt động", value: stats.active, icon: PlayCircle, bgColor: "bg-teal-50", iconColor: "text-teal-600" },
        { label: "Sắp khai giảng", value: stats.upcoming, icon: CalendarCheck, bgColor: "bg-blue-50", iconColor: "text-blue-600" },
        { label: "Đã kết thúc", value: stats.ended, icon: Users, bgColor: "bg-amber-50", iconColor: "text-amber-600" },
    ];

    // Lọc theo tìm kiếm (frontend)
    const filteredSubjects = subjects.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="bg-gray-50 min-h-screen">
            {/* Gradient Header */}
            <section className="relative overflow-hidden pb-8 pt-0">
                <div className="absolute inset-0 bg-[linear-gradient(169deg,rgba(102,126,234,1)_0%,rgba(118,75,162,1)_50%,rgba(240,147,251,1)_100%)]"></div>
                <svg className="absolute bottom-[-1px] left-0 w-full" viewBox="0 0 1440 270">
                    <path
                        fill="#f9fafb"
                        fillOpacity="1"
                        d="M0,192L80,170.7C160,149,320,107,480,117.3C640,128,800,192,960,202.7C1120,213,1280,171,1360,149.3L1440,128L1440,320L0,320Z"
                    ></path>
                </svg>

                <div className="relative max-w-7xl mx-auto px-6 pt-10">
                    <div className="w-full flex flex-col">
                        <header className="flex flex-col w-full">
                            <div className="flex items-center justify-between w-full flex-wrap gap-4">
                                <div className="flex flex-col">
                                    <h1 className="text-white text-3xl lg:text-4xl font-bold">Lớp học của tôi</h1>
                                    <p className="text-white/80 text-sm mt-1">Chào mừng quay trở lại!</p>
                                </div>
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="search"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Tìm kiếm lớp học..."
                                        className="w-72 pl-10 pr-4 py-2.5 bg-white rounded-xl text-sm text-gray-700 outline-none border border-gray-200 focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>
                            </div>
                        </header>

                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-6 w-full">
                            {summaryCards.map((card, idx) => {
                                const Icon = card.icon;
                                return (
                                    <article key={idx} className="flex flex-col p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-gray-500 font-bold text-[11px] uppercase tracking-wider">{card.label}</h3>
                                                <p className="font-bold text-2xl lg:text-3xl text-gray-900 mt-1">
                                                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : card.value}
                                                </p>
                                            </div>
                                            <div className={`flex w-11 h-11 items-center justify-center ${card.bgColor} rounded-xl`}>
                                                <Icon size={20} className={card.iconColor} />
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </section>
                    </div>
                </div>
            </section>

            {/* Nội dung chính */}
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Cột trái */}
                    <div className="flex-1 space-y-6">
                        {/* Biểu đồ */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Tỷ lệ lấp đầy */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="font-bold text-slate-800 text-xs uppercase">Tỷ lệ lấp đầy lớp học</h2>
                                        <p className="text-[10px] text-slate-400">Hiệu suất tuyển sinh (%)</p>
                                    </div>
                                    <BarChart size={16} className="text-slate-500" />
                                </div>
                                <div className="h-44 flex items-end justify-between gap-3 px-2">
                                    {subjectChartData.map((item, idx) => (
                                        <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group relative">
                                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-20 w-max max-w-[180px] bg-slate-800 text-white text-[10px] px-3 py-2 rounded-lg shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center gap-1">
                                                <p className="font-bold text-center">{item.name}</p>
                                                <p className="text-slate-300 text-[9px]">Sĩ số: {item.displayValue} ({item.value}%)</p>
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                                            </div>
                                            <div
                                                className={`w-full max-w-[32px] rounded-t-lg transition-all duration-500 ${item.value >= 90 ? "bg-emerald-500" : item.value >= 50 ? "bg-violet-500" : "bg-rose-400"
                                                    }`}
                                                style={{ height: `${item.value}%` }}
                                            >
                                                {item.value > 10 && <span className="flex justify-center text-[9px] text-white font-bold pt-1">{item.value}%</span>}
                                            </div>
                                            <span className="mt-3 text-[10px] text-slate-500 font-medium truncate w-full text-center">
                                                {item.name.split(" ")[0]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Phân bố cấp học */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-bold text-slate-800 text-xs">THỐNG KÊ THEO CẤP</h2>
                                    <PieChart size={16} className="text-slate-500" />
                                </div>
                                {levelData.length > 0 ? (
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                        <div className="relative w-[150px] h-[150px]">
                                            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                                                {levelData.map((item, i) => {
                                                    const circumference = 2 * Math.PI * 45;
                                                    const dash = (item.percentage / 100) * circumference;
                                                    return (
                                                        <circle
                                                            key={i}
                                                            cx="60"
                                                            cy="60"
                                                            r="45"
                                                            fill="transparent"
                                                            stroke={item.color}
                                                            strokeWidth="10"
                                                            strokeDasharray={`${dash} ${circumference}`}
                                                            strokeDashoffset={levelData.slice(0, i).reduce((acc, g) => acc - (g.percentage / 100) * circumference, 0)}
                                                            strokeLinecap="round"
                                                        />
                                                    );
                                                })}
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                {levelData[0] && (
                                                    <>
                                                        <span className="text-lg font-bold text-slate-900">{levelData[0].percentage}%</span>
                                                        <span className="text-xs text-slate-400">{levelData[0].name}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {levelData.map((item) => (
                                                <div key={item.name} className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                                    <span className="text-slate-600 text-xs">
                                                        {item.name}: {item.percentage}%
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Chưa có dữ liệu</div>
                                )}
                            </div>
                        </div>

                        {/* Bộ lọc */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <Search size={16} className="text-slate-500" />
                                    <h2 className="font-bold text-slate-900 text-sm">Danh sách lớp học</h2>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-slate-400 font-bold text-[9px] block mb-1">TRẠNG THÁI</label>
                                    <div className="relative">
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => {
                                                setStatusFilter(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="w-full bg-white rounded-lg border border-slate-100 px-3 py-2 text-xs"
                                        >
                                            <option value="">Mọi trạng thái</option>
                                            <option value="active">Đang học</option>
                                            <option value="upcoming">Sắp khai giảng</option>
                                            <option value="ended">Kết thúc</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-slate-400 font-bold text-[9px] block mb-1">KHỐI LỚP</label>
                                    <div className="relative">
                                        <select
                                            value={levelFilter}
                                            onChange={(e) => setLevelFilter(e.target.value)}
                                            className="w-full bg-white rounded-lg border border-slate-100 px-3 py-2 text-xs"
                                        >
                                            <option value="">Tất cả khối</option>
                                            <option value="6">Khối 6</option>
                                            <option value="7">Khối 7</option>
                                            <option value="8">Khối 8</option>
                                            <option value="9">Khối 9</option>
                                            <option value="10">Khối 10</option>
                                            <option value="11">Khối 11</option>
                                            <option value="12">Khối 12</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-slate-400 font-bold text-[9px] block mb-1">TÌM KIẾM</label>
                                    <input
                                        type="text"
                                        placeholder="Nhập tên lớp..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full rounded-lg border border-slate-100 px-3 py-2 text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Grid các lớp */}
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="animate-spin w-8 h-8 text-violet-600" />
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredSubjects.map((subject, idx) => (
                                        <ClassCard key={subject.id} subject={subject} palette={palettes[idx % palettes.length]} />
                                    ))}
                                </div>

                                {/* Phân trang */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center mt-8">
                                        <div className="flex items-center gap-2">
                                            <button
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage((p) => p - 1)}
                                                className="px-3 py-1 rounded border border-slate-200 bg-white text-sm disabled:opacity-50"
                                            >
                                                Trước
                                            </button>
                                            <span className="text-sm text-slate-600">
                                                Trang {currentPage} / {totalPages}
                                            </span>
                                            <button
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage((p) => p + 1)}
                                                className="px-3 py-1 rounded border border-slate-200 bg-white text-sm disabled:opacity-50"
                                            >
                                                Sau
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Sidebar phải: Lịch dạy sắp tới (hiện tại chưa có API, có thể để trống hoặc thông báo) */}
                    <aside className="w-full lg:w-80 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm sticky top-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-slate-800 text-sm">Lịch dạy sắp tới</h2>
                                <button className="text-blue-600 font-medium text-xs hover:underline">Xem tất cả</button>
                            </div>
                            <div className="text-center py-8 text-slate-400 text-sm">
                                Chức năng đang cập nhật
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
};