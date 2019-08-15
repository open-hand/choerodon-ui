import React, { PureComponent } from 'react';
import FilterSelect from './FilterSelect';
import ColumnFilter from './ColumnFilter';
import DataSet from '../data-set/DataSet';
import { $l } from '../locale-context';

export interface FilterBarProps {
  prefixCls?: string;
  placeholder?: string;
  dataSet: DataSet;
  paramName: string;
}

export default class FilterBar extends PureComponent<FilterBarProps, any> {
  renderSuffix() {
    const { prefixCls } = this.props;
    return (
      <ColumnFilter
        prefixCls={prefixCls}
      />
    );
  }

  render() {
    const { prefixCls, dataSet, paramName, placeholder = $l('Table', 'filter_bar_placeholder') } = this.props;
    return (
      <FilterSelect
        prefixCls={`${prefixCls}-filter-select`}
        optionDataSet={dataSet}
        placeholder={placeholder}
        suffix={this.renderSuffix()}
        paramName={paramName}
      />
    );
  }
};
