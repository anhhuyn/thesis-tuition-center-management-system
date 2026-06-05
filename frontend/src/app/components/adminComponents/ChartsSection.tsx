import { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Area
} from 'recharts';
import { subjectApi } from '../../utils/api';
import { PieChartIcon, TrendingUp } from 'lucide-react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highcharts3d from 'highcharts/highcharts-3d';

// Kích hoạt module 3D
if (typeof Highcharts === 'object') {
    const initialize3d = highcharts3d as any;
    
    if (typeof initialize3d === 'function') {
        initialize3d(Highcharts);
    } else if (initialize3d && typeof initialize3d.default === 'function') {
        initialize3d.default(Highcharts);
    }
}

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

const bluePalette = ['#224D7A', '#417BB9', '#A8C7E5', '#7BB0DF'];

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
                const raw = res;

                // Map dữ liệu từ API về cấu trúc Highcharts cần
                const data = raw.map((item: any) => ({
                    name: item.level,
                    y: item.total,
                    sliced: true,    
                    slicedOffset: 12    
                }));

                setLevelData(data);
            })
            .catch(console.error);
    }, []);

    const pie3dOptions: Highcharts.Options = {
        chart: {
            type: 'pie',
            backgroundColor: 'transparent',
            options3d: {
                enabled: true,
                alpha: 60, 
                beta: 0
            },
            height: '240px',
            margin: [0, 0, 0, 0]
        },
        title: { text: undefined },
        accessibility: { enabled: false },
        credits: { enabled: false },
        colors: bluePalette, 
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                depth: 32,
                dataLabels: {
                    enabled: true,
                    format: '{point.percentage:.0f}%', 
                    distance: -35, 
                    style: {
                        color: '#FFFFFF',
                        fontSize: '15px',
                        fontWeight: '600',
                        textOutline: 'none' 
                    }
                },
                showInLegend: false 
            }
        },
        series: [{
            type: 'pie',
            name: 'Số lượng lớp',
            data: levelData
        }]
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto">
            <div className="grid lg:grid-cols-[2fr_1fr] gap-6 lg:gap-6">
                
                {/* Biểu đồ đường */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                    <div className="p-4">
                        <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-slate-400" />
                                    <h3 className="text-base font-semibold text-slate-800">
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

                        <div className="h-[260px] w-full">
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
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E2E8F0" strokeOpacity={0.6} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }} dy={6} />
                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tickFormatter={(v) => `${v}Tr`} domain={[20, 70]} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }} dx={-5} />
                                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} domain={[180, 380]} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 500 }} dx={5} />
                                    <Tooltip content={<CustomLineTooltip />} cursor={{ stroke: '#CBD5E1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#A78BFA" strokeWidth={2.5} name="Doanh thu" dot={{ r: 3, strokeWidth: 2, stroke: '#FFFFFF', fill: '#A78BFA' }} activeDot={{ r: 5, strokeWidth: 2.5, stroke: '#FFFFFF', fill: '#A78BFA' }} strokeLinecap="round" />
                                    <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="none" fill="url(#revenueGradient)" />
                                    <Line yAxisId="right" type="monotone" dataKey="students" stroke="#67E8F9" strokeWidth={2.5} name="Học viên" dot={{ r: 3, strokeWidth: 2, stroke: '#FFFFFF', fill: '#67E8F9' }} activeDot={{ r: 5, strokeWidth: 2.5, stroke: '#FFFFFF', fill: '#67E8F9' }} strokeLinecap="round" />
                                    <Area yAxisId="right" type="monotone" dataKey="students" stroke="none" fill="url(#studentsGradient)" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Biểu đồ tròn*/}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                    <div className="p-4">
                        <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <PieChartIcon className="w-4 h-4 text-slate-400" />
                                    <h3 className="text-base font-semibold text-slate-800">
                                        Phân bố lớp học
                                    </h3>
                                </div>
                                <div className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg">
                                    {totalSubjects} tổng lớp
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">Chi tiết theo cấp học</p>
                        </div>

                        <div className="flex flex-col items-center gap-3">
                            {/* Highcharts */}
                            <div className="w-full h-[240px]">
                                {levelData.length > 0 ? (
                                    <HighchartsReact highcharts={Highcharts} options={pie3dOptions} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                                        Đang tải dữ liệu...
                                    </div>
                                )}
                            </div>

                            {/* Legend */}
                            <div className="w-full space-y-1">
                                {levelData.map((level, i) => (
                                    <div 
                                        key={i} 
                                        className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50/80 transition-all duration-200 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div 
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{ backgroundColor: bluePalette[i % bluePalette.length] }}
                                            />
                                            <span className="font-medium text-xs text-slate-700">{level.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-slate-700">
                                                {level.y} lớp
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