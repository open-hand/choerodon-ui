import { Component, ReactNode } from 'react';
import { findDOMNode } from 'react-dom';
import ResizeObserver from 'resize-observer-polyfill';

type DomElement = Element | null;

interface ResizeObserverProps {
  children?: ReactNode;
  disabled?: boolean;
  onResize?: (target) => void;
}

class ReactResizeObserver extends Component<ResizeObserverProps> {
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
    const element = findDOMNode(this) as DomElement;
    if (!this.resizeObserver && !disabled && element) {
      // Add resize observer
      this.resizeObserver = new ResizeObserver(this.onResize);
      this.resizeObserver.observe(element);
    } else if (disabled) {
      // Remove resize observer
      this.destroyObserver();
    }
  }

  onResize: ResizeObserverCallback = (entries: ResizeObserverEntry[]) => {
    const { onResize } = this.props;

    const { target } = entries[0];

    const { width, height } = target.getBoundingClientRect();

    /**
     * Resize observer trigger when content size changed.
     * In most case we just care about element size,
     * let's use `boundary` instead of `contentRect` here to avoid shaking.
     */
    const fixedWidth = Math.floor(width);
    const fixedHeight = Math.floor(height);

    if (this.width !== fixedWidth || this.height !== fixedHeight) {
      this.width = fixedWidth;
      this.height = fixedHeight;

      if (onResize) {
        onResize(target);
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
