export const isWhitelabelDomain = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  if (hostname === 'f2fintech.com' || hostname === 'www.f2fintech.com') return false;
  if (hostname === 'localhost' || hostname.includes('127.0.0.1')) return false;
  return true;
};

export const getCanonicalUrl = (path: string): string => {
  const cleanPath = path.replace(/\/$/, '') || '/';
  return `https://f2fintech.com${cleanPath}`;
};

export const isHomePage = (path: string): boolean => {
  return path === '/' || path === '';
};
