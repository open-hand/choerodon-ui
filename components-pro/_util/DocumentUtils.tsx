import { MousePosition } from 'choerodon-ui/shared/modal-manager';

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

function getPageMousePosition(x, y, self: Window): MousePosition {
  const { scrollTop, scrollLeft } = self.document.documentElement;
  return { x: x + scrollLeft, y: y + scrollTop };
}

export function getMousePosition(x: number, y: number, self: Window, client?: boolean): MousePosition {
  try {
    if (self.top === self) {
      return client ? { x, y } : getPageMousePosition(x, y, self);
    }
    const { parent } = self;
    const iframe = findIFrame(self);
    const { top, left } = iframe ? iframe.getBoundingClientRect() : { top: 0, left: 0 };
    const newX = x + left;
    const newY = y + top;
    if (parent === self.top) {
      return client ? { x: newX, y: newY } : getPageMousePosition(newX, newY, parent);
    }
    return getMousePosition(newX, newY, parent);
  } catch (e) {
    return client ? { x, y } : getPageMousePosition(x, y, self);
  }
}
