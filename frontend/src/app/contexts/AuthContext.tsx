import { createContext, useContext, useEffect, useState } from 'react'
import api from '../utils/axios'

interface User {
  id: number
  fullName: string
  email: string
  phoneNumber: string
  roleId: string
  gender?: boolean | null 
  image?: string
  createdAt?: string 
  passwordUpdatedAt?: string 
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (user: User) => void
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Khôi phục token từ localStorage
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // verify token khi app load
  useEffect(() => {
    api
      .get('/auth/me')
      .then(res => {
        const data = res as unknown as { user: User }
        setUser(data.user)
      })
      .catch(() => {
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = (user: User) => {
    setUser(user)
  }

  const logout = async () => {
    try {
      await api.post('/logout', {}, { withCredentials: true })
    } catch (err) {
      console.error('Logout error', err)
    } finally {
      setUser(null)
    }
  }

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me')
      const data = res as unknown as { user: User }
      setUser(data.user)
    } catch (err) {
      console.error('Refresh profile error', err)
    }
  }


  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>

  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
