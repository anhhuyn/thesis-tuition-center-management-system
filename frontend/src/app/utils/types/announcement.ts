// types/announcement.ts
export type AnnouncementStatus = "active" | "inactive" | "draft"

export interface AdminInfo {
  id: number
  email: string
  fullName: string
  phoneNumber: string
  gender: boolean
  image: string | null
  roleId: string
  status: boolean
  createdAt: string
  updatedAt: string
  passwordUpdatedAt?: string
}

export interface Announcement {
  id: number
  title: string
  content: string
  imageURL: string | null
  attachments: string[] | null
  status: AnnouncementStatus
  pinned: boolean
  admin: AdminInfo  
  likeCount: number      // THÊM
  viewCount: number      // THÊM
  createdAt: string
  updatedAt: string
}

export interface AnnouncementPage {
  content: Announcement[]
  pageable?: {
    pageNumber: number
    pageSize: number
    sort: {
      sorted: boolean
      unsorted: boolean
      empty: boolean
    }
  }
  totalPages: number
  totalElements: number
  last?: boolean
  first?: boolean
  size?: number
  number?: number
  sort?: {
    sorted: boolean
    unsorted: boolean
    empty: boolean
  }
  numberOfElements?: number
  empty?: boolean
}

export interface CreateAnnouncementPayload {
  adminId: number
  title: string
  content: string
  status?: AnnouncementStatus
  pinned?: boolean
}

export interface UpdateAnnouncementPayload {
  title?: string
  content?: string
  status?: AnnouncementStatus
  pinned?: boolean
  clearImage?: boolean
  clearAttachments?: boolean
}

// Thêm interface cho stats response
export interface AnnouncementStats {
  likeCount: number
  viewCount: number
}

// Thêm interface cho like response
export interface LikeResponse {
  success: boolean
  likeCount: number
  message?: string
  isLiked?: boolean
}

export interface ViewResponse {
  success: boolean
  viewCount: number
}