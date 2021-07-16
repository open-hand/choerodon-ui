declare global {
  interface Window {
    ActiveXObject: any;
  }
}

export default function isIE(): boolean {
  if (window && !!window.ActiveXObject || 'ActiveXObject' in window) {
    return true;
  }
  return false;
}
