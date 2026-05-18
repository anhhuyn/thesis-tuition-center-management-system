import axios from '../axios'

export interface LoginResponse {
  token: string
  user: {
    id: number
    fullName: string
    email: string
    phoneNumber: string
    roleId: string
    image?: string
  }
}

export const loginApi = (
  email: string,
  password: string
): Promise<LoginResponse> => {
  return axios.post('/login', { email, password })
}
