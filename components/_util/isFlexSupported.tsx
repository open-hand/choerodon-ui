import { global } from 'choerodon-ui/shared';

export default function isFlexSupported() {
  const { FLEX_SUPPORT } = global;
  if (FLEX_SUPPORT !== undefined) {
    return FLEX_SUPPORT;
  }
  if (typeof window !== 'undefined' && window.document && window.document.documentElement) {
    const { documentElement } = window.document;
    const support = 'flex' in documentElement.style ||
      'webkitFlex' in documentElement.style ||
      'Flex' in documentElement.style ||
      'msFlex' in documentElement.style;
    global.FLEX_SUPPORT = support;
    return support;
  }
  return false;
}
