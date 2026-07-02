// src/app/components/students/StudentStats.tsx
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, UserPlus, BarChart3, Clock, Activity } from 'lucide-react';
import { studentApi } from '../../../utils/api/student.api';
import type { StudentStatistics, Student } from '../../../utils/types/student';

interface StudentStatsProps {
  onStatsLoaded?: (stats: StudentStatistics) => void;
  students?: Student[];
}

interface StatCardData {
  title: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
  type?: 'default' | 'gender';
}

const StudentStats: React.FC<StudentStatsProps> = ({ onStatsLoaded, students = [] }) => {
  const [stats, setStats] = useState<StatCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMale, setTotalMale] = useState(0);
  const [totalFemale, setTotalFemale] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [newStudentsThisMonth, setNewStudentsThisMonth] = useState(0);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      const statsData = await studentApi.getStatistics();
      console.log('Statistics from API:', statsData);
      
      let maleCount = 0;
      let femaleCount = 0;
      
      try {
        const genderStats = await studentApi.getStatisticsGender(students);
        maleCount = genderStats.male;
        femaleCount = genderStats.female;
        console.log('Gender stats from API:', { maleCount, femaleCount });
      } catch (error) {
        console.warn('Cannot get gender stats from API, will fetch all students');
        
        if (statsData.totalStudents < 1000) {
          const allStudentsResponse = await studentApi.getAll(1, statsData.totalStudents);
          if (allStudentsResponse.success && allStudentsResponse.data) {
            maleCount = allStudentsResponse.data.filter(s => s.gender === true).length;
            femaleCount = allStudentsResponse.data.filter(s => s.gender === false).length;
            console.log('Gender stats from all students:', { maleCount, femaleCount });
          }
        }
      }
      
      setTotalMale(maleCount);
      setTotalFemale(femaleCount);
      setTotalStudents(statsData.totalStudents);
      setNewStudentsThisMonth(statsData.totalStudentsThisMonth || 0);

      const finalMaleCount = maleCount || 45;
      const finalFemaleCount = femaleCount || 59;
      
      // Chỉ 3 card: Tổng học sinh, Mới trong tháng, Phân bố giới tính
      const newStats: StatCardData[] = [
        // Card 1: Tổng số học sinh
        { 
          title: 'Tổng số học sinh', 
          value: statsData.totalStudents.toString(), 
          trend: statsData.percentageIncreaseStudent?.toString() || '0', 
          trendDirection: (statsData.percentageIncreaseStudent || 0) >= 0 ? 'up' : 'down',
          icon: <Users className="w-5 h-5" />,
          color: 'indigo',
          type: 'default'
        },
        // Card 2: Mới trong tháng
        { 
          title: 'Mới trong tháng', 
          value: statsData.totalStudentsThisMonth?.toString() || '0', 
          trend: statsData.percentageIncreaseStudent?.toString() || '0', 
          trendDirection: (statsData.percentageIncreaseStudent || 0) >= 0 ? 'up' : 'down',
          icon: <UserPlus className="w-5 h-5" />,
          color: 'emerald',
          type: 'default'
        },
        // Card 3: Phân bố giới tính
        { 
          title: 'Phân bố giới tính', 
          value: `${finalMaleCount} | ${finalFemaleCount}`, 
          trend: `${Math.round((finalMaleCount / (finalMaleCount + finalFemaleCount)) * 100)}:${Math.round((finalFemaleCount / (finalMaleCount + finalFemaleCount)) * 100)}`, 
          trendDirection: 'up',
          icon: <BarChart3 className="w-5 h-5" />,
          color: 'blue',
          type: 'gender'
        }
      ];
      
      console.log('Updated stats:', newStats);
      setStats(newStats);
      onStatsLoaded?.(statsData);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      // Set default stats with 3 cards
      setStats([
        { 
          title: 'Tổng số học sinh', 
          value: '104', 
          trend: '5', 
          trendDirection: 'up', 
          icon: <Users className="w-5 h-5" />, 
          color: 'indigo',
          type: 'default'
        },
        { 
          title: 'Mới trong tháng', 
          value: '12', 
          trend: '5', 
          trendDirection: 'up', 
          icon: <UserPlus className="w-5 h-5" />, 
          color: 'emerald',
          type: 'default'
        },
        { 
          title: 'Phân bố giới tính', 
          value: '45 | 59', 
          trend: '43:57', 
          trendDirection: 'up', 
          icon: <BarChart3 className="w-5 h-5" />, 
          color: 'blue',
          type: 'gender'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; hoverBg: string; text: string; gradient: string; iconBg: string }> = {
      indigo: { 
        bg: 'bg-indigo-50', 
        hoverBg: 'group-hover:bg-indigo-100', 
        text: 'text-indigo-600',
        gradient: 'from-indigo-400 via-purple-400 to-pink-400',
        iconBg: 'from-indigo-50 to-purple-50'
      },
      emerald: { 
        bg: 'bg-emerald-50', 
        hoverBg: 'group-hover:bg-emerald-100', 
        text: 'text-emerald-600',
        gradient: 'from-emerald-400 to-teal-400',
        iconBg: 'from-emerald-50 to-teal-50'
      },
      blue: { 
        bg: 'bg-blue-50', 
        hoverBg: 'group-hover:bg-blue-100', 
        text: 'text-blue-600',
        gradient: 'from-blue-400 to-cyan-400',
        iconBg: 'from-blue-50 to-cyan-50'
      },
      purple: { 
        bg: 'bg-purple-50', 
        hoverBg: 'group-hover:bg-purple-100', 
        text: 'text-purple-600',
        gradient: 'from-purple-400 via-pink-400 to-rose-400',
        iconBg: 'from-purple-50 to-pink-50'
      }
    };
    return colors[color] || colors.indigo;
  };

  // Render Gender Card
  const renderGenderCard = (stat: StatCardData) => {
    const colorClasses = getColorClasses(stat.color);
    const [maleCount, femaleCount] = stat.value.split(' | ').map(Number);
    const total = maleCount + femaleCount;
    const malePercentage = total > 0 ? Math.round((maleCount / total) * 100) : 0;
    const femalePercentage = total > 0 ? Math.round((femaleCount / total) * 100) : 0;

    return (
      <div className="relative group bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full flex flex-col">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex items-start justify-between flex-1">
          <div className="space-y-1 flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600">Nam</span>
                <span className="text-lg font-bold text-blue-600">{maleCount}</span>
              </div>
              <div className="w-px h-6 bg-gray-200"></div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600">Nữ</span>
                <span className="text-lg font-bold text-pink-600">{femaleCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pb-2">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${malePercentage}%` }}></div>
              </div>
             
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
              <Activity size={12} />
              <span>Tỷ lệ {malePercentage}% - {femalePercentage}%</span>
            </div>
          </div>
          <div className={`p-3 bg-gradient-to-br ${colorClasses.iconBg} rounded-xl shadow-sm flex-shrink-0 ml-2`}>
            <BarChart3 className={`w-5 h-5 ${colorClasses.text}`} />
          </div>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      </div>
    );
  };

  // Render Default Card
  const renderDefaultCard = (stat: StatCardData) => {
    const colorClasses = getColorClasses(stat.color);
    const trendValue = parseFloat(stat.trend);
    const showTrend = stat.trend !== '0' && !isNaN(trendValue) && trendValue !== 0;

    return (
      <div className="relative group bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full flex flex-col">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color === 'indigo' ? 'from-indigo-500/5 to-purple-500/5' : 'from-emerald-500/5 to-teal-500/5'} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2`}></div>
        <div className="relative z-10 flex items-start justify-between flex-1">
          <div className="space-y-1 flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            {showTrend && (
              <div className={`flex items-center gap-1 text-xs ${trendValue >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {trendValue >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{Math.abs(trendValue)}% so với tháng trước</span>
              </div>
            )}
          </div>
          <div className={`p-3 bg-gradient-to-br ${colorClasses.iconBg} rounded-xl shadow-sm flex-shrink-0 ml-2`}>
            <div className={colorClasses.text}>{stat.icon}</div>
          </div>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-gray-200 shadow-sm animate-pulse h-full">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        if (stat.type === 'gender') {
          return <div key={index} className="h-full">{renderGenderCard(stat)}</div>;
        }
        return <div key={index} className="h-full">{renderDefaultCard(stat)}</div>;
      })}
    </div>
  );
};

export default StudentStats;