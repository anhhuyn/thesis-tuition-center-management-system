// hooks/useTeacherId.ts
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { teacherApi } from '../utils/api/teacher.api'

export const useTeacherId = () => {
  const { user, loading: authLoading } = useAuth()
  const [teacherId, setTeacherId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTeacherId = async () => {
      // Nếu chưa có user hoặc đang loading auth thì chờ
      if (authLoading) return
      
      // Nếu không có user (chưa đăng nhập)
      if (!user) {
        setTeacherId(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const id = await teacherApi.getTeacherIdByUserId()
        setTeacherId(id)
        
        if (!id) {
          setError('Không tìm thấy thông tin giáo viên')
        }
      } catch (err) {
        console.error('Error fetching teacherId:', err)
        setError('Có lỗi xảy ra khi lấy thông tin giáo viên')
        setTeacherId(null)
      } finally {
        setLoading(false)
      }
    }

    fetchTeacherId()
  }, [user, authLoading])

  return { teacherId, loading, error, isTeacher: !!teacherId }
}