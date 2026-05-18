import { useEffect, useState } from 'react';
import { BadgeCheck, Mail, Phone } from 'lucide-react';
import { teacherApi } from '../../utils/api';
import type { TeacherBasic } from '../../utils/types/teacher';

const getInitials = (name?: string): string => {
  if (!name) return "";
  const words = name.trim().split(" ");
  const lastName = words[words.length - 1];
  return lastName.slice(0, 2).toUpperCase();
};

const getImageSrc = (image?: string): string | null => {
  if (!image) return null;
  if (image.startsWith("http")) return image;
  return `${import.meta.env.VITE_BACKEND_URL_IMAGE}${image}`;
};

export function TeachersList() {
  const [teachers, setTeachers] = useState<TeacherBasic[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const res = await teacherApi.getBasicTeachers();
        setTeachers(res);
      } catch (error) {
        console.error('Lỗi lấy danh sách giáo viên:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  return (
    <section className="bg-white p-6 rounded-xl shadow border border-gray-100 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900 relative inline-block mb-2">
            Đội ngũ Giáo viên Nổi bật
          </h3>
          <p className="text-sm text-gray-500 max-w-md">
            Những giáo viên tận tâm với bề dày kinh nghiệm và thành tựu xuất sắc trong lĩnh vực giáo dục.
          </p>
        </div>
        <button className="mt-4 sm:mt-0 text-blue-600 font-medium hover:underline flex items-center gap-1 text-sm">
          Xem tất cả giáo viên <span aria-hidden="true" className="text-lg">→</span>
        </button>
      </div>

      {/* Loading */}
      {loading && <p className="text-center text-gray-500">Đang tải dữ liệu giáo viên...</p>}

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {!loading &&
          teachers.slice(0, 4).map((teacher) => {
            const imageSrc = getImageSrc(teacher.image);
            return (
              <article
                key={teacher.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center
             transform transition duration-300 hover:scale-105 hover:shadow-lg hover:border-purple-200"
              >
                <div className="relative w-24 h-24">
                  {/* Avatar chính */}
                  <div
                    className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center font-semibold text-white border-2 border-purple-100 ${!imageSrc ? 'bg-blue-900' : ''
                      }`}
                  >
                    {imageSrc ? (
                      <img src={imageSrc} alt={teacher.fullName} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(teacher.fullName)
                    )}
                  </div>

                  {/* Badge check */}
                  <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center ">
                    <BadgeCheck className="w-4 h-4 text-white fill-current stroke-purple-500" />
                  </div>
                </div>

                <h3 className="mt-4 font-semibold text-gray-900">{teacher.fullName}</h3>
                <p className="mt-1 text-xs font-semibold text-blue-700 uppercase tracking-wide">{`Chuyên môn: ${teacher.specialty}`}</p>

                <div className="mt-3 space-y-1 text-gray-600 text-xs">
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-3 h-3" />
                    <span>{teacher.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="w-3 h-3" />
                    <span>{teacher.phoneNumber}</span>
                  </div>
                </div>

                <button className="mt-6 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-200 transition">
                  Xem hồ sơ chi tiết
                </button>
              </article>
            );
          })}
      </div>
    </section>
  );
}