import { global } from 'choerodon-ui/shared';

function isCssAnimationSupported() {
  const { CSS_ANIMATION_SUPPORT } = global;
  if (CSS_ANIMATION_SUPPORT !== undefined) {
    return CSS_ANIMATION_SUPPORT;
  }
  if (typeof window !== 'undefined') {
    const domPrefixes = ['webkit', 'moz', 'O', 'ms', 'khtml'];
    const elmStyle = document.createElement('div').style;
    const support = elmStyle.animationName !== undefined ||
      domPrefixes.some(prefix => (elmStyle as any)[`${prefix}AnimationName`] !== undefined);
    global.CSS_ANIMATION_SUPPORT = support;
    return support;
  }
  return false;
}

export default isCssAnimationSupported;
