import React, { cloneElement, Component } from 'react';
import { findDOMNode } from 'react-dom';
import scrollIntoView from 'dom-scroll-into-view';
import raf from 'raf';
import toArray from '../util/Children/toArray';
import Menu from '../menu';
import { getSelectKeys, preventDefaultEvent, saveRef } from './util';
import FilterInput from './FilterInput';
import LocaleReceiver from '../../locale-provider/LocaleReceiver';
import { getRuntimeLocale } from '../../locale-provider/utils';

export default class DropdownMenu extends Component {
  static defaultProps = {
    footer: null,
  };

  constructor(props) {
    super(props);
    this.lastInputValue = props.inputValue;
    this.saveMenuRef = saveRef(this, 'menuRef');
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

    if (itemComponent) {
      raf(() => {
        if (itemComponent) {
          const { props } = this;
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
      });
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
      dropdownMenuRippleDisabled,
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
      } else {
        this.firstActiveItem = null;
      }

      // clear activeKey when inputValue change
      const lastValue = value && value[value.length - 1];
      if (inputValue !== this.lastInputValue && (!lastValue || lastValue !== backfillValue)) {
        activeKeyProps.activeKey = '';
      }

      return (
        <Menu
          ref={this.saveMenuRef}
          style={this.props.dropdownMenuStyle}
          defaultActiveFirst={defaultActiveFirstOption}
          rippleDisabled={dropdownMenuRippleDisabled}
          role="listbox"
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
    const { prefixCls, filter, placeholder, onFilterChange, filterValue, onKeyDown } = this.props;
    const props = {
      filterValue,
      prefixCls,
      placeholder,
      onChange: onFilterChange,
      onKeyDown: onKeyDown,
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
    return checkAll ? (
      <div className={`${prefixCls}-select-all-none`}>
        <span name="check-all" onClick={checkAll}>{locale.selectAll}</span>
        <span name="check-none" onClick={checkAll}>{locale.selectNone}</span>
      </div>
    ) : null;
  };

  render() {
    const renderMenu = this.renderMenu();
    const filterInput = this.renderFilterInput();
    const { multiple, menuItems, checkAll, onMouseDown } = this.props;

    let selectOpt = null;
    if (checkAll && multiple && menuItems.length && menuItems[0].key !== 'NOT_FOUND') {
      selectOpt = (
        <LocaleReceiver
          componentName="Select"
          defaultLocale={getRuntimeLocale().Select || {}}
        >
          {this.renderCheckLabel}
        </LocaleReceiver>
      );
    }
    const menu = renderMenu ? (
      <div
        style={{ overflow: 'auto' }}
        onFocus={this.props.onPopupFocus}
        onMouseDown={preventDefaultEvent}
        onScroll={this.props.onPopupScroll}
      >
        {renderMenu}
      </div>
    ) : null;
    const footer = this.getFooter();
    return menu || filterInput || selectOpt || footer ? (
      <div onMouseDown={onMouseDown}>
        {filterInput}
        {selectOpt}
        {menu}
        {footer}
      </div>
    ) : null;
  }
}

DropdownMenu.displayName = 'DropdownMenu';
