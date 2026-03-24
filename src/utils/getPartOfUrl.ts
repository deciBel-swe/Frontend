export const getPathThroughSegment = (
  pathname: string,
  segmentValue: string
) => {
  const pathSegments = pathname.split('/').filter(Boolean);
  const segmentIndex = pathSegments.findIndex(
    (segment) => segment === segmentValue
  );
  return segmentIndex >= 0
    ? `/${pathSegments.slice(0, segmentIndex + 1).join('/')}`
    : pathname || '/';
};
