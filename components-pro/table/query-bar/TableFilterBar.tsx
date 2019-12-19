import React, { PureComponent, ReactElement, ReactNode } from 'react';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import FilterSelect from './FilterSelect';
import ColumnFilter from './ColumnFilter';
import DataSet from '../../data-set/DataSet';
import { $l } from '../../locale-context';
import { ButtonProps } from '../../button/Button';
import { PaginationProps } from '../../pagination/Pagination';

export interface FilterBarProps {
  prefixCls?: string;
  placeholder?: string;
  dataSet: DataSet;
  queryDataSet?: DataSet;
  paramName: string;
  buttons: ReactElement<ButtonProps>[];
  pagination?: ReactElement<PaginationProps>;
}

export default class TableFilterBar extends PureComponent<FilterBarProps, any> {
  static defaultProps = {
    prefixCls: getProPrefixCls('table'),
    paramName: 'params',
    placeholder: $l('Table', 'filter_bar_placeholder'),
  };

  renderSuffix() {
    const { prefixCls } = this.props;
    return <ColumnFilter prefixCls={prefixCls} />;
  }

  getButtons(): ReactNode {
    const { prefixCls, buttons } = this.props;
    if (buttons.length) {
      return (
        <div key="toolbar" className={`${prefixCls}-toolbar`}>
          <span className={`${prefixCls}-toolbar-button-group`}>{buttons}</span>
        </div>
      );
    }
  }

  render() {
    const { prefixCls, dataSet, queryDataSet, paramName, placeholder, pagination } = this.props;
    const buttons = this.getButtons();
    return [
      buttons,
      pagination,
      <FilterSelect
        key="filter"
        prefixCls={`${prefixCls}-filter-select`}
        optionDataSet={dataSet}
        queryDataSet={queryDataSet}
        placeholder={placeholder}
        suffix={this.renderSuffix()}
        paramName={paramName}
      />,
    ];
  }
}
