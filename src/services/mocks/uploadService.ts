// src/services/mocks/uploadTrackMock.ts
import { TrackUploadResponse } from "@/types/trackUpload"

export const uploadTrackMock = (
  onProgress: (progress: number) => void
): Promise<TrackUploadResponse> => {
//empty promise to simulate async behavior
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