import axios from '../axios'
import type { ApiResponse } from '../types/api'
import type { RoomListDTO, RoomSchedule, Device, DeviceUpdateDTO } from '../types/room'

export const roomApi = {
  // GET ALL ROOMS
  getAll(): Promise<ApiResponse<RoomListDTO[]>> {
    return axios.get('/rooms')
  },

  // GET ROOM BY ID
  getById(id: number): Promise<ApiResponse<RoomListDTO>> {
    return axios.get(`/rooms/${id}`)
  },

  // CREATE ROOM
  create(data: {
    name: string
    seatCapacity: number
    manualStatus?: string
  }): Promise<ApiResponse<RoomListDTO>> {
    return axios.post('/rooms', data)
  },

  // UPDATE ROOM
  update(id: number, data: {
    name?: string
    seatCapacity?: number
    manualStatus?: string
    devices?: DeviceUpdateDTO[] 
  }): Promise<ApiResponse<RoomListDTO>> {
    return axios.put(`/rooms/${id}`, data)
  },

  // DELETE ROOM
  delete(id: number): Promise<ApiResponse<number>> {
    return axios.delete(`/rooms/${id}`)
  },

  // GET ROOM SCHEDULE
  getSchedule(roomId: number, startDate: string, endDate: string): Promise<ApiResponse<RoomSchedule[]>> {
    return axios.get(`/rooms/${roomId}/schedule`, {
      params: { startDate, endDate }
    })
  },

  // GET DEVICES
  getDevices(roomId: number): Promise<ApiResponse<Device[]>> {
    return axios.get(`/rooms/${roomId}/devices`)
  },

  // ADD DEVICE
  addDevice(roomId: number, type: string): Promise<ApiResponse<Device>> {
    return axios.post(`/rooms/${roomId}/devices`, { type })
  },

  // DELETE DEVICE
  deleteDevice(deviceId: number): Promise<ApiResponse<number>> {
    return axios.delete(`/devices/${deviceId}`)
  }
}