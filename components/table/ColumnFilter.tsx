import React, { Component } from 'react';
import Button from '../button/Button';
import { ColumnProps } from './interface';
import SelectTrigger from '../rc-components/select/SelectTrigger';
import { Item as MenuItem } from '../rc-components/menu';
import { UNSELECTABLE_ATTRIBUTE, UNSELECTABLE_STYLE } from '../rc-components/select/util';
import { getColumnKey } from './util';
import { Size } from '../_util/enum';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

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
  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static displayName = 'ColumnFilter';

  context: ConfigContextValue;

  state = {
    open: false,
  };

  render() {
    const { prefixCls, getPopupContainer } = this.props;
    const { open } = this.state;
    const { getPrefixCls } = this.context;
    return (
      <div className={`${prefixCls}-columns-chooser`}>
        <SelectTrigger
          prefixCls={getPrefixCls('select')}
          showAction={['click']}
          options={this.getOptions()}
          value={this.getVisibleColumns()}
          getPopupContainer={getPopupContainer}
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
    const { state } = this;
    if (state.open !== open) {
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
    const { columns } = this.props;
    const options: any = [];
    (columns || []).forEach((column, i) => {
      const { title, notDisplay, disableClick } = column;
      if (title && !notDisplay) {
        options.push(
          <MenuItem
            disabled={disableClick}
            style={UNSELECTABLE_STYLE}
            attribute={UNSELECTABLE_ATTRIBUTE}
            value={column}
            key={getColumnKey(column, i)}
          >
            {title}
          </MenuItem>,
        );
      }
    });
    return options;
  }

  getVisibleColumns() {
    const { columns } = this.props;
    return (columns || []).filter(column => !column.hidden);
  }
}
