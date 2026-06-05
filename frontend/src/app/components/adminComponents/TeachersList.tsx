import { useEffect, useState } from 'react';
import { BadgeCheck, Mail, Phone, GraduationCap, Award, BookOpen, ChevronRight, Star, MapPin } from 'lucide-react';
import { teacherApi } from '../../utils/api';
import type { TeacherBasic } from '../../utils/types/teacher';
import { formatPhoneNumber } from '../../utils/helpers/formatPhoneNumber';
import { getImageSrc, getInitials } from '../../utils/helpers';

export function TeachersList() {
  const [teachers, setTeachers] = useState<TeacherBasic[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

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
    <section className="teachers-section">
      <div className="teachers-container">
        {/* Header với hiệu ứng gradient */}
        <div className="teachers-header">
          <div className="header-content">
            <div className="header-badge">
              <GraduationCap className="badge-icon" />
              <span>Đội ngũ xuất sắc</span>
            </div>
            <h2 className="header-title">
              Giáo viên
              <span className="title-highlight"> tận tâm</span>
            </h2>
            <p className="header-description">
              Những giáo viên giàu kinh nghiệm, tận tâm với sự nghiệp trồng người,
              cùng thành tích nổi bật trong giảng dạy và nghiên cứu.
            </p>
          </div>
          <button className="view-all-link">
            Xem tất cả
            <ChevronRight className="link-icon" />
          </button>
        </div>

        {/* Loading State với Skeleton */}
        {loading && (
          <div className="teachers-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
                <div className="skeleton-line small"></div>
              </div>
            ))}
          </div>
        )}

        {/* Teachers Grid */}
        {!loading && (
          <div className="teachers-grid">
            {teachers.slice(0, 4).map((teacher, index) => {
              const imageSrc = getImageSrc(teacher.image);
              const isHovered = hoveredCard === teacher.id;

              return (
                <article
                  key={teacher.id}
                  className="teacher-card"
                  onMouseEnter={() => setHoveredCard(teacher.id as number)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Card Glow Effect */}
                  <div className="card-glow"></div>

                  {/* Decorative Elements */}
                  <div className="card-decoration">
                    <div className="decoration-circle"></div>
                    <div className="decoration-dots"></div>
                  </div>

                  {/* Avatar Section */}
                  <div className="avatar-wrapper">
                    <div className="avatar-container">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={teacher.fullName}
                          className="avatar-image"
                        />
                      ) : (
                        <div className="avatar-initials">
                          {getInitials(teacher.fullName)}
                        </div>
                      )}
                      <div className="avatar-badge">
                        <BadgeCheck className="badge-icon" />
                      </div>
                    </div>
                  </div>

                  {/* Teacher Info */}
                  <div className="teacher-info">
                    <h3 className="teacher-name">{teacher.fullName}</h3>
                    <div className="teacher-specialty">
                      <BookOpen className="specialty-icon" />
                      <span>{teacher.specialty}</span>
                    </div>

                    {/* Contact Info */}
                    <div className="contact-info">
                      <div className="contact-item">
                        <Mail className="contact-icon" />
                        <span className="contact-text">{teacher.email}</span>
                      </div>
                      <div className="contact-item">
                        <Phone className="contact-icon" />
                        <span className="contact-text">{formatPhoneNumber(teacher.phoneNumber)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Overlay với nút hành động */}
                  <div className={`card-overlay ${isHovered ? 'visible' : ''}`}>
                    <button className="view-profile-btn">
                      <span>Xem hồ sơ</span>
                      <ChevronRight className="btn-icon" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .teachers-section {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 2rem 1rem;
          border-radius: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .teachers-container {
          max-width: 100%;
          margin: 0 auto;
        }

        /* Header Styles */
        .teachers-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-content {
          flex: 1;
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.25rem 0.75rem;
          background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
          border-radius: 2rem;
          font-size: 0.688rem;
          font-weight: 600;
          color: #4f46e5;
          margin-bottom: 0.75rem;
        }

        .badge-icon {
          width: 0.75rem;
          height: 0.75rem;
        }

        .header-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }

        .title-highlight {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .header-description {
          font-size: 0.813rem;
          color: #64748b;
          max-width: 500px;
          line-height: 1.5;
          margin: 0;
        }

        .view-all-button {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.625rem;
          font-size: 0.813rem;
          font-weight: 500;
          color: #4f46e5;
          cursor: pointer;
          transition: all 0.3s;
        }

        .view-all-button:hover {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          border-color: transparent;
          color: white;
          transform: translateX(4px);
        }

        .button-icon {
          width: 0.875rem;
          height: 0.875rem;
          transition: transform 0.3s;
        }

        .view-all-button:hover .button-icon {
          transform: translateX(4px);
        }

        /* Grid Layout - 4 cards per row */
        .teachers-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 0rem;
        }

        /* Teacher Card - Compact size */
        .teacher-card {
          position: relative;
          background: white;
          border-radius: 1rem;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .teacher-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.12);
        }

        .card-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .teacher-card:hover .card-glow {
          opacity: 1;
        }

        .card-decoration {
          position: absolute;
          top: 0;
          right: 0;
          width: 60px;
          height: 60px;
          overflow: hidden;
          pointer-events: none;
        }

        .decoration-circle {
          position: absolute;
          top: -20px;
          right: -20px;
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
          border-radius: 50%;
          opacity: 0.2;
        }

        .decoration-dots {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 25px;
          height: 25px;
          background-image: radial-gradient(#4f46e5 1px, transparent 1px);
          background-size: 6px 6px;
          opacity: 0.08;
        }

        /* Avatar Styles - Smaller */
        .avatar-wrapper {
          display: flex;
          justify-content: center;
          padding: 1.25rem 1.25rem 0.75rem 1.25rem;
        }

        .avatar-container {
          position: relative;
          width: 80px;
          height: 80px;
        }

        .avatar-image, .avatar-initials {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .avatar-initials {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
        }

        .avatar-badge {
          position: absolute;
          bottom: -2px;
          right: -2px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 50%;
          padding: 0.188rem;
          border: 2px solid white;
        }

        .badge-icon {
          width: 0.75rem;
          height: 0.75rem;
          color: white;
        }

        /* Teacher Info - Compact */
        .teacher-info {
          padding: 0 0.75rem 0.75rem 0.75rem;
          text-align: center;
        }

        .teacher-name {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.25rem 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .teacher-specialty {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.188rem 0.5rem;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 0.375rem;
          font-size: 0.688rem;
          font-weight: 600;
          color: #92400e;
          margin-bottom: 0.5rem;
        }

        .specialty-icon {
          width: 0.625rem;
          height: 0.625rem;
        }

        /* Rating Stars - Compact */
        .teacher-rating {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.188rem;
          margin-bottom: 0.5rem;
        }

        .star-icon {
          width: 0.75rem;
          height: 0.75rem;
          color: #fbbf24;
        }

        .rating-text {
          font-size: 0.688rem;
          color: #64748b;
          margin-left: 0.25rem;
        }

        /* Contact Info - Compact */
        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          margin-bottom: 0.5rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          font-size: 0.688rem;
          color: #64748b;
          padding: 0.25rem 0.5rem;
          background: #f8fafc;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }

        .contact-item:hover {
          background: #e0e7ff;
          transform: translateX(2px);
        }

        .contact-icon {
          width: 0.75rem;
          height: 0.75rem;
          color: #4f46e5;
        }

        .contact-text {
          flex: 1;
          text-align: left;
          font-size: 0.688rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Achievement Badge - Compact */
        .achievement-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border-radius: 0.375rem;
          font-size: 0.625rem;
          font-weight: 600;
          color: #dc2626;
        }

        .achievement-icon {
          width: 0.75rem;
          height: 0.75rem;
        }

        /* Card Overlay */
        .card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.95) 0%, rgba(124, 58, 237, 0.95) 100%);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }

        .card-overlay.visible {
          opacity: 1;
          pointer-events: auto;
        }

        .view-profile-btn {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1rem;
          background: white;
          border: none;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #4f46e5;
          cursor: pointer;
          transition: all 0.3s;
        }

        .view-profile-btn:hover {
          gap: 0.5rem;
          transform: scale(1.05);
        }

        .btn-icon {
          width: 0.875rem;
          height: 0.875rem;
          transition: transform 0.3s;
        }

        .view-profile-btn:hover .btn-icon {
          transform: translateX(2px);
        }

        /* Stats Section - Compact */
        .teachers-stats {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 1.25rem;
          background: white;
          border-radius: 1rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 800;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin-bottom: 0.125rem;
        }

        .stat-label {
          font-size: 0.688rem;
          color: #64748b;
          font-weight: 500;
        }

        .stat-divider {
          width: 1px;
          height: 1.5rem;
          background: linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%);
        }

        /* Skeleton Loading - Compact */
        .skeleton-card {
          background: white;
          border-radius: 1rem;
          padding: 1.25rem 0.75rem 0.75rem;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .skeleton-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          margin: 0 auto 0.75rem;
        }

        .skeleton-line {
          height: 0.75rem;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 0.25rem;
          margin: 0.5rem 0;
        }

        .skeleton-line.short {
          width: 60%;
          margin: 0.5rem auto;
        }

        .skeleton-line.small {
          width: 80%;
          height: 0.625rem;
          margin: 0.5rem auto;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .teachers-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .teachers-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-title {
            font-size: 1.25rem;
          }

          .teachers-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .teachers-stats {
            flex-direction: column;
            gap: 0.75rem;
          }

          .stat-divider {
            width: 2rem;
            height: 1px;
          }

          .contact-text {
            white-space: normal;
            word-break: break-all;
          }
        }

        @media (min-width: 641px) and (max-width: 1024px) {
          .teachers-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </section>
  );
}