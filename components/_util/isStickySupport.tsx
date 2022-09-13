import { global } from 'choerodon-ui/shared';


export default function isStickySupport(): boolean {
  const { STICKY_SUPPORT } = global;
  if (STICKY_SUPPORT !== undefined) {
    return STICKY_SUPPORT;
  }
  if (typeof window !== 'undefined') {
    const vendorList = ['', '-webkit-', '-ms-', '-moz-', '-o-'];
    const stickyElement = document.createElement('div');
    const support = vendorList.some(vendor => {
      stickyElement.style.position = `${vendor}sticky`;
      if (stickyElement.style.position !== '') {
        return true;
      }
      return false;
    });
    global.STICKY_SUPPORT = support;
    return support;
  }
  return true;
}
