import React, { Component, Key, ReactElement, ReactNode } from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import Icon from 'choerodon-ui/lib/icon';
import Menu, { Item } from 'choerodon-ui/lib/rc-components/menu/index';
import { Action } from 'choerodon-ui/lib/trigger/enum';
import Dropdown from '../../dropdown/Dropdown';
import TableContext from '../TableContext';
import { Placements } from '../../dropdown/enum';
import Column, { ColumnProps } from '../Column';
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

  static get contextType(): typeof TableContext {
    return TableContext;
  }

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
          <Icon type="view_column" onClick={this.handleKeyDown} style={{ cursor: 'pointer' }} />
        </Dropdown>
      </div>
    );
  }

  @autobind
  @action
  handleMenuSelect({
    item: {
      props: { value },
    },
  }) {
    const { tableStore: { node } } = this.context;
    value.hidden = false;
    node._cacheCells = null;
    node.forceUpdate();
  }

  @autobind
  @action
  handleMenuUnSelect({
    item: {
      props: { value },
    },
  }) {
    const { tableStore: { node } } = this.context;
    value.hidden = true;
    node._cacheCells = null;
    node.forceUpdate();
  }

  @autobind
  getMenu() {
    const { tableStore: { proPrefixCls, originalChildren, originalColumns } } = this.context;
    const selfPrefixCls = `${proPrefixCls}-columns-chooser`;
    const selectedKeys: Key[] = [];
    const menuColumns: [ColumnProps, ReactNode, Key][] = [];
    if (originalColumns && originalColumns.length) {
      originalColumns.forEach((column: ColumnProps) => {
        const newColumn: ColumnProps = { ...Column.defaultProps, ...column };
        const { hideable, hidden, title, dataIndex, key } = newColumn;
        if (hideable && title) {
          const keys: Key = key || dataIndex!;
          if (!hidden) {
            selectedKeys.push(keys);
          }
          const header = typeof title === 'function' ? title() : title;
          menuColumns.push([column, header, keys]);
        }
      });
    } else if (originalChildren && originalChildren.length) {
      // todo children hidden
      originalChildren.forEach((column: React.ReactElement<ColumnProps>) => {
        if (React.isValidElement(column)) {
          const columnChildren: any = column.props.children;
          const { hideable, hidden } = column.props;
          if (hideable && columnChildren[0]) {
            const key: Key = columnChildren[1].props.dataKey;
            if (!hidden) {
              selectedKeys.push(key);
            }
            menuColumns.push([column.props, columnChildren[0].props.children, key]);
          }
        }
      });
    }

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
        {this.getOptions(menuColumns)}
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
