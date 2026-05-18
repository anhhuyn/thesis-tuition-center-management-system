// src/utils/mockTeachers.ts
import type { Teacher, TeacherStat, TeacherActivity } from '../utils/types/teacher';

export const mockTeachers: Teacher[] = [
  {
    id: '1',
    name: 'Nguyễn Thị Minh An',
    email: 'minhan.nguyen@hocvien.edu.vn',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0AMYDglDKQW_Gp6HFp9y6Jii0RxzWUXDgRPUd4j8RqIQ9laZVjSVQ6526Uw1LyPRBfgxviTHKi62aYgSnAd8szfCQisaJf79rO9sDjShjpp7FRNxT5Xb2H9L4hH8JKyRjzI6Xr1t5p6HovfFIxyLtZktF45Soq9VFQAo-7UJtz2UFi58pdkcsTq-1vLDwYSdFMs5KZ9rSh3eJC6nmveUgUDp12_Mg6UWqLNDPVEHtQmFtIdK-W8WE_GyTO9f45n8G1iYHu-zlI7Ca',
    teacherId: 'TEA-2024-089',
    subject: 'Ngôn ngữ Anh',
    department: 'Ngoại ngữ',
    status: 'Đang hoạt động',
    experience: '8 năm',
    experienceYears: 8,
    joinDate: 'Th09 2016',
    position: 'Giảng viên chính',
    phone: '0987 654 321',
    gender: 'Nữ',
    dateOfBirth: '1992-05-15',
    degree: 'Thạc sĩ',
    notes: 'Giáo viên có chuyên môn tốt, đạt chứng chỉ IELTS 8.5. Hiện đang phụ trách các lớp nâng cao khối 12.'
  },
  {
    id: '2',
    name: 'Marcus Thompson',
    email: 'm.thompson@academy.edu',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAe4FQH8wdtS_PDaHAE1UcCu0QoPTy_yptf7yR8iVab3kqsB09CsGBKYTbyqTu8lQVaTBSyBrLFvdm6qyjo1YXPzzbsJy0dBPb27mvD7MhIDadol8RTMYx-ancdsCRUqEYfLajhibbmt5zYkN9Jfi-gp5O5U9NA17o0HjE3CMnF7vFZaJItFn-lPaZR5gL9FN0zP_6G44U9x_HBlBRZUnBestqKuURVcNxdTS-DEDobvH70f2RHtbx32o8lpEmoYvV9_FNa3YVv3OYP',
    teacherId: '#GV-9088',
    subject: 'Lịch sử',
    department: 'Nhân văn',
    status: 'Đang hoạt động',
    experience: '4 năm',
    experienceYears: 4,
    joinDate: 'Th03 2022',
    position: 'Giảng viên'
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    email: 'e.rodriguez@academy.edu',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWnShRLucclA2B61l-w-mmtB_s5yImhLj6Iq4seMRq5XJcAj55IZRKwMQzZTrXgksQhUZSdLjOifiaRaQB2DSmWB9JK9DhGcbuwNsUUYUGxJyG0uBQj2rJd8z28G94kElcnrhhl7lEKG9zGYiLXiyydYTm-3x5voSygWA96m8aQr_4CyLY5vwIODeTNajZdWAZ6zCsn89SwIl9F6rbkNAi5jFyoS-0Ewoi-Hep6qzktQLKPBP-sXmXeKv-JLd087L6kryJdwu1jsNh',
    teacherId: '#GV-9051',
    subject: 'Hóa học',
    department: 'Khoa học Tự nhiên',
    status: 'Tạm nghỉ',
    experience: '6 năm',
    experienceYears: 6,
    joinDate: 'Th08 2019',
    position: 'Trưởng khoa'
  },
  {
    id: '4',
    name: 'Liam O\'Brian',
    email: 'l.obrian@academy.edu',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfbHwjcqp7MAVMsscmw3jle_BxOJDsk798_YJ8qF7Ye4xMndXDidn6WsDi56LtWlGrRPVHmykoRo6Pf7uz5QUu1EYrJ-Esbn0xOm5eiaHFkn4LeE1vUidLsY208-fp6H_qzlcSqrizUjRwhO0QufynfYlj1GnlmTb44NdTsd__85aDjQv1NHWk4TNanWN1SMelmw3QIGhY13SZbZrqTeUDNPKmdxTCewMfQzKVMDKaamzlMCarOfsJwpmS8AWOkQ10IdzsROt8Tt7B',
    teacherId: '#GV-8821',
    subject: 'Vật lý',
    department: 'Khoa học & Công nghệ',
    status: 'Đã nghỉ hưu',
    experience: '3 năm',
    experienceYears: 3,
    joinDate: 'Th09 2020',
    position: 'Giáo viên thay thế'
  }
];

export const teacherStats: TeacherStat[] = [
  {
    title: 'Tổng giáo viên',
    value: 120,
    trend: 5.2,
    trendDirection: 'up',
    chartData: [70]
  },
  {
    title: 'Đang hoạt động',
    value: 98,
    trend: 3.1,
    trendDirection: 'up',
    chartData: [82]
  },
  {
    title: 'Mới trong tháng',
    value: 12,
    trend: 12,
    trendDirection: 'up',
    chartData: [45]
  },
  {
    title: 'Tạm nghỉ',
    value: 5,
    trend: 2.1,
    trendDirection: 'down',
    chartData: [15]
  },
  {
    title: 'Phân bố môn',
    value: 'Toán/Khoa học',
    subText: 'Chính',
    chartData: [40, 30]
  },
  {
    title: 'Kinh nghiệm TB',
    value: 4.5,
    trend: 1.2,
    trendDirection: 'up',
    subText: 'năm',
    chartData: [60]
  }
];

export const teacherActivities: TeacherActivity[] = [
  {
    id: '1',
    user: 'Nguyễn Thị Minh An',
    action: 'Cập nhật hồ sơ',
    description: 'đã cập nhật thông tin liên hệ',
    time: '2 giờ trước',
    type: 'profile'
  },
  {
    id: '2',
    user: 'Marcus Thompson',
    action: 'Giáo viên mới',
    description: 'được thêm vào khoa Nhân văn',
    time: '5 giờ trước',
    type: 'teacher'
  },
  {
    id: '3',
    user: 'Elena Rodriguez',
    action: 'Yêu cầu nghỉ phép',
    description: 'đã gửi yêu cầu nghỉ phép cho tuần sau',
    time: 'Hôm qua',
    type: 'leave'
  }
];