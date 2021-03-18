import React, { Children, cloneElement, Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { getConfig } from '../../configure';
import CollapsePanel from './Panel';
import openAnimationFactory from './openAnimationFactory';

function toArray(activeKey) {
  let currentActiveKey = activeKey;
  if (!Array.isArray(currentActiveKey)) {
    currentActiveKey = currentActiveKey ? [currentActiveKey] : [];
  }
  return currentActiveKey;
}

export default class Collapse extends Component {
  static propTypes = {
    children: PropTypes.any,
    prefixCls: PropTypes.string,
    activeKey: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    defaultActiveKey: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    openAnimation: PropTypes.object,
    onChange: PropTypes.func,
    accordion: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object,
    destroyInactivePanel: PropTypes.bool,
  };

  static defaultProps = {
    prefixCls: 'rc-collapse',
    onChange() {
    },
    accordion: false,
    destroyInactivePanel: false,
  };

  static Panel = CollapsePanel;

  constructor(props) {
    super(props);

    const { activeKey, defaultActiveKey } = this.props;
    let currentActiveKey = defaultActiveKey;
    if ('activeKey' in this.props) {
      currentActiveKey = activeKey;
    }

    this.state = {
      openAnimation: this.props.openAnimation || openAnimationFactory(this.props.prefixCls),
      activeKey: toArray(currentActiveKey),
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('activeKey' in nextProps) {
      this.setState({
        activeKey: toArray(nextProps.activeKey),
      });
    }
    if ('openAnimation' in nextProps) {
      this.setState({
        openAnimation: nextProps.openAnimation,
      });
    }
  }

  onClickItem(key) {
    let activeKey = this.state.activeKey;
    if (this.props.accordion) {
      activeKey = activeKey[0] === key ? [] : [key];
    } else {
      activeKey = [...activeKey];
      const index = activeKey.indexOf(key);
      const isActive = index > -1;
      if (isActive) {
        // remove active state
        activeKey.splice(index, 1);
      } else {
        activeKey.push(key);
      }
    }
    this.setActiveKey(activeKey);
  }

  getItems() {
    const activeKey = this.state.activeKey;
    const { prefixCls, accordion, destroyInactivePanel, expandIcon } = this.props;
    const newChildren = [];

    Children.forEach(this.props.children, (child, index) => {
      if (!child) return;
      // If there is no key provide, use the panel order as default key
      const key = child.key || String(index);
      const { header, headerClass, disabled } = child.props;
      let isActive = false;
      if (accordion) {
        isActive = activeKey[0] === key;
      } else {
        isActive = activeKey.indexOf(key) > -1;
      }

      const trigger = this.props.trigger || getConfig('collapseTrigger');

      const props = {
        key,
        header,
        headerClass,
        isActive,
        prefixCls,
        destroyInactivePanel,
        openAnimation: this.state.openAnimation,
        children: child.props.children,
        onItemClick: disabled ? null : () => this.onClickItem(key),
        expandIcon,
        trigger,
      };

      newChildren.push(cloneElement(child, props));
    });

    return newChildren;
  }

  setActiveKey(activeKey) {
    if (!('activeKey' in this.props)) {
      this.setState({ activeKey });
    }
    this.props.onChange(this.props.accordion ? activeKey[0] : activeKey);
  }

  render() {
    const { prefixCls, className, style, accordion } = this.props;
    const collapseClassName = classNames({
      [prefixCls]: true,
      [className]: !!className,
    });
    return (
      <div className={collapseClassName} style={style} role={accordion ? 'tablist' : null}>
        {this.getItems()}
      </div>
    );
  }
}
