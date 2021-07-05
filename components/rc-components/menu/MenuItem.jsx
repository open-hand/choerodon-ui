import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { hide, show } from 'choerodon-ui/pro/lib/tooltip/singleton';
import isOverflow from 'choerodon-ui/pro/lib/overflow-tip/util';
import KeyCode from '../../_util/KeyCode';
import classNames from 'classnames';
import { connect } from 'mini-store';
import noop from 'lodash/noop';
import Checkbox from '../../checkbox/Checkbox';
import Ripple from '../../ripple';
/* eslint react/no-is-mounted:0 */

const MenuItem = createReactClass({
  displayName: 'MenuItem',

  propTypes: {
    rootPrefixCls: PropTypes.string,
    eventKey: PropTypes.string,
    active: PropTypes.bool,
    children: PropTypes.any,
    selectedKeys: PropTypes.array,
    disabled: PropTypes.bool,
    checkable: PropTypes.bool,
    title: PropTypes.string,
    onItemHover: PropTypes.func,
    onSelect: PropTypes.func,
    onClick: PropTypes.func,
    onDeselect: PropTypes.func,
    parentMenu: PropTypes.object,
    onDestroy: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onMouseDown: PropTypes.func,
  },

  getDefaultProps() {
    return {
      onSelect: noop,
      onMouseEnter: noop,
      onMouseLeave: noop,
      onMouseDown: noop,
    };
  },

  componentWillUnmount() {
    const props = this.props;
    if (props.onDestroy) {
      props.onDestroy(props.eventKey);
    }
  },

  componentDidMount() {
    // invoke customized ref to expose component to mixin
    if (this.props.manualRef) {
      this.props.manualRef(this);
    }
  },

  componentDidUpdate() {
    // invoke customized ref to expose component to mixin
    if (this.props.manualRef) {
      this.props.manualRef(this);
    }
  },

  onKeyDown(e) {
    const keyCode = e.keyCode;
    if (keyCode === KeyCode.ENTER) {
      this.onClick(e);
      return true;
    }
  },

  onMouseLeave(e) {
    const { eventKey, onItemHover, onMouseLeave } = this.props;
    onItemHover({
      key: eventKey,
      hover: false,
    });
    onMouseLeave({
      key: eventKey,
      domEvent: e,
    });
  },

  onMouseEnter(e) {
    const { eventKey, onItemHover, onMouseEnter } = this.props;
    onItemHover({
      key: eventKey,
      hover: true,
    });
    onMouseEnter({
      key: eventKey,
      domEvent: e,
    });
  },

  handleRippleMouseEnter(e) {
    const { tooltip, children, mode } = this.props;
    const { currentTarget } = e;
    if (children && (tooltip === 'always' || (tooltip === 'overflow' && isOverflow(currentTarget)))) {
      show(currentTarget, {
        title: children,
        placement: mode === 'horizontal' ? 'top' : 'right',
      });
    }
  },

  onClick(e) {
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
  },

  getPrefixCls() {
    return `${this.props.rootPrefixCls}-item`;
  },

  getActiveClassName() {
    return `${this.getPrefixCls()}-active`;
  },

  getSelectedClassName() {
    return `${this.getPrefixCls()}-selected`;
  },

  getDisabledClassName() {
    return `${this.getPrefixCls()}-disabled`;
  },

  render() {
    const props = this.props;
    const className = classNames(this.getPrefixCls(), props.className, {
      [this.getActiveClassName()]: !props.disabled && props.active,
      [this.getSelectedClassName()]: props.isSelected,
      [this.getDisabledClassName()]: props.disabled,
    });
    const attrs = {
      ...props.attribute,
      title: props.title,
      className,
      role: 'menuitem',
      'aria-selected': props.isSelected,
      'aria-disabled': props.disabled,
    };
    let mouseEvent = {};
    if (!props.disabled) {
      mouseEvent = {
        onClick: this.onClick,
        onMouseLeave: this.onMouseLeave,
        onMouseEnter: this.onMouseEnter,
        onMouseDown: this.props.onMouseDown,
      };
    }
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
      disabled: props.disabled,
    };
    if (['overflow', 'always'].includes(props.tooltip)) {
      rippleProps.onMouseEnter = this.handleRippleMouseEnter;
      rippleProps.onMouseLeave = hide;
    }
    return (
      <Ripple {...rippleProps}>
        <li
          {...attrs}
          {...mouseEvent}
          style={style}
        >
          {checkbox}
          {props.children}
        </li>
      </Ripple>
    );
  },
});

MenuItem.isMenuItem = 1;

export default connect(({ activeKey, selectedKeys }, { eventKey, subMenuKey }) => ({
  active: activeKey[subMenuKey] === eventKey,
  isSelected: selectedKeys.indexOf(eventKey) !== -1,
}))(MenuItem);
