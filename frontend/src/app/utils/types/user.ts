export interface UpdateUserImageResponse {
  message: string
  image: string
}

export interface UpdateProfileRequest {
  fullName: string
  phoneNumber: string
  gender: boolean 
  email?: string
}

export interface UpdateProfileResponse {
  message: string
  requireOtp?: boolean
  user: any
}

export interface VerifyEmailOtpRequest {
  otp: string
}

export interface VerifyEmailOtpResponse {
  message: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordResponse {
  message: string
}

