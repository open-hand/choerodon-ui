import { Property } from 'csstype';

let OBJECT_FIT_SUPPORT: boolean | undefined;

export function isObjectFitSupport() {
  if (OBJECT_FIT_SUPPORT !== undefined) {
    return OBJECT_FIT_SUPPORT;
  }
  if (typeof window !== 'undefined') {
    const { style } = document.documentElement;
    OBJECT_FIT_SUPPORT = 'objectFit' in style && 'objectPosition' in style;
    return OBJECT_FIT_SUPPORT;
  }
  return true;
}

function getComputedStyle(element: HTMLElement): CSSStyleDeclaration | undefined {
  const { ownerDocument } = element;
  if (ownerDocument) {
    const { defaultView } = ownerDocument;
    if (defaultView) {
      return defaultView.getComputedStyle(element, null);
    }
  }
}

function checkParentContainer($container: HTMLElement) {
  const styles = getComputedStyle($container);
  if (styles) {
    const position = styles.getPropertyValue('position');
    const overflow = styles.getPropertyValue('overflow');
    const display = styles.getPropertyValue('display');

    if (!position || position === 'static') {
      $container.style.position = 'relative';
    }
    if (overflow !== 'hidden') {
      $container.style.overflow = 'hidden';
    }
    if (!display || display === 'inline') {
      $container.style.display = 'block';
    }
    if ($container.clientHeight === 0) {
      $container.style.height = '100%';
    }

    if ($container.className.indexOf('object-fit-polyfill') === -1) {
      $container.className += ' object-fit-polyfill';
    }
  }
}

function checkMediaProperties($media) {
  const styles = getComputedStyle($media);
  if (styles) {
    const constraints = {
      'max-width': 'none',
      'max-height': 'none',
      'min-width': '0px',
      'min-height': '0px',
      top: 'auto',
      right: 'auto',
      bottom: 'auto',
      left: 'auto',
      'margin-top': '0px',
      'margin-right': '0px',
      'margin-bottom': '0px',
      'margin-left': '0px',
    };

    Object.keys(constraints).forEach(property => {
      const constraint = styles.getPropertyValue(property);
      const constraintValue = constraints[property];
      if (constraint !== constraintValue) {
        $media.style[property] = constraintValue;
      }
    });
  }
}

function setPosition(axis, $media, objectPosition) {
  let position;
  let other;
  let start;
  let end;
  let side;
  objectPosition = objectPosition.split(' ');

  if (objectPosition.length < 2) {
    objectPosition[1] = objectPosition[0];
  }

  /* istanbul ignore else */
  if (axis === 'x') {
    position = objectPosition[0];
    other = objectPosition[1];
    start = 'left';
    end = 'right';
    side = $media.clientWidth;
  } else if (axis === 'y') {
    position = objectPosition[1];
    other = objectPosition[0];
    start = 'top';
    end = 'bottom';
    side = $media.clientHeight;
  } else {
    return; // Neither x or y axis specified
  }

  if (position === start || other === start) {
    $media.style[start] = '0';
    return;
  }

  if (position === end || other === end) {
    $media.style[end] = '0';
    return;
  }

  if (position === 'center' || position === '50%') {
    $media.style[start] = '50%';
    $media.style[`margin-${start}`] = `${side / -2}px`;
    return;
  }

  if (position.indexOf('%') >= 0) {
    position = parseInt(position, 10);

    if (position < 50) {
      $media.style[start] = `${position}%`;
      $media.style[`margin-${start}`] = `${side * (position / -100)}px`;
    } else {
      position = 100 - position;
      $media.style[end] = `${position}%`;
      $media.style[`margin-${end}`] = `${side * (position / -100)}px`;
    }
  } else {
    $media.style[start] = position;
  }
}

export default function objectFitPolyfill(
  $media: HTMLImageElement,
  fit: Property.ObjectFit,
  position: Property.ObjectPosition,
) {
  // If necessary, make the parent container work with absolutely positioned elements
  const $container: HTMLElement | null = $media.parentNode as HTMLElement | null;
  if ($container) {
    checkParentContainer($container);

    // Check for any pre-set CSS which could mess up image calculations
    checkMediaProperties($media);

    // Reset any pre-set width/height CSS and handle fit positioning
    $media.style.position = 'absolute';
    $media.style.width = 'auto';
    $media.style.height = 'auto';

    // `scale-down` chooses either `none` or `contain`, whichever is smaller
    if (fit === 'scale-down') {
      if (
        $media.clientWidth < $container.clientWidth &&
        $media.clientHeight < $container.clientHeight
      ) {
        fit = 'none';
      } else {
        fit = 'contain';
      }
    }

    // `none` (width/height auto) and `fill` (100%) and are straightforward
    if (fit === 'none') {
      setPosition('x', $media, position);
      setPosition('y', $media, position);
      return;
    }

    if (fit === 'fill') {
      $media.style.width = '100%';
      $media.style.height = '100%';
      setPosition('x', $media, position);
      setPosition('y', $media, position);
      return;
    }

    // `cover` and `contain` must figure out which side needs covering, and add CSS positioning & centering
    $media.style.height = '100%';

    if (
      (fit === 'cover' && $media.clientWidth > $container.clientWidth) ||
      (fit === 'contain' && $media.clientWidth < $container.clientWidth)
    ) {
      $media.style.top = '0';
      $media.style.marginTop = '0';
      setPosition('x', $media, position);
    } else {
      $media.style.width = '100%';
      $media.style.height = 'auto';
      $media.style.left = '0';
      $media.style.marginLeft = '0';
      setPosition('y', $media, position);
    }
  }
}
