import React, { cloneElement } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import toArray from '../util/Children/toArray';
import Menu from '../menu';
import scrollIntoView from 'dom-scroll-into-view';
import { getSelectKeys, preventDefaultEvent, saveRef } from './util';
import FilterInput from './FilterInput';
import LocaleReceiver from '../../locale-provider/LocaleReceiver';
import defaultLocale from '../../locale-provider/default';

export default class DropdownMenu extends React.Component {
  static propTypes = {
    defaultActiveFirstOption: PropTypes.bool,
    value: PropTypes.any,
    dropdownMenuStyle: PropTypes.object,
    multiple: PropTypes.bool,
    onPopupFocus: PropTypes.func,
    onPopupScroll: PropTypes.func,
    onMenuDeSelect: PropTypes.func,
    onMenuSelect: PropTypes.func,
    onMouseDown: PropTypes.func,
    prefixCls: PropTypes.string,
    menuItems: PropTypes.any,
    inputValue: PropTypes.string,
    visible: PropTypes.bool,
    filter: PropTypes.bool,
    checkAll: PropTypes.func,
    footer: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.string,
    ]),
  };

  static defaultProps = {
    footer: null,
  };

  componentWillMount() {
    this.lastInputValue = this.props.inputValue;
  }

  componentDidMount() {
    this.scrollActiveItemToView();
    this.lastVisible = this.props.visible;
  }

  shouldComponentUpdate(nextProps) {
    if (!nextProps.visible) {
      this.lastVisible = false;
    }
    // freeze when hide
    return nextProps.visible;
  }

  componentDidUpdate(prevProps) {
    const props = this.props;
    if (!prevProps.visible && props.visible) {
      this.scrollActiveItemToView();
    }
    this.lastVisible = props.visible;
    this.lastInputValue = props.inputValue;
  }

  scrollActiveItemToView = () => {
    // scroll into view
    const itemComponent = findDOMNode(this.firstActiveItem);
    const props = this.props;

    if (itemComponent) {
      const scrollIntoViewOpts = {
        onlyScrollIfNeeded: true,
      };
      if (
        (!props.value || props.value.length === 0) &&
        props.firstActiveValue
      ) {
        scrollIntoViewOpts.alignWithTop = true;
      }

      scrollIntoView(
        itemComponent,
        findDOMNode(this.menuRef),
        scrollIntoViewOpts,
      );
    }
  };

  renderMenu() {
    const props = this.props;
    const {
      menuItems,
      value,
      defaultActiveFirstOption,
      prefixCls,
      multiple,
      onMenuSelect,
      inputValue,
      firstActiveValue,
      backfillValue,
    } = props;

    if (menuItems && menuItems.length) {
      const menuProps = {};
      if (multiple) {
        menuProps.onDeselect = props.onMenuDeselect;
        menuProps.onSelect = onMenuSelect;
      } else {
        menuProps.onClick = onMenuSelect;
      }

      const selectedKeys = getSelectKeys(menuItems, value);
      const activeKeyProps = {};

      let clonedMenuItems = menuItems;
      if (selectedKeys.length || firstActiveValue) {
        if (props.visible && !this.lastVisible) {
          activeKeyProps.activeKey = selectedKeys[0] || firstActiveValue;
        }
        let foundFirst = false;
        // set firstActiveItem via cloning menus
        // for scroll into view
        const clone = item => {
          if (
            (!foundFirst && selectedKeys.indexOf(item.key) !== -1) ||
            (!foundFirst &&
              !selectedKeys.length &&
              firstActiveValue.indexOf(item.key) !== -1)
          ) {
            foundFirst = true;
            return cloneElement(item, {
              ref: ref => {
                this.firstActiveItem = ref;
              },
            });
          }
          return item;
        };

        clonedMenuItems = menuItems.map(item => {
          if (item.type.isMenuItemGroup) {
            const children = toArray(item.props.children).map(clone);
            return cloneElement(item, {}, children);
          }
          return clone(item);
        });
      }

      // clear activeKey when inputValue change
      const lastValue = value && value[value.length - 1];
      if (inputValue !== this.lastInputValue && (!lastValue || lastValue !== backfillValue)) {
        activeKeyProps.activeKey = '';
      }

      return (
        <Menu
          ref={saveRef(this, 'menuRef')}
          style={this.props.dropdownMenuStyle}
          defaultActiveFirst={defaultActiveFirstOption}
          {...activeKeyProps}
          multiple={multiple}
          {...menuProps}
          selectedKeys={selectedKeys}
          prefixCls={`${prefixCls}-menu`}
        >
          {clonedMenuItems}
        </Menu>
      );
    }
    return null;
  }

  renderFilterInput() {
    const { prefixCls, filter, placeholder, onFilterChange , filterValue} = this.props;
    const props = {
      filterValue,
      prefixCls,
      placeholder,
      onChange: onFilterChange,
      underline: false,
    };
    return filter ? <FilterInput {...props} ref={saveRef(this, 'filterRef')} /> : null;
  }

  getFooter() {
    const { prefixCls, footer } = this.props;
    return footer ? (
      <div className={`${prefixCls}-footer`} onMouseDown={preventDefaultEvent}>
        {footer}
      </div>) : null;
  }

  renderCheckLabel = (locale) => {
    const { prefixCls, checkAll } = this.props;
    return (
      <div className={`${prefixCls}-select-all-none`}>
        <span name="check-all" onClick={checkAll}>{locale.selectAll}</span>
        <span name="check-none" onClick={checkAll}>{locale.selectNone}</span>
      </div>
    );
  }

  render() {
    const renderMenu = this.renderMenu();
    const filterInput = this.renderFilterInput();
    const { multiple, menuItems, checkAll, onMouseDown } = this.props;

    let selectOpt = null;
    if (checkAll && multiple && menuItems.length && menuItems[0].key !== 'NOT_FOUND') {
      selectOpt = (
        <LocaleReceiver
          componentName="Select"
          defaultLocale={defaultLocale.Select}
        >
          {this.renderCheckLabel}
        </LocaleReceiver>
      );
    }
    return (
      <div onMouseDown={onMouseDown}>
        {filterInput}
        {selectOpt}
        <div
          style={{ overflow: 'auto' }}
          onScroll={this.props.onPopupScroll}
          onFocus={this.props.onPopupFocus}
        >
          {renderMenu}
        </div>
        {this.getFooter()}
      </div>
    );
  }
}

DropdownMenu.displayName = 'DropdownMenu';
