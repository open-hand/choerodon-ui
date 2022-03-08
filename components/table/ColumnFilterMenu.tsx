import React, { Component } from 'react';
import { Size } from '../_util/enum';

import { ColumnFilterMenuLocale, ColumnFilterMenuProps, ColumnFilterMenuState, ColumnProps, CustomColumn } from './interface';

import Menu from '../menu';
import Dropdown from '../dropdown';
import Icon from '../icon';
import Button from '../button';
import message from '../message';

import FilterDropdownMenuWrapper from './FilterDropdownMenuWrapper';
import ColumnFilterMenuItem from './ColumnFilterMenuItem';
import { getColumnKey } from './util';

function getParentNode(triggerNode: HTMLElement): HTMLElement {
  return triggerNode.parentNode as HTMLElement;
}

export default class ColumnFilterMenu<T> extends Component<ColumnFilterMenuProps<T>, ColumnFilterMenuState> {

  static getDerivedStateFromProps(nextProps: ColumnFilterMenuProps<any>, prevState: ColumnFilterMenuState) {
    const { customColumns } = nextProps;
    const { prevCustomColumns } = prevState;
    if (customColumns && customColumns !== prevCustomColumns) {
      return {
        customColumns,
        prevCustomColumns: customColumns,
      };
    }
    return null;
  }

  items: { [key: string]: any } = {}; // 存储编辑的 column 的组件的 ref

  constructor(props: ColumnFilterMenuProps<T>) {
    super(props);
    this.state = {
      editing: false,
      customColumns: props.customColumns || [],
      prevCustomColumns: props.customColumns || [],
    };
  }

  render() {
    const { locale, prefixCls, dropdownProps, getPopupContainer } = this.props;
    const dropdownPrefixCls = dropdownProps.prefixCls;
    const { editing } = this.state;
    const editTitle = this.renderEditTitle();
    const editContent = this.renderEditContent(); // this.renderMenus(columns)
    const menus = (
      <FilterDropdownMenuWrapper className={`${prefixCls}-dropdown custom-column-dropdown`}>
        <div className={`${dropdownPrefixCls}-menu-item`}>
          {editTitle}
        </div>
        <Menu
          multiple
          prefixCls={`${dropdownPrefixCls}-menu`}
          getPopupContainer={getParentNode}
        >
          {editContent}
        </Menu>
        <div className={`${prefixCls}-dropdown-btns`}>
          <Button size={Size.small} className={`${prefixCls}-dropdown-link confirm`} onClick={this.handleConfirmBtnClick}>
            {locale.filterConfirm}
          </Button>
        </div>
      </FilterDropdownMenuWrapper>
    );

    return (
      <Dropdown
        {...dropdownProps}
        trigger={['click']}
        overlay={menus}
        visible={editing}
        onVisibleChange={this.handleEditChange}
        getPopupContainer={getPopupContainer}
        forceRender
      >
        {this.renderFilterIcon()}
      </Dropdown>
    );
  }

  handleEditChange = (editing: boolean) => {
    const { prevCustomColumns } = this.state;
    this.setState({
      editing,
      customColumns: prevCustomColumns, // 重新设置 编辑内容
    });
  };

  // 渲染标题旁边的 icon
  renderFilterIcon = () => {
    const { locale } = this.props;
    return <Icon title={locale.filterTitle} className="custom-bars" type="format_list_bulleted" />;
  };

  // 确认按钮点击
  handleConfirmBtnClick = () => {
    const { columns = [], confirmFilter, store } = this.props;
    const customColumnsGetPromise: Promise<CustomColumn>[] = [];
    columns
      .map((column, index) => getColumnKey(column, index))
      .forEach((key: string) => {
        const columnFilterMenuItem = this.items[key];
        if (columnFilterMenuItem) {
          customColumnsGetPromise.push(columnFilterMenuItem.getValidateCustomColumn());
        }
      });
    Promise.all(customColumnsGetPromise).then(
      ([...customColumns]) => {
        this.setState({
          customColumns,
          editing: false,
        });
        store.setState({ customColumns });
        confirmFilter(customColumns);
      },
      (err) => {
        message.error(err && err.message);
      },
    );
  };

  renderEditItem(column: ColumnProps<T>, index: number) {
    const { checkboxPrefixCls, inputNumberProps } = this.props;
    const { customColumns } = this.state;
    const key = getColumnKey(column) as string;
    const customColumn = customColumns.find((fCustomColumn) => fCustomColumn.fieldKey === key);
    return (
      <Menu.Item
        key={key}
      >
        <ColumnFilterMenuItem
          inputNumberProps={inputNumberProps}
          checkboxPrefixCls={checkboxPrefixCls}
          customColumn={customColumn}
          column={column}
          index={index}
          ref={(item) => this.handleItemRef(key, item)}
        />
      </Menu.Item>
    );
  }

  // 渲染编辑的标题
  renderEditTitle() {
    const { filterBarLocale } = this.props;
    const { display, field, fixedLeft, orderSeq }: ColumnFilterMenuLocale = filterBarLocale || {};
    return (
      <div>
        <div className="dropdown-menu-text">{display}</div>
        <div className="dropdown-menu-text">{field}</div>
        <div className="dropdown-menu-text">{fixedLeft}</div>
        <div className="dropdown-menu-text">{orderSeq}</div>
      </div>
    );
  }

  // 渲染编辑区域内容
  renderEditContent() {
    const { columns = [] } = this.props;
    return columns.map((column, index) => {
      return this.renderEditItem(column, index);
    });
  }

  // 获取编辑组件的 ref
  handleItemRef = (key: string, element: any) => {
    this.items[key] = element;
  };
}
