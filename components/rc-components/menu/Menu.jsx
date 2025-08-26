import React, { Component } from 'react';
import { create, Provider } from 'mini-store';
import noop from 'lodash/noop';
import SubPopupMenu, { getActiveKey } from './SubPopupMenu';

export default class Menu extends Component {
  static displayName = 'Menu';

  static defaultProps = {
    prefixCls: 'rc-menu',
    className: '',
    mode: 'vertical',
    level: 1,
    inlineIndent: 24,
    visible: true,
    focusable: true,
    style: {},
    selectable: true,
    onClick: noop,
    onSelect: noop,
    onOpenChange: noop,
    onDeselect: noop,
    defaultSelectedKeys: [],
    defaultOpenKeys: [],
    subMenuOpenDelay: 0.1,
    subMenuCloseDelay: 0.1,
    triggerSubMenuAction: 'hover',
  };

  isRootMenu = true;

  constructor(props) {
    super(props);
    let selectedKeys = props.defaultSelectedKeys;
    let openKeys = props.defaultOpenKeys;
    if ('selectedKeys' in props) {
      selectedKeys = props.selectedKeys || [];
    }
    if ('openKeys' in props) {
      openKeys = props.openKeys || [];
    }

    this.store = create({
      selectedKeys,
      openKeys,
      activeKey: { '0-menu-': getActiveKey(props, props.activeKey) },
    });
  }

  updateMiniStore() {
    if ('selectedKeys' in this.props) {
      this.store.setState({
        selectedKeys: this.props.selectedKeys || [],
      });
    }
    if ('openKeys' in this.props) {
      this.store.setState({
        openKeys: this.props.openKeys || [],
      });
    }
    // 强制清除 activeKey
    if (this.props.forceClearActiveKey) {
      this.store.setState({
        activeKey: { '0-menu-': null },
      });
    }
  }

  componentDidMount() {
    this.updateMiniStore();
  }

  componentDidUpdate() {
    this.updateMiniStore();
  }

  onSelect = selectInfo => {
    const props = this.props;
    if (props.selectable) {
      // root menu
      let selectedKeys = this.store.getState().selectedKeys;
      const selectedKey = selectInfo.key;
      if (props.multiple) {
        selectedKeys = selectedKeys.concat([selectedKey]);
      } else {
        selectedKeys = [selectedKey];
      }
      if (!('selectedKeys' in props)) {
        this.store.setState({
          selectedKeys,
        });
      }
      props.onSelect({
        ...selectInfo,
        selectedKeys,
      });
    }
  };

  step(direction) {
    return this.innerMenu.getWrappedInstance().step(direction);
  }

  onClick = e => {
    this.props.onClick(e);
  };

  onKeyDown = (e, callback) => {
    return this.innerMenu.getWrappedInstance().onKeyDown(e, callback);
  };

  getFlatInstanceArray() {
    return this.innerMenu.getWrappedInstance().getFlatInstanceArray();
  }

  onOpenChange = event => {
    const props = this.props;
    const openKeys = this.store.getState().openKeys.concat();
    let changed = false;
    const processSingle = e => {
      let oneChanged = false;
      if (e.open) {
        oneChanged = openKeys.indexOf(e.key) === -1;
        if (oneChanged) {
          openKeys.push(e.key);
        }
      } else {
        const index = openKeys.indexOf(e.key);
        oneChanged = index !== -1;
        if (oneChanged) {
          openKeys.splice(index, 1);
        }
      }
      changed = changed || oneChanged;
    };
    if (Array.isArray(event)) {
      // batch change call
      event.forEach(processSingle);
    } else {
      processSingle(event);
    }
    if (changed) {
      if (!('openKeys' in this.props)) {
        this.store.setState({ openKeys });
      }
      props.onOpenChange(openKeys);
    }
  };

  onDeselect = selectInfo => {
    const props = this.props;
    if (props.selectable) {
      const selectedKeys = this.store.getState().selectedKeys.concat();
      const selectedKey = selectInfo.key;
      const index = selectedKeys.indexOf(selectedKey);
      if (index !== -1) {
        selectedKeys.splice(index, 1);
      }
      if (!('selectedKeys' in props)) {
        this.store.setState({
          selectedKeys,
        });
      }
      props.onDeselect({
        ...selectInfo,
        selectedKeys,
      });
    }
  };

  setInnerMenu = node => {
    this.innerMenu = node;
  };

  getStore() {
    const store = this.store || this.props.store;

    return store;
  }

  getEventKey() {
    return this.props.eventKey || '0-menu-';
  }

  getOpenTransitionName() {
    const props = this.props;
    let transitionName = props.openTransitionName;
    const animationName = props.openAnimation;
    if (!transitionName && typeof animationName === 'string') {
      transitionName = `${props.prefixCls}-open-${animationName}`;
    }
    return transitionName;
  }

  isInlineMode() {
    return this.props.mode === 'inline';
  }

  lastOpenSubMenu() {
    let lastOpen = [];
    const { openKeys } = this.store.getState();
    if (openKeys.length) {
      lastOpen = this.getFlatInstanceArray().filter(c => {
        return c && openKeys.indexOf(c.props.eventKey) !== -1;
      });
    }
    return lastOpen[0];
  }

  renderMenuItem(c, i, subIndex, subMenuKey) {
    if (!c) {
      return null;
    }
    const state = this.store.getState();
    const extraProps = {
      openKeys: state.openKeys,
      selectedKeys: state.selectedKeys,
      triggerSubMenuAction: this.props.triggerSubMenuAction,
      subMenuKey,
    };
    return this.renderCommonMenuItem(c, i, subIndex, extraProps);
  }

  render() {
    let props = { ...this.props };
    props.className += ` ${props.prefixCls}-root`;
    props = {
      ...props,
      onClick: this.onClick,
      onOpenChange: this.onOpenChange,
      onDeselect: this.onDeselect,
      onSelect: this.onSelect,
      openTransitionName: this.getOpenTransitionName(),
      parentMenu: this,
    };

    // delete props.openAnimation;
    // delete props.openTransitionName;
    return (
      <Provider store={this.store}>
        <SubPopupMenu {...props} ref={this.setInnerMenu}>
          {this.props.children}
        </SubPopupMenu>
      </Provider>
    );
  }
}
