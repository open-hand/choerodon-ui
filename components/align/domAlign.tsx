import { pxToRem } from '../_util/UnitConvertor';

type overflowType = { adjustX?: boolean, adjustY?: boolean };
type regionType = { left: number, top: number, width: number, height: number };
type positionType = { left: number, top: number };

function isFailX(elFuturePos, elRegion, visibleRect) {
  return elFuturePos.left < visibleRect.left || elFuturePos.left + elRegion.width > visibleRect.right;
}

function isFailY(elFuturePos, elRegion, visibleRect) {
  return elFuturePos.top < visibleRect.top || elFuturePos.top + elRegion.height > visibleRect.bottom;
}

function isCompleteFailX(elFuturePos, elRegion, visibleRect) {
  return elFuturePos.left > visibleRect.right || elFuturePos.left + elRegion.width < visibleRect.left;
}

function isCompleteFailY(elFuturePos, elRegion, visibleRect) {
  return elFuturePos.top > visibleRect.bottom || elFuturePos.top + elRegion.height < visibleRect.top;
}

function isOutOfVisibleRect(target) {
  const visibleRect = getVisibleRectForElement();
  const targetRegion = getRegion(target);

  return !visibleRect || targetRegion.left + targetRegion.width <= visibleRect.left ||
    targetRegion.top + targetRegion.height <= visibleRect.top ||
    targetRegion.left >= visibleRect.right || targetRegion.top >= visibleRect.bottom;
}

function flip(points, reg, map) {
  return points.map((p) => p.replace(reg, (m) => map[m]));
}

function flipOffset(offset, index) {
  offset[index] = -offset[index];
  return offset;
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

function adjustForViewport(elFuturePos: positionType, elRegion: regionType, visibleRect, overflow): regionType {
  const pos = { ...elFuturePos };
  const size = {
    width: elRegion.width,
    height: elRegion.height,
  };

  if (overflow.adjustX && pos.left < visibleRect.left) {
    pos.left = visibleRect.left;
  }

  // Left edge inside and right edge outside viewport, try to resize it.
  if (overflow.resizeWidth && pos.left >= visibleRect.left && pos.left + size.width > visibleRect.right) {
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
  if (overflow.resizeHeight && pos.top >= visibleRect.top && pos.top + size.height > visibleRect.bottom) {
    size.height -= pos.top + size.height - visibleRect.bottom;
  }

  // Bottom edge outside viewport, try to move it.
  if (overflow.adjustY && pos.top + size.height > visibleRect.bottom) {
    // 保证上边界和可视区域上边界对齐
    pos.top = Math.max(visibleRect.bottom - size.height, visibleRect.top);
  }

  return Object.assign(pos, size);
}

function getRegion(node): regionType {
  const rect = node.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

function getVisibleRectForElement() {
  const body = document.body;
  return {
    top: 0,
    right: body.clientWidth,
    bottom: body.clientHeight,
    left: 0,
  };
}

function isFixedPosition(node) {
  const { offsetParent } = node;
  if (offsetParent === document.body && document.defaultView && document.defaultView.getComputedStyle(node).position !== 'fixed') {
    return false;
  }
  if (offsetParent === null) {
    return true;
  } else {
    return isFixedPosition(offsetParent);
  }
}

export default function (el, refNode, align) {
  let points = align.points;
  let offset = (align.offset || [0, 0]).slice();
  let targetOffset = (align.targetOffset || [0, 0]).slice();
  const overflow: overflowType = align.overflow || {};
  const target = align.target || refNode;
  const source = align.source || el;
  const newOverflowCfg: overflowType = {};
  let fail = 0;
  const visibleRect = getVisibleRectForElement();
  const elRegion = getRegion(source);
  const refNodeRegion = getRegion(target);
  let elFuturePos = getElFuturePos(elRegion, refNodeRegion, points, offset, targetOffset);
  let newElRegion = Object.assign(elRegion, elFuturePos);

  const isTargetNotOutOfVisible = !isOutOfVisibleRect(target);

  if (visibleRect && (overflow.adjustX || overflow.adjustY) && isTargetNotOutOfVisible) {
    if (overflow.adjustX) {
      if (isFailX(elFuturePos, elRegion, visibleRect)) {
        const newPoints = flip(points, /[lr]/ig, {
          l: 'r',
          r: 'l',
        });
        const newOffset = flipOffset(offset, 0);
        const newTargetOffset = flipOffset(targetOffset, 0);
        const newElFuturePos = getElFuturePos(elRegion, refNodeRegion, newPoints, newOffset, newTargetOffset);

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
        const _newPoints = flip(points, /[tb]/ig, {
          t: 'b',
          b: 't',
        });
        const _newOffset = flipOffset(offset, 1);
        const _newTargetOffset = flipOffset(targetOffset, 1);
        const _newElFuturePos = getElFuturePos(elRegion, refNodeRegion, _newPoints, _newOffset, _newTargetOffset);

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

  if (newElRegion.width !== elRegion.width) {
    source.style.width = newElRegion.width;
  }

  if (newElRegion.height !== elRegion.height) {
    source.style.height = newElRegion.height;
  }

  const isTargetFixed = isFixedPosition(target);
  const scrollTop = isTargetFixed ? 0 : document.documentElement.scrollTop || document.body.scrollTop;
  const scrollLeft = isTargetFixed ? 0 : document.documentElement.scrollLeft || document.body.scrollLeft;

  Object.assign(source.style, {
    left: pxToRem(newElRegion.left + scrollLeft),
    top: pxToRem(newElRegion.top + scrollTop),
  });

  if (isTargetFixed) {
    source.style.position = 'fixed';
  } else {
    source.style.position = '';
  }

  return {
    points: points,
    offset: offset,
    targetOffset: targetOffset,
    overflow: newOverflowCfg,
  };
}
