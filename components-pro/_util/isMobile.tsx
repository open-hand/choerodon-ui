export default function isMobile() {
  if (typeof navigator === 'undefined') return false;
  const info = navigator.userAgent;
  const agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPod', 'iPad'];
  for (let i = 0; i < agents.length; i++) {
    if (info.indexOf(agents[i]) >= 0) return true;
  }
  return false;
}
