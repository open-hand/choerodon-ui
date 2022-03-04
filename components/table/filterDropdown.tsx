import React, { cloneElement, Component, ReactElement, SyntheticEvent } from 'react';
import { findDOMNode } from 'react-dom';
import closest from 'dom-closest';
import classNames from 'classnames';
import shallowequal from 'shallowequal';
import Dropdown from '../dropdown';
import Icon from '../icon';
import Checkbox from '../checkbox';
import Radio from '../radio';
import FilterDropdownMenuWrapper from './FilterDropdownMenuWrapper';
import { ColumnFilterItem, ColumnProps, FilterMenuProps, FilterMenuState } from './interface';
import Menu, { Item as MenuItem, SubMenu } from '../rc-components/menu';

export default class FilterMenu<T> extends Component<FilterMenuProps<T>, FilterMenuState> {
  static defaultProps = {
    handleFilter() {/* noop */
    },
    column: {},
  };

  neverShown: boolean;

  constructor(props: FilterMenuProps<T>) {
    super(props);

    const visible =
      'filterDropdownVisible' in props.column ? props.column.filterDropdownVisible : false;

    this.state = {
      selectedKeys: props.selectedKeys,
      keyPathOfSelectedItem: {}, // 记录所有有选中子菜单的祖先菜单
      visible,
    };
  }

  componentDidMount() {
    const { column } = this.props;
    this.setNeverShown(column);
  }

  componentWillReceiveProps(nextProps: FilterMenuProps<T>) {
    const { column } = nextProps;
    this.setNeverShown(column);
    const newState = {} as {
      selectedKeys: string[];
      visible: boolean;
    };
    const { selectedKeys } = this.props;
    if ('selectedKeys' in nextProps && !shallowequal(selectedKeys, nextProps.selectedKeys)) {
      newState.selectedKeys = nextProps.selectedKeys;
    }
    if ('filterDropdownVisible' in column) {
      newState.visible = column.filterDropdownVisible as boolean;
    }
    if (Object.keys(newState).length > 0) {
      this.setState(newState);
    }
  }

  setNeverShown = (column: ColumnProps<T>) => {
    const rootNode = findDOMNode(this);
    const { prefixCls } = this.props;
    const filterBelongToScrollBody = !!closest(rootNode, `${prefixCls}-scroll`);
    if (filterBelongToScrollBody) {
      // When fixed column have filters, there will be two dropdown menus
      // Filter dropdown menu inside scroll body should never be shown

      this.neverShown = !!column.fixed;
    }
  };

  setSelectedKeys = ({ selectedKeys }: { selectedKeys: string[] }) => {
    this.setState({ selectedKeys });
  };

  setVisible(visible: boolean) {
    const { column } = this.props;
    if (!('filterDropdownVisible' in column)) {
      this.setState({ visible });
    }
    if (column.onFilterDropdownVisibleChange) {
      column.onFilterDropdownVisibleChange(visible);
    }
  }

  handleClearFilters = () => {
    this.setState(
      {
        selectedKeys: [],
      },
      this.handleConfirm,
    );
  };

  handleConfirm = () => {
    this.setVisible(false);
    this.confirmFilter();
  };

  onVisibleChange = (visible: boolean) => {
    this.setVisible(visible);
    if (!visible) {
      this.confirmFilter();
    }
  };

  confirmFilter() {
    const { selectedKeys: propSelectedKeys, column, confirmFilter } = this.props;
    const { selectedKeys } = this.state;
    if (!shallowequal(selectedKeys, propSelectedKeys)) {
      confirmFilter(column, selectedKeys);
    }
  }

  renderMenuItem(item: ColumnFilterItem) {
    const { column, radioPrefixCls, checkboxPrefixCls } = this.props;
    const { selectedKeys } = this.state;
    const multiple = 'filterMultiple' in column ? column.filterMultiple : true;
    const input = multiple ? (
      <Checkbox prefixCls={checkboxPrefixCls} checked={selectedKeys.indexOf(item.value.toString()) >= 0} />
    ) : (
      <Radio prefixCls={radioPrefixCls} checked={selectedKeys.indexOf(item.value.toString()) >= 0} />
    );

    return (
      <MenuItem key={item.value} checkable={false}>
        {input}
        <span>{item.text}</span>
      </MenuItem>
    );
  }

  hasSubMenu() {
    const {
      column: { filters = [] },
    } = this.props;
    return filters.some(item => !!(item.children && item.children.length > 0));
  }

  renderMenus(items: ColumnFilterItem[]): ReactElement<any>[] {
    return items.map(item => {
      if (item.children && item.children.length > 0) {
        const { dropdownProps: { prefixCls: dropdownPrefixCls } } = this.props;
        const { keyPathOfSelectedItem } = this.state;
        const containSelected = Object.keys(keyPathOfSelectedItem).some(
          key => keyPathOfSelectedItem[key].indexOf(item.value) >= 0,
        );
        const subMenuCls = containSelected ? `${dropdownPrefixCls}-submenu-contain-selected` : '';
        return (
          <SubMenu title={item.text} className={subMenuCls} key={item.value.toString()}>
            {this.renderMenus(item.children)}
          </SubMenu>
        );
      }
      return this.renderMenuItem(item);
    });
  }

  handleFilterDropdownMenuClick = (e: SyntheticEvent<any>) => {
    e.preventDefault();
  };

  handleMenuItemClick = (info: { keyPath: string; key: string }) => {
    if (!info.keyPath || info.keyPath.length <= 1) {
      return;
    }
    const { keyPathOfSelectedItem, selectedKeys } = this.state;
    if (selectedKeys.indexOf(info.key) >= 0) {
      // deselect SubMenu child
      delete keyPathOfSelectedItem[info.key];
    } else {
      // select SubMenu child
      keyPathOfSelectedItem[info.key] = info.keyPath;
    }
    this.setState({ keyPathOfSelectedItem });
  };

  renderFilterIcon = () => {
    const { column, locale, prefixCls, selectedKeys } = this.props;
    const filterd = selectedKeys.length > 0;
    let filterIcon = column.filterIcon as any;
    if (typeof filterIcon === 'function') {
      filterIcon = filterIcon(filterd);
    }
    const dropdownSelectedClass = filterd ? `${prefixCls}-selected` : '';

    return filterIcon ? (
      cloneElement(filterIcon as any, {
        title: locale.filterTitle,
        className: classNames(`${prefixCls}-icon`, filterIcon.props.className),
      })
    ) : (
      <Icon title={locale.filterTitle} type="filter_list" className={dropdownSelectedClass} />
    );
  };

  render() {
    const { column, locale, prefixCls, dropdownProps, getPopupContainer, rippleDisabled } = this.props;
    const { visible, selectedKeys } = this.state;
    const dropdownPrefixCls = dropdownProps.prefixCls;
    // default multiple selection in filter dropdown
    const multiple = 'filterMultiple' in column ? column.filterMultiple : true;
    const dropdownMenuClass = classNames({
      [`${dropdownPrefixCls}-menu-without-submenu`]: !this.hasSubMenu(),
    });
    let { filterDropdown } = column;
    if (filterDropdown && typeof filterDropdown === 'function') {
      filterDropdown = filterDropdown({
        prefixCls: `${dropdownPrefixCls}-custom`,
        setSelectedKeys: ($selectedKeys: Array<any>) => this.setSelectedKeys({ selectedKeys: $selectedKeys }),
        selectedKeys,
        confirm: this.handleConfirm,
        clearFilters: this.handleClearFilters,
        filters: column.filters,
        getPopupContainer: (triggerNode: HTMLElement) => triggerNode.parentNode,
      });
    }
    const menus = filterDropdown ? (
      <FilterDropdownMenuWrapper onClick={this.handleFilterDropdownMenuClick}>
        {filterDropdown}
      </FilterDropdownMenuWrapper>
    ) : (
      <FilterDropdownMenuWrapper
        className={`${prefixCls}-dropdown`}
        onClick={this.handleFilterDropdownMenuClick}
      >
        <Menu
          multiple={multiple}
          rippleDisabled={rippleDisabled}
          onClick={this.handleMenuItemClick}
          prefixCls={`${dropdownPrefixCls}-menu`}
          className={dropdownMenuClass}
          onSelect={this.setSelectedKeys}
          onDeselect={this.setSelectedKeys}
          selectedKeys={selectedKeys}
          getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentNode}
        >
          {this.renderMenus(column.filters!)}
        </Menu>
        <div className={`${prefixCls}-dropdown-btns`}>
          <a className={`${prefixCls}-dropdown-link confirm`} onClick={this.handleConfirm}>
            {locale.filterConfirm}
          </a>
          <a className={`${prefixCls}-dropdown-link clear`} onClick={this.handleClearFilters}>
            {locale.filterReset}
          </a>
        </div>
      </FilterDropdownMenuWrapper>
    );

    return (
      <Dropdown
        {...dropdownProps}
        trigger={['click']}
        overlay={menus}
        visible={this.neverShown ? false : visible}
        onVisibleChange={this.onVisibleChange}
        getPopupContainer={getPopupContainer}
        forceRender
      >
        {this.renderFilterIcon()}
      </Dropdown>
    );
  }
}
