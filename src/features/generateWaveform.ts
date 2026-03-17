import decodeAudio from "audio-decode";

interface AudioFile {
    arrayBuffer(): Promise<ArrayBuffer>;
}

export const generateWaveform = async (file: AudioFile): Promise<string[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await decodeAudio(arrayBuffer);

    const raw = audioBuffer.channelData[0];

    const samples: number = 100;
    const blockSize: number = Math.floor(raw.length / samples);

    const waveform: string[] = [];

    for (let i: number = 0; i < samples; i++) {
        let sum: number = 0;

        for (let j: number = 0; j < blockSize; j++) {
            sum += Math.abs(raw[i * blockSize + j]);
        }

        waveform.push((sum / blockSize).toFixed(2));
    }

    return waveform;
};