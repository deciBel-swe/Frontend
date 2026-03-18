// src/services/api/tracks/uploadTrack.ts
import { UploadTrackResponse  } from "@/types/index"
import { config } from "@/config"
import { API_ENDPOINTS, getApiUrl } from "@/constants/routes"
import { UploadTrackService } from '@/types/index';

export const uploadTrack : UploadTrackService = (
  formData: FormData,
  token: string,
  onProgress: (progress: number) => void
): Promise<UploadTrackResponse> => {
  return new Promise((resolve, reject) => {

    const xhr = new XMLHttpRequest()

    const url = getApiUrl(API_ENDPOINTS.TRACKS.UPLOAD, config.api.baseURL)
    xhr.open("POST", url)

    xhr.setRequestHeader("Authorization", `Bearer ${token}`)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress(percent)
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const responseText = xhr.responseText?.trim()
        const response: UploadTrackResponse = responseText
          ? JSON.parse(responseText)
          : ({} as UploadTrackResponse)
        resolve(response)
      } else {
        const details = xhr.responseText?.trim()
        reject(
          new Error(
            `Upload failed (status ${xhr.status})${details ? `: ${details}` : ""}`
          )
        )
      }
    }

    xhr.onerror = () => reject(new Error("Network error"))

    xhr.send(formData)
  })
}
