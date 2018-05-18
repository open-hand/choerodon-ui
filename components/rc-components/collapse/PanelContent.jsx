import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

class PanelContent extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.isActive || nextProps.isActive;
  }

  render() {
    this._isActived = this.props.forceRender || this._isActived || this.props.isActive;
    if (!this._isActived) {
      return null;
    }
    const { prefixCls, isActive, children, destroyInactivePanel, forceRender } = this.props;
    const contentCls = classnames({
      [`${prefixCls}-content`]: true,
      [`${prefixCls}-content-active`]: isActive,
      [`${prefixCls}-content-inactive`]: !isActive,
    });
    const child = !forceRender && !isActive && destroyInactivePanel ? null :
      <div className={`${prefixCls}-content-box`}>{children}</div>;
    return (
      <div
        className={contentCls}
        role="tabpanel"
      >{child}</div>
    );
  }
}

PanelContent.propTypes = {
  prefixCls: PropTypes.string,
  isActive: PropTypes.bool,
  children: PropTypes.any,
  destroyInactivePanel: PropTypes.bool,
  forceRender: PropTypes.bool,
};

export default PanelContent;
