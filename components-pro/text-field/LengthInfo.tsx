import React from 'react';
import omit from 'lodash/omit';
import ResizeObserver from 'resize-observer-polyfill';

class LengthInfo extends React.Component<{ className: string; onWidthChange: (width?: number) => void }> {
  element: HTMLDivElement | null = null;

  resizeObserver?: ResizeObserver;

  componentDidMount() {
    this.resizeObserver = new ResizeObserver(this.measureWidth);
    if (this.element) {
      this.resizeObserver.observe(this.element);
    }
    this.measureWidth();
  }

  componentDidUpdate() {
    this.measureWidth();
  }

  componentWillUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.element = null;
    const { onWidthChange } = this.props;
    onWidthChange(undefined);
  }

  saveRef = (element: HTMLDivElement | null) => {
    this.element = element;
  };

  measureWidth = () => {
    if (this.element) {
      const { onWidthChange } = this.props;
      onWidthChange(this.element.offsetWidth);
    }
  };

  render() {
    // TextArea 有其他属性透传
    const { children, ...rest } = omit(this.props, ['onWidthChange']);
    return <div ref={this.saveRef} {...rest}>{children}</div>;
  }
}

export default LengthInfo;
