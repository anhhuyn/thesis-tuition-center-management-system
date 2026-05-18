// src/utils/mockLeaves.ts
import type { LeaveRequest, LeaveStat, LeaveActivity } from '../utils/types/leave';

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    teacherId: '1',
    teacherName: 'Nguyễn Văn An',
    teacherCode: 'GV-202401',
    department: 'Khoa Toán học',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAly947iPnIy3OA61-gOc9BCkZ1I9b7WtL0M8-ciq3fR9H1YmKzz1Tz0BD7TRPo_bbwuYd72nI1-Na6lDnaP-MrRJiVpk-YLpkXQMSSv9jaS9do6hTF-ZLtApO7ZaeUneRo_ptZA1i2X3ai-RzdRqB1i30PlhVteBFO-c9V5EyRvWS6uWPttUkeGdp9mIQ0D2Sl__a_CdkuBZhnDBeETAxkai9jmhiZ-Hcy8nw8p7tPzBB7Us5LgBfrxmbcAK9WKBOCTxAGoxY8G3x9',
    leaveType: 'Nghỉ phép năm',
    startDate: '2024-04-12',
    endDate: '2024-04-15',
    days: 3.5,
    status: 'Chờ duyệt',
    createdAt: '2024-04-10T08:00:00'
  },
  {
    id: '2',
    teacherId: '2',
    teacherName: 'Lê Thị Mai',
    teacherCode: 'GV-202488',
    department: 'Khoa Ngoại ngữ',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcIGxqOkqiEBO0Iq_EbvYcWSh9tfEpOkJAamounZYydEkAs5EocsHpuyWm1hujn4uX5fzYLaLuvlOkLt8yYJN8UcZSadvpNHxpLDjqr-zxZgT5XBpbG_Bd3NCW_4927X6pdL_5BWEF8B6fObb5rJ65oOdT0llwu7IyeDdlwPcA8GwBPC7ekzxJMZAqpzxT0teBZiVIBtPObTbawdGe6Fbj8HndrfxJBnu0HQA9oU2z8-RMt_ncWoRMs1urnoAjlaPQRJlWJ3Gnk31U',
    leaveType: 'Việc riêng',
    startDate: '2024-04-20',
    days: 1,
    status: 'Đã duyệt',
    createdAt: '2024-04-15T10:30:00'
  },
  {
    id: '3',
    teacherId: '3',
    teacherName: 'Trần Minh Hoàng',
    teacherCode: 'GV-202415',
    department: 'Khoa Vật lý',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuXQjBGgCmr6yvoIkPjoqaA0lOlIyDzxbNMBe3wHEpAP1sjEWowvVuIHx_AESQwSBTesOHf1xm3ZnOV1YWe2VaXxcCuoXaF7VKmhVCY_1j1prLupp-1rtGAZxB_EpMsTlyi7rFzEAddrIFNgP__QhYQfXIdlQ0zG5dNHa0YD8zCTEpdTIcVpQP_fivAZCt6LPpd6XwdylDHmK-L-Fo3rWk3Ar-NDYkkr_87Tp-Kg7ifdO5dqbbsBFGHxk8sRwq5Dlt_UfpQn1E-6bV',
    leaveType: 'Nghỉ ốm',
    startDate: '2024-04-18',
    endDate: '2024-04-19',
    days: 2,
    status: 'Từ chối',
    createdAt: '2024-04-17T14:20:00'
  }
];

export const leaveStats: LeaveStat[] = [
  {
    title: 'Tổng yêu cầu',
    value: 1284,
    icon: 'dashboard',
    color: 'text-primary',
    bgColor: 'bg-primary-fixed'
  },
  {
    title: 'Đang chờ duyệt',
    value: 15,
    icon: 'pending_actions',
    color: 'text-secondary',
    bgColor: 'bg-secondary-container'
  },
  {
    title: 'Đã duyệt',
    value: 1120,
    icon: 'check_circle',
    color: 'text-primary',
    bgColor: 'bg-primary-fixed'
  },
  {
    title: 'Bị từ chối',
    value: 149,
    icon: 'cancel',
    color: 'text-error',
    bgColor: 'bg-error-container'
  }
];

export const leaveActivities: LeaveActivity[] = [
  {
    id: '1',
    user: 'Admin',
    action: 'đã duyệt yêu cầu của',
    target: 'Nguyễn Văn An',
    time: '2 phút trước',
    type: 'approve',
    icon: 'person',
    bgColor: 'bg-primary-fixed',
    textColor: 'text-primary'
  },
  {
    id: '2',
    user: 'Lê Thị Mai',
    action: 'vừa gửi một yêu cầu nghỉ mới',
    time: '15 phút trước',
    type: 'submit',
    icon: 'history',
    bgColor: 'bg-secondary-container',
    textColor: 'text-secondary'
  },
  {
    id: '3',
    user: 'Admin',
    action: 'đã từ chối yêu cầu của',
    target: 'Trần Minh Hoàng',
    time: '1 giờ trước',
    type: 'reject',
    icon: 'block',
    bgColor: 'bg-error-container',
    textColor: 'text-error'
  },
  {
    id: '4',
    action: 'Hệ thống đã tự động xuất báo cáo tuần',
    time: '3 giờ trước',
    type: 'system',
    icon: 'file_upload',
    bgColor: 'bg-primary-fixed',
    textColor: 'text-primary'
  }
];