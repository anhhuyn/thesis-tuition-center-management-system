import { useEffect, useState } from "react";
import { X, Plus, Search, UserPlus, School, Calendar } from "lucide-react";
import { studentSubjectApi } from "../../../../utils/api";
import type { StudentSubject } from "../../../../utils/types/studentSubject";
import { useOutletContext } from "react-router-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  subjectId: number;
  grade: string;
  existingStudentIds: number[];
  onSuccess: () => void;
};

export const AddStudentModal = ({
  open,
  onClose,
  subjectId,
  grade,
  existingStudentIds,
  onSuccess,
}: Props) => {
  const [students, setStudents] = useState<StudentSubject[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { setAlert } = useOutletContext<any>();

  const filteredStudents = students.filter(
    (s) => !existingStudentIds.includes(s.id)
  );

  const searchedStudents = filteredStudents.filter((s) =>
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!open || !grade) return;

    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await studentSubjectApi.getStudentsByGrade(grade);
        setStudents(res.data);
      } catch (err) {
        console.error(err);
        setAlert?.({
          type: "error",
          message: "Không thể tải danh sách học sinh",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
    setSearchTerm("");
  }, [grade, open, setAlert]);

  const handleAdd = async (studentId: number) => {
    try {
      setAddingId(studentId);

      await studentSubjectApi.addStudentToSubject({
        studentId,
        subjectId,
      });
      setAlert?.({
        type: "success",
        message: "Thêm học sinh mới vào lớp thành công",
      });

      onSuccess();
    } catch (err: any) {
      setAlert?.({
        type: "error",
        message: err?.response?.data?.message || "Có lỗi xảy ra trong quá trình thêm học sinh",
      });
    } finally {
      setAddingId(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl">
        {/* HEADER */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <UserPlus size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Thêm học sinh</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Lớp {grade}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="px-6 pt-4 pb-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm học sinh theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* LIST HEADER */}
        <div className="px-6 py-2 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase">
            <div className="col-span-6">Thông tin học sinh</div>
            <div className="col-span-4">Trường</div>
            <div className="col-span-2 text-center">Thao tác</div>
          </div>
        </div>

        {/* LIST CONTENT */}
        <div className="max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 mt-3">Đang tải danh sách...</p>
            </div>
          ) : searchedStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-gray-100 rounded-full p-3 mb-3">
                <Search size={24} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">
                {searchTerm ? "Không tìm thấy học sinh phù hợp" : "Không có học sinh nào trong lớp"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-sm text-blue-600 hover:text-blue-700 mt-2"
                >
                  Xóa tìm kiếm
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {searchedStudents.map((s) => (
                <div
                  key={s.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* STUDENT INFO */}
                    <div className="col-span-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-medium text-sm">
                            {s.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{s.fullName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Calendar size={12} className="text-gray-400" />
                            <p className="text-xs text-gray-500">
                              {new Date(s.dateOfBirth).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SCHOOL */}
                    <div className="col-span-4">
                      <div className="flex items-center gap-2">
                        <School size={14} className="text-gray-400 flex-shrink-0" />
                        <p className="text-sm text-gray-600 truncate" title={s.schoolName}>
                          {s.schoolName}
                        </p>
                      </div>
                    </div>

                    {/* ADD BUTTON */}
                    <div className="col-span-2 flex justify-center">
                      <button
                        onClick={() => handleAdd(s.id)}
                        disabled={addingId === s.id}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {addingId === s.id ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Đang thêm</span>
                          </>
                        ) : (
                          <>
                            <Plus size={14} />
                            <span>Thêm</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            {searchedStudents.length} / {filteredStudents.length} học sinh
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};