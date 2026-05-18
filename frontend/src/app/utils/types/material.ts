// types/material.ts
export interface MaterialUser {
  id: number
  fullName: string
  email: string
}

export interface Material {
  id: number
  title: string
  fileURL: string
  type: string
  uploadedAt: string
  subjectId: number | null
  subjectName: string | null
  uploadedById: number | null     
  uploadedByName: string | null    
  uploadedByImage: string | null
  fileSize: string
  user?: MaterialUser             
}

export interface MaterialResponse {
  message: string
  data: Material[]
}

export interface SingleMaterialResponse {
  message: string
  data: Material
}

export interface DeleteMaterialResponse {
  message: string
  data: null
}