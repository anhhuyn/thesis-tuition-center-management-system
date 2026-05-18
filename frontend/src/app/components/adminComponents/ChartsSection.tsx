import { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell,
    Area
} from 'recharts';
import { subjectApi } from '../../utils/api';
import { PieChartIcon, TrendingUp } from 'lucide-react';

const revenueData = [
    { month: 'Th10', revenue: 28, students: 210 },
    { month: 'Th11', revenue: 32, students: 225 },
    { month: 'Th12', revenue: 38, students: 240 },
    { month: 'Th1', revenue: 42, students: 260 },
    { month: 'Th2', revenue: 45, students: 285 },
    { month: 'Th3', revenue: 52, students: 310 },
    { month: 'Th4', revenue: 58, students: 335 },
    { month: 'Th5', revenue: 63, students: 355 }
];

// Pastel color palette
const getColorByLevel = (level: string) => {
    switch (level) {
        case 'Cấp 1 (Tiểu học)':
            return '#6366F1';
        case 'Cấp 2 (THCS)':
            return '#06B6D4';
        case 'Cấp 3 (THPT)':
            return '#10B981';
        default:
            return '#CBD5E1';
    }
};

type CustomTooltipProps = {
    active?: boolean;
    payload?: any[];
    label?: string;
};

const CustomLineTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl p-3 text-xs transition-all duration-200">
            <p className="font-semibold text-slate-800 mb-2 text-sm">{label}</p>
            {payload.map((item, index) => {
                const isRevenue = item.name === 'Doanh thu';
                const value = isRevenue ? `${item.value} Triệu` : `${item.value} học viên`;
                const color = item.color;

                return (
                    <div key={index} className="flex justify-between gap-6 items-center py-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-slate-600 text-xs">{item.name}</span>
                        </div>
                        <span className="font-semibold text-slate-800 text-xs">{value}</span>
                    </div>
                );
            })}
        </div>
    );
};

const CustomPieTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;

    return (
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl p-3 text-xs">
            <p className="font-semibold text-slate-800 mb-1">{data.name}</p>
            <p className="text-slate-600">{data.value} lớp học</p>
            <p className="text-indigo-500 font-semibold mt-1">{data.percentage}%</p>
        </div>
    );
};

export function ChartsSection() {
    const [totalSubjects, setTotalSubjects] = useState<number>(0);
    const [levelData, setLevelData] = useState<any[]>([]);

    useEffect(() => {
        subjectApi.getStatistics()
            .then(res => {
                setTotalSubjects(res.totalSubjects);
            })
            .catch(console.error);

        subjectApi.getStatisticsLevel()
            .then(res => {
                const raw = res
                const total = raw.reduce((sum: number, item: any) => sum + item.total, 0) || 1;

                const data = raw.map((item: any) => ({
                    name: item.level,
                    value: item.total,
                    percentage: Math.round((item.total / total) * 100),
                    color: getColorByLevel(item.level)
                }));

                setLevelData(data);
            })
            .catch(console.error);
    }, []);

    return (
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <div className="grid lg:grid-cols-[2fr_1fr] gap-6 lg:gap-8">
                {/* Line Chart Card */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                    <div className="p-4 lg:p-5">
                        {/* Header with title */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                               <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-slate-400" />
                                    <h3 className="text-base lg:text-lg font-semibold text-slate-800">
                                        Biểu đồ doanh thu & học viên
                                    </h3>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-50">
                                        <div className="w-2 h-2 rounded-full bg-indigo-400" />
                                        <span className="text-xs font-medium text-indigo-600">Doanh thu</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-cyan-50">
                                        <div className="w-2 h-2 rounded-full bg-cyan-400" />
                                        <span className="text-xs font-medium text-cyan-600">Học viên</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">Theo dõi xu hướng tăng trưởng theo tháng</p>
                        </div>

                        {/* Chart Container */}
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#A78BFA" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="studentsGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#67E8F9" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#67E8F9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    
                                    <CartesianGrid 
                                        strokeDasharray="4 4" 
                                        vertical={false} 
                                        stroke="#E2E8F0" 
                                        strokeOpacity={0.6}
                                    />
                                    
                                    <XAxis 
                                        dataKey="month" 
                                        axisLine={false} 
                                        tickLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                                        dy={6}
                                    />
                                    
                                    <YAxis 
                                        yAxisId="left"
                                        axisLine={false} 
                                        tickLine={false}
                                        tickFormatter={(v) => `${v}Tr`}
                                        domain={[20, 70]}
                                        tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                                        dx={-5}
                                    />
                                    
                                    <YAxis 
                                        yAxisId="right"
                                        orientation="right"
                                        axisLine={false} 
                                        tickLine={false}
                                        domain={[180, 380]}
                                        tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                                        dx={5}
                                    />
                                    
                                    <Tooltip content={<CustomLineTooltip />} cursor={{ stroke: '#CBD5E1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#A78BFA"
                                        strokeWidth={2.5}
                                        name="Doanh thu"
                                        dot={{ r: 3.5, strokeWidth: 2, stroke: '#FFFFFF', fill: '#A78BFA' }}
                                        activeDot={{ r: 5.5, strokeWidth: 2.5, stroke: '#FFFFFF', fill: '#A78BFA' }}
                                        strokeLinecap="round"
                                    />
                                    
                                    <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="none"
                                        fill="url(#revenueGradient)"
                                    />
                                    
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="students"
                                        stroke="#67E8F9"
                                        strokeWidth={2.5}
                                        name="Học viên"
                                        dot={{ r: 3.5, strokeWidth: 2, stroke: '#FFFFFF', fill: '#67E8F9' }}
                                        activeDot={{ r: 5.5, strokeWidth: 2.5, stroke: '#FFFFFF', fill: '#67E8F9' }}
                                        strokeLinecap="round"
                                    />
                                    
                                    <Area
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="students"
                                        stroke="none"
                                        fill="url(#studentsGradient)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Pie Chart Card */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                    <div className="p-4 lg:p-5">
                        {/* Header with title */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <PieChartIcon className="w-5 h-5 text-slate-400" />
                                    <h3 className="text-base lg:text-lg font-semibold text-slate-800">
                                        Phân bố lớp học
                                    </h3>
                                </div>
                                <div className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                                    {totalSubjects} tổng lớp
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">Chi tiết theo cấp học</p>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            {/* Donut Chart */}
                            <div className="relative">
                                <div className="w-40 h-40 lg:w-48 lg:h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={levelData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius="65%"
                                                outerRadius="85%"
                                                startAngle={90}
                                                endAngle={-270}
                                                stroke="none"
                                                paddingAngle={3}
                                                cornerRadius={8}
                                            >
                                                {levelData.map((item, i) => (
                                                    <Cell 
                                                        key={i} 
                                                        fill={item.color}
                                                        className="cursor-pointer transition-all duration-300 hover:opacity-80"
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                content={<CustomPieTooltip />}
                                                wrapperStyle={{ zIndex: 1000 }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                
                                {/* Center Stats */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-xl lg:text-2xl font-bold text-slate-800">{totalSubjects}</span>
                                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wide">Lớp học</span>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="w-full space-y-1.5">
                                {levelData.map((level, i) => (
                                    <div 
                                        key={i} 
                                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50/80 transition-all duration-200 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div 
                                                className="w-2.5 h-2.5 rounded-full transition-all duration-200"
                                                style={{ backgroundColor: level.color }}
                                            />
                                            <span className="font-medium text-xs text-slate-700">{level.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-slate-700">
                                                {level.value}
                                            </span>
                                            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                                {level.percentage}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChartsSection;