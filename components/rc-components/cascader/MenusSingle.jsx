import React, { Component } from 'react';
import PropTypes from 'prop-types';
import arrayTreeFilter from 'array-tree-filter';
import { findDOMNode } from 'react-dom';
import Locale from './locale/en_US';
import isFunction from 'lodash/isFunction';

export default class Menus extends Component {
  static defaultProps = {
    options: [],
    value: [],
    activeValue: [],
    onSelect() {
    },
    prefixCls: 'rc-cascader-menus',
    visible: false,
    expandTrigger: 'click',
    isTabSelected: false,
    locale: Locale,
    singleMenuStyle: { width: '3rem' },
    singleMenuItemStyle: { minWidth: '1rem' },
  };

  static propTypes = {
    // 选择的值
    value: PropTypes.array,
    // 当前激活的值
    activeValue: PropTypes.array,
    // 可选内容
    options: PropTypes.array.isRequired,
    // 注入样式开头
    prefixCls: PropTypes.string,
    // 触发展开事件
    expandTrigger: PropTypes.string,
    // 被选择后触发
    onSelect: PropTypes.func,
    // 是否可见
    visible: PropTypes.bool,
    // 下拉列表的样式配置
    dropdownMenuColumnStyle: PropTypes.object,
    // 标识是由于tab select 触发的事件
    isTabSelected: PropTypes.bool,
    locale: PropTypes.object,
    singleMenuStyle: PropTypes.object,
    singleMenuItemStyle: PropTypes.object,
    singlePleaseRender: PropTypes.func,
    singleMenuItemRender: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.menuItems = {};
  }

  componentDidMount() {
    this.scrollActiveItemToView();
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.visible && this.props.visible) {
      this.scrollActiveItemToView();
    }
  }

  /**
   * render th li list
   * @param {*} option
   * @param {*} menuIndex
   */
  getOption(option, menuIndex) {
    const { prefixCls, expandTrigger, singleMenuItemStyle } = this.props;
    const onSelect = this.props.onSelect.bind(this, option, menuIndex, false);
    let expandProps = {
      onClick: onSelect,
    };
    let menuItemCls = `${prefixCls}-menu-item`;
    // TODO: add item style
    if (expandTrigger === 'hover' && hasChildren) {
      expandProps = {
        onMouseEnter: this.delayOnSelect.bind(this, onSelect),
        onMouseLeave: this.delayOnSelect.bind(this),
        onClick: onSelect,
      };
    }
    if (this.isActiveOption(option, menuIndex)) {
      menuItemCls += ` ${prefixCls}-menu-item-active`;
      expandProps.ref = this.saveMenuItem(menuIndex);
    }
    if (option.disabled) {
      menuItemCls += ` ${prefixCls}-menu-item-disabled`;
    }
    if (option.loading) {
      menuItemCls += ` ${prefixCls}-menu-item-loading`;
    }
    let title = '';
    if (option.title) {
      title = option.title;
    } else if (typeof option.label === 'string') {
      title = option.label;
    }
    return (
      <li
        key={option.key || option.value}
        className={menuItemCls}
        title={title}
        style={singleMenuItemStyle}
        {...expandProps}
      >
        {option.label}
      </li>
    );
  }

  /**
   *  be active value is a array of items
   * @param string[] values
   */
  getActiveOptions(values) {
    const activeValue = values || this.props.activeValue;
    const options = this.props.options;
    return arrayTreeFilter(options, (o, level) => o.value === activeValue[level]);
  }

  getShowOptions() {
    const { options } = this.props;
    const result = this.getActiveOptions()
      .map(activeOption => activeOption.children)
      .filter(activeOption => !!activeOption);
    result.unshift(options);
    return result;
  }

  delayOnSelect(onSelect, ...args) {
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }
    if (typeof onSelect === 'function') {
      this.delayTimer = setTimeout(() => {
        onSelect(args);
        this.delayTimer = null;
      }, 150);
    }
  }

  scrollActiveItemToView() {
    // scroll into view
    const optionsLength = this.getShowOptions().length;
    for (let i = 0; i < optionsLength; i++) {
      const itemComponent = this.menuItems[i];
      if (itemComponent) {
        const target = findDOMNode(itemComponent);
        target.parentNode.scrollTop = target.offsetTop;
      }
    }
  }

  isActiveOption(option, menuIndex) {
    const { activeValue = [] } = this.props;
    return activeValue[menuIndex] === option.value;
  }

  saveMenuItem = (index) => (node) => {
    this.menuItems[index] = node;
  };

  /**
   * render th li list
   * @param {*} option
   * @param {*} menuIndex
   */
  getTabItem(option, menuIndex) {
    const { prefixCls, singleMenuItemRender } = this.props;
    const onSelect = this.props.onSelect.bind(this, option, menuIndex, true);
    let expandProps = {
      onClick: onSelect,
    };
    let menuItemCls = `${prefixCls}-menu-tab-item`;

    let title = '';
    if (option.title) {
      title = option.title;
    } else if (typeof option.label === 'string') {
      title = option.label;
    }
    let label = option.label;
    if (isFunction(singleMenuItemRender)) {
      label = singleMenuItemItem(option.label);
    }
    return (
      <span
        key={option.key || option.value}
        className={menuItemCls}
        {...expandProps}
      >
        {label}
      </span>
    );
  }

  render() {
    const { prefixCls, dropdownMenuColumnStyle, isTabSelected, locale, singleMenuStyle, singlePleaseRender } = this.props;
    const showOptions = this.getShowOptions();
    let showOptionsIndex = showOptions.length - 1;
    const activeOptions = this.getActiveOptions();
    const dropdownMenuColumnStyleSingle = { ...dropdownMenuColumnStyle, ...singleMenuStyle };
    const tabItemRender = activeOptions.map((item, indexItem) => (this.getTabItem(item, indexItem)));
    if (showOptions && activeOptions && !isTabSelected && showOptions.length > activeOptions.length) {
      const pleaseRenderProps = {
        key: 'please_check',
        className: `${prefixCls}-menu-tab-item ${prefixCls}-menu-tab-please`,
        text: locale.pleaseSelect,
      };
      if (isFunction(singlePleaseRender)) {
        tabItemRender.push(singlePleaseRender(pleaseRenderProps));
      } else {
        tabItemRender.push(<span {...pleaseRenderProps}>{pleaseRenderProps.text}</span>);
      }

    }
    if (isTabSelected) {
      showOptionsIndex = activeOptions.length - 1;
    }

    return (
      <div className={`${prefixCls}-mode-single `}>
        <div className={`${prefixCls}-menu-tab`}>
          {tabItemRender}
        </div>
        <ul className={`${prefixCls}-menu ${prefixCls}-menu-single `} key={showOptionsIndex} style={dropdownMenuColumnStyleSingle}>
          {showOptions[showOptionsIndex].map(option => this.getOption(option, showOptionsIndex))}
        </ul>
      </div>
    );
  }
}
