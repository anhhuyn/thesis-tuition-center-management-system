import { X, Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { loginApi } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios'; // axios instance đã cấu hình

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultMode?: 'login' | 'register';
}

export function LoginModal({
    isOpen,
    onClose,
    defaultMode = 'login',
}: LoginModalProps) {
    const [isLogin, setIsLogin] = useState(defaultMode === 'login');
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await loginApi(email, password);
            const { user, token } = res;

            // Lưu token
            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Cập nhật context
            login(user);
            onClose();

            // Điều hướng theo roleId
            if (user.roleId === 'R0') {
                navigate('/admin/home');
            } else if (user.roleId === 'R1') {
                navigate('/teacher/classes');
            } else {
                navigate('/');
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Sai email hoặc mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-[slideUp_0.3s_ease-out]">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>

                {/* Header with Gradient */}
                <div className="relative h-20 bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb] overflow-hidden">
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white -mr-16 -mt-16" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white -ml-12 -mb-12" />
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-[#1a1a2e] mb-2">
                            {isLogin ? 'Chào mừng trở lại!' : 'Đăng ký tài khoản'}
                        </h2>
                        <p className="text-gray-600">
                            {isLogin
                                ? 'Đăng nhập để tiếp tục sử dụng EduCenter Pro'
                                : 'Việc tạo tài khoản cần được quản trị viên hỗ trợ'}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${isLogin
                                ? 'bg-white text-[#667eea] shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Đăng nhập
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${!isLogin
                                ? 'bg-white text-[#667eea] shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Đăng ký
                        </button>
                    </div>

                    {/* LOGIN FORM */}
                    {isLogin ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@email.com"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#667eea]"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mật khẩu
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#667eea]"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm text-center">
                                    {error}
                                </p>
                            )}

                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input type="checkbox" className="w-4 h-4 text-[#667eea] border-gray-300 rounded" />
                                    <span className="ml-2 text-sm text-gray-600">
                                        Ghi nhớ đăng nhập
                                    </span>
                                </label>
                                <a
                                    href="#"
                                    className="text-sm text-[#667eea] hover:text-[#764ba2] font-medium"
                                >
                                    Quên mật khẩu?
                                </a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl font-semibold text-white
                 bg-gradient-to-r from-[#667eea] to-[#764ba2]
                 hover:shadow-lg transition-all
                 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-10 px-6 rounded-2xl bg-gray-50 border border-dashed border-gray-300">
                            <p className="text-gray-600 mb-6">
                                Việc tạo tài khoản mới hiện được quản lý bởi hệ thống. Vui lòng liên hệ <b>quản trị viên trung tâm</b> để được hỗ trợ.
                            </p>
                            <div className="text-sm text-gray-500">
                                Hotline: <b>090x.xxx.xxx</b> <br />
                                Email: <b>admin@educenter.vn</b>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
        </div>
    );
}