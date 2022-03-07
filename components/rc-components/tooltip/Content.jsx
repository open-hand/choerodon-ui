import React, { Component } from 'react';

export default class Content extends Component {
  componentDidUpdate() {
    const { trigger } = this.props;
    if (trigger) {
      trigger.forcePopupAlign();
    }
  }

  render() {
    const { overlay, prefixCls, id, theme } = this.props;
    return (
      <div className={`${prefixCls}-inner ${prefixCls}-inner-${theme}`} id={id}>
        {typeof overlay === 'function' ? overlay() : overlay}
      </div>
    );
  }
}
