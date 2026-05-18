


// src/app/leaves/calendar/page.tsx
'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, Calendar, FileText, RefreshCw, Mail, Eye, CheckCircle, XCircle, History, Zap, Download } from 'lucide-react';
import { LeaveCalendar } from '../../../components/adminComponents/leaves/LeaveCalendar';
import { LeaveToolbar } from '../../../components/adminComponents/leaves/LeaveToolbar';
import { QuickActions } from '../../../components/adminComponents/leaves/QuickActions';
import { ProfileCard } from '../../../components/adminComponents/leaves/ProfileCard';
import { mockLeaveRequests, leaveStats, leaveActivities } from '../../../utils/mockLeaves';
import type { LeaveRequest } from '../../../utils/types/teacherLeave';


export function LeaveCalendarPage() {
    const navigate = useNavigate();
    const [leaves, setLeaves] = useState<LeaveRequest[]>(mockLeaveRequests);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('Tất cả');
    const [selectedLeaveType, setSelectedLeaveType] = useState('Tất cả');
    const [currentViewMode, setCurrentViewMode] = useState<'list' | 'calendar'>('calendar');

    const statusOptions = ['Tất cả', 'Chờ duyệt', 'Đã duyệt', 'Từ chối'];
    const leaveTypeOptions = ['Tất cả', 'Nghỉ phép năm', 'Nghỉ ốm', 'Việc riêng'];

    // Tính số người nghỉ hôm nay
    const todayLeaves = leaves.filter(leave => {
        const today = new Date().toISOString().split('T')[0];
        const leaveStart = leave.startDate;
        const leaveEnd = leave.endDate || leaveStart;
        return today >= leaveStart && today <= leaveEnd;
    });
    const todayLeaveCount = todayLeaves.length;

    // Tính số đang chờ duyệt
    const pendingCount = leaves.filter(l => l.status === 'Chờ duyệt').length;

    const filterLeaves = (query: string, status: string, type: string) => {
        let filtered = mockLeaveRequests;

        if (query) {
            filtered = filtered.filter(leave =>
                leave.teacherName.toLowerCase().includes(query.toLowerCase()) ||
                leave.teacherCode.toLowerCase().includes(query.toLowerCase())
            );
        }

        if (status !== 'Tất cả') {
            filtered = filtered.filter(leave => leave.status === status);
        }

        if (type !== 'Tất cả') {
            filtered = filtered.filter(leave => leave.leaveType === type);
        }

        setLeaves(filtered);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        filterLeaves(query, selectedStatus, selectedLeaveType);
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        filterLeaves(searchQuery, status, selectedLeaveType);
    };

    const handleLeaveTypeChange = (type: string) => {
        setSelectedLeaveType(type);
        filterLeaves(searchQuery, selectedStatus, type);
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedStatus('Tất cả');
        setSelectedLeaveType('Tất cả');
        setLeaves(mockLeaveRequests);
    };

    const handleViewModeChange = (mode: 'list' | 'calendar') => {
        setCurrentViewMode(mode);
        if (mode === 'list') {
            navigate('/admin/teacher/leave');
        }
    };

    const handleDayClick = (date: Date) => {
        console.log('Clicked date:', date);
        navigate(`/admin/teacher/leave?date=${date.toISOString().split('T')[0]}`);
    };

    const handleCreateRequest = () => {
        navigate('/admin/teacher/leave/create');
    };

    const handleQuickCreate = () => {
        navigate('/admin/teacher/leave/create');
    };

    const handleExport = () => {
        console.log('Export to Excel');
    };

    const handleLogout = () => {
        console.log('Logout');
    };

    // Helper function để lấy icon cho từng loại activity
    const getActivityIcon = (type: string, iconName: string) => {
        switch (iconName) {
            case 'person':
                return <Eye className="w-4 h-4" />;
            case 'history':
                return <History className="w-4 h-4" />;
            case 'block':
                return <XCircle className="w-4 h-4" />;
            case 'file_upload':
                return <FileText className="w-4 h-4" />;
            default:
                return <Eye className="w-4 h-4" />;
        }
    };

    const getActivityBgColor = (type: string) => {
        switch (type) {
            case 'approve':
                return 'bg-purple-100';
            case 'reject':
                return 'bg-red-100';
            case 'submit':
                return 'bg-amber-100';
            default:
                return 'bg-gray-100';
        }
    };

    const getActivityTextColor = (type: string) => {
        switch (type) {
            case 'approve':
                return 'text-purple-600';
            case 'reject':
                return 'text-red-600';
            case 'submit':
                return 'text-amber-600';
            default:
                return 'text-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex">
                {/* Main Content */}
                <main className="flex-1 overflow-y-auto px-8 py-10 space-y-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Lịch Nghỉ Giáo Viên</h1>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {leaveStats.map((stat, index) => (
                            <div key={index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>

                    {/* Stats nhỏ bên dưới */}
                    <div className="flex gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Hôm nay nghỉ</p>
                                <p className="text-xl font-bold text-gray-900">{todayLeaveCount}</p>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Chờ duyệt</p>
                                <p className="text-xl font-bold text-gray-900">{pendingCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Toolbar with integrated view switcher */}
                    <LeaveToolbar
                        searchQuery={searchQuery}
                        onSearchChange={handleSearch}
                        selectedStatus={selectedStatus}
                        onStatusChange={handleStatusChange}
                        selectedLeaveType={selectedLeaveType}
                        onLeaveTypeChange={handleLeaveTypeChange}
                        onClearFilters={handleClearFilters}
                        onViewModeChange={handleViewModeChange}
                        currentViewMode={currentViewMode}
                        statusOptions={statusOptions}
                        leaveTypeOptions={leaveTypeOptions}
                    />

                    {/* Calendar Component */}
                    <LeaveCalendar
                        leaves={leaves}
                        onDayClick={handleDayClick}
                        onCreateRequest={handleCreateRequest}
                    />
                </main>

                {/* Right Sidebar */}
                <aside className="w-80 bg-white border-l border-gray-200 p-6 space-y-6 hidden lg:block overflow-y-auto">
                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-purple-600" />
                            Thao tác nhanh
                        </h3>
                        <div className="space-y-3">
                            <button
                                onClick={handleQuickCreate}
                                className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-purple-50 hover:text-purple-600 transition-all rounded-xl text-left group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800 group-hover:text-purple-600">Tạo nhanh</p>
                                    <p className="text-xs text-gray-400">Sử dụng mẫu có sẵn</p>
                                </div>
                            </button>
                            <button
                                onClick={handleExport}
                                className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-purple-50 hover:text-purple-600 transition-all rounded-xl text-left group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                                    <Download className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800 group-hover:text-purple-600">Xuất Excel</p>
                                    <p className="text-xs text-gray-400">Tải báo cáo tháng 4</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <History className="w-4 h-4 text-purple-600" />
                                Hoạt động gần đây
                            </span>
                            <button className="text-xs text-purple-600 hover:underline">Tất cả</button>
                        </h4>
                        <div className="space-y-4">
                            {leaveActivities.slice(0, 3).map((activity) => (
                                <div key={activity.id} className="flex gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityBgColor(activity.type)}`}>
                                        <div className={getActivityTextColor(activity.type)}>
                                            {getActivityIcon(activity.type, activity.icon)}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-800">
                                            {activity.user || 'Hệ thống'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {activity.action} {activity.target && <span className="font-medium text-purple-600">{activity.target}</span>}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Chú thích</h5>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <span className="text-xs text-gray-600">Đã duyệt nghỉ</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                <span className="text-xs text-gray-600">Đang chờ duyệt</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-purple-100 border border-purple-200"></div>
                                <span className="text-xs text-gray-600">Sự kiện trường</span>
                            </div>
                        </div>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-sm">Admin Dashboard</p>
                                <p className="text-xs text-white/70">Quản trị viên cấp cao</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}