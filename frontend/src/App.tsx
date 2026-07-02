// src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './app/routes/ProtectedRoute';
import { LoginModal } from './app/components/HomePage/LoginModal';
import { Home } from './app/pages/HomePage';
import { AdminHomePage } from './app/pages/admin/AdminHomePage';
import { MainLayout } from './app/pages/admin/MainAdminLayout';
import { StudentManagementPage } from './app/pages/admin/StudentManagementPage';
import { ProfilePage } from './app/pages/admin/ProfilePage';
import { ClassListPage } from './app/pages/admin/ClassListPage';
import { ClassDetail } from './app/pages/admin/ClassDetail';
import { AnnouncementPage } from './app/pages/admin/AnnouncementPage';
import { SchedulePage } from './app/pages/admin/SchedulePage';
import { useState } from 'react';
import { StudentDetail } from './app/pages/admin/StudentDetail';
import RoomPage from './app/pages/admin/RoomPage';
import { TeacherClassListPage } from './app/pages/teacher/TeacherClassListPage';
import { TeacherLayout } from './app/pages/teacher/TeacherLayout';
import { TeacherSchedule } from './app/pages/teacher/TeacherSchedule';
import { TeacherManagementPage } from './app/pages/admin/teachers/TeacherManagementPage';
import { TeacherDetailPage } from './app/pages/admin/teachers/TeacherDetailPage';
import { SalaryManagementPage } from './app/pages/admin/contract/SalaryManagementPage';
import { SalaryAgreementDetailPage } from './app/pages/admin/contract/SalaryAgreementDetailPage';
import { LeaveRequestDetail } from './app/pages/admin/leaves/LeaveRequestDetail';
import { LeaveManagementPage } from './app/pages/admin/leaves/LeaveManagementPage';
import { TeacherLeaveManagementPage } from './app/pages/teacher/TeacherLeaveManagementPage';
import { PayrollPage } from './app/pages/admin/PayrollPage';
import { TeacherPayrollPage } from './app/pages/teacher/TeacherPayrollPage';
import { ScrollToTop } from './app/components/ScrollToTop';
import RecentActivityPage from './app/pages/admin/RecentActivityPage';
import TeacherRecentActivityPage from './app/pages/teacher/TeacherRecentActivityPage';
import TuitionPage from './app/pages/admin/TuitionPage';
import TuitionDetailPage from './app/pages/admin/TuitionDetailPage';


function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <Home
              onLoginClick={() => {
                setAuthMode('login');
                setIsLoginModalOpen(true);
              }}
              onRegisterClick={() => {
                setAuthMode('register');
                setIsLoginModalOpen(true);
              }}
            />
          }
        />

        {/* Trang Admin và các trang con của nó sẽ sử dụng MainLayout */}
        <Route path="/admin" element={<MainLayout />}>
          <Route
            path="home"
            element={
              <ProtectedRoute allowedRoles={['R0']}>
                <AdminHomePage />
              </ProtectedRoute>
            }
          />
          {/* Trang học sinh */}
          <Route
            path="student"
            element={
              <ProtectedRoute allowedRoles={['R0']}>
                <StudentManagementPage />
              </ProtectedRoute>
            }
          />
          {/* Trang chi tiết học sinh */}
          <Route
            path="student/:id"
            element={
              <ProtectedRoute allowedRoles={['R0']}>
                <StudentDetail />
              </ProtectedRoute>
            }
          />

          {/* Trang lịch */}
          <Route
            path="teacher"
            element={
              <ProtectedRoute allowedRoles={['R0']}>
                <TeacherManagementPage />
              </ProtectedRoute>
            }
          />

         
          <Route
            path="teacher/:id"
            element={
              <ProtectedRoute>
                <TeacherDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Trang profile ( admin) */}
          <Route
            path="profile"
            element={
              <ProtectedRoute allowedRoles={['R0']}>
                <ProfilePage isTeacher={false} />
              </ProtectedRoute>
            }
          />

          {/* Trang lịch */}
          <Route
            path="schedule"
            element={
              <ProtectedRoute allowedRoles={['R0']}>
                <SchedulePage />
              </ProtectedRoute>
            }
          />

          {/* Trang phòng học */}
          <Route
            path="rooms"
            element={
              <ProtectedRoute allowedRoles={['R0']}>
                <RoomPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="teacher-subject"
            element={
              <ProtectedRoute>
                <SalaryManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="teacher-subject/:id"
            element={
              <ProtectedRoute>
                <SalaryAgreementDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Trang hoạt động */}
          <Route
            path="recent-activity"
            element={
              <ProtectedRoute allowedRoles={['R0']}>
                <RecentActivityPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="teacher/leave"
            element={
              <ProtectedRoute>
                <LeaveManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="teacher/leave/:id"
            element={
              <ProtectedRoute>
                <LeaveRequestDetail />
              </ProtectedRoute>
            }
          />

          {/* Trang thông báo */}
          <Route
            path="announcement"
            element={
              <ProtectedRoute allowedRoles={['R0']}>
                <AnnouncementPage />
              </ProtectedRoute>
            }
          />

          {/* Trang danh sách lớp học ( admin) */}
          <Route
            path="class"
            element={
              <ProtectedRoute allowedRoles={['R0']}>
                <ClassListPage />
              </ProtectedRoute>
            }
          />
          {/* Trang chi tiết lớp học ( admin) */}
          <Route
            path="class/:id"
            element={
              <ProtectedRoute allowedRoles={['R0']}>
                <ClassDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="payroll"
            element={
              <ProtectedRoute allowedRoles={['R0']}>
                <PayrollPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="tuition"
            element={
              <ProtectedRoute allowedRoles={['R0']}>
                <TuitionPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="tuition/:id"
            element={
              <ProtectedRoute allowedRoles={['R0']}>
                <TuitionDetailPage />
              </ProtectedRoute>
            }
          />
          {/* Các trang khác thêm tương tự ở đây nha */}
        </Route>


        {/* Teacher routes */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route
            path="classes"
            element={
              <ProtectedRoute allowedRoles={['R1']}>
                <TeacherClassListPage />
              </ProtectedRoute>
            }
          />

          {/* Trang danh sách lớp học ( teacher) */}
          <Route
            path="class/:id"
            element={
              <ProtectedRoute allowedRoles={['R1']}>
                <ClassDetail isTeacher={true} />
              </ProtectedRoute>
            }
          />

          <Route
            path="schedule"
            element={
              <ProtectedRoute allowedRoles={['R1']}>
                <TeacherSchedule />
              </ProtectedRoute>
            }
          />

          <Route
            path="announcements"
            element={
              <ProtectedRoute allowedRoles={['R1']}>
                <AnnouncementPage isTeacher={true} />
              </ProtectedRoute>
            }
          />
          <Route
            path="leaves"
            element={
              <ProtectedRoute allowedRoles={['R1']}>
                <TeacherLeaveManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="salary"
            element={
              <ProtectedRoute allowedRoles={['R1']}>
                <TeacherPayrollPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="profile"
            element={
              <ProtectedRoute allowedRoles={['R1']}>
                <ProfilePage isTeacher={true} />
              </ProtectedRoute>
            }
          />

          <Route
            path="recent-activity"
            element={
              <ProtectedRoute allowedRoles={['R1']}>
                <TeacherRecentActivityPage />
              </ProtectedRoute>
            }
          />

        </Route>

        {/* Unauthorized page */}
        <Route path="/unauthorized" element={<div>Bạn không có quyền truy cập trang này.</div>} />

      </Routes>



      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        defaultMode={authMode}
      />
    </BrowserRouter>
  );
}

export default App;
