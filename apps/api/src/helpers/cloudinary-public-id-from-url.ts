export const cloudinaryPublicIdFromURL = (url: string): string | null => {
  const match = url.match(/\/upload\/v\d+\/(.+)\.[^.]+$/);
  return match ? match[1] : null;
};
