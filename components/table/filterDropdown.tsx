import React, { cloneElement, Component, ReactElement, SyntheticEvent } from 'react';
import { findDOMNode } from 'react-dom';
import closest from 'dom-closest';
import classNames from 'classnames';
import Dropdown from '../dropdown';
import Icon from '../icon';
import Radio from '../radio';
import FilterDropdownMenuWrapper from './FilterDropdownMenuWrapper';
import { ColumnFilterItem, ColumnProps, FilterMenuProps, FilterMenuState } from './interface';
import Menu, { Item as MenuItem, SubMenu } from '../rc-components/menu';

export default class FilterMenu<T> extends Component<FilterMenuProps<T>, FilterMenuState> {
  static defaultProps = {
    handleFilter() {/* noop */},
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
    if ('selectedKeys' in nextProps) {
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
    if (selectedKeys !== propSelectedKeys) {
      confirmFilter(column, selectedKeys);
    }
  }

  renderMenuItem(item: ColumnFilterItem) {
    const { column } = this.props;
    const { selectedKeys } = this.state;
    const multiple = 'filterMultiple' in column ? column.filterMultiple : false;
    const input = multiple ? null : (
      <Radio checked={selectedKeys.indexOf(item.value.toString()) >= 0} />
    );

    return (
      <MenuItem key={item.value}>
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
        const { dropdownPrefixCls } = this.props;
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
    if (info.keyPath.length <= 1) {
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
    const filterIcon = column.filterIcon as any;
    const dropdownSelectedClass = selectedKeys.length > 0 ? `${prefixCls}-selected` : '';

    return filterIcon ? (
      cloneElement(filterIcon as any, {
        title: locale.filterTitle,
        className: classNames(filterIcon.className, {
          [`${prefixCls}-icon`]: true,
        }),
      })
    ) : (
      <Icon title={locale.filterTitle} type="filter_list" className={dropdownSelectedClass} />
    );
  };

  render() {
    const { column, locale, prefixCls, dropdownPrefixCls, getPopupContainer } = this.props;
    const { visible, selectedKeys } = this.state;
    // default multiple selection in filter dropdown
    const multiple = 'filterMultiple' in column ? column.filterMultiple : false;
    const dropdownMenuClass = classNames({
      [`${dropdownPrefixCls}-menu-without-submenu`]: !this.hasSubMenu(),
    });
    const menus = column.filterDropdown ? (
      <FilterDropdownMenuWrapper onClick={this.handleFilterDropdownMenuClick}>
        {column.filterDropdown}
      </FilterDropdownMenuWrapper>
    ) : (
      <FilterDropdownMenuWrapper
        className={`${prefixCls}-dropdown`}
        onClick={this.handleFilterDropdownMenuClick}
      >
        <Menu
          multiple={multiple}
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
