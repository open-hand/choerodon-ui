import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import PanelContent from './PanelContent';
import Animate from '../../animate';

export default class CollapsePanel extends Component {
  static propTypes = {
    className: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
    id: PropTypes.string,
    children: PropTypes.any,
    openAnimation: PropTypes.object,
    prefixCls: PropTypes.string,
    header: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.node,
    ]),
    headerClass: PropTypes.string,
    showArrow: PropTypes.bool,
    isActive: PropTypes.bool,
    onItemClick: PropTypes.func,
    style: PropTypes.object,
    destroyInactivePanel: PropTypes.bool,
    disabled: PropTypes.bool,
    forceRender: PropTypes.bool,
  };

  static defaultProps = {
    showArrow: true,
    isActive: false,
    destroyInactivePanel: false,
    onItemClick() {
    },
    headerClass: '',
    forceRender: false,
  };

  handleItemClick() {
    if (this.props.onItemClick) {
      this.props.onItemClick();
    }
  }

  render() {
    const {
      className,
      id,
      style,
      prefixCls,
      header,
      headerClass,
      children,
      isActive,
      showArrow,
      destroyInactivePanel,
      disabled,
      forceRender,
    } = this.props;
    const headerCls = classNames(`${prefixCls}-header`, {
      [headerClass]: headerClass,
    });
    const itemCls = classNames({
      [`${prefixCls}-item`]: true,
      [`${prefixCls}-item-active`]: isActive,
      [`${prefixCls}-item-disabled`]: disabled,
    }, className);
    const iconCls = classNames({
      [`${prefixCls}-expand-icon`]: true,
      [`${prefixCls}-expanded`]: isActive,
      [`${prefixCls}-collapsed`]: !isActive,
    });
    return (
      <div className={itemCls} style={style} id={id} role="tablist">
        <div
          className={headerCls}
          onClick={this.handleItemClick.bind(this)}
          role="tab"
          aria-expanded={isActive}
        >
          {showArrow && <i className={iconCls} />}
          {header}
        </div>
        <Animate
          hiddenProp="isInactive"
          exclusive
          component=""
          animation={this.props.openAnimation}
        >
          <PanelContent
            prefixCls={prefixCls}
            isInactive={!isActive}
            destroyInactivePanel={destroyInactivePanel}
            forceRender={forceRender}
          >
            {children}
          </PanelContent>
        </Animate>
      </div>
    );
  }
}
