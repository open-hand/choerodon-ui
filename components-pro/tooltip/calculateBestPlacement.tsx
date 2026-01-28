import { TooltipPlacement } from 'choerodon-ui/lib/tooltip';

interface ElementRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

interface PlacementScore {
  placement: TooltipPlacement;
  score: number;
}

/**
 * 计算四个方向的最佳位置
 * @param targetRect 目标元素的矩形区域
 * @param popupRect 弹出层的矩形区域
 * @param viewportRect 视口矩形区域
 * @param currentPlacement 当前的 placement (用于迟滞判断)
 * @returns 最佳的 placement
 */
export function calculateBestPlacement(
  targetRect: ElementRect,
  popupRect: ElementRect,
  viewportRect: ElementRect,
  currentPlacement?: TooltipPlacement,
): TooltipPlacement {
  const placements: TooltipPlacement[] = ['top', 'bottom', 'left', 'right'];
  const scores: PlacementScore[] = [];

  placements.forEach(placement => {
    let score = 0;
    let popupLeft = 0;
    let popupTop = 0;
    let popupRight = 0;
    let popupBottom = 0;

    switch (placement) {
      case 'top':
        popupLeft = targetRect.left + (targetRect.width - popupRect.width) / 2;
        popupTop = targetRect.top - popupRect.height;
        popupRight = popupLeft + popupRect.width;
        popupBottom = targetRect.top;
        break;
      case 'bottom':
        popupLeft = targetRect.left + (targetRect.width - popupRect.width) / 2;
        popupTop = targetRect.bottom;
        popupRight = popupLeft + popupRect.width;
        popupBottom = popupTop + popupRect.height;
        break;
      case 'left':
        popupLeft = targetRect.left - popupRect.width;
        popupTop = targetRect.top + (targetRect.height - popupRect.height) / 2;
        popupRight = targetRect.left;
        popupBottom = popupTop + popupRect.height;
        break;
      case 'right':
        popupLeft = targetRect.right;
        popupTop = targetRect.top + (targetRect.height - popupRect.height) / 2;
        popupRight = popupLeft + popupRect.width;
        popupBottom = popupTop + popupRect.height;
        break;
      default:
        break;
    }

    // 计算在视口内的可见面积
    const visibleLeft = Math.max(popupLeft, viewportRect.left);
    const visibleTop = Math.max(popupTop, viewportRect.top);
    const visibleRight = Math.min(popupRight, viewportRect.right);
    const visibleBottom = Math.min(popupBottom, viewportRect.bottom);

    const visibleWidth = Math.max(0, visibleRight - visibleLeft);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    const visibleArea = visibleWidth * visibleHeight;
    const totalArea = popupRect.width * popupRect.height;

    // 可见面积比例得分
    const visibilityScore = visibleArea / totalArea;
    score += visibilityScore * 100;

    // 距离视口边缘的距离得分
    const marginScore = 
      Math.min(popupLeft - viewportRect.left, viewportRect.right - popupRight) +
      Math.min(popupTop - viewportRect.top, viewportRect.bottom - popupBottom);
    score += marginScore * 0.1;

    // 优先级得分（top > bottom > left > right）
    // const priorityScores: { [key in TooltipPlacement]: number } = {
    const priorityScores = {
      top: 10,
      bottom: 8,
      left: 6,
      right: 4,
    };
    score += priorityScores[placement];

    // 迟滞（Hysteresis）机制：
    // 如果当前位置就是这个 placement，给予额外的加分，防止在临界状态下反复切换。
    // 10分相当于一个优先级层级的差异，或者10%的可见区域差异。
    if (currentPlacement && placement === currentPlacement) {
      score += 10;
    }

    scores.push({ placement, score });
  });

  // 按得分排序，返回得分最高的 placement
  scores.sort((a, b) => b.score - a.score);
  return scores[0].placement;
}

/**
 * 获取元素的矩形信息
 */
export function getElementRect(element: HTMLElement): ElementRect {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  };
}

/**
 * 获取视口矩形信息
 */
export function getViewportRect(): ElementRect {
  return {
    top: 0,
    left: 0,
    right: window.innerWidth || document.documentElement.clientWidth,
    bottom: window.innerHeight || document.documentElement.clientHeight,
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  };
}