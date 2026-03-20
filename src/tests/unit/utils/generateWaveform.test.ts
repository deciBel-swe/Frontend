import { generateWaveform } from '@/utils/generateWaveform';

const originalAudioContext = globalThis.AudioContext;

const mockAudioContext = (channelData: Float32Array) => {
  const getChannelData = jest.fn().mockReturnValue(channelData);
  const decodeAudioData = jest
    .fn()
    .mockResolvedValue({ getChannelData } as AudioBuffer);

  const AudioContextMock = jest.fn().mockImplementation(() => ({
    decodeAudioData,
  }));

  Object.defineProperty(globalThis, 'AudioContext', {
    value: AudioContextMock,
    configurable: true,
    writable: true,
  });

  return {
    AudioContextMock,
    decodeAudioData,
    getChannelData,
  };
};

describe('generateWaveform', () => {
  afterEach(() => {
    Object.defineProperty(globalThis, 'AudioContext', {
      value: originalAudioContext,
      configurable: true,
      writable: true,
    });
  });

  it('returns 200 two-decimal samples for decoded audio data', async () => {
    const channelData = new Float32Array(1000).fill(0.5);
    const { AudioContextMock, decodeAudioData, getChannelData } =
      mockAudioContext(channelData);

    const arrayBuffer = new ArrayBuffer(16);
    const file = {
      arrayBuffer: jest.fn().mockResolvedValue(arrayBuffer),
    } as unknown as File;

    const waveform = await generateWaveform(file);

    expect(file.arrayBuffer).toHaveBeenCalledTimes(1);
    expect(AudioContextMock).toHaveBeenCalledTimes(1);
    expect(decodeAudioData).toHaveBeenCalledTimes(1);
    expect(getChannelData).toHaveBeenCalledWith(0);

    expect(waveform).toHaveLength(200);
    expect(waveform[0]).toBe('0.50');
    expect(waveform[199]).toBe('0.50');
  });

  it('uses absolute values when computing block amplitudes', async () => {
    const channelData = new Float32Array(200).fill(0.1);
    channelData[0] = -0.25;
    channelData[1] = -0.75;

    mockAudioContext(channelData);

    const file = {
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
    } as unknown as File;

    const waveform = await generateWaveform(file);

    expect(waveform[0]).toBe('0.25');
    expect(waveform[1]).toBe('0.75');
    expect(waveform[2]).toBe('0.10');
  });
});
