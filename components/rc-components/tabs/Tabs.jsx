import React, { Children, cloneElement, Component } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import classnames from 'classnames';
import KeyCode from './KeyCode';
import TabPane from './TabPane';
import { generateKey, getDataAttr } from './utils';

function getDefaultActiveKey(props) {
  let activeKey;
  Children.forEach(props.children, (child, index) => {
    if (child && !activeKey && !child.props.disabled) {
      activeKey = generateKey(child.key, index);
    }
  });
  return activeKey;
}

function activeKeyIsValid(props, key) {
  const keys = Children.map(props.children, (child, index) => child && generateKey(child.key, index));
  return keys.indexOf(key) >= 0;
}

export default class Tabs extends Component {
  static propTypes = {
    destroyInactiveTabPane: PropTypes.bool,
    renderTabBar: PropTypes.func.isRequired,
    renderTabContent: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    children: PropTypes.any,
    prefixCls: PropTypes.string,
    className: PropTypes.string,
    tabBarPosition: PropTypes.string,
    style: PropTypes.object,
    activeKey: PropTypes.string,
    defaultActiveKey: PropTypes.string,
  };

  static defaultProps = {
    prefixCls: 'rc-tabs',
    destroyInactiveTabPane: false,
    onChange: noop,
    tabBarPosition: 'top',
    style: {},
  };

  static TabPane = TabPane;

  constructor(props) {
    super(props);

    let activeKey;
    if ('activeKey' in props) {
      activeKey = props.activeKey;
    } else if ('defaultActiveKey' in props) {
      activeKey = props.defaultActiveKey;
    } else {
      activeKey = getDefaultActiveKey(props);
    }

    this.state = {
      activeKey,
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('activeKey' in nextProps) {
      this.setState({
        activeKey: nextProps.activeKey,
      });
    } else if (!activeKeyIsValid(nextProps, this.state.activeKey)) {
      this.setState({
        activeKey: getDefaultActiveKey(nextProps),
      });
    }
  }

  onTabClick = (activeKey) => {
    if (this.tabBar.props.onTabClick) {
      this.tabBar.props.onTabClick(activeKey);
    }
    this.setActiveKey(activeKey);
  };

  onNavKeyDown = (e) => {
    const eventKeyCode = e.keyCode;
    if (eventKeyCode === KeyCode.RIGHT || eventKeyCode === KeyCode.DOWN) {
      e.preventDefault();
      const nextKey = this.getNextActiveKey(true);
      this.onTabClick(nextKey);
    } else if (eventKeyCode === KeyCode.LEFT || eventKeyCode === KeyCode.UP) {
      e.preventDefault();
      const previousKey = this.getNextActiveKey(false);
      this.onTabClick(previousKey);
    }
  };

  setActiveKey = (activeKey) => {
    if (this.state.activeKey !== activeKey) {
      if (!('activeKey' in this.props)) {
        this.setState({
          activeKey,
        });
      }
      this.props.onChange(activeKey);
    }
  };

  getNextActiveKey = (next) => {
    const activeKey = this.state.activeKey;
    const children = [];
    Children.forEach(this.props.children, (c) => {
      if (c && !c.props.disabled) {
        if (next) {
          children.push(c);
        } else {
          children.unshift(c);
        }
      }
    });
    const length = children.length;
    let ret = length && generateKey(children[0].key, 0);
    children.forEach((child, i) => {
      if (generateKey(child.key, i) === activeKey) {
        if (i === length - 1) {
          ret = generateKey(children[0].key, 0);
        } else {
          ret = generateKey(children[i + 1].key, i + 1);
        }
      }
    });
    return ret;
  };

  render() {
    const props = this.props;
    const {
      prefixCls,
      tabBarPosition, className,
      renderTabContent,
      renderTabBar,
      destroyInactiveTabPane,
      ...restProps,
    } = props;
    const cls = classnames({
      [prefixCls]: 1,
      [`${prefixCls}-${tabBarPosition}`]: 1,
      [className]: !!className,
    });

    this.tabBar = renderTabBar();
    const contents = [
      cloneElement(this.tabBar, {
        prefixCls,
        key: 'tabBar',
        onKeyDown: this.onNavKeyDown,
        tabBarPosition,
        onTabClick: this.onTabClick,
        panels: props.children,
        activeKey: this.state.activeKey,
      }),
      cloneElement(renderTabContent(), {
        prefixCls,
        tabBarPosition,
        activeKey: this.state.activeKey,
        destroyInactiveTabPane,
        children: props.children,
        onChange: this.setActiveKey,
        key: 'tabContent',
      }),
    ];
    if (tabBarPosition === 'bottom') {
      contents.reverse();
    }
    return (
      <div
        className={cls}
        style={props.style}
        {...getDataAttr(restProps)}
      >
        {contents}
      </div>
    );
  }
}
