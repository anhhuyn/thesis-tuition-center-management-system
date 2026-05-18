// api/announcement.ts
import axios from "../axios"
import type {
  Announcement,
  AnnouncementPage,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
  AnnouncementStats,
  LikeResponse,
  ViewResponse,
} from "../types/announcement"

export const announcementApi = {
  // =========================
  // GET - Pagination
  // =========================
  getAll(
    page = 0,
    size = 10
  ): Promise<AnnouncementPage> {
    return axios.get("/announcements", {
      params: { page, size },
    })
  },

  // =========================
  // GET BY ID
  // =========================
  getById(id: number): Promise<Announcement> {
    return axios.get(`/announcements/${id}`)
  },

  // =========================
  // CREATE (multipart)
  // =========================
  create(
    data: CreateAnnouncementPayload,
    imageFile?: File,
    attachments?: File[]
  ): Promise<Announcement> {
    const formData = new FormData()

    formData.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    )

    if (imageFile) {
      formData.append("imageFile", imageFile)
    }

    if (attachments) {
      attachments.forEach(file => {
        formData.append("attachments", file)
      })
    }

    return axios.post("/announcements", formData)
  },

  // =========================
  // UPDATE (multipart)
  // =========================
  update(
    id: number,
    data: UpdateAnnouncementPayload,
    imageFile?: File,
    attachments?: File[]
  ): Promise<Announcement> {
    const formData = new FormData()

    formData.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    )

    if (imageFile) {
      formData.append("imageFile", imageFile)
    }

    if (attachments) {
      attachments.forEach(file => {
        formData.append("attachments", file)
      })
    }

    return axios.put(`/announcements/${id}`, formData)
  },

  // =========================
  // DELETE
  // =========================
  delete(id: number): Promise<{ success: boolean }> {
    return axios.delete(`/announcements/${id}`)
  },

  // =========================
  // LIKE - Thả tim
  // =========================
  like(id: number): Promise<LikeResponse> {
    return axios.post(`/announcements/${id}/like`)
  },

  // =========================
  // UNLIKE - Bỏ thích
  // =========================
  unlike(id: number): Promise<LikeResponse> {
    return axios.delete(`/announcements/${id}/like`)
  },

  // =========================
  // TOGGLE LIKE - Thích/Bỏ thích
  // =========================
  toggleLike(id: number, isLiking: boolean): Promise<LikeResponse> {
    return axios.post(`/announcements/${id}/toggle-like`, null, {
      params: { isLiking }
    })
  },

  // =========================
  // INCREMENT VIEW - Tăng lượt xem
  // =========================
  incrementView(id: number): Promise<ViewResponse> {
    return axios.post(`/announcements/${id}/view`)
  },

  // =========================
  // GET STATS - Lấy thống kê
  // =========================
  getStats(id: number): Promise<AnnouncementStats> {
    return axios.get(`/announcements/${id}/stats`)
  },
}