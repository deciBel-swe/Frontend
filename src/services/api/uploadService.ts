// src/services/api/tracks/uploadTrack.ts
import { TrackUploadResponse } from "@/types/trackUpload"

export const uploadTrack = (
  formData: FormData,
  token: string,
  onProgress: (progress: number) => void
): Promise<TrackUploadResponse> => {

  return new Promise((resolve, reject) => {

    const xhr = new XMLHttpRequest()

    xhr.open("POST", "/tracks/upload")

    xhr.setRequestHeader("Authorization", `Bearer ${token}`)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress(percent)
      }
    }

    xhr.onload = () => {
      if (xhr.status === 201) {
        const response: TrackUploadResponse = JSON.parse(xhr.response)
        resolve(response)
      } else {
        reject(new Error("Upload failed"))
      }
    }

    xhr.onerror = () => reject(new Error("Network error"))

    xhr.send(formData)
  })
}