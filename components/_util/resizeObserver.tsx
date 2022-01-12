import { PureComponent, ReactNode } from 'react';
import { findDOMNode } from 'react-dom';
import ResizeObserver from 'resize-observer-polyfill';

type DomElement = Element | null;

interface ResizeObserverProps {
  children?: ReactNode;
  disabled?: boolean;
  onResize?: (width: number, height: number, target: DomElement) => void;
  resizeProp?: 'width' | 'height' | 'both';
  immediately?: boolean;
  boxSize?: 'borderBox' | 'contentBox';
}

class ReactResizeObserver extends PureComponent<ResizeObserverProps> {
  static defaultProps = {
    resizeProp: 'both',
    boxSize: 'borderBox',
  };

  resizeObserver: ResizeObserver | null = null;

  width = 0;

  height = 0;

  componentDidMount() {
    this.onComponentUpdated();
  }

  componentDidUpdate() {
    this.onComponentUpdated();
  }

  componentWillUnmount() {
    this.destroyObserver();
  }

  onComponentUpdated() {
    const { disabled } = this.props;
    const element = findDOMNode(this) as HTMLElement | null;
    if (!this.resizeObserver && !disabled && element) {
      // Add resize observer
      this.resizeObserver = new ResizeObserver(this.onResize);
      this.resizeObserver.observe(element);
      const { onResize, immediately } = this.props;
      if (immediately && onResize) {
        onResize(element.offsetWidth, element.offsetHeight, element);
      }
    } else if (disabled) {
      // Remove resize observer
      this.destroyObserver();
    }
  }

  onResize: ResizeObserverCallback = (entries: ResizeObserverEntry[]) => {
    const { onResize, resizeProp, boxSize } = this.props;
    const [entry] = entries;
    const {
      target,
      contentRect,
    } = entry;
    const { borderBoxSize } = entry as any;
    const borderBox = borderBoxSize && borderBoxSize[0];
    const isBorderBox = boxSize === 'borderBox';
    const { width, height } = (() => {
      if (isBorderBox) {
        if (borderBox) {
          return { width: borderBox.inlineSize, height: borderBox.blockSize };
        }
        return target.getBoundingClientRect();
      }
      return contentRect;
    })();
    const fixedWidth = Math.round(width);
    const fixedHeight = Math.round(height);

    if (
      (this.width !== fixedWidth && ['width', 'both'].includes(resizeProp!)) ||
      (this.height !== fixedHeight && ['height', 'both'].includes(resizeProp!))
    ) {
      this.width = fixedWidth;
      this.height = fixedHeight;

      if (onResize) {
        onResize(fixedWidth, fixedHeight, target);
      }
    }
  };

  destroyObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  render() {
    const { children = null } = this.props;
    return children;
  }
}

export default ReactResizeObserver;
