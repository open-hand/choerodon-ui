import React, { Component, createRef } from 'react';

export default class Content extends Component {
  innerRef = createRef();

  innerObserver = null;

  componentDidMount() {
    this.watchInner();
  }

  componentDidUpdate() {
    const { trigger } = this.props;
    if (trigger) {
      trigger.forcePopupAlign();
    }
  }

  componentWillUnmount() {
    if (this.innerObserver) {
      this.innerObserver.disconnect();
      this.innerObserver = null;
    }
  }

  watchInner = () => {
    const { current: element } = this.innerRef || {};
    if (!element) return;

    this.innerObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect || {};
        const { trigger } = this.props;
        if (trigger && width !== 0 && height !== 0) {
          trigger.forcePopupAlign();
        }
      }
    });
    this.innerObserver.observe(element);
  }

  render() {
    const { overlay, prefixCls, id, theme } = this.props;
    return (
      <div className={`${prefixCls}-inner ${prefixCls}-inner-${theme}`} id={id} ref={this.innerRef}>
        {typeof overlay === 'function' ? overlay() : overlay}
      </div>
    );
  }
}
