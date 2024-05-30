import React from 'react';
import { findDOMNode } from 'react-dom';
import scrollIntoView from 'dom-scroll-into-view';
import classNames from 'classnames';
import { connect } from 'mini-store';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import { hide, show } from 'choerodon-ui/pro/lib/tooltip/singleton';
import isOverflow from 'choerodon-ui/pro/lib/overflow-tip/util';
import isMobile from 'choerodon-ui/pro/lib/_util/isMobile';
import KeyCode from '../../_util/KeyCode';
import Checkbox from '../../checkbox/Checkbox';
import Ripple from '../../ripple';
import { menuAllProps } from './util';

/* eslint react/no-is-mounted:0 */

export class MenuItem extends React.Component {
  static displayName = 'MenuItem';

  static defaultProps = {
    onSelect: noop,
    onMouseEnter: noop,
    onMouseLeave: noop,
    onMouseDown: noop,
    manualRef: noop,
  };

  componentWillUnmount() {
    const props = this.props;
    if (props.onDestroy) {
      props.onDestroy(props.eventKey);
    }
  }

  componentDidMount() {
    // invoke customized ref to expose component to mixin
    this.callRef();
  }

  componentDidUpdate() {
    if (this.props.active) {
      scrollIntoView(findDOMNode(this), findDOMNode(this.props.parentMenu), {
        onlyScrollIfNeeded: true,
      });
    }
    this.callRef();
  }

  onKeyDown = (e) => {
    const keyCode = e.keyCode;
    if (keyCode === KeyCode.ENTER) {
      this.onClick(e);
      return true;
    }
  };

  onMouseLeave = (e) => {
    const { eventKey, onItemHover, onMouseLeave } = this.props;
    onItemHover({
      key: eventKey,
      hover: false,
    });
    onMouseLeave({
      key: eventKey,
      domEvent: e,
    });
  };

  onMouseEnter = (e) => {
    const { eventKey, onItemHover, onMouseEnter } = this.props;
    onItemHover({
      key: eventKey,
      hover: true,
    });
    onMouseEnter({
      key: eventKey,
      domEvent: e,
    });
  };

  handleRippleMouseEnter = (e) => {
    const { tooltip, tooltipTheme, tooltipPlacement, children, mode } = this.props;
    const { currentTarget } = e;
    if (children && (tooltip === 'always' || (tooltip === 'overflow' && isOverflow(currentTarget)))) {
      show(currentTarget, {
        title: children,
        placement: tooltipPlacement || mode === 'horizontal' ? 'top' : 'right',
        theme: tooltipTheme,
      });
    }
  };

  onClick = (e) => {
    const { eventKey, multiple, onClick, onSelect, onDeselect, isSelected } = this.props;
    const info = {
      key: eventKey,
      keyPath: [eventKey],
      item: this,
      domEvent: e,
    };
    onClick(info);
    if (multiple) {
      if (isSelected) {
        onDeselect(info);
      } else {
        onSelect(info);
      }
    } else if (!isSelected) {
      onSelect(info);
    }
  };

  getPrefixCls() {
    return `${this.props.rootPrefixCls}-item`;
  }

  getActiveClassName() {
    return `${this.getPrefixCls()}-active`;
  }

  getSelectedClassName() {
    return `${this.getPrefixCls()}-selected`;
  }

  getDisabledClassName() {
    return `${this.getPrefixCls()}-disabled`;
  }

  callRef() {
    if (this.props.manualRef) {
      this.props.manualRef(this);
    }
  }

  render() {
    const props = { ...this.props };
    const className = classNames(this.getPrefixCls(), props.className, {
      [this.getActiveClassName()]: !props.disabled && props.active,
      [this.getSelectedClassName()]: props.isSelected,
      [this.getDisabledClassName()]: props.disabled,
    });
    let attrs = {
      ...props.attribute,
      title: props.title,
      className,
      role: props.role || 'menuitem',
      'aria-disabled': props.disabled,
    };

    if (props.role === 'option') {
      // overwrite to option
      attrs = {
        ...attrs,
        role: 'option',
        'aria-selected': props.isSelected,
      };
    } else if (props.role === null || props.role === 'none') {
      attrs.role = 'none';
    }

    const mouseEvent = {
      onClick: props.disabled ? null : this.onClick,
      onMouseLeave: props.disabled ? null : this.onMouseLeave,
      onMouseEnter: props.disabled ? null : this.onMouseEnter,
      onMouseDown: props.disabled ? null : props.onMouseDown,
    };
    const style = {
      ...props.style,
    };
    if (props.mode === 'inline') {
      style.paddingLeft = props.inlineIndent * props.level;
    }

    const checkbox = props.multiple && props.checkable !== false ? (
      <Checkbox disabled={props.disabled} checked={props.isSelected} tabIndex={-1} />
    ) : null;
    const rippleProps = {
      disabled: props.disabled || props.rippleDisabled,
    };
    if (['overflow', 'always'].includes(props.tooltip)) {
      if (!isMobile()) {
        rippleProps.onMouseEnter = this.handleRippleMouseEnter;
        rippleProps.onMouseLeave = hide;
      } else {
        rippleProps.onTouchStart = this.handleRippleMouseEnter;
        rippleProps.onTouchEnd = hide;
      }
    }
    menuAllProps.forEach(key => delete props[key]);
    return (
      <Ripple {...rippleProps}>
        <li
          {...omit(props, ['tooltipPlacement', 'tooltipTheme'])}
          {...attrs}
          {...mouseEvent}
          style={style}
        >
          {checkbox}
          {props.children}
        </li>
      </Ripple>
    );
  };
}

MenuItem.isMenuItem = true;

const connected = connect(({ activeKey, selectedKeys }, { eventKey, subMenuKey }) => ({
  active: activeKey[subMenuKey] === eventKey,
  isSelected: selectedKeys.indexOf(eventKey) !== -1,
}))(MenuItem);

export default connected;
