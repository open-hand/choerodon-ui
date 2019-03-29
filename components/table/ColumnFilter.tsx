import React, { Component } from 'react';
import Button from '../button/Button';
import { ColumnProps } from './interface';
import SelectTrigger from '../rc-components/select/SelectTrigger';
import { Item as MenuItem } from '../rc-components/menu';
import { UNSELECTABLE_ATTRIBUTE, UNSELECTABLE_STYLE } from '../rc-components/select/util';
import { getColumnKey } from './util';
import { Size } from '../_util/enum';
import { getPrefixCls } from '../configure';

export interface ColumnFilterProps<T> {
  prefixCls?: string;
  columns?: ColumnProps<T>[];
  onColumnFilterChange?: (item?: any) => void;
  getPopupContainer?: (triggerNode?: Element) => HTMLElement;
}

export interface ColumnFilterState {
  open: boolean;
}

export default class ColumnFilter<T> extends Component<ColumnFilterProps<T>, ColumnFilterState> {
  static displayName = 'ColumnFilter';

  state = {
    open: false,
  };

  render() {
    const { prefixCls } = this.props;
    const { open } = this.state;
    return (
      <div className={`${prefixCls}-columns-chooser`}>
        <SelectTrigger
          prefixCls={getPrefixCls('select')}
          showAction={['click']}
          options={this.getOptions()}
          value={this.getVisibleColumns()}
          getPopupContainer={this.props.getPopupContainer}
          multiple
          onDropdownVisibleChange={this.onDropdownVisibleChange}
          onMenuSelect={this.onMenuSelect}
          onMenuDeselect={this.onMenuDeselect}
          visible={open}
          popupPlacement="bottomRight"
          dropdownMatchSelectWidth={false}
          dropdownStyle={{ minWidth: 187 }}
        >
          <Button shape="circle" icon="view_column" size={Size.small} />
        </SelectTrigger>
      </div>
    );
  }

  onMenuSelect = (item: any) => {
    item.item.props.value.hidden = false;
    this.fireChange(item);
  };

  onMenuDeselect = (item: any) => {
    item.item.props.value.hidden = true;
    this.fireChange(item);
  };

  onDropdownVisibleChange = (open: boolean) => {
    if (this.state.open !== open) {
      this.setState({
        open,
      });
    }
  };

  fireChange(item?: any) {
    const { onColumnFilterChange } = this.props;
    if (onColumnFilterChange) {
      onColumnFilterChange(item);
    }
  }

  getOptions() {
    let options: any = [];
    (this.props.columns || []).filter((column) => !column.notDisplay).map((column, i) => {
      const item = column.title ? (
        <MenuItem
          disabled={column.disableClick}
          style={UNSELECTABLE_STYLE}
          attribute={UNSELECTABLE_ATTRIBUTE}
          value={column}
          key={getColumnKey(column, i)}
        >
          {column.title}
        </MenuItem>) : null;
      if (item) {
        options.push(item);
      }
    });
    return options;
  }

  getVisibleColumns() {
    return (this.props.columns || []).filter((column) => !column.hidden);
  }
}
