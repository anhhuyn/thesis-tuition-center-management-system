export interface Room {
  id: number
  name: string
  seatCapacity: number
  manualStatus: 'ACTIVE' | 'MAINTENANCE' | 'DISABLED'
  status: 'ACTIVE' | 'DISABLED' | 'MAINTENANCE'
  devices: Device[]
  activeSession: ActiveSession | null
}

export interface Device {
  id: number
  type: string
}

export interface DeviceUpdateDTO {
  id?: number | null
  type: string
  action: 'ADD' | 'DELETE'
}

export interface RoomListDTO {
  id: number
  name: string
  seatCapacity: number
  manualStatus: string
  status: string
  devices: Device[]
  activeSession?: ActiveSession | null
}

export interface RoomSchedule {
  roomId: number
  roomName: string
  seatCapacity: number

  scheduleId: number
  subjectName: string
  dayOfWeek: string
  startTime: string
  endTime: string

  sessionId: number
  sessionDate: string
  sessionStartTime: string
  sessionEndTime: string
  status: string
}

export interface ActiveSession {
  subjectId: number
  subjectName: string
  startTime: string
  endTime: string
  studentCount: number
}

export interface RoomResponse {
  message: string
  data: Room[]
}