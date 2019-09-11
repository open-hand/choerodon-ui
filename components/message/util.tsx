export function getPlacementStyle(placement: string, defaultTop: number, defaultBottom: number) {
  const top = defaultTop ? `${defaultTop}px` : 0;
  const bottom = defaultBottom ? `${defaultBottom}px` : 0;
  const target = {
    left: '24px',
    right: '24px',
    top,
    bottom,
  };
  let style = {};
  switch (placement) {
    case 'top':
      style = {
        bottom: 'auto',
      };
      break;
    case 'right':
      style = {
        left: 'auto',
        top: '50%',
        bottom: 'auto',
      };
      break;
    case 'bottom':
      style = {
        top: 'auto',
      };
      break;
    case 'left':
      style = {
        right: 'auto',
        top: '50%',
        bottom: 'auto',
      };
      break;
    case 'topLeft':
    case 'leftTop':
      style = {
        right: 'auto',
        bottom: 'auto',
      };
      break;
    case 'topRight':
    case 'rightTop':
      style = {
        left: 'auto',
        bottom: 'auto',
      };
      break;
    case 'bottomLeft':
    case 'leftBottom':
      style = {
        right: 'auto',
        top: 'auto',
      };
      break;
    case 'bottomRight':
    case 'rightBottom':
      style = {
        left: 'auto',
        top: 'auto',
      };
      break;
    default:
      break;
  }
  Object.assign(target, style);
  return target;
}

export function getPlacementTransitionName(placement: string, defaultTransitionName: string) {
  let transitionName = defaultTransitionName;
  switch (placement) {
    case 'top':
    case 'topLeft':
    case 'topRight':
      transitionName = 'move-up';
      break;
    case 'left':
    case 'leftTop':
    case 'leftBottom':
      transitionName = 'move-left';
      break;
    case 'bottom':
    case 'bottomLeft':
    case 'bottomRight':
      transitionName = 'move-down';
      break;
    case 'right':
    case 'rightTop':
    case 'rightBottom':
      transitionName = 'move-right';
      break;
    default:
      break;
  }
  return transitionName;
}
