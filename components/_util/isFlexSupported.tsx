let flexSupported;

export default function isFlexSupported() {
  if (flexSupported !== undefined) {
    return flexSupported;
  }
  if (typeof window !== 'undefined' && window.document && window.document.documentElement) {
    const { documentElement } = window.document;
    flexSupported = 'flex' in documentElement.style ||
      'webkitFlex' in documentElement.style ||
      'Flex' in documentElement.style ||
      'msFlex' in documentElement.style;
    return flexSupported;
  }
  return false;
}
