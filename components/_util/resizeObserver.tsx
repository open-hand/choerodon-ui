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
}

class ReactResizeObserver extends PureComponent<ResizeObserverProps> {
  static defaultProps = {
    resizeProp: 'both',
  };

  resizeObserver: ResizeObserver | null = null;

  width: number = 0;

  height: number = 0;

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
    const { onResize, resizeProp } = this.props;

    const {
      target,
      contentRect: { width, height },
    } = entries[0];

    /**
     * getBoundingClientRect return wrong size in transform case.
     */
      // const { width, height } = target.getBoundingClientRect();

    const fixedWidth = Math.floor(width);
    const fixedHeight = Math.floor(height);

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
