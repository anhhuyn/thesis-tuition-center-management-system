import { Users, BookOpen, GraduationCap, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { studentApi, subjectApi, teacherApi } from '../../utils/api'
import { useEffect, useState } from 'react'

export function StatsCards() {
    const [totalStudents, setTotalStudents] = useState<number>(0)
    const [totalNewStudent, setTotalNewStudent] = useState<number>(0)

    const [totalSubjects, setTotalSubjects] = useState<number>(0)
    const [totalNewSubject, settotalNewSubject] = useState<number>(0)

    const [totalTeachers, setTotalTeachers] = useState<number>(0);
    const [totalNewTeacher, setTotalNewTeacher] = useState<number>(0);

    useEffect(() => {
        studentApi.getStatistics()
            .then(res => {
                setTotalStudents(res.totalStudents)
                setTotalNewStudent(res.totalStudentsThisMonth)
            })
            .catch(err => {
                console.error('Lỗi lấy thống kê học sinh', err)
            })

        subjectApi.getStatistics()
            .then(res => {
                setTotalSubjects(res.totalSubjects)
                settotalNewSubject(res.totalSubjectsThisMonth)
            })
            .catch(err => console.error(err))

        teacherApi.getStatistics()
            .then(res => {
                setTotalTeachers(res.totalTeachers);
                setTotalNewTeacher(res.totalTeachersThisMonth);
            })
            .catch(err => console.error('Lỗi lấy thống kê giáo viên', err));
    }, [])

    const dynamicStats = [
        {
            title: 'Tổng học viên',
            value: totalStudents.toLocaleString(),
            change: Math.abs(totalNewStudent).toLocaleString(),
            trend: totalNewStudent >= 0 ? 'up' : 'down',
            icon: Users,
            bgClass: 'bg-blue-500'
        },
        {
            title: 'Khóa học',
            value: totalSubjects.toLocaleString(),
            change: Math.abs(totalNewSubject).toLocaleString(),
            trend: totalNewSubject >= 0 ? 'up' : 'down',
            icon: BookOpen,
            bgClass: 'bg-purple-500'
        },
        {
            title: 'Giáo viên',
            value: totalTeachers.toLocaleString(),
            change: Math.abs(totalNewTeacher).toLocaleString(),
            trend: totalNewTeacher >= 0 ? 'up' : 'down',
            icon: GraduationCap,
            bgClass: 'bg-pink-500'
        },
       
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {dynamicStats.map((stat, index) => {
                const Icon = stat.icon;
                const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;

                return (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                                <div className="flex items-center space-x-1">
                                    <TrendIcon className={`w-4 h-4 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                                    <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                        {stat.change}
                                    </span>
                                    <span className="text-gray-500 text-sm">so với tháng trước</span>
                                </div>
                            </div>
                            <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.bgClass}`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}