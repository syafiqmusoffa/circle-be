export const getPublicIdFromUrl = (url: string): string | null => {
  const match = url.match(/\/([^/]+)\.(jpg|jpeg|png|webp|gif|svg)$/i);
  return match ? match[1] : null;
};
