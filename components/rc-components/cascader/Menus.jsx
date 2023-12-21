import React, { Component } from 'react';
import arrayTreeFilter from 'array-tree-filter';
import { findDOMNode } from 'react-dom';
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
    selectedValues: [],
    expandTrigger: 'click',
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

  get expandIcon() {
    const { expandIcon } = this.props;
    if (expandIcon) {
      return expandIcon;
    }
    return <Icon type="navigate_next" />;
  }

  getFieldName(name) {
    const { fieldNames, defaultFieldNames } = this.props;
    // 防止只设置单个属性的名字
    return fieldNames[name] || defaultFieldNames[name];
  }
  getOption(option, menuIndex) {
    const { prefixCls, expandTrigger, selectedValues } = this.props;
    const { expandIcon } = this;
    const onSelect = this.props.onSelect.bind(this, option, menuIndex,false);
    let expandProps = {
      onClick: () => {
        return onSelect('click');
      },
      onDoubleClick: () => {
        return onSelect('dblclick');
      },
    };
    let menuItemCls = `${prefixCls}-menu-item`;
    let expandIconNode = null;
    const childrenField = this.getFieldName('children');
    const labelField = this.getFieldName('label');
    const valueField = this.getFieldName('value');
    const hasChildren = option[childrenField] && option[childrenField].length > 0;
    if (hasChildren || option.isLeaf === false) {
      menuItemCls += ` ${prefixCls}-menu-item-expand`;
      expandIconNode = (
        <span className={`${prefixCls}-menu-item-expand-icon`}>
          {expandIcon}
        </span>
      );
    }
    if (selectedValues.findIndex((item) => item === option.value) > -1) {
      menuItemCls += ` ${prefixCls}-menu-item-selected`;
    }
    if (expandTrigger === 'hover' && (hasChildren || option.isLeaf === false)) {
      expandProps = {
        onMouseEnter: this.delayOnSelect.bind(this, onSelect),
        onMouseLeave: this.delayOnSelect.bind(this),
        onClick: () => {
          return onSelect('click');
        },
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
    } else if (typeof option[labelField] === 'string') {
      title = option[labelField];
    }
    return (
      <li
        key={option.key || option[valueField]}
        className={menuItemCls}
        title={title}
        {...expandProps}
      >
        {option[labelField]}
        {expandIconNode}
      </li>
    );
  }

  getActiveOptions(values) {
    const activeValue = values || this.props.activeValue;
    const options = this.props.options;
    const childrenField = this.getFieldName('children');
    const valueField = this.getFieldName('value');
    return arrayTreeFilter(options,
      (o, level) => o[valueField] === activeValue[level],
      { childrenKeyName: childrenField });
  }

  getShowOptions() {
    const { options } = this.props;
    const childrenField = this.getFieldName('children');
    const result = this.getActiveOptions()
      .map(activeOption => activeOption[childrenField])
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
        onSelect('hover',args);
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
    return activeValue[menuIndex] === option[this.getFieldName('value')];
  }

  saveMenuItem = (index) => (node) => {
    this.menuItems[index] = node;
  };

  render() {
    const { prefixCls, dropdownMenuColumnStyle } = this.props;
    return (
      <div className={`${prefixCls}-mode-multiple`}>
        {this.getShowOptions().map((options, menuIndex) =>
          <ul className={`${prefixCls}-menu`} key={menuIndex} style={dropdownMenuColumnStyle}>
            {options.map(option => this.getOption(option, menuIndex))}
          </ul>,
        )}
      </div>
    );
  }
}
