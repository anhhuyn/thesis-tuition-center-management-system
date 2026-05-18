import { Mail, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { StudentLatest } from '../../utils/types/student';
import { studentApi } from '../../utils/api';
import { getImageSrc, getInitials } from '../../utils/helpers';

export function StudentsTable() {
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [students, setStudents] = useState<StudentLatest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lấy tổng số học sinh
    const fetchStatistics = async () => {
      try {
        const res = await studentApi.getStatistics();
        console.log("Statistics API result:", res);
        setTotalStudents(res.totalStudents);
      } catch (error) {
        console.error("Lỗi lấy tổng số học sinh", error);
      }
    };

    // Lấy danh sách học viên mới nhất
    const fetchLatestStudents = async () => {
      try {
        setLoading(true);
        const res = await studentApi.getLatestStudents();
        setStudents(res);
      } catch (error) {
        console.error("Lỗi load students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
    fetchLatestStudents();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 relative inline-block mb-2">
              Học viên mới nhất

            </h3>

          </div>
          <button className="mt-4 sm:mt-0 text-blue-600 font-medium hover:underline flex items-center gap-1 text-sm">
            Xem tất cả giáo viên <span aria-hidden="true" className="text-lg">→</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Học viên</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Liên hệ</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Khóa học</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tham gia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((student) => {
              const imageSrc = getImageSrc(student.image);
              return (
                <tr key={student.id} className="hover:bg-gray-50 whitespace-nowrap text-sm">
                  {/* Học viên */}
                  <td className="px-4 py-3 min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-semibold text-white ${!imageSrc ? "bg-blue-900" : ""}`}
                      >
                        {imageSrc ? (
                          <img src={imageSrc} alt={student.fullName} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          getInitials(student.fullName)
                        )}
                      </div>
                      <div className="flex flex-col">
                        <p className="font-medium text-gray-900">{student.fullName}</p>
                        <p className="text-xs text-gray-500">Lớp: {student.grade}</p>
                      </div>
                    </div>
                  </td>

                  {/* Liên hệ */}
                  <td className="px-4 py-3 min-w-[180px]">
                    <div className="flex flex-col gap-1 text-gray-500">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 " />
                        {student.email}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        {student.phoneNumber || "Chưa cập nhật"}
                      </div>
                    </div>
                  </td>

                  {/* Khóa học */}
                  <td className="px-4 py-3 min-w-[180px] text-xs">
                    {student.subjects && student.subjects.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {student.subjects.slice(0, 2).map((sub) => (
                          <span
                            key={sub.id}
                            className="inline-block w-fit px-2 py-1 bg-blue-900 text-white rounded-md"
                          >
                            {sub.name}
                          </span>
                        ))}

                        {student.subjects.length > 2 && (
                          <span className="text-gray-500">, ...</span>
                        )}
                      </div>
                    ) : (
                      <span className="inline-block w-fit px-2 py-1 bg-red-100 text-red-600 rounded-md font-medium">
                        Chưa có môn học
                      </span>
                    )}
                  </td>
                  {/* Ngày tham gia */}
                  <td className="px-4 py-3 min-w-[120px] text-gray-600">
                    {new Date(student.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-sm text-gray-600 italic">
          Hiển thị <b>1–5</b> trong tổng số <b>{totalStudents}</b> học sinh
        </p>
      </div>
    </div>
  );
}