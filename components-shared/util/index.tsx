import { MousePosition } from '../modal-manager';

let zoom = 0;

export function getDocument(self: Window): Document {
  try {
    const { parent, top } = self;
    if (parent !== top) {
      return getDocument(parent);
    }
    return parent.document;
  } catch (e) {
    return self.document;
  }
}

export function getDocuments(self: Window, list: Document[] = []): Document[] {
  try {
    const { parent, top } = self;
    if (parent !== top) {
      return getDocuments(parent, list);
    }
    return list.concat(parent.document);
  } catch (e) {
    return list.concat(self.document);
  }
}

export function findIFrame(self: Window): HTMLIFrameElement | undefined {
  return [...self.parent.document.querySelectorAll('iframe')].find(frame => frame.contentWindow === self);
}

export { MousePosition };

function getPageMousePosition(x, y, self: Window, client?: boolean): MousePosition {
  const { scrollTop, scrollLeft, clientWidth, clientHeight } = self.document.documentElement;
  if (client) {
    return { x, y, vw: clientWidth, vh: clientHeight };
  }
  return { x: x + scrollLeft, y: y + scrollTop, vw: clientWidth, vh: clientHeight };
}

export function getMousePosition(x: number, y: number, self: Window, client?: boolean): MousePosition {
  try {
    if (self.top === self) {
      return getPageMousePosition(x, y, self, client);
    }
    const { parent } = self;
    const iframe = findIFrame(self);
    const { top, left } = iframe ? iframe.getBoundingClientRect() : { top: 0, left: 0 };
    const newX = x + left;
    const newY = y + top;
    if (parent === self.top) {
      return getPageMousePosition(newX, newY, parent, client);
    }
    return getMousePosition(newX, newY, parent);
  } catch (e) {
    return getPageMousePosition(x, y, self, client);
  }
}

/**
 * 转换缩放比例后的数据
 * 场景：兼容全局带有 zoom 样式导致的数据偏差
 * @param data 需要转换的数据
 * @returns 转换后的数据
 */
export const transformZoomData = (data: number): number => {
  if (!zoom) {
    // eslint-disable-next-line dot-notation
    zoom = Number(getComputedStyle(document.body)['zoom']);
  }
  return data / zoom;
};

export default {
  getDocument,
  getDocuments,
  findIFrame,
  getMousePosition,
  transformZoomData,
};
