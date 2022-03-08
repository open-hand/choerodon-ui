import React, { Children, cloneElement, Component } from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import { connect } from 'mini-store';
import KeyCode from '../../_util/KeyCode';
import createChainedFunction from '../util/createChainedFunction';
import { getKeyFromChildrenIndex, loopMenuItem, menuAllProps } from './util';
import DOMWrap from './DOMWrap';

function allDisabled(arr) {
  if (!arr.length) {
    return true;
  }
  return arr.every(c => !!c.props.disabled);
}

function updateActiveKey(store, menuId, activeKey) {
  const state = store.getState();
  store.setState({
    activeKey: {
      ...state.activeKey,
      [menuId]: activeKey,
    },
  });
}

function getEventKey(props) {
  // when eventKey not available ,it's menu and return menu id '0-menu-'
  return props.eventKey || '0-menu-';
}

export function getActiveKey(props, originalActiveKey) {
  let activeKey = originalActiveKey;
  const { children, eventKey } = props;
  if (activeKey) {
    let found;
    loopMenuItem(children, (c, i) => {
      if (c && !c.props.disabled && activeKey === getKeyFromChildrenIndex(c, eventKey, i)) {
        found = true;
      }
    });
    if (found) {
      return activeKey;
    }
  }
  activeKey = null;
  if (props.defaultActiveFirst) {
    loopMenuItem(children, (c, i) => {
      if (!activeKey && c && !c.props.disabled) {
        activeKey = getKeyFromChildrenIndex(c, eventKey, i);
      }
    });
    return activeKey;
  }
  return activeKey;
}

export function saveRef(c) {
  if (c) {
    const index = this.instanceArray.indexOf(c);
    if (index !== -1) {
      // update component if it's already inside instanceArray
      this.instanceArray[index] = c;
    } else {
      // add component if it's not in instanceArray yet;
      this.instanceArray.push(c);
    }
  }
}

export function getWrappedInstance() { return SubPopupMenu }

export class SubPopupMenu extends Component {
  static defaultProps = {
    prefixCls: 'rc-menu',
    className: '',
    mode: 'vertical',
    level: 1,
    inlineIndent: 24,
    hidden: false,
    focusable: true,
    style: {},
    manualRef: noop,
  };

  constructor(props) {
    super(props);

    props.store.setState({
      activeKey: {
        ...props.store.getState().activeKey,
        [props.eventKey]: getActiveKey(props, props.activeKey),
      },
    });

    this.instanceArray = [];
  }

  componentDidMount() {
    // invoke customized ref to expose component to mixin
    if (this.props.manualRef) {
      this.props.manualRef(this);
    }
  }

  shouldComponentUpdate(nextProps) {
    return !this.props.hidden || !nextProps.hidden;
  }

  componentDidUpdate() {
    const props = this.props;
    const originalActiveKey = 'activeKey' in props ? props.activeKey : props.store.getState().activeKey[getEventKey(props)];
    const activeKey = getActiveKey(props, originalActiveKey);
    if (activeKey !== originalActiveKey) {
      updateActiveKey(props.store, getEventKey(props), activeKey);
    }
  }

  // all keyboard events callbacks run from here at first
  onKeyDown = (e, callback) => {
    const keyCode = e.keyCode;
    let handled;
    this.getFlatInstanceArray().forEach((obj) => {
      if (obj && obj.props.active && obj.onKeyDown) {
        handled = obj.onKeyDown(e);
      }
    });
    if (handled) {
      return 1;
    }
    let activeItem = null;
    if (keyCode === KeyCode.UP || keyCode === KeyCode.DOWN) {
      activeItem = this.step(keyCode === KeyCode.UP ? -1 : 1);
    }
    if (activeItem) {
      e.preventDefault();
      updateActiveKey(this.props.store, getEventKey(this.props), activeItem.props.eventKey);

      if (typeof callback === 'function') {
        callback(activeItem);
      }

      return 1;
    }
  };

  onItemHover = (e) => {
    const { key, hover } = e;
    updateActiveKey(this.props.store, getEventKey(this.props), hover ? key : null);
  };

  onDeselect = (selectInfo) => {
    this.props.onDeselect(selectInfo);
  };

  onSelect = (selectInfo) => {
    this.props.onSelect(selectInfo);
  };

  onClick = (e) => {
    this.props.onClick(e);
  };

  onOpenChange = (e) => {
    this.props.onOpenChange(e);
  };

  onDestroy = (key) => {
    /* istanbul ignore next */
    this.props.onDestroy(key);
  };

  getFlatInstanceArray = () => {
    return this.instanceArray;
  };

  getOpenTransitionName = () => {
    return this.props.openTransitionName;
  };

  step = (direction) => {
    let children = this.getFlatInstanceArray();
    const activeKey = this.props.store.getState().activeKey[getEventKey(this.props)];
    const len = children.length;
    if (!len) {
      return null;
    }
    if (direction < 0) {
      children = children.concat().reverse();
    }
    // find current activeIndex
    let activeIndex = -1;
    children.every((c, ci) => {
      if (c && c.props.eventKey === activeKey) {
        activeIndex = ci;
        return false;
      }
      return true;
    });
    if (
      !this.props.defaultActiveFirst && activeIndex !== -1
      &&
      allDisabled(children.slice(activeIndex, len - 1))
    ) {
      return undefined;
    }
    const start = (activeIndex + 1) % len;
    let i = start;

    do {
      const child = children[i];
      if (!child || child.props.disabled) {
        i = (i + 1) % len;
      } else {
        return child;
      }
    } while (i !== start);

    return null;
  };

  renderCommonMenuItem = (child, i, extraProps) => {
    const state = this.props.store.getState();
    const props = this.props;
    const key = getKeyFromChildrenIndex(child, props.eventKey, i);
    const childProps = child.props;
    const isActive = key === state.activeKey;
    const newChildProps = {
      mode: childProps.mode || props.mode,
      level: props.level,
      inlineIndent: props.inlineIndent,
      renderMenuItem: this.renderMenuItem,
      rootPrefixCls: props.prefixCls,
      index: i,
      parentMenu: props.parentMenu,
      // customized ref function, need to be invoked manually in child's componentDidMount
      manualRef: childProps.disabled ? undefined : createChainedFunction(child.ref, saveRef.bind(this)),
      eventKey: key,
      active: !childProps.disabled && isActive,
      multiple: props.multiple,
      rippleDisabled: props.rippleDisabled,
      onClick: (e) => {
        (childProps.onClick || noop)(e);
        this.onClick(e);
      },
      onItemHover: this.onItemHover,
      openTransitionName: this.getOpenTransitionName(),
      openAnimation: props.openAnimation,
      subMenuOpenDelay: props.subMenuOpenDelay,
      subMenuCloseDelay: props.subMenuCloseDelay,
      forceSubMenuRender: props.forceSubMenuRender,
      onOpenChange: this.onOpenChange,
      onDeselect: this.onDeselect,
      onSelect: this.onSelect,
      builtinPlacements: props.builtinPlacements,
      itemIcon: childProps.itemIcon || this.props.itemIcon,
      expandIcon: childProps.expandIcon || this.props.expandIcon,
      ...extraProps,
    };
    if (props.mode === 'inline') {
      newChildProps.triggerSubMenuAction = 'click';
    }
    return cloneElement(child, newChildProps);
  };

  renderMenuItem = (c, i, subMenuKey) => {
    /* istanbul ignore if */
    if (!c) {
      return null;
    }
    const props = this.props;
    const extraProps = {
      openKeys: props.openKeys,
      selectedKeys: props.selectedKeys,
      triggerSubMenuAction: props.triggerSubMenuAction,
      subMenuKey,
    };
    return this.renderCommonMenuItem(c, i, extraProps);
  };

  render() {
    const { ...props } = this.props;

    this.instanceArray = [];
    const className = classNames(
      props.prefixCls,
      props.className,
      `${props.prefixCls}-${props.mode}`,
    );
    const haveRendered = this.haveRendered;
    this.haveRendered = true;
    this.haveOpened = this.haveOpened || !props.hidden || props.forceSubMenuRender;
    if (!this.haveOpened) {
      return null;
    }
    const domProps = {
      className,
      // role could be 'select' and by default set to menu
      role: props.role || 'menu',
    };
    if (props.id) {
      domProps.id = props.id;
    }
    if (props.focusable) {
      domProps.tabIndex = '0';
      domProps.onKeyDown = this.onKeyDown;
    }
    const { prefixCls, eventKey, hidden, level, mode, overflowedIndicator, theme } = props;
    menuAllProps.forEach(key => delete props[key]);

    const transitionAppear = !(!haveRendered && !props.hidden && props.mode === 'inline');

    props.className += ` ${props.prefixCls}-sub`;
    delete props.onClick;
    const animProps = {};
    if (props.openTransitionName) {
      animProps.transitionName = props.openTransitionName;
    } else if (typeof props.openAnimation === 'object') {
      animProps.animation = { ...props.openAnimation };
      if (!transitionAppear) {
        delete animProps.animation.appear;
      }
    }
    return (
      /* eslint-disable */
      <DOMWrap
        {...props}
        prefixCls={prefixCls}
        mode={mode}
        tag="ul"
        level={level}
        theme={theme}
        hiddenClassName={`${prefixCls}-hidden`}
        hidden={hidden}
        overflowedIndicator={overflowedIndicator}
        {...domProps}
      >
        {Children.map(
          props.children,
          (c, i) => this.renderMenuItem(c, i, eventKey || '0-menu-'),
        )}
      </DOMWrap>
      /*eslint-enable */
    );
  }
}

const connected = connect()(SubPopupMenu);

export default connected;
