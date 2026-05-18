import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
    Image as ImageIcon,
    Paperclip,
    Heart,
    Eye,
    Search,
    TrendingUp,
    FileText,
    ChevronDown,
    Pin,
    Pencil,
    Trash2,
    FolderInput,
    Loader2,
    X,
} from "lucide-react";
import AnnouncementModal from "../../components/adminComponents/announcement/AnnouncementModal";
import { announcementApi } from "../../utils/api/announcement.api";
import type { Announcement, AnnouncementStatus } from "../../utils/types/announcement";
import { getImageSrc, getInitials } from "../../utils/helpers";
import { LibraryModal } from "../../components/adminComponents/announcement/LibraryModal";

const stats = [
    { label: "THÀNH VIÊN", value: "12.5k" },
    { label: "BÀI VIẾT", value: "3.2k" },
];

const getStatusBadge = (status: AnnouncementStatus) => {
    switch (status) {
        case "active":
            return { text: "CÔNG KHAI", bg: "bg-green-100", textColor: "text-green-700" };
        case "inactive":
            return { text: "ẨN", bg: "bg-gray-100", textColor: "text-gray-700" };
        case "draft":
            return { text: "NHÁP", bg: "bg-[#d9dde0]", textColor: "text-[#595c5e]" };
        default:
            return { text: "CÔNG KHAI", bg: "bg-green-100", textColor: "text-green-700" };
    }
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
};

const formatViewCount = (count: number) => {
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}k lượt xem`;
    }
    return `${count} lượt xem`;
};

interface AnnouncementPageProps {
    isTeacher?: boolean;
}

export const AnnouncementPage = ({ isTeacher = false }: AnnouncementPageProps) => {
    const [searchValue, setSearchValue] = useState("");
    const [likedPosts, setLikedPosts] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingData, setEditingData] = useState<Announcement | null>(null);

    // State for load more
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [pinnedAnnouncements, setPinnedAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");

    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    const [recentImages, setRecentImages] = useState<string[]>([]);
    const [recentFiles, setRecentFiles] = useState<{ name: string; url: string; size: string; type: string }[]>([]);
    const [allImages, setAllImages] = useState<string[]>([]);
    const [allFiles, setAllFiles] = useState<{ name: string; url: string; size: string; type: string }[]>([]);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
    const [libraryTab, setLibraryTab] = useState<'images' | 'files'>('images');
    const [togglingPinId, setTogglingPinId] = useState<number | null>(null);


    // Load dữ liệu media
    const loadMediaData = async () => {
        try {
            setLoadingFiles(true);

            // Lấy 50 bài viết để có đủ dữ liệu
            const response = await announcementApi.getAll(0, 50);
            let allPosts = response.content;

            // Nếu là teacher, chỉ lấy bài viết active
            if (isTeacher) {
                allPosts = allPosts.filter(post => post.status === 'active');
            }

            // Lấy tất cả hình ảnh
            const images = allPosts
                .filter(post => post.imageURL)
                .map(post => post.imageURL as string);

            // Lấy tất cả tài liệu
            const files = allPosts
                .filter(post => post.attachments && post.attachments.length > 0)
                .flatMap(post =>
                    post.attachments?.map(attachment => {
                        const fileName = attachment.split('/').pop() || 'unknown';
                        const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
                        return {
                            name: fileName,
                            url: attachment,
                            size: '',
                            type: fileExt
                        };
                    }) || []
                );

            // Lưu tất cả dữ liệu
            setAllImages(images);
            setAllFiles(files);

            // Lấy 3 ảnh mới nhất
            const latestImages = images.slice(0, 3);
            setRecentImages(latestImages);

            // Lấy 2 tệp mới nhất
            const latestFiles = files.slice(0, 2);
            setRecentFiles(latestFiles);

        } catch (error) {
            console.error('Failed to load media:', error);
        } finally {
            setLoadingFiles(false);
        }
    };

    // Gọi trong useEffect
    useEffect(() => {
        loadAnnouncements(0, false);
        loadMediaData();
    }, []);

    // Trong AnnouncementPage component, thêm state
    const [trendingPosts, setTrendingPosts] = useState<Announcement[]>([]);
    const [loadingTrending, setLoadingTrending] = useState(false);

    // Hàm tính toán bài viết nổi bật dựa trên các tiêu chí
    const calculateTrendingPosts = (posts: Announcement[]): Announcement[] => {
        // Tiêu chí 1: Bài viết active và có nhiều tương tác (like, view)
        // Tiêu chí 2: Bài viết mới trong vòng 7 ngày
        // Tiêu chí 3: Bài viết được ghim (pinned)

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Tính điểm cho mỗi bài viết
        const scoredPosts = posts.map(post => {
            let score = 0;

            // Bài viết active được ưu tiên
            if (post.status === 'active') score += 10;

            // Bài viết ghim được cộng điểm
            if (post.pinned) score += 5;

            // Bài viết mới trong 7 ngày được cộng điểm
            const postDate = new Date(post.createdAt);
            if (postDate >= sevenDaysAgo) score += 3;

            // Random điểm cho like/view (vì backend chưa có)
            // Sau này có thể thay bằng dữ liệu thật
            score += Math.floor(Math.random() * 20);

            return { post, score };
        });

        // Sắp xếp theo điểm và lấy top 3
        return scoredPosts
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(item => item.post);
    };

    // Load trending posts
    const loadTrendingPosts = async () => {
        try {
            setLoadingTrending(true);
            // Lấy 50 bài viết gần nhất để tính toán
            const response = await announcementApi.getAll(0, 50);
            let allPosts = response.content;

            // Nếu là teacher, chỉ lấy bài viết active
            if (isTeacher) {
                allPosts = allPosts.filter(post => post.status === 'active');
            }

            // Tính toán bài viết nổi bật
            const trending = calculateTrendingPosts(allPosts);
            setTrendingPosts(trending);
        } catch (error) {
            console.error('Failed to load trending posts:', error);
        } finally {
            setLoadingTrending(false);
        }
    };

    useEffect(() => {
        loadAnnouncements(0, false);
        loadMediaData();
        loadTrendingPosts();
    }, [isTeacher]);

    // Load announcements
    const loadAnnouncements = async (page: number = 0, append: boolean = false) => {
        try {
            if (page === 0) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await announcementApi.getAll(page, 10);

            // Lọc bài viết dựa trên role
            let filteredPosts = response.content;
            if (isTeacher) {
                // Teacher chỉ xem được bài viết có status = 'active'
                filteredPosts = response.content.filter(post => post.status === 'active');
            }

            const newPinned = filteredPosts.filter(post => post.pinned === true);
            const newNormal = filteredPosts.filter(post => post.pinned === false);

            if (append) {
                setAnnouncements(prev => [...prev, ...newNormal]);
                setPinnedAnnouncements(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const uniqueNewPinned = newPinned.filter(p => !existingIds.has(p.id));
                    return [...prev, ...uniqueNewPinned];
                });
            } else {
                setAnnouncements(newNormal);
                setPinnedAnnouncements(newPinned);
            }

            setHasMore(page + 1 < response.totalPages);
            setCurrentPage(page);
        } catch (error) {
            console.error("Failed to load announcements:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore && !loading) {
            loadAnnouncements(currentPage + 1, true);
        }
    }, [currentPage, hasMore, loadingMore, loading]);

    // Setup Intersection Observer
    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.1, rootMargin: "100px" }
        );

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [hasMore, loadingMore, loading, loadMore]);

    // Thêm hàm scrollToPost
    const scrollToPost = (postId: number) => {
        // Thử nhiều cách để tìm element
        let element = document.getElementById(`announcement-${postId}`);

        if (!element) {
            element = document.getElementById(`post-${postId}`);
        }

        if (element) {
            // Scroll với behavior smooth và offset để tránh bị che khuất bởi header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - 100; // Trừ đi 100px để không bị che

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Thêm hiệu ứng highlight
            element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'transition-all', 'duration-300');
            setTimeout(() => {
                element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
            }, 2000);
        } else {
            console.warn(`Post with id ${postId} not found`);
            // Nếu không tìm thấy, có thể bài viết chưa được load, cần load thêm
            loadAndScrollToPost(postId);
        }
    };

    // Hàm load bài viết nếu chưa có và scroll đến
    const loadAndScrollToPost = async (postId: number) => {
        try {
            // Tìm bài viết trong danh sách hiện tại
            const existingPost = [...announcements, ...pinnedAnnouncements].find(p => p.id === postId);

            if (!existingPost) {
                // Nếu chưa có, load bài viết cụ thể từ API
                const post = await announcementApi.getById(postId);
                // Thêm vào đầu danh sách announcements
                setAnnouncements(prev => [post, ...prev]);

                // Đợi một chút để DOM render xong
                setTimeout(() => {
                    scrollToPost(postId);
                }, 300);
            }
        } catch (error) {
            console.error('Failed to load post:', error);
        }
    };


    const [adminId, setAdminId] = useState<number>(() => {
        // Lấy từ localStorage hoặc context
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                return user.id || 1;
            } catch {
                return 1;
            }
        }
        return 1;
    });

    // Handle create
    const handleCreate = async (formData: FormData) => {
        try {
            // Lấy dữ liệu từ formData
            const dataStr = formData.get('data') as string;
            const data = JSON.parse(dataStr);

            // Lấy file từ formData - KHÔNG parse JSON
            const imageFile = formData.get('imageFile') as File;
            const attachments = formData.getAll('attachments') as File[];

            console.log('Data:', data); // { adminId, title, content, status, pinned }
            console.log('Image file:', imageFile);
            console.log('Attachments:', attachments);

            // Gọi API tạo bài viết
            const result = await announcementApi.create(
                data,
                imageFile || undefined,
                attachments.length > 0 ? attachments : undefined
            );
            console.log('Created announcement:', result);

            // Reset và reload dữ liệu
            setAnnouncements([]);
            setPinnedAnnouncements([]);
            setCurrentPage(0);
            setHasMore(true);
            await loadAnnouncements(0, false);
            await loadMediaData();
            await loadTrendingPosts();

            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to create announcement:", error);
            throw error;
        }
    };

    // Handle update
    // Handle update - Cách đơn giản và an toàn hơn
    const handleUpdate = async (id: number, formData: FormData) => {
        try {
            const dataStr = formData.get('data') as string;
            const data = JSON.parse(dataStr);
            const imageFile = formData.get('imageFile') as File;
            const attachments = formData.getAll('attachments') as File[];

            console.log('Updating announcement:', { id, data, imageFile, attachments });

            // Gọi API update
            const result = await announcementApi.update(
                id,
                data,
                imageFile || undefined,
                attachments.length > 0 ? attachments : undefined
            );

            console.log('Updated announcement:', result);

            // Reload toàn bộ dữ liệu từ đầu
            setCurrentPage(0);
            setHasMore(true);
            await loadAnnouncements(0, false);
            await loadMediaData();
            await loadTrendingPosts();

            setIsModalOpen(false);
            setEditingData(null);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update announcement:", error);
            throw error;
        }
    };

    // Handle delete
    const handleDelete = async (id: number) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
            try {
                const result = await announcementApi.delete(id);
                if (result.success) {
                    // Xóa khỏi state
                    setAnnouncements(prev => prev.filter(post => post.id !== id));
                    setPinnedAnnouncements(prev => prev.filter(post => post.id !== id));

                    // Refresh media và trending posts
                    await loadMediaData();
                    await loadTrendingPosts();

                    console.log('Deleted announcement:', id);
                }
            } catch (error) {
                console.error("Failed to delete announcement:", error);
                alert("Xóa bài viết thất bại!");
            }
        }
    };

    const handleTogglePin = async (announcement: Announcement) => {
        console.log('🔍 handleTogglePin called!');
        console.log('📌 Post ID:', announcement.id);
        console.log('📌 Current pinned status:', announcement.pinned);
        console.log('📌 Will change to:', !announcement.pinned);
        if (togglingPinId === announcement.id) {
            console.log('⚠️ Already toggling, skipping');
            return;
        }

        setTogglingPinId(announcement.id);
        try {
            console.log('🔄 Calling API to update...');
            const result = await announcementApi.update(announcement.id, {
                pinned: !announcement.pinned
            });
            console.log('✅ API response:', result);
            console.log('📌 New pinned status:', result.pinned);

            console.log('Toggle pin result:', result);

            // Cập nhật state
            if (result.pinned) {
                setPinnedAnnouncements(prev => [...prev, result]);
                setAnnouncements(prev => prev.filter(post => post.id !== result.id));
            } else {
                setAnnouncements(prev => [result, ...prev]);
                setPinnedAnnouncements(prev => prev.filter(post => post.id !== result.id));
            }

            await loadTrendingPosts();
        } catch (error) {
            console.error("Failed to toggle pin:", error);
            alert("Không thể thay đổi trạng thái ghim!");
        } finally {
            setTogglingPinId(null);
        }
    };

    const handleEdit = (announcement: Announcement) => {
        setIsEditing(true);
        setEditingData(announcement);
        setIsModalOpen(true);
    };

    const handleSubmit = async (formData: FormData) => {
        if (isEditing && editingData) {
            await handleUpdate(editingData.id, formData);
        } else {
            await handleCreate(formData);
        }
    };

    const handleSortChange = () => {
        const newSort = sortOrder === "latest" ? "oldest" : "latest";
        setSortOrder(newSort);
        setAnnouncements([]);
        setPinnedAnnouncements([]);
        setCurrentPage(0);
        setHasMore(true);
        loadAnnouncements(0, false);
    };

    useEffect(() => {
        loadAnnouncements(0, false);
    }, []);

    // Filter by search
    const filteredAnnouncements = announcements.filter(announcement =>
        announcement.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchValue.toLowerCase())
    );

    const filteredPinnedAnnouncements = pinnedAnnouncements.filter(announcement =>
        announcement.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchValue.toLowerCase())
    );

    const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
    const searchTimeoutRef = useRef<number | null>(null);

    const handleSearchChange = (value: string) => {
        setSearchValue(value);

        // Clear timeout cũ
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set timeout mới - delay 300ms để tránh lag
        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearchValue(value);
        }, 300);
    };

    // Cleanup timeout khi unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const toggleLike = (postId: number) => {
        setLikedPosts(prev =>
            prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-12 py-4 flex flex-col gap-6 pb-24"
        >
            <div className="grid grid-cols-12 gap-8">
                {/* LEFT */}
                <div className="col-span-8 flex flex-col gap-6">
                    {/* CREATE POST  */}
                    {!isTeacher && (
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="flex gap-4">
                                <motion.img
                                    whileHover={{ scale: 1.05 }}
                                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbNvlcAeJ9tEROUJXPVVsf3jtELgYKo7JV7g&s"
                                    className="w-10 h-10 rounded-full object-cover object-top cursor-pointer"
                                />
                                <div className="flex-1 flex flex-col gap-4">
                                    <motion.div
                                        whileHover={{ backgroundColor: "#f3f4f6" }}
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditingData(null);
                                            setIsModalOpen(true);
                                        }}
                                        className="p-3 bg-gray-100 rounded-xl text-gray-400 cursor-text transition-colors duration-200"
                                    >
                                        Bạn đang nghĩ gì?
                                    </motion.div>
                                    <div className="flex justify-between">
                                        <div className="flex gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-900 transition-colors duration-200"
                                            >
                                                <ImageIcon size={14} className="text-blue-900" /> Ảnh/Video
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex items-center gap-1 text-xs text-slate-400 hover:text-green-900 transition-colors duration-200"
                                            >
                                                <Paperclip size={14} className="text-green-900" /> Đính kèm
                                            </motion.button>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-4 py-1 btn-gradient text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                                        >
                                            Đăng bài
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* FILTER + SORT - Giữ nguyên giao diện */}
                    <div className="flex justify-between items-center px-2">
                        <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: "#1e3a8a" }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-blue-900 text-white px-4 py-1.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            Tất cả bài viết
                        </motion.button>
                        <motion.div
                            whileHover={{ borderColor: "#3b82f6" }}
                            onClick={handleSortChange}
                            className="flex items-center gap-2 bg-white border px-3 py-1.5 rounded-xl text-xs cursor-pointer hover:border-blue-400 transition-colors duration-200"
                        >
                            Sắp xếp: {sortOrder === "latest" ? "Mới nhất" : "Cũ nhất"} <ChevronDown size={14} />
                        </motion.div>
                    </div>

                    {/* PINNED POST - Dùng div thường để tránh xung đột sự kiện */}
                    {filteredPinnedAnnouncements.length > 0 && (
                        <div className="flex flex-col items-end gap-3">
                            <div className="flex items-center gap-2 w-full">
                                <Pin size={16} className="text-blue-900 fill-current" />
                                <span className="font-bold text-sm tracking-wider text-slate-400">
                                    BÀI VIẾT ĐÃ GHIM
                                </span>
                            </div>
                            {filteredPinnedAnnouncements.map((announcement) => (
                                <div
                                    key={announcement.id}
                                    className="w-full p-6 rounded-2xl bg-blue-50 border border-blue-100 relative overflow-hidden  hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                                >
                                    <div className="absolute top-2 right-2 opacity-10 text-blue-400 rotate-45 pointer-events-none">
                                        <Pin size={60} />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div className="text-xs text-gray-500">
                                                Đăng bởi {announcement.admin?.fullName || "Ban Quản Trị"} • {formatDate(announcement.createdAt)}
                                            </div>
                                            {!isTeacher && (
                                                <div className="flex items-center gap-3">
                                                    {/* Nút Edit */}

                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(announcement);
                                                        }}
                                                        className="cursor-pointer p-1 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                                                    >
                                                        <Pencil size={16} className="text-gray-500 hover:text-yellow-500" />
                                                    </div>


                                                    {/* Nút Pin/Unpin */}
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            console.log('🎯 Pin button CLICKED for announcement:', announcement.id);
                                                            console.log('🎯 Current pinned value:', announcement.pinned);
                                                            handleTogglePin(announcement);
                                                        }}
                                                        className="cursor-pointer p-1 rounded-lg transition-colors duration-200 hover:bg-gray-200"
                                                    >
                                                        {togglingPinId === announcement.id ? (
                                                            <Loader2 size={16} className="animate-spin text-blue-500" />
                                                        ) : (
                                                            <Pin
                                                                size={16}
                                                                className={`transition-colors duration-200 ${announcement.pinned
                                                                    ? "text-blue-900 fill-current"
                                                                    : "text-gray-500 hover:text-blue-900"
                                                                    }`}
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Nút Delete */}

                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(announcement.id);
                                                        }}
                                                        className="cursor-pointer p-1 hover:bg-red-100 rounded-lg transition-colors duration-200"
                                                    >
                                                        <Trash2 size={16} className="text-red-700 hover:text-red-500" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-lg font-extrabold text-blue-900">
                                            {announcement.title}
                                        </div>

                                        <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words">
                                            {announcement.content}
                                        </div>

                                        {announcement.imageURL && (
                                            <img
                                                src={`${import.meta.env.VITE_BACKEND_URL_IMAGE}${announcement.imageURL}`}
                                                className="mt-2 rounded-xl w-full max-h-96 object-cover cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(`${import.meta.env.VITE_BACKEND_URL_IMAGE}${announcement.imageURL}`, '_blank');
                                                }}
                                                alt={announcement.title}
                                            />
                                        )}

                                        <div
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-1 text-blue-900 font-semibold text-sm cursor-pointer hover:underline"
                                        >
                                            Xem chi tiết →
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* POSTS - Giữ nguyên giao diện */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="animate-spin text-blue-900" size={40} />
                        </div>
                    ) : (
                        <>
                            {filteredAnnouncements.map((post, index) => {
                                const statusBadge = getStatusBadge(post.status);
                                const likeCount = likedPosts.includes(post.id)
                                    ? Math.floor(Math.random() * 100) + 50
                                    : Math.floor(Math.random() * 100);

                                return (
                                    <motion.div
                                        id={`announcement-${post.id}`}
                                        key={post.id}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        whileHover={{ y: -4 }}
                                        className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition-all duration-300"
                                    >
                                        {/* HEADER */}
                                        <div className="flex justify-between">
                                            <div className="flex gap-3">
                                                {/* Avatar với ảnh thật */}
                                                {post.admin?.image ? (
                                                    <motion.img
                                                        whileHover={{ scale: 1.1 }}
                                                        src={getImageSrc(post.admin.image) || ''}
                                                        className="w-10 h-10 rounded-full object-cover cursor-pointer"
                                                        onError={(e) => {
                                                            // Nếu ảnh lỗi thì ẩn đi và hiển thị fallback
                                                            e.currentTarget.style.display = 'none';
                                                            const fallbackDiv = e.currentTarget.nextElementSibling;
                                                            if (fallbackDiv) fallbackDiv.classList.remove('hidden');
                                                        }}
                                                        alt={post.admin.fullName}
                                                    />
                                                ) : null}

                                                {/* Fallback khi không có ảnh hoặc ảnh lỗi */}
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    className={`w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold cursor-pointer ${post.admin?.image ? 'hidden' : ''}`}
                                                >
                                                    {getInitials(post.admin?.fullName)}
                                                </motion.div>
                                                <div>
                                                    <div className="flex gap-2 items-center">
                                                        <span className="font-semibold">{post.admin?.fullName || "Ban Quản Trị"}</span>
                                                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${statusBadge.bg} ${statusBadge.textColor}`}>
                                                            {statusBadge.text}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-400">{formatDate(post.createdAt)}</div>
                                                </div>
                                            </div>
                                            {!isTeacher && (
                                                <div className="flex items-center gap-3">
                                                    <motion.div
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleEdit(post)}
                                                    >
                                                        <Pencil size={16} className="cursor-pointer text-gray-500 hover:text-yellow-500 transition-colors duration-200" />
                                                    </motion.div>
                                                    <motion.div
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleTogglePin(post)}
                                                    >
                                                        {togglingPinId === post.id ? (
                                                            <Loader2 size={16} className="animate-spin text-blue-500" />
                                                        ) : (
                                                            <Pin
                                                                size={16}
                                                                className={`cursor-pointer transition-colors duration-200 ${post.pinned
                                                                    ? "text-blue-900 fill-current"
                                                                    : "text-gray-500 hover:text-blue-900"
                                                                    }`}
                                                            />
                                                        )}
                                                    </motion.div>
                                                    <motion.div
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleDelete(post.id)}
                                                    >
                                                        <Trash2 size={16} className="cursor-pointer text-red-700 hover:text-red-500 transition-colors duration-200" />
                                                    </motion.div>
                                                </div>
                                            )}
                                        </div>
                                        {/* TIÊU ĐỀ */}
                                        <div className="mt-3">
                                            <h3 className="font-bold text-lg text-gray-900 mb-2">
                                                {post.title}
                                            </h3>
                                        </div>
                                        {/* CONTENT */}
                                        <div className="mt-3 text-sm whitespace-pre-wrap break-words">
                                            {post.content}
                                        </div>
                                        {/* IMAGE */}
                                        {post.imageURL && (
                                            <motion.img
                                                initial={{ scale: 0.95, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                                whileHover={{ scale: 1.02 }}
                                                src={`${import.meta.env.VITE_BACKEND_URL_IMAGE}${post.imageURL}`}
                                                className="mt-3 rounded-xl w-full cursor-pointer"
                                            />
                                        )}
                                        {/* ACTION */}
                                        <div className="flex gap-5 mt-4 text-xs text-gray-500 border-t pt-3">
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className={`flex items-center gap-1 cursor-pointer transition-colors duration-200 ${likedPosts.includes(post.id) ? "text-red-500" : "hover:text-red-500"}`}
                                                onClick={() => toggleLike(post.id)}
                                            >
                                                <Heart
                                                    size={14}
                                                    fill={likedPosts.includes(post.id) ? "currentColor" : "none"}
                                                />
                                                {likedPosts.includes(post.id) ? parseInt(likeCount.toString()) + 1 : likeCount}
                                            </motion.div>
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                className="flex items-center gap-1 cursor-pointer hover:text-blue-500 transition-colors duration-200"
                                            >
                                                <Eye size={14} /> {formatViewCount(Math.floor(Math.random() * 5000) + 100)}
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {/* LOAD MORE TRIGGER */}
                            <div ref={loadMoreRef} className="py-8 flex justify-center">
                                {loadingMore && (
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Loader2 className="animate-spin" size={20} />
                                        <span className="text-sm">Đang tải thêm...</span>
                                    </div>
                                )}
                                {!hasMore && announcements.length > 0 && (
                                    <div className="text-center text-gray-400 text-sm py-4">
                                        Đã tải hết bài viết
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* RIGHT - Giữ nguyên hoàn toàn hardcode */}
                <div className="col-span-4 flex flex-col gap-6">
                    {/* SEARCH */}
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 bg-white rounded-2xl shadow hover:shadow-lg transition-shadow duration-300"
                    >
                        <div className="relative">
                            <Search
                                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                                size={18}
                            />
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Tìm kiếm bài viết..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full text-sm text-gray-600 placeholder:text-gray-400 outline-none focus:bg-gray-50 transition-all duration-200"
                            />
                            {searchValue && (
                                <button
                                    onClick={() => {
                                        handleSearchChange("");
                                        setSearchValue("");
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                    {/* FILE */}
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition-shadow duration-300 flex flex-col gap-5"
                    >
                        <div className="flex items-center gap-2 font-bold text-gray-800">
                            <FolderInput className="text-blue-900" size={18} />
                            Tệp & Hình ảnh
                        </div>

                        {/* HÌNH ẢNH GẦN ĐÂY */}
                        <div className="flex flex-col gap-3">
                            <div className="text-[10px] tracking-widest text-gray-500 font-bold">
                                HÌNH ẢNH GẦN ĐÂY
                            </div>
                            {loadingFiles ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="animate-spin text-blue-900" size={24} />
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {/* 2 ảnh mới nhất */}
                                    {recentImages.slice(0, 2).map((image, idx) => (
                                        <motion.img
                                            key={idx}
                                            whileHover={{ scale: 1.05 }}
                                            src={getImageSrc(image) || ''}
                                            className="w-full h-[90px] object-cover rounded-xl cursor-pointer"
                                            onClick={() => {
                                                setIsLibraryModalOpen(true);
                                                setLibraryTab('images');
                                            }}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                const parent = (e.target as HTMLImageElement).parentElement;
                                                if (parent) {
                                                    const placeholder = document.createElement('div');
                                                    placeholder.className = 'w-full h-[90px] bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 font-bold';
                                                    placeholder.textContent = 'IMG';
                                                    parent.appendChild(placeholder);
                                                }
                                            }}
                                        />
                                    ))}

                                    {/* Ảnh thứ 3 hiển thị số lượng còn lại */}
                                    <motion.div
                                        whileHover={{ scale: 1.05, backgroundColor: "#e5e7eb" }}
                                        className="w-full h-[90px] bg-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors duration-200"
                                        onClick={() => {
                                            setIsLibraryModalOpen(true);
                                            setLibraryTab('images');
                                        }}
                                    >
                                        <span className="text-blue-900 text-xl font-bold">
                                            +{allImages.length - 2}
                                        </span>
                                        <span className="text-xs text-gray-500">hình ảnh</span>
                                    </motion.div>

                                    {recentImages.length === 0 && (
                                        <div className="col-span-3 text-center text-gray-400 text-sm py-4">
                                            Chưa có hình ảnh nào
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* TÀI LIỆU ĐÃ TẢI LÊN */}
                        <div className="flex flex-col gap-3">
                            <div className="text-[10px] tracking-widest text-gray-500 font-bold">
                                TÀI LIỆU ĐÃ TẢI LÊN
                            </div>
                            {loadingFiles ? (
                                <div className="flex justify-center py-2">
                                    <Loader2 className="animate-spin text-blue-900" size={20} />
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {recentFiles.slice(0, 2).map((file, idx) => (
                                        <motion.a
                                            key={idx}
                                            href={getImageSrc(file.url) || ''}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.02, backgroundColor: "#f9fafb" }}
                                            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200"
                                        >
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                className={`p-2 rounded-lg ${file.type === 'pdf' ? 'bg-red-50' :
                                                    file.type === 'docx' || file.type === 'doc' ? 'bg-blue-50' :
                                                        'bg-gray-50'
                                                    }`}
                                            >
                                                <FileText size={16} className={
                                                    file.type === 'pdf' ? 'text-red-500' :
                                                        file.type === 'docx' || file.type === 'doc' ? 'text-blue-500' :
                                                            'text-gray-500'
                                                } />
                                            </motion.div>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <div className="text-xs font-semibold text-gray-800 truncate">
                                                    {file.name.length > 30 ? file.name.substring(0, 30) + '...' : file.name}
                                                </div>
                                                <div className="text-[10px] text-gray-400">
                                                    {file.size || 'Tài liệu'}
                                                </div>
                                            </div>
                                        </motion.a>
                                    ))}

                                    {recentFiles.length === 0 && (
                                        <div className="text-center text-gray-400 text-sm py-4">
                                            Chưa có tài liệu nào
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Nút xem thư viện */}
                        <motion.div
                            whileHover={{ scale: 1.02, backgroundColor: "#f9fafb" }}
                            whileTap={{ scale: 0.98 }}
                            className="border border-gray-200 rounded-xl py-2 text-center text-xs font-semibold text-blue-900 cursor-pointer transition-all duration-200"
                            onClick={() => {
                                setIsLibraryModalOpen(true);
                                setLibraryTab('images');
                            }}
                        >
                            Xem thư viện của tôi
                        </motion.div>
                    </motion.div>

                    {/* Library Modal */}
                    <LibraryModal
                        isOpen={isLibraryModalOpen}
                        onClose={() => setIsLibraryModalOpen(false)}
                        images={allImages}
                        files={allFiles}
                        initialTab={libraryTab}
                    />

                    {/* TREND */}
                    {/* TREND - Bài viết nổi bật từ API */}
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition-shadow duration-300"
                    >
                        <div className="flex items-center gap-2 font-bold mb-4">
                            <TrendingUp className="text-violet-900" />
                            Bài viết nổi bật
                        </div>

                        {loadingTrending ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="animate-spin text-violet-900" size={24} />
                            </div>
                        ) : trendingPosts.length > 0 ? (
                            <>
                                {trendingPosts.map((post, idx) => (
                                    <motion.div
                                        key={post.id}
                                        whileHover={{ x: 5 }}
                                        className="mb-4 cursor-pointer"
                                        onClick={() => {
                                            console.log('Clicking post:', post.id); // Debug log
                                            scrollToPost(post.id);
                                        }}
                                    >
                                        <div className="text-sm font-semibold line-clamp-2">
                                            {post.title}
                                        </div>
                                        <div className="text-xs text-gray-400 flex justify-between items-center mt-1">
                                            <div className="flex items-center gap-2">
                                                <span>{formatDate(post.createdAt)}</span>
                                                <span className="text-blue-600">
                                                    {post.pinned && <Pin size={10} className="inline mr-1" />}
                                                    {post.status === 'active' ? 'Công khai' : 'Nháp'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Eye size={12} />
                                                {formatViewCount(Math.floor(Math.random() * 5000) + 100)}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </>
                        ) : (
                            <div className="text-center text-gray-400 text-sm py-8">
                                Chưa có bài viết nổi bật
                            </div>
                        )}

                        <motion.div
                            whileHover={{ scale: 1.02, backgroundColor: "#f9fafb" }}
                            whileTap={{ scale: 0.98 }}
                            className="border border-gray-200 rounded-xl py-2 text-center text-xs font-semibold text-blue-900 cursor-pointer transition-all duration-200"
                            onClick={() => {
                                // Chuyển hướng đến trang danh sách bài viết hoặc scroll lên đầu
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        >
                            Xem tất cả bài viết
                        </motion.div>
                    </motion.div>

                    {/* STATS */}
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                        className="p-6 btn-gradient rounded-2xl text-white cursor-pointer transition-all duration-300"
                    >
                        <div className="text-sm font-bold mb-4">SỐ LIỆU EDUWAVE</div>
                        <div className="grid grid-cols-2 gap-3">
                            {stats.map((s, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-white/20 p-3 rounded-xl transition-all duration-200"
                                >
                                    <div className="text-xs">{s.label}</div>
                                    <div className="text-xl font-semibold">{s.value}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            <AnnouncementModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setIsEditing(false);
                    setEditingData(null);
                }}
                isEditing={isEditing}
                initialData={editingData}
                onSubmit={handleSubmit}
                adminId={adminId}
            />
        </motion.div>
    );
};