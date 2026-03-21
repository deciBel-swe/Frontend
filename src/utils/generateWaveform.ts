export async function generateWaveform(file: File): Promise<string[]> {

  const arrayBuffer = await file.arrayBuffer()

  const audioContext = new AudioContext()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

  const rawData = audioBuffer.getChannelData(0)

  const samples = 200
  const blockSize = Math.floor(rawData.length / samples)

  const waveform: string[] = []

  for (let i = 0; i < samples; i++) {

    let sum = 0

    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(rawData[i * blockSize + j])
    }

    const amplitude = sum / blockSize

    waveform.push(amplitude.toFixed(2))

  }

  return waveform
}