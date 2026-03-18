// src/services/mocks/uploadTrackMock.ts
import { UploadTrackResponse } from "@/types/index"
import { UploadTrackService } from '@/types/index';

export const uploadTrackMock: UploadTrackService = (
  formData: FormData,
  token: string,
  onProgress: (progress: number) => void
): Promise<UploadTrackResponse> => {
  return new Promise((resolve) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      onProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        resolve({
          id: 1,
          title: "Mock Track",
          trackUrl: "/tracks/1",
          coverUrl: "/mock-cover.jpg",
          durationSeconds: 180
        })
      }
    }, 150)
  })
}