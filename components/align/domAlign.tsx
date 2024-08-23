import { getDocument, getMousePosition } from 'choerodon-ui/pro/lib/_util/DocumentUtils';
import { findIFrame } from 'choerodon-ui/shared/util';
import isString from 'lodash/isString';
import { pxToRem } from '../_util/UnitConvertor';
import { AlignPoint } from './Align';

type overflowType = { adjustX?: boolean; adjustY?: boolean };
type regionType = { left: number; top: number; width: number; height: number };
type positionType = { left: number; top: number };

function isFailX(elFuturePos, elRegion, visibleRect) {
  return (
    elFuturePos.left < visibleRect.left || elFuturePos.left + elRegion.width > visibleRect.right
  );
}

function isFailY(elFuturePos, elRegion, visibleRect) {
  return (
    elFuturePos.top < visibleRect.top || elFuturePos.top + elRegion.height > visibleRect.bottom
  );
}

function isCompleteFailX(elFuturePos, elRegion, visibleRect) {
  return (
    elFuturePos.left > visibleRect.right || elFuturePos.left + elRegion.width < visibleRect.left
  );
}

function isCompleteFailY(elFuturePos, elRegion, visibleRect) {
  return (
    elFuturePos.top > visibleRect.bottom || elFuturePos.top + elRegion.height < visibleRect.top
  );
}

function getParent(element: HTMLElement): HTMLElement | null {
  let parent: HTMLElement | null = element;
  do {
    parent = parent.parentElement;
  } while (parent && parent.nodeType !== 1 && parent.nodeType !== 9);
  return parent;
}

function getOffsetParentAndStyle(el: HTMLElement, defaultView: Window): { parent: HTMLElement, style: CSSStyleDeclaration | null } | null {
  const { position } = defaultView.getComputedStyle(el);
  if (position !== 'absolute' && position !== 'fixed') {
    if (!isString(el.nodeName) || el.nodeName.toLowerCase() !== 'html') {
      const parent = getParent(el);
      if (parent) {
        return {
          parent,
          style: null,
        };
      }
    }
  } else {
    const { body } = defaultView.document;
    for (
      let parent = getParent(el);
      parent && parent !== body && parent.nodeType !== 9;
      parent = getParent(parent)
    ) {
      const style = defaultView.getComputedStyle(parent);
      if (style.position !== 'static') {
        return { parent, style };
      }
    }
  }
  return null;
}

function getVisibleRectForElement(element: HTMLElement) {
  const { ownerDocument } = element;
  let isIframe = false;
  if (ownerDocument) {
    const { defaultView } = ownerDocument;
    if (defaultView) {
      isIframe = !!findIFrame(defaultView);
      const { body, documentElement } = ownerDocument;
      let offsetParentAndStyle = getOffsetParentAndStyle(element, defaultView);
      while (offsetParentAndStyle) {
        const { parent, style } = offsetParentAndStyle;
        if (!parent || parent === body || parent === documentElement) {
          break;
        }
        if ((style || defaultView.getComputedStyle(parent)).overflow !== 'visible') {
          const rect = parent.getBoundingClientRect();
          const { x, y } = getMousePosition(rect.left, rect.top, defaultView, true);
          return {
            top: y,
            right: rect.right + x - rect.left,
            bottom: rect.bottom + y - rect.top,
            left: x,
          };
        }
        offsetParentAndStyle = getOffsetParentAndStyle(parent, defaultView);
      }
    }
  }
  const { body } = getDocument(window);
  return {
    top: 0,
    right: isIframe && window.frameElement ? window.frameElement.clientWidth : body.clientWidth,
    bottom: isIframe && window.frameElement ? window.frameElement.clientHeight : body.clientHeight,
    left: 0,
  };
}

function getRegion(node: HTMLElement): regionType {
  const rect = node.getBoundingClientRect();
  const { ownerDocument } = node;
  const defaultView = ownerDocument ? ownerDocument.defaultView : null;
  const position = defaultView ? getMousePosition(rect.left, rect.top, defaultView, true) : { x: rect.left, y: rect.top };
  return {
    top: position.y,
    left: position.x,
    width: rect.width || node.offsetWidth,
    height: rect.height || node.offsetHeight,
  };
}

function isOutOfVisibleRect(target: HTMLElement) {
  const visibleRect = getVisibleRectForElement(target);
  const targetRegion = getRegion(target);

  return (
    !visibleRect ||
    targetRegion.left + targetRegion.width <= visibleRect.left ||
    targetRegion.top + targetRegion.height <= visibleRect.top ||
    targetRegion.left >= visibleRect.right ||
    targetRegion.top >= visibleRect.bottom
  );
}

function flip(points, reg, map) {
  return points.map(p => p.replace(reg, m => map[m]));
}

function flipOffset(offset, index) {
  offset[index] = -offset[index];
  return offset;
}

function getAlignOffset(region, align) {
  const V = align.charAt(0);
  const H = align.charAt(1);
  const w = region.width;
  const h = region.height;

  let x = region.left;
  let y = region.top;

  if (V === 'c') {
    y += h / 2;
  } else if (V === 'b') {
    y += h;
  }

  if (H === 'c') {
    x += w / 2;
  } else if (H === 'r') {
    x += w;
  }

  return {
    left: x,
    top: y,
  };
}

function getElFuturePos(elRegion, refNodeRegion, points, offset, targetOffset): positionType {
  const p1 = getAlignOffset(refNodeRegion, points[1]);
  const p2 = getAlignOffset(elRegion, points[0]);
  const diff = [p2.left - p1.left, p2.top - p1.top];

  return {
    left: elRegion.left - diff[0] + offset[0] - targetOffset[0],
    top: elRegion.top - diff[1] + offset[1] - targetOffset[1],
  };
}

function adjustForViewport(
  elFuturePos: positionType,
  elRegion: regionType,
  visibleRect,
  overflow,
): regionType {
  const pos = { ...elFuturePos };
  const size = {
    width: elRegion.width,
    height: elRegion.height,
  };

  if (overflow.adjustX && pos.left < visibleRect.left) {
    pos.left = visibleRect.left;
  }

  // Left edge inside and right edge outside viewport, try to resize it.
  if (
    overflow.resizeWidth &&
    pos.left >= visibleRect.left &&
    pos.left + size.width > visibleRect.right
  ) {
    size.width -= pos.left + size.width - visibleRect.right;
  }

  // Right edge outside viewport, try to move it.
  if (overflow.adjustX && pos.left + size.width > visibleRect.right) {
    // 保证左边界和可视区域左边界对齐
    pos.left = Math.max(visibleRect.right - size.width, visibleRect.left);
  }

  // Top edge outside viewport, try to move it.
  if (overflow.adjustY && pos.top < visibleRect.top) {
    pos.top = visibleRect.top;
  }

  // Top edge inside and bottom edge outside viewport, try to resize it.
  if (
    overflow.resizeHeight &&
    pos.top >= visibleRect.top &&
    pos.top + size.height > visibleRect.bottom
  ) {
    size.height -= pos.top + size.height - visibleRect.bottom;
  }

  // Bottom edge outside viewport, try to move it.
  if (overflow.adjustY && pos.top + size.height > visibleRect.bottom) {
    // 保证上边界和可视区域上边界对齐
    pos.top = Math.max(visibleRect.bottom - size.height, visibleRect.top);
  }

  return Object.assign(pos, size);
}

// function isFixedPosition(node: HTMLElement): boolean {
//   const { offsetParent, ownerDocument } = node;
//   if (
//     ownerDocument &&
//     offsetParent === ownerDocument.body &&
//     ownerDocument.defaultView &&
//     ownerDocument.defaultView.getComputedStyle(node).position !== 'fixed'
//   ) {
//     return false;
//   }
//   if (offsetParent) {
//     return isFixedPosition(offsetParent as HTMLElement);
//   }
//   return true;
// }

function doAlign(el: HTMLElement, refNodeRegion: regionType, align, isTargetNotOutOfVisible: boolean) {
  let points = align.points;
  let offset = (align.offset || [0, 0]).slice();
  let targetOffset = (align.targetOffset || [0, 0]).slice();
  const overflow: overflowType = align.overflow || {};
  const source: HTMLElement = align.source || el;
  const newOverflowCfg: overflowType = {};
  let fail = 0;
  const visibleRect = getVisibleRectForElement(el);
  const elRegion = getRegion(source);
  let elFuturePos = getElFuturePos(elRegion, refNodeRegion, points, offset, targetOffset);
  let newElRegion = Object.assign(elRegion, elFuturePos);

  if (visibleRect && (overflow.adjustX || overflow.adjustY) && isTargetNotOutOfVisible) {
    if (overflow.adjustX) {
      if (isFailX(elFuturePos, elRegion, visibleRect)) {
        const newPoints = flip(points, /[lr]/gi, {
          l: 'r',
          r: 'l',
        });
        const newOffset = flipOffset(offset, 0);
        const newTargetOffset = flipOffset(targetOffset, 0);
        const newElFuturePos = getElFuturePos(
          elRegion,
          refNodeRegion,
          newPoints,
          newOffset,
          newTargetOffset,
        );

        if (!isCompleteFailX(newElFuturePos, elRegion, visibleRect)) {
          fail = 1;
          points = newPoints;
          offset = newOffset;
          targetOffset = newTargetOffset;
        }
      }
    }

    if (overflow.adjustY) {
      if (isFailY(elFuturePos, elRegion, visibleRect)) {
        const _newPoints = flip(points, /[tb]/gi, {
          t: 'b',
          b: 't',
        });
        const _newOffset = flipOffset(offset, 1);
        const _newTargetOffset = flipOffset(targetOffset, 1);
        const _newElFuturePos = getElFuturePos(
          elRegion,
          refNodeRegion,
          _newPoints,
          _newOffset,
          _newTargetOffset,
        );

        if (!isCompleteFailY(_newElFuturePos, elRegion, visibleRect)) {
          fail = 1;
          points = _newPoints;
          offset = _newOffset;
          targetOffset = _newTargetOffset;
        }
      }
    }

    if (fail) {
      elFuturePos = getElFuturePos(elRegion, refNodeRegion, points, offset, targetOffset);
      Object.assign(newElRegion, elFuturePos);
    }

    newOverflowCfg.adjustX = overflow.adjustX && isFailX(elFuturePos, elRegion, visibleRect);

    newOverflowCfg.adjustY = overflow.adjustY && isFailY(elFuturePos, elRegion, visibleRect);

    if (newOverflowCfg.adjustX || newOverflowCfg.adjustY) {
      newElRegion = adjustForViewport(elFuturePos, elRegion, visibleRect, newOverflowCfg);
    }
  }
  const { width, height } = newElRegion;
  if (width !== elRegion.width) {
    source.style.width = width ? pxToRem(width, true)! : '0';
  }

  if (height !== elRegion.height) {
    source.style.height = height ? pxToRem(height, true)! : '0';
  }
  // const isTargetFixed = isFixedPosition(target);
  const { offsetParent, ownerDocument } = source;
  if (offsetParent) {
    const { left, top } = offsetParent.getBoundingClientRect();
    newElRegion.left -= left;
    newElRegion.top -= top;
  }
  if (ownerDocument) {
    const { x, y } = getMousePosition(0, 0, ownerDocument.defaultView || window, true);
    newElRegion.left -= x;
    newElRegion.top -= y;
  }
  Object.assign(source.style, {
    left: pxToRem(newElRegion.left, true),
    top: pxToRem(newElRegion.top, true),
  });

  // if (isTargetFixed) {
  //   source.style.position = 'fixed';
  // } else {
  //   source.style.position = '';
  // }

  return {
    points,
    offset,
    targetOffset,
    overflow: newOverflowCfg,
  };
}

export default function alignElement(el: HTMLElement, refNode: HTMLElement, align) {
  const target = align.target || refNode;
  const refNodeRegion = getRegion(target);
  const isTargetNotOutOfVisible = !isOutOfVisibleRect(target);
  return doAlign(el, refNodeRegion, align, isTargetNotOutOfVisible);
}

export function alignPoint(el: HTMLElement, tgtPoint: AlignPoint, align) {
  let left = 0;
  let top = 0;
  const { ownerDocument } = el;
  const defaultView = ownerDocument ? ownerDocument.defaultView : null;
  const documentElement = ownerDocument ? ownerDocument.documentElement : null;
  const scrollX = documentElement ? documentElement.scrollLeft : 0;
  const scrollY = documentElement ? documentElement.scrollTop : 0;

  if (tgtPoint.pageX !== undefined) {
    left = tgtPoint.pageX - scrollX;
  } else if (tgtPoint.clientX !== undefined) {
    left = scrollX + tgtPoint.clientX;
  }

  if (tgtPoint.pageY !== undefined) {
    top = tgtPoint.pageY - scrollY;
  } else if (tgtPoint.clientY !== undefined) {
    top = tgtPoint.clientY;
  }
  const position = defaultView ? getMousePosition(left, top, defaultView, true) : {
    x: left,
    y: top,
    vw: documentElement ? documentElement.clientWidth : 0,
    vh: documentElement ? documentElement.clientHeight : 0,
  };
  left = position.x;
  top = position.y;

  const tgtRegion: regionType = {
    left,
    top,
    width: 0,
    height: 0,
  };
  const pointInView = left >= 0 && left <= position.vw && top >= 0 && top <= position.vh; // Provide default target point

  const points = [align.points[0], 'cc'];
  return doAlign(el, tgtRegion, {
    ...align,
    points,
  }, pointInView);
}
