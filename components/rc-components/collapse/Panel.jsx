import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import noop from 'lodash/noop';
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
      accordion,
      forceRender,
      expandIcon,
      extra,
      trigger,
    } = this.props;
    const headerCls = classNames(`${prefixCls}-header`, {
      [headerClass]: headerClass,
      [`${prefixCls}-item-expand-renderer`]: showArrow && typeof expandIcon === 'function',
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

    let icon = <i className={iconCls} />;

    if (trigger === 'icon') {
      icon = (<span className={`${prefixCls}-expand-icon-wrapper`} onClick={this.handleItemClick.bind(this)}>
        <i className={iconCls} />
      </span>);
    }

    if (showArrow) {
      if (typeof expandIcon === 'function') {
        icon = trigger === 'icon' ? (
          <span className={`${prefixCls}-expand-icon-wrapper`} onClick={this.handleItemClick.bind(this)}>
        {expandIcon(this.props)}
      </span>) : expandIcon(this.props);
      }
    }

    return (
      <div className={itemCls} style={style} id={id}>
        <div
          className={headerCls}
          onClick={trigger === 'header' ? this.handleItemClick.bind(this) : noop}
          role={accordion ? 'tab' : 'button'}
          tabIndex={disabled ? -1 : 0}
          aria-expanded={`${isActive}`}
          onKeyPress={this.handleKeyPress}
        >
          {showArrow && icon}
          {header}
          {extra && (<div className={`${prefixCls}-extra`}>{extra}</div>)}
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
            role={accordion ? 'tabpanel' : null}
          >
            {children}
          </PanelContent>
        </Animate>
      </div>
    );
  }
}
