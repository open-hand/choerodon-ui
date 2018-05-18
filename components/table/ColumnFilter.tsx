import * as React from 'react';
import Button from '../button/button';
import { ColumnProps } from './interface';
import SelectTrigger from '../rc-components/select/SelectTrigger';
import { Item as MenuItem } from '../rc-components/menu';
import { UNSELECTABLE_STYLE, UNSELECTABLE_ATTRIBUTE } from '../rc-components/select/util';
import { getColumnKey } from './util';

export interface ColumnFilterProps<T> {
  prefixCls?: string;
  columns?: ColumnProps<T>[];
  onColumnFilterChange?: () => void;
}

export interface ColumnFilterState {
  open: boolean;
}

export default class ColumnFilter<T> extends React.Component<ColumnFilterProps<T>, ColumnFilterState> {

  state = {
    open: false,
  };

  render() {
    const { prefixCls } = this.props;
    const { open } = this.state;
    return (
      <div className={`${prefixCls}-columns-chooser`}>
        <SelectTrigger
          prefixCls={'ant-select'}
          showAction={['click']}
          options={this.getOptions()}
          value={this.getVisibleColumns()}
          multiple
          onDropdownVisibleChange={this.onDropdownVisibleChange}
          onMenuSelect={this.onMenuSelect}
          onMenuDeselect={this.onMenuDeselect}
          visible={open}
          popupPlacement="bottomRight"
          dropdownMatchSelectWidth={false}
          dropdownStyle={{ minWidth: 187 }}
        >
          <Button shape="circle" icon="view_column" size="small" />
        </SelectTrigger>
      </div>
    );
  }

  onMenuSelect = (item: any) => {
    item.item.props.value.hidden = false;
    this.fireChange();
  };

  onMenuDeselect = (item: any) => {
    item.item.props.value.hidden = true;
    this.fireChange();
  };

  onDropdownVisibleChange = (open: boolean) => {
    if (this.state.open !== open) {
      this.setState({
        open,
      });
    }
  };

  fireChange() {
    const { onColumnFilterChange } = this.props;
    if (onColumnFilterChange) {
      onColumnFilterChange();
    }
  }

  getOptions() {
    let options: any = [];
    (this.props.columns || []).map((column, i) => {
      const item = column.title ? (
        <MenuItem
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
