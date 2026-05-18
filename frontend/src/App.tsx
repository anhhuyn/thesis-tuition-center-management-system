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
import { LibraryPage } from './app/pages/admin/LibraryPage';
import { TeacherClassListPage } from './app/pages/teacher/TeacherClassListPage';
import { TeacherLayout } from './app/pages/teacher/TeacherLayout';
import { TeacherSchedule } from './app/pages/teacher/TeacherSchedule';
import TeacherHome from './app/pages/teacher/TeacherHomePage';
import { TeacherManagementPage } from './app/pages/admin/teachers/TeacherManagementPage';
import { TeacherCardViewPage } from './app/pages/admin/teachers/TeacherCardViewPage';
import { TeacherDetailPage } from './app/pages/admin/teachers/TeacherDetailPage';
import { SalaryManagementPage } from './app/pages/admin/contract/SalaryManagementPage';
import { SalaryAgreementDetailPage } from './app/pages/admin/contract/SalaryAgreementDetailPage';
import { LeaveCalendarPage } from './app/pages/admin/leaves/LeaveCalendarPage';
import { LeaveRequestDetail } from './app/pages/admin/leaves/LeaveRequestDetail';
import { LeaveManagementPage } from './app/pages/admin/leaves/LeaveManagementPage';

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  return (
    <BrowserRouter>
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

          {/* Quản lý giáo viên - Dạng thẻ (Card View) */}
          <Route
            path="teacher/cards"
            element={
              <ProtectedRoute>
                <TeacherCardViewPage />
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
                <ProfilePage />
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

          {/* Trang tài liệu chung */}
          <Route
            path="documents"
            element={
              <ProtectedRoute allowedRoles={['R0']}>
                <LibraryPage />
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

          <Route
            path="teacher/leave/calendar"
            element={
              <ProtectedRoute>
                <LeaveCalendarPage />
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
          {/* Các trang khác thêm tương tự ở đây nha */}
        </Route>

        {/* Teacher routes */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route
            path="home"
            element={
              <ProtectedRoute allowedRoles={['R1']}>
                <TeacherHome />
              </ProtectedRoute>
            }
          />
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
          {/* Có thể thêm /teacher/schedule, /teacher/class/:id... */}
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
