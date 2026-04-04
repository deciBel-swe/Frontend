import { getPathThroughSegment } from '@/utils/getPartOfUrl';

describe('getPathThroughSegment', () => {
  it('returns path through the target segment when present', () => {
    expect(getPathThroughSegment('/user/42/tracks/abc', 'tracks')).toBe(
      '/user/42/tracks'
    );
  });

  it('returns original pathname when segment is missing', () => {
    expect(getPathThroughSegment('/user/42', 'tracks')).toBe('/user/42');
  });

  it('returns root for empty pathname', () => {
    expect(getPathThroughSegment('', 'tracks')).toBe('/');
  });
});
