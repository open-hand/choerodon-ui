import React, { Component } from 'react';

import { ColumnFilterMenuItemProps, ColumnFilterMenuItemState, CustomColumn } from './interface';

import Checkbox, { CheckboxChangeEvent } from '../checkbox';
import InputNumber from '../input-number';
import { getColumnKey } from './util';

const sortInputStyle = {
  width: '60px',
};
const sortInputWrapStyle = {
  ...sortInputStyle,
  display: 'inline-block',
};
const sortInputWrapStyleCenter: any = {
  ...sortInputWrapStyle,
  textAlign: 'center', // checkbox 需要居中
};

class ColumnFilterMenuItem<T> extends Component<ColumnFilterMenuItemProps<T>, ColumnFilterMenuItemState> {

  static getDerivedStateFromProps(nextProps: ColumnFilterMenuItemProps<any>, prevState: ColumnFilterMenuItemState) {
    const { customColumn } = nextProps;
    const { prevCustomColumn } = prevState;
    if (customColumn && prevCustomColumn !== customColumn) {
      return {
        customColumn,
        prevCustomColumn: customColumn,
      };
    }
    return null;
  }

  constructor(props: ColumnFilterMenuItemProps<T>) {
    super(props);
    const customColumn: CustomColumn = props.customColumn || {
      hidden: 0,
      fixedLeft: 0,
      fixedRight: 0,
      orderSeq: props.index,
      fieldKey: getColumnKey(props.column, props.index) as string,
    };
    this.state = {
      customColumn,
      prevCustomColumn: customColumn,
    };
  }

  render() {
    const { column, checkboxPrefixCls, inputNumberProps } = this.props;
    const { customColumn } = this.state;
    return (
      <>
        <div
          style={sortInputWrapStyleCenter}
        >
          <Checkbox
            prefixCls={checkboxPrefixCls}
            style={sortInputStyle}
            checked={customColumn.hidden !== 1}
            onChange={this.handleHiddenChange}
          />
        </div>
        <div className="dropdown-menu-text">
          {column.title}
        </div>
        <div
          style={sortInputWrapStyleCenter}
        >
          <Checkbox
            prefixCls={checkboxPrefixCls}
            name="fixedLeft"
            checked={customColumn.fixedLeft === 1}
            onChange={this.handleFixedLeftChange}
          />
        </div>
        <div
          style={sortInputWrapStyle}
        >
          <InputNumber
            {...inputNumberProps}
            name="orderSeq"
            style={sortInputStyle}
            min={0}
            step={1}
            precision={0}
            value={customColumn.orderSeq}
            onChange={this.handleOrderSeqChange}
          />
        </div>
      </>
    );
  }

  // 修改是否 lock (fixedLeft)
  handleFixedLeftChange = (e: CheckboxChangeEvent) => {
    const { customColumn } = this.state;
    const fixedLeft = e.target.checked ? 1 : 0;
    this.setState({
      customColumn: {
        ...customColumn,
        fixedLeft,
        fixedRight: (fixedLeft === 1) ? 0 : customColumn.fixedRight, // 如果 fixedLeft 为1,则 fixedRight 为0
      },
    });
  };

  // 修改是否隐藏
  handleHiddenChange = (e: CheckboxChangeEvent) => {
    const { customColumn } = this.state;
    const hidden = e.target.checked ? 0 : 1;
    this.setState({
      customColumn: {
        ...customColumn,
        hidden,
      },
    });
  };

  // 修改排序
  handleOrderSeqChange = (value: number) => {
    const { customColumn } = this.state;
    this.setState({
      customColumn: {
        ...customColumn,
        orderSeq: value,
      },
    });
  };

  // 获取校验的数据
  getValidateCustomColumn = () => {
    const { customColumn } = this.state;
    return Promise.resolve(customColumn);
  };
}

export default ColumnFilterMenuItem;
