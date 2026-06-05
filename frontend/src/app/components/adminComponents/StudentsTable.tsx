import { useEffect, useState } from 'react';
import type { Student } from '../../utils/types/student';
import { studentApi } from '../../utils/api';
import { getImageSrc, getInitials } from '../../utils/helpers';
import { formatPhoneNumber } from '../../utils/helpers/formatPhoneNumber';
import { Users, Mail, Phone, School, Calendar, ChevronRight, GraduationCap } from 'lucide-react';

export function StudentsTable() {
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const res = await studentApi.getStatistics();
        console.log("Statistics API result:", res);
        setTotalStudents(res.totalStudents);
      } catch (error) {
        console.error("Lỗi lấy tổng số học sinh", error);
      }
    };

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
    <div className="students-table-wrapper">
      {/* Header */}
      <div className="table-header">
        <div className="header-left">

          <div>
            <h3 className="table-title">Học viên mới nhất</h3>
            <p className="table-subtitle">Danh sách học viên vừa đăng ký gần đây</p>
          </div>
        </div>
        <button className="view-all-link">
          Xem tất cả
          <ChevronRight className="link-icon" />
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton-cell"></div>
              <div className="skeleton-cell"></div>
              <div className="skeleton-cell"></div>
              <div className="skeleton-cell"></div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {!loading && (
        <>
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th className="col-student">
                    <div className="th-content">
                      <Users className="th-icon" />
                      <span>Học viên</span>
                    </div>
                  </th>
                  <th className="col-contact">
                    <div className="th-content">
                      <Mail className="th-icon" />
                      <span>Liên hệ</span>
                    </div>
                  </th>
                  <th className="col-school">
                    <div className="th-content">
                      <School className="th-icon" />
                      <span>Trường học</span>
                    </div>
                  </th>
                  <th className="col-join">
                    <div className="th-content">
                      <Calendar className="th-icon" />
                      <span>Ngày tham gia</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-state">
                      <div className="empty-content">
                        <Users className="empty-icon" />
                        <p>Chưa có học viên nào</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => {
                    const imageSrc = getImageSrc(student.image);
                    return (
                      <tr key={student.id} className="table-row">
                        {/* Học viên */}
                        <td className="cell-student">
                          <div className="student-info">
                            <div className="student-avatar">
                              {imageSrc ? (
                                <img
                                  src={imageSrc}
                                  alt={student.fullName}
                                  className="avatar-img"
                                />
                              ) : (
                                <div className="avatar-placeholder">
                                  {getInitials(student.fullName)}
                                </div>
                              )}
                            </div>
                            <div className="student-details">
                              <p className="student-name">{student.fullName}</p>
                              <div className="student-grade">
                                <span>Lớp {student.grade}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Liên hệ */}
                        <td className="cell-contact">
                          <div className="contact-details">
                            <div className="contact-line">
                              <Mail className="contact-icon" />
                              <span>{student.email}</span>
                            </div>
                            <div className="contact-line">
                              <Phone className="contact-icon" />
                              <span>{formatPhoneNumber(student.phoneNumber)}</span>
                            </div>
                          </div>
                        </td>

                        {/* Trường học */}
                        <td className="cell-school">
                          <div className="school-info">
                            <School className="school-icon" />
                            <span>{student.schoolName || "Chưa cập nhật"}</span>
                          </div>
                        </td>

                        {/* Ngày tham gia */}
                        <td className="cell-join">
                          <div className="join-date">
                            <Calendar className="date-icon" />
                            <span>{new Date(student.createdAt).toLocaleDateString("vi-VN")}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="table-footer">
            <div className="footer-stats">
              <Users className="stats-icon" />
              <span>
                Hiển thị <strong>{students.length}</strong> / <strong>{totalStudents.toLocaleString()}</strong> học sinh
              </span>
            </div>
          </div>
        </>
      )}

      <style>{`
        .students-table-wrapper {
          background: #ffffff;
          border-radius: 1rem;
          border: 1px solid #f0f0f0;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        /* Header */
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f0f0f0;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-icon {
          width: 2.5rem;
          height: 2.5rem;
          background: #f0f0f0;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-icon .icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #4f46e5;
        }

        .table-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .table-subtitle {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0.25rem 0 0 0;
        }

        .view-all-btn {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1rem;
          background: transparent;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-all-btn:hover {
          color: #3b82f6;
          background: #f9fafb;
        }

        .btn-icon {
          width: 0.875rem;
          height: 0.875rem;
          transition: transform 0.2s;
        }

        .view-all-btn:hover .btn-icon {
          transform: translateX(2px);
        }

        /* Table Container */
        .table-container {
          overflow-x: auto;
        }

        /* Modern Table */
        .modern-table {
          width: 100%;
          border-collapse: collapse;
        }

        .modern-table thead {
          background: #f9fafb;
          border-bottom: 1px solid #f0f0f0;
        }

        .modern-table th {
          padding: 0.875rem 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .th-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .th-icon {
          width: 0.875rem;
          height: 0.875rem;
          color: #9ca3af;
        }

        .col-student { width: 28%; }
        .col-contact { width: 32%; }
        .col-school { width: 25%; }
        .col-join { width: 15%; }

        /* Table Row */
        .table-row {
          border-bottom: 1px solid #f5f5f5;
          transition: all 0.2s;
        }

        .table-row:hover {
          background: #fafafa;
        }

        .modern-table td {
          padding: 0.875rem 1rem;
          vertical-align: middle;
        }

        /* Student Cell */
        .student-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .student-avatar {
          flex-shrink: 0;
        }

        .avatar-img {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
        }

        .student-details {
          flex: 1;
        }

        .student-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 0.25rem 0;
        }

        .student-grade {
          font-size: 0.688rem;
          color: #9ca3af;
          font-weight: 400;
        }

        /* Contact Cell */
        .contact-details {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .contact-line {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #4b5563;
        }

        .contact-icon {
          width: 0.875rem;
          height: 0.875rem;
          color: #9ca3af;
          flex-shrink: 0;
        }

        /* School Cell */
        .school-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.813rem;
          color: #4b5563;
        }

        .school-icon {
          width: 0.875rem;
          height: 0.875rem;
          color: #9ca3af;
          flex-shrink: 0;
        }

        /* Join Date Cell */
        .join-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.813rem;
          color: #4b5563;
        }

        .date-icon {
          width: 0.875rem;
          height: 0.875rem;
          color: #9ca3af;
          flex-shrink: 0;
        }

        /* Footer */
        .table-footer {
          padding: 0.875rem 1.5rem;
          border-top: 1px solid #f0f0f0;
          background: #fafafa;
        }

        .footer-stats {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .stats-icon {
          width: 0.875rem;
          height: 0.875rem;
          color: #9ca3af;
        }

        .footer-stats strong {
          color: #1a1a1a;
          font-weight: 600;
        }

        /* Loading State */
        .loading-state {
          padding: 1rem;
        }

        .skeleton-row {
          display: flex;
          gap: 1rem;
          padding: 0.875rem 1rem;
          border-bottom: 1px solid #f0f0f0;
        }

        .skeleton-cell {
          flex: 1;
          height: 2.5rem;
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 0.5rem;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 3rem !important;
        }

        .empty-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .empty-icon {
          width: 2rem;
          height: 2rem;
          color: #d1d5db;
        }

        .empty-content p {
          font-size: 0.813rem;
          color: #9ca3af;
          margin: 0;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .table-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .col-student,
          .col-contact,
          .col-school,
          .col-join {
            width: auto;
          }

          .contact-line span,
          .school-info span,
          .join-date span {
            font-size: 0.688rem;
          }
        }
      `}</style>
    </div>
  );
}