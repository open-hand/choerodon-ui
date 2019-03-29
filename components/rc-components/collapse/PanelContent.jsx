import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default class PanelContent extends Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    isInactive: PropTypes.bool,
    children: PropTypes.any,
    destroyInactivePanel: PropTypes.bool,
    forceRender: PropTypes.bool,
  };

  shouldComponentUpdate(nextProps) {
    return !this.props.isInactive || !nextProps.isInactive;
  }

  render() {
    this._isActived = this.props.forceRender || this._isActived || !this.props.isInactive;
    if (!this._isActived) {
      return null;
    }
    const { prefixCls, isInactive, children, destroyInactivePanel, forceRender } = this.props;
    const contentCls = classnames({
      [`${prefixCls}-content`]: true,
      [`${prefixCls}-content-active`]: !isInactive,
      [`${prefixCls}-content-inactive`]: isInactive,
    });
    const child = !forceRender && isInactive && destroyInactivePanel ? null : <div className={`${prefixCls}-content-box`}>{children}</div>;
    return (
      <div
        className={contentCls}
        role="tabpanel"
      >{child}</div>
    );
  }
}
