import { useState, useEffect, useCallback, useRef } from 'react';
import { BookOpen, Menu, X, Bell, Settings, MessageSquare, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { getImageSrc, getInitials, getRoleName } from "../../utils/helpers";

const NAV_LINKS = [
  { label: 'Trang chủ', path: '/admin/home' },
  { label: 'Học sinh', path: '/admin/student' },
   {
    label: 'Giáo viên',
    path: '#',
    children: [
      { label: 'Danh sách giáo viên', path: '/admin/teacher' },
      { label: 'Thảo thuận lương', path: '/admin/teacher-subject' },
      { label: 'Lịch nghỉ giáo viên', path: '/admin/teacher/leave' },
    ]
  },
  { label: 'Lớp học', path: '/admin/class' },
  { label: 'Thông báo', path: '/admin/announcement' },
  {
    label: 'Khác',
    path: '#',
    children: [
      { label: 'Kho Tài liệu', path: '/admin/documents' },
      { label: 'Lịch học', path: '/admin/schedule' },
      { label: 'Phòng học', path: '/admin/rooms' },
      { label: 'Test', path: '/admin/test' },
    ]
  },
];

export function EduHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // 2. Xử lý đóng User Menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. Tối ưu scroll listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  const navigateToPage = (path: string) => {
    if (path !== '#') navigate(path);
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-lg' : ''}`}
      style={{
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(116,148,236,0.1)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">

          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/admin/home')}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center glow-effect sparkle bg-gradient-to-br from-[#667eea] to-[#764ba2]">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg sm:text-xl font-extrabold gradient-text heading-font">
              EduCenter Pro
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <div key={link.label} className="relative group">
                <button
                  onClick={() => !link.children && navigateToPage(link.path)}
                  className={`nav-link font-semibold text-sm transition-all flex items-center gap-1 ${isActive(link.path) ? 'gradient-text font-semibold' : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  {link.label}
                  {link.children && (
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                  )}
                </button>

                {/* Dropdown cho mục 'Khác' */}
                {link.children && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50 py-2">
                    {link.children.map((child) => (
                      <button
                        key={child.path}
                        onClick={() => navigateToPage(child.path)}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-[#667eea] transition-colors"
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Notification Bell */}
            <div className="relative group">
              <button
                className="relative p-2 sm:p-2.5 text-gray-500 hover:text-[#667eea] hover:bg-indigo-50 rounded-xl transition-all duration-300 active:scale-95"
              >
                <Bell className="w-5 h-6 transition-transform group-hover:rotate-[15deg]" />

                {/* Badge số lượng thông báo */}
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 text-[8px] text-white font-semibold items-center justify-center">
                    3
                  </span>
                </span>
              </button>

              {/* Dropdown xem nhanh (Hiện khi hover hoặc click tùy bạn chọn) */}
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Thông báo</h3>
                  <button className="text-xs text-[#667eea] hover:underline font-medium">Đánh dấu đã đọc</button>
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                  {/* Ví dụ 1 item thông báo */}
                  <div className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 border-b border-gray-50">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 line-clamp-2">
                        <span className="font-bold">Hệ thống:</span> Lịch học lớp ReactJS đã được cập nhật vào thứ 2 tuần tới.
                      </p>
                      <span className="text-[11px] text-gray-400 mt-1 block">2 phút trước</span>
                    </div>
                  </div>

                  <div className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex-shrink-0 flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 line-clamp-2">
                        <span className="font-bold">Cô Mai:</span> Đã phê duyệt yêu cầu nghỉ học của bạn.
                      </p>
                      <span className="text-[11px] text-gray-400 mt-1 block">1 giờ trước</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/admin/announcement')}
                  className="w-full p-3 text-center text-sm font-semibold text-gray-600 hover:text-[#667eea] border-t border-gray-100"
                >
                  Xem tất cả thông báo
                </button>
              </div>
            </div>

            <div className="h-5 w-px bg-gray-200 mx-1" />

            {/* User menu Container */}
            <div className="relative" ref={userMenuRef}>
              {/* 1. Nút kích hoạt (Trigger) - Thiết kế theo image_4a90e9.png */}
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                /* Chỉnh lại: pr-2 (giảm padding phải), gap-1.5 (khoảng cách giữa avatar và icon) */
                className="flex items-center gap-1.5 p-1 pr-2 rounded-full hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-100 group"
              >
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full ring-2 p-0.5 transition-all duration-300 overflow-hidden ${showUserMenu ? 'ring-indigo-500 shadow-md' : 'ring-gray-100 group-hover:ring-indigo-200'
                  }`}>
                  {user?.image ? (
                    <img
                      src={getImageSrc(user.image) || ''}
                      alt={user.fullName}
                      className="w-full h-full rounded-full object-cover"
                      // Xử lý nếu link ảnh lỗi (ví dụ 404) thì ẩn ảnh hiện chữ cái
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.classList.add('bg-indigo-600');
                      }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-inner">
                      <span className="text-[13px] font-bold text-white">
                        {getInitials(user?.fullName)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Icon mũi tên - Loại bỏ div bọc không cần thiết để dễ căn chỉnh */}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : 'showUserMenu text-indigo-500'
                    }`}
                />
              </button>

              {/* 2. Menu thả xuống (Dropdown) */}
              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right z-[60]">

                  {/* Header: Thông tin chi tiết */}
                  <div className="px-4 py-3 mb-2 border-b border-gray-50">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1">
                      {user?.roleId && getRoleName(user.roleId)}
                    </p>
                    <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>

                  {/* Danh sách lựa chọn */}
                  <div className="space-y-0.5 px-2">
                    <MenuAction
                      icon={<User className="w-4 h-4" />}
                      label="Hồ sơ cá nhân"
                      onClick={() => navigate('/admin/profile')}
                    />
                    <MenuAction
                      icon={<Settings className="w-4 h-4" />}
                      label="Cài đặt bảo mật"
                      onClick={() => { }}
                    />
                  </div>

                  <div className="my-2 border-t border-gray-50" />

                  {/* Nút Đăng xuất */}
                  <div className="px-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors group"
                    >
                      <div className="p-1.5 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold">Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#7494ec]"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white animate-in slide-in-from-top duration-300">
          <div className="px-4 py-4 space-y-2">
            {NAV_LINKS.map((link) => (
              <div key={link.label}>
                <button
                  onClick={() => !link.children && navigateToPage(link.path)}
                  className={`block w-full text-left py-3 px-4 rounded-lg font-medium transition-all ${isActive(link.path) ? 'bg-indigo-50 gradient-text' : 'text-gray-600'
                    }`}
                >
                  {link.label}
                </button>

                {/* Render mục con ngay bên dưới nếu có */}
                {link.children && (
                  <div className="ml-4 mt-1 border-l-2 border-indigo-100">
                    {link.children.map((child) => (
                      <button
                        key={child.path}
                        onClick={() => navigateToPage(child.path)}
                        className="block w-full text-left py-2 px-6 text-sm text-gray-500 hover:text-[#667eea]"
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

function MenuAction({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-all duration-200 group"
    >
      <div className="p-1.5 rounded-lg bg-gray-50 group-hover:bg-white group-hover:shadow-sm transition-all">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}