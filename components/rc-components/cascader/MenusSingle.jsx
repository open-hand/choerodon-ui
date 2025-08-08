import React, { Component } from 'react';
import arrayTreeFilter from 'array-tree-filter';
import { findDOMNode } from 'react-dom';
import Locale from './locale/en_US';
import isFunction from 'lodash/isFunction';
import Icon from '../../icon';

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
    selectedValues: [],
    isTabSelected: false,
    locale: Locale,
    singleMenuStyle: { width: '3rem' },
    singleMenuItemStyle: { minWidth: '1rem' },
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

  getFieldName(name) {
    const { fieldNames, defaultFieldNames } = this.props;
    // 防止只设置单个属性的名字
    return fieldNames[name] || defaultFieldNames[name];
  }

  /**
   * render th li list
   * @param {*} option
   * @param {*} menuIndex
   */
  getOption(option, menuIndex) {
    const { prefixCls, expandTrigger, singleMenuItemStyle, selectedValues } = this.props;
    const onSelect = this.props.onSelect.bind(this, option, menuIndex, false);
    let expandProps = {
      onClick: () => {
        return onSelect('click');
      },
    };
    const childrenField = this.getFieldName('children');
    const labelField = this.getFieldName('label');
    const valueField = this.getFieldName('value');
    const hasChildren = option[childrenField] && option[childrenField].length > 0;
    let menuItemCls = `${prefixCls}-menu-item`;
    // TODO: add item style
    if (expandTrigger === 'hover' && hasChildren) {
      expandProps = {
        onMouseEnter: this.delayOnSelect.bind(this, onSelect),
        onMouseLeave: this.delayOnSelect.bind(this),
        onClick: () => {
          return onSelect('click');
        },
      };
    }
    if (selectedValues.findIndex((item) => item === option[valueField]) > -1) {
      menuItemCls += ` ${prefixCls}-menu-item-selected`;
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
    } else if (typeof option[labelField] === 'string') {
      title = option[labelField];
    }
    return (
      <li
        key={option.key || option[valueField]}
        className={menuItemCls}
        title={title}
        style={singleMenuItemStyle}
        {...expandProps}
      >
        {option[labelField]}
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
        onSelect('hover', args);
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
    const labelField = this.getFieldName('label');
    const valueField = this.getFieldName('value');
    let label = option[labelField];
    if (isFunction(singleMenuItemRender)) {
      label = singleMenuItemRender(option[labelField]);
    }
    return (
      <span
        key={option.key || option[valueField]}
        className={menuItemCls}
        {...expandProps}
      >
        {label}
        <Icon type="arrow_drop_down" />
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
    let tabItemRenderResult;
    if (showOptions && activeOptions && !isTabSelected && showOptions.length > activeOptions.length) {
      const pleaseRenderProps = {
        key: 'please_check',
        className: `${prefixCls}-menu-tab-item ${prefixCls}-menu-tab-please`,
        text: locale.pleaseSelect,
      };
      if (isFunction(singlePleaseRender)) {
        tabItemRenderResult = singlePleaseRender(pleaseRenderProps);
      } else {
        const pleaseItem = (
          <span {...pleaseRenderProps}>
              {pleaseRenderProps.text}
            <Icon type="arrow_drop_down" />
            </span>
        );
        tabItemRenderResult = tabItemRender.length > 0 ? [...tabItemRender, pleaseItem] : pleaseItem;
      }
    }
    if (isTabSelected) {
      showOptionsIndex = activeOptions.length - 1 < 0 ? 0 : activeOptions.length - 1;
    }

    return (
      <div className={`${prefixCls}-mode-single `}>
        <div className={`${prefixCls}-menu-tab`}>
          {tabItemRenderResult || tabItemRender}
        </div>
        <ul className={`${prefixCls}-menu ${prefixCls}-menu-single `} key={showOptionsIndex} style={dropdownMenuColumnStyleSingle}>
          {showOptions[showOptionsIndex].map(option => this.getOption(option, showOptionsIndex))}
        </ul>
      </div>
    );
  }
}
