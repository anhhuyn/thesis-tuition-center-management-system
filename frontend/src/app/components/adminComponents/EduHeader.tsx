// EduHeader.tsx - Fixed tooltip position
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BookOpen, Menu, X, Bell, Settings, MessageSquare, User, LogOut,
  ChevronDown, Pin, PinOff, CheckCheck, MoreHorizontal, Check, EyeOff
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { getImageSrc, getInitials, getRoleName } from "../../utils/helpers";
import type { ActivityLog } from '../../utils/types/activity-log';
import { activityLogApi } from '../../utils/api/activity-log.api';
import { teacherLeaveApi } from '../../utils/api/teacherLeave.api';

const NAV_LINKS = [
  { label: 'Trang chủ', path: '/admin/home' },
  {
    label: 'Học sinh',
    path: '#',
    children: [
      { label: 'Danh sách học sinh', path: '/admin/student' },
      { label: 'Quản lý học phí', path: '/admin/tuition' },
    ]
  },
  {
    label: 'Giáo viên',
    path: '#',
    children: [
      { label: 'Danh sách giáo viên', path: '/admin/teacher' },
      { label: 'Thảo thuận lương', path: '/admin/teacher-subject' },
      { label: 'Lịch nghỉ giáo viên', path: '/admin/teacher/leave' },
      { label: 'Lương giáo viên', path: '/admin/payroll' },
    ]
  },
  { label: 'Lớp học', path: '/admin/class' },
  { label: 'Thông báo', path: '/admin/announcement' },
  {
    label: 'Khác',
    path: '#',
    children: [
      { label: 'Lịch học', path: '/admin/schedule' },
      { label: 'Phòng học', path: '/admin/rooms' },
      { label: 'Lịch sử hoạt động', path: '/admin/recent-activity' },
    ]
  },
];

// Google-style Tooltip component with better positioning
const GoogleTooltip = ({ children, text }: { children: React.ReactNode; text: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2 - 30,
      });
    }
    setIsVisible(true);
  };

  const hideTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 100);
  };

  return (
    <div
      ref={triggerRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      className="relative inline-block"
    >
      {children}
      {isVisible && (
        <div
          className="fixed z-[100] px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-100 shadow-lg"
          style={{
            top: position.top,
            left: position.left,
            transform: 'translateX(-50%)',
          }}
        >
          {text}
          <div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-0 border-4 border-transparent border-b-gray-900"
            style={{ marginBottom: '-1px' }}
          />
        </div>
      )}
    </div>
  );
};

// Dropdown menu component cho từng activity
const ActivityMenu = ({
  activityId,
  isRead,
  onMarkAsRead
}: {
  activityId: number;
  isRead: boolean;
  onMarkAsRead: (id: number) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 rounded-lg hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
          {!isRead ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(activityId);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              <Check className="w-4 h-4" />
              Đánh dấu đã đọc
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
              disabled
            >
              <EyeOff className="w-4 h-4" />
              Đã đọc
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export function EduHeader() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  // State for header visibility and pin
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isPinned, setIsPinned] = useState(() => {
    const saved = localStorage.getItem('headerPinned');
    return saved ? JSON.parse(saved) : false;
  });
  const [isHoveringTop, setIsHoveringTop] = useState(false);

  // Save pin state to localStorage
  useEffect(() => {
    localStorage.setItem('headerPinned', JSON.stringify(isPinned));

    if (isPinned) {
      setIsHeaderVisible(true);
    }
  }, [isPinned]);

  // Handle mouse movement near top edge (only when not pinned)
  useEffect(() => {
    if (isPinned) return;

    const handleMouseMove = (event: MouseEvent) => {
      const mouseY = event.clientY;
      const isNearTop = mouseY <= 50;

      if (isNearTop && !isHoveringTop) {
        setIsHoveringTop(true);
        setIsHeaderVisible(true);

        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
      } else if (!isNearTop && isHoveringTop) {
        setIsHoveringTop(false);

        hoverTimeoutRef.current = setTimeout(() => {
          if (!showUserMenu && !isMenuOpen) {
            setIsHeaderVisible(false);
          }
        }, 500);
      }
    };

    const handleMouseLeaveWindow = () => {
      if (isHeaderVisible && !showUserMenu && !isMenuOpen && !isPinned) {
        hoverTimeoutRef.current = setTimeout(() => {
          setIsHeaderVisible(false);
        }, 300);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeaveWindow);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeaveWindow);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, [isHoveringTop, showUserMenu, isMenuOpen, isHeaderVisible, isPinned]);

  // Handle scroll for shadow effect only
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keep header visible when interacting with menus
  useEffect(() => {
    if (showUserMenu || isMenuOpen) {
      setIsHeaderVisible(true);

      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    }
  }, [showUserMenu, isMenuOpen]);

  // Xử lý đóng User Menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper function để parse meta an toàn
  const getMetaSafe = (metaString: string | null) => {
    if (!metaString) return null;
    try {
      return JSON.parse(metaString);
    } catch (error) {
      console.warn('Failed to parse meta JSON:', metaString);
      return null;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  // Fetch activities cho admin
  const fetchActivities = useCallback(async () => {
    try {
      if (!user) return;

      setLoading(true);
      const data = await activityLogApi.getRecentActivities(10);
      setActivities(data);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      setMarkingAllRead(true);
      await activityLogApi.markAllAsRead(user.id);

      // Cập nhật state: đánh dấu tất cả đã đọc
      setActivities(prev =>
        prev.map(activity => ({ ...activity, isRead: true }))
      );

      // Toast thông báo thành công (có thể thêm library toast)
      console.log('Đã đánh dấu tất cả thông báo đã đọc');
    } catch (err) {
      console.error('Error marking all as read:', err);
    } finally {
      setMarkingAllRead(false);
    }
  };

  // Handle mark single as read
  const handleMarkAsRead = async (activityId: number) => {
    try {
      await activityLogApi.markAsRead(activityId);

      // Cập nhật state: đánh dấu 1 thông báo đã đọc
      setActivities(prev =>
        prev.map(activity =>
          activity.id === activityId
            ? { ...activity, isRead: true }
            : activity
        )
      );

      console.log(`Đã đánh dấu thông báo ${activityId} đã đọc`);
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  // Trong EduHeader component, thêm state mới
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);

  // Thêm useEffect để fetch số lượng đơn chờ duyệt
  useEffect(() => {
    const fetchPendingLeaveCount = async () => {
      try {
        if (!user) return;
        const stats = await teacherLeaveApi.getPendingStats();
        setPendingLeaveCount(stats.pendingCount);
      } catch (err) {
        console.error('Error fetching pending leave count:', err);
      }
    };

    fetchPendingLeaveCount();

    // Có thể set interval để refresh mỗi 30s nếu muốn
    const interval = setInterval(fetchPendingLeaveCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  const navigateToPage = (path: string) => {
    if (path !== '#') navigate(path);
    setIsMenuOpen(false);

    if (!isPinned) {
      setIsHeaderVisible(true);
      setTimeout(() => {
        if (!showUserMenu && !isMenuOpen && !isHoveringTop && !isPinned) {
          setIsHeaderVisible(false);
        }
      }, 1000);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const togglePin = () => {
    setIsPinned(!isPinned);
    if (!isPinned) {
      setIsHeaderVisible(true);
    } else {
      setTimeout(() => {
        if (!showUserMenu && !isMenuOpen && !isHoveringTop) {
          setIsHeaderVisible(false);
        }
      }, 1000);
    }
  };

  // Đếm số thông báo chưa đọc
  const unreadCount = activities.filter(a => !a.isRead).length;

  return (
    <>
      {/* Small invisible hit area at the top for easier hover detection - only when not pinned */}
      {!isPinned && (
        <div
          className="fixed top-0 left-0 right-0 z-40"
          style={{ height: '8px' }}
          onMouseEnter={() => {
            setIsHeaderVisible(true);
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          }}
        />
      )}

      {/* Spacer div to prevent content jump */}
      <div className={`transition-all duration-300 ${isHeaderVisible ? 'h-16 sm:h-20' : 'h-0'}`} />

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
          } ${scrolled ? 'shadow-lg' : ''}`}
        style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(116,148,236,0.1)'
        }}
        onMouseEnter={() => {
          if (!isPinned) {
            if (hoverTimeoutRef.current) {
              clearTimeout(hoverTimeoutRef.current);
            }
          }
        }}
        onMouseLeave={() => {
          if (!isPinned && !showUserMenu && !isMenuOpen) {
            hoverTimeoutRef.current = setTimeout(() => {
              setIsHeaderVisible(false);
            }, 300);
          }
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
                    {/* 👉 BADGE NHỎ CHO "Giáo viên" */}
                    {link.label === 'Giáo viên' && pendingLeaveCount > 0 && (
                      <span className="ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm shadow-red-500/20">
                        {pendingLeaveCount > 99 ? '99+' : pendingLeaveCount}
                      </span>
                    )}
                    {link.children && (
                      <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                    )}
                  </button>

                  {/* Dropdown */}
                  {link.children && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50 py-2">
                      {link.children.map((child) => (
                        <button
                          key={child.path}
                          onClick={() => navigateToPage(child.path)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-indigo-50 hover:text-[#667eea] transition-colors flex items-center justify-between"
                        >
                          <span>{child.label}</span>
                          {/* 👉 BADGE NHỎ CHO "Lịch nghỉ giáo viên" */}
                          {child.label === 'Lịch nghỉ giáo viên' && pendingLeaveCount > 0 && (
                            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm shadow-red-500/20">
                              {pendingLeaveCount > 99 ? '99+' : pendingLeaveCount}
                            </span>
                          )}
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

                  {/* Badge số lượng thông báo chưa đọc */}
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 text-[8px] text-white font-semibold items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    </span>
                  )}
                </button>

                {/* Dropdown xem nhanh */}
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Thông báo hoạt động</h3>
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={markingAllRead || unreadCount === 0}
                      className={`text-xs font-medium transition-colors flex items-center gap-1 ${unreadCount === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-[#667eea] hover:underline'
                        }`}
                    >
                      {markingAllRead ? (
                        <>
                          <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-500"></span>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <CheckCheck className="w-3 h-3" />
                          Đánh dấu đã đọc
                        </>
                      )}
                    </button>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto">
                    {loading ? (
                      <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                        <p className="text-sm text-gray-400 mt-2">Đang tải...</p>
                      </div>
                    ) : activities.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Chưa có hoạt động nào</p>
                      </div>
                    ) : (
                      activities.map(activity => {
                        const meta = getMetaSafe(activity.meta);
                        const isCurrentUser = activity.userId === user?.id;
                        const isUnread = !activity.isRead;

                        return (
                          <div
                            key={activity.id}
                            className={`p-4 hover:bg-gray-50 transition-colors flex gap-3 border-b border-gray-50 group ${isUnread ? 'bg-blue-50 hover:bg-blue-100' : ''
                              }`}
                          >
                            <div
                              className="flex-1 min-w-0 cursor-pointer"
                              onClick={() => {
                                if (isUnread) {
                                  handleMarkAsRead(activity.id);
                                }
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                  {activity.userImage ? (
                                    <img
                                      src={getImageSrc(activity.userImage) ?? undefined}
                                      className="w-full h-full object-cover"
                                      alt=""
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                      {getInitials(activity.userName)}
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-800">
                                    <span className="font-bold">
                                      {isCurrentUser ? 'Bạn' : activity.userName}
                                    </span>
                                    {' '}{activity.description}
                                  </p>

                                  {meta?.title && (
                                    <p className="text-xs text-indigo-500 mt-1 font-medium truncate">
                                      📌 {meta.title}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-[11px] text-gray-400">
                                      {formatRelativeTime(activity.createdAt)}
                                    </span>
                                    {isUnread && (
                                      <span className="text-[10px] font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                        Mới
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* More button */}
                            <div className="flex-shrink-0">
                              <ActivityMenu
                                activityId={activity.id}
                                isRead={!isUnread}
                                onMarkAsRead={handleMarkAsRead}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <button
                    onClick={() => navigate('/admin/recent-activity')}
                    className="w-full p-3 text-center text-sm font-semibold text-gray-600 hover:text-[#667eea] border-t border-gray-100 transition-colors"
                  >
                    Xem tất cả hoạt động
                  </button>
                </div>
              </div>

              <div className="h-5 w-px bg-gray-200 mx-1" />

              {/* User menu Container */}
              <div className="relative" ref={userMenuRef}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-1.5 p-1 pr-2 rounded-full hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-100 group"
                  >
                    <div className={`w-9 h-9 rounded-full ring-2 p-0.5 transition-all duration-300 overflow-hidden ${showUserMenu ? 'ring-indigo-500 shadow-md' : 'ring-gray-100 group-hover:ring-indigo-200'
                      }`}>
                      {user?.image ? (
                        <img
                          src={getImageSrc(user.image) || ''}
                          alt={user.fullName}
                          className="w-full h-full rounded-full object-cover"
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

                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  {/* Pin button after avatar with Google-style tooltip */}
                  <GoogleTooltip text={isPinned ? "Đã ghim thanh điều hướng" : "Ghim thanh điều hướng"}>
                    <button
                      onClick={togglePin}
                      className={`p-2 rounded-lg transition-all duration-300 active:scale-95 ${isPinned
                        ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                        : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'
                        }`}
                    >
                      {isPinned ? (
                        <Pin className="w-4 h-4" />
                      ) : (
                        <PinOff className="w-4 h-4 " />
                      )}
                    </button>
                  </GoogleTooltip>
                </div>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right z-[60]">
                    <div className="px-4 py-3 mb-2 border-b border-gray-50">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1">
                        {user?.roleId && getRoleName(user.roleId)}
                      </p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

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

                    {/* Pin option in user menu */}
                    <div className="my-2 border-t border-gray-50" />

                    <div className="px-2">
                      <MenuAction
                        icon={isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
                        label={isPinned ? "Bỏ ghim header" : "Ghim header"}
                        onClick={togglePin}
                      />
                    </div>

                    <div className="my-2 border-t border-gray-50" />

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
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white animate-in slide-in-from-top duration-300">
            <div className="px-4 py-4 space-y-2">
              {NAV_LINKS.map((link) => (
                <div key={link.label}>
                  <button
                    onClick={() => !link.children && navigateToPage(link.path)}
                    className={`block w-full text-left py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-between ${isActive(link.path) ? 'bg-indigo-50 gradient-text' : 'text-gray-600'
                      }`}
                  >
                    <span>{link.label}</span>
                    {/* 👉 BADGE NHỎ CHO "Giáo viên" trên mobile */}
                    {link.label === 'Giáo viên' && pendingLeaveCount > 0 && (
                      <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm shadow-red-500/20">
                        {pendingLeaveCount > 99 ? '99+' : pendingLeaveCount}
                      </span>
                    )}
                  </button>

                  {link.children && (
                    <div className="ml-4 mt-1 border-l-2 border-indigo-100">
                      {link.children.map((child) => (
                        <button
                          key={child.path}
                          onClick={() => navigateToPage(child.path)}
                          className="block w-full text-left py-2 px-6 text-sm text-gray-500 hover:text-[#667eea] flex items-center justify-between"
                        >
                          <span>{child.label}</span>
                          {/* 👉 BADGE NHỎ CHO "Lịch nghỉ giáo viên" trên mobile */}
                          {child.label === 'Lịch nghỉ giáo viên' && pendingLeaveCount > 0 && (
                            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm shadow-red-500/20">
                              {pendingLeaveCount > 99 ? '99+' : pendingLeaveCount}
                            </span>
                          )}
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
    </>
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