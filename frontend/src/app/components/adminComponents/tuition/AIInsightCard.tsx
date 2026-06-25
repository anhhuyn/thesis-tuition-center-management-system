import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Users, Target, BarChart3 } from 'lucide-react';
import type { TopDebtStudent } from '../../../utils/types/tuition';

interface AIInsightCardProps {
  forecastRevenue: number;
  debtRecoveryRate: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  overdueCount: number;
  topDebtors: TopDebtStudent[];
}

const AIInsightCard: React.FC<AIInsightCardProps> = ({
  forecastRevenue,
  debtRecoveryRate,
  riskLevel,
  overdueCount,
  topDebtors,
}) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000_000) {
      return `${(amount / 1_000_000_000).toFixed(1)}B`;
    }
    return `${(amount / 1_000_000).toFixed(0)}M`;
  };

  const getRiskConfig = () => {
    switch (riskLevel) {
      case 'LOW':
        return { color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: TrendingDown, label: 'Thấp' };
      case 'MEDIUM':
        return { color: 'text-amber-600', bgColor: 'bg-amber-50', icon: AlertTriangle, label: 'Trung bình' };
      case 'HIGH':
        return { color: 'text-red-600', bgColor: 'bg-red-50', icon: TrendingUp, label: 'Cao' };
    }
  };

  const riskConfig = getRiskConfig();
  const RiskIcon = riskConfig.icon;

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* AI Analysis Section - Fixed height */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[280px]">
          <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-transparent flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-100 rounded-lg">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
              </div>
              <h2 className="font-headline font-semibold text-sm text-gray-900">Phân tích Tài chính</h2>
              <span className="text-[10px] text-gray-400 ml-1">Cập nhật hôm nay</span>
            </div>
          </div>
          
          <div className="p-4 flex-1 flex items-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              {/* Forecast Revenue */}
              <div className="p-3 bg-gray-50 rounded-lg h-full">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                  <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">Dự báo doanh thu</p>
                </div>
                <p className="text-base font-bold text-gray-900">{formatCurrency(forecastRevenue)} VNĐ</p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 h-1 rounded-full">
                    <div className="bg-indigo-500 h-full rounded-full w-[78%]"></div>
                  </div>
                  <p className="text-[10px] text-emerald-600 mt-1.5 font-medium">↑ 14% so với tháng trước</p>
                </div>
              </div>
              
              {/* Debt Recovery */}
              <div className="p-3 bg-gray-50 rounded-lg h-full">
                <div className="flex items-center gap-1.5 mb-2">
                  <Target className="w-3.5 h-3.5 text-emerald-500" />
                  <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">Tỷ lệ thu hồi nợ</p>
                </div>
                <p className="text-base font-bold text-gray-900">{debtRecoveryRate}%</p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 h-1 rounded-full">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${debtRecoveryRate}%` }}></div>
                  </div>
                  <p className="text-[10px] text-emerald-600 mt-1.5 font-medium">
                    ↑ Vượt mục tiêu (+{Math.round(debtRecoveryRate - 80)}%)
                  </p>
                </div>
              </div>
              
              {/* Risk Level */}
              <div className="p-3 bg-gray-50 rounded-lg h-full">
                <div className="flex items-center gap-1.5 mb-2">
                  <RiskIcon className={`w-3.5 h-3.5 ${riskConfig.color}`} />
                  <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">Rủi ro công nợ</p>
                </div>
                <p className={`text-base font-bold ${riskConfig.color}`}>{riskConfig.label}</p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 h-1 rounded-full">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${Math.min((overdueCount / 100) * 100, 100)}%` }}></div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1.5">
                    {overdueCount} học sinh quá hạn
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Debtors Section - Fixed height */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[280px]">
          <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              <h3 className="font-headline font-semibold text-xs text-gray-700 uppercase tracking-wider">
                Học sinh nợ nhiều nhất
              </h3>
            </div>
          </div>
          
          <div className="p-3 flex-1 overflow-y-auto">
            <div className="space-y-3">
              {topDebtors.map((student, idx) => (
                <div key={student.id} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {student.avatar ? (
                        <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-gray-500">
                          {student.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{student.name}</p>
                      <p className="text-[10px] text-gray-400">{student.className} • {student.studentCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-red-500">
                      {(student.debtAmount / 1_000_000).toFixed(1)}M
                    </span>
                    <p className="text-[9px] text-gray-400">VNĐ</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/30 flex-shrink-0">
            <button className="w-full text-center text-[10px] text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
              Xem tất cả →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightCard;