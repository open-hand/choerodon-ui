import React, { Component, Key, ReactElement, ReactNode } from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import Icon from 'choerodon-ui/lib/icon';
import Menu, { Item } from 'choerodon-ui/lib/rc-components/menu/index';
import { Action } from '../../trigger/enum';
import Dropdown from '../../dropdown/Dropdown';
import TableContext from '../TableContext';
import { Placements } from '../../dropdown/enum';
import { ColumnProps } from '../Column.d';
import { stopEvent, stopPropagation } from '../../_util/EventManager';
import autobind from '../../_util/autobind';

function handleMenuClick({ domEvent }) {
  domEvent.preventDefault();
}

export interface ColumnFilterProps {
  prefixCls?: string;
  onColumnFilterChange?: (item?: any) => void;
  getPopupContainer?: (triggerNode?: Element) => HTMLElement;
}

@observer
export default class ColumnFilter extends Component<ColumnFilterProps> {
  static displayName = 'ColumnFilter';

  static contextType = TableContext;

  @observable hidden;

  menu?: Menu | null;

  constructor(props, context) {
    super(props, context);
    this.setDropDownHidden(true);
  }

  @autobind
  saveMenu(node) {
    this.menu = node;
  }

  @autobind
  handleHiddenChange(hidden) {
    this.setDropDownHidden(hidden);
  }

  @autobind
  handleKeyDown(e) {
    if (this.menu && this.menu.onKeyDown(e)) {
      stopEvent(e);
    }
  }

  @action
  setDropDownHidden(hidden) {
    this.hidden = hidden;
  }

  render() {
    const { prefixCls } = this.props;
    return (
      <div
        className={`${prefixCls}-columns-chooser`}
        onFocus={stopPropagation}
        onMouseDown={stopPropagation}
        tabIndex={-1}
      >
        <Dropdown
          trigger={[Action.click]}
          placement={Placements.bottomRight}
          overlay={this.getMenu}
          hidden={this.hidden}
          onHiddenChange={this.handleHiddenChange}
        >
          <Icon type="view_column" onClick={this.handleKeyDown} />
        </Dropdown>
      </div>
    );
  }

  @autobind
  @action
  handleMenuSelect({
    key,
    item: {
      props: { value },
    },
  }) {
    const { tableStore: { node } } = this.context;
    value.hidden = false;
    node.handleColumnHidden(key, false);
  }

  @autobind
  @action
  handleMenuUnSelect({
    key,
    item: {
      props: { value },
    },
  }) {
    const { tableStore: { node } } = this.context;
    value.hidden = true;
    node.handleColumnHidden(key, true);
  }

  @autobind
  getMenu() {
    const { tableStore: { proPrefixCls } } = this.context;
    const selfPrefixCls = `${proPrefixCls}-columns-chooser`;
    const { tableStore } = this.context;
    const { originalColumns } = tableStore;
    const selectedKeys: Key[] = [];
    const columns: [ColumnProps, ReactNode, Key][] = [];
    React.Children.forEach(originalColumns, (column: React.ReactElement<ColumnProps>) => {
      if (React.isValidElement(column)) {
        const columnChildren: any = column.props.children;
        const { hideable, hidden } = column.props;
        if (hideable && columnChildren[0]) {
          const key: Key = columnChildren[1].props.dataKey;
          if (!hidden) {
            selectedKeys.push(key);
          }
          columns.push([column.props, columnChildren[0].props.children, key]);
        }
      }
    });
    return (
      <Menu
        ref={this.saveMenu}
        multiple
        defaultActiveFirst
        prefixCls={`${proPrefixCls}-dropdown-menu`}
        className={`${selfPrefixCls}-dropdown-menu`}
        selectedKeys={selectedKeys}
        onSelect={this.handleMenuSelect}
        onDeselect={this.handleMenuUnSelect}
        onClick={handleMenuClick}
      >
        {this.getOptions(columns)}
      </Menu>
    );
  }

  getOptions(columns: [ColumnProps, ReactNode, Key][]): ReactElement<any>[] {
    return columns.map(([column, header, key]) => (
      <Item key={key} value={column}>
        <span>{header}</span>
      </Item>
    ));
  }
}
