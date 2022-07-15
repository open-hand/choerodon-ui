import React, { Component, Key, ReactElement, ReactNode } from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import Menu, { Item } from 'choerodon-ui/lib/rc-components/menu/index';
import Button from '../../button/Button';
import Dropdown from '../../dropdown/Dropdown';
import { Size } from '../../core/enum';
import { FuncType } from '../../button/enum';
import TableContext from '../TableContext';
import { getHeader } from '../utils';
import { Placements } from '../../dropdown/enum';
import { ColumnProps } from '../Column';
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

  getPrefixCls() {
    const { prefixCls } = this.props;
    return `${prefixCls}-columns-chooser`;
  }

  render() {
    const prefixCls = this.getPrefixCls();
    return (
      <div
        className={prefixCls}
        onFocus={stopPropagation}
        onMouseDown={stopPropagation}
        tabIndex={-1}
      >
        <Dropdown
          placement={Placements.bottomRight}
          overlay={this.getMenu}
          hidden={this.hidden}
          onHiddenChange={this.handleHiddenChange}
        >
          <Button
            funcType={FuncType.flat}
            icon="view_column"
            size={Size.small}
            onKeyDown={this.handleKeyDown}
          />
        </Dropdown>
      </div>
    );
  }

  @action
  handleMenuSelect({
    item: {
      props: { value },
    },
  }) {
    value.hidden = false;
  }

  @action
  handleMenuUnSelect({
    item: {
      props: { value },
    },
  }) {
    value.hidden = true;
  }

  @autobind
  getMenu() {
    const { prefixCls } = this.props;
    const selfPrefixCls = this.getPrefixCls();
    const { tableStore, dataSet, aggregation } = this.context;
    const { allLeafs } = tableStore.columnGroups;
    const selectedKeys: Key[] = [];
    const columns: [ColumnProps, ReactNode, Key][] = [];
    allLeafs.forEach(({ column, key, headerGroup, headerGroups }) => {
      if (column.hideable) {
        const header = getHeader({ ...column, dataSet, aggregation, group: headerGroup, groups: headerGroups });
        if (header) {
          if (!column.hidden) {
            selectedKeys.push(key);
          }
          columns.push([column, header, key]);
        }
      }
    });
    return (
      <Menu
        ref={this.saveMenu}
        multiple
        defaultActiveFirst
        prefixCls={`${prefixCls}-dropdown-menu`}
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
