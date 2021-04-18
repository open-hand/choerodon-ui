import React, { Component, ReactElement, ReactNode } from 'react';
import { observer } from 'mobx-react';
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
  onQuery?: () => void;
  onReset?: () => void;
}

@observer
export default class TableFilterBar extends Component<FilterBarProps, any> {
  static defaultProps = {
    prefixCls: getProPrefixCls('table'),
    paramName: 'params',
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
    const { prefixCls, dataSet, onReset, queryDataSet, paramName, placeholder = $l('Table', 'filter_bar_placeholder'), pagination, onQuery } = this.props;
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
        onQuery={onQuery}
        onReset={onReset}
      />,
    ];
  }
}
