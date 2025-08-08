import React, { Component, ReactElement, ReactNode } from 'react';
import { observer } from 'mobx-react';
import noop from 'lodash/noop';
import { getProPrefixCls as getProPrefixClsDefault } from 'choerodon-ui/lib/configure/utils';
import FilterSelect from './FilterSelect';
import ColumnFilter from './ColumnFilter';
import TableContext, { TableContextValue } from '../TableContext';
import DataSet from '../../data-set/DataSet';
import Record from '../../data-set/Record';
import { $l } from '../../locale-context';
import { ButtonProps } from '../../button/Button';
import { PaginationProps } from '../../pagination/Pagination';
import { FormFieldProps } from '../../field/interface';

export interface FilterBarProps {
  prefixCls?: string;
  placeholder?: string;
  dataSet: DataSet;
  queryDataSet?: DataSet;
  paramName: string;
  buttons: ReactElement<ButtonProps>[];
  pagination?: ReactElement<PaginationProps>;
  editable?: boolean;
  onBeforeQuery?: () => (Promise<boolean | void> | boolean | void);
  onQuery?: () => void;
  onReset?: () => void;
  editorProps?: (props: { name: string, record?: Record, editor: ReactElement<FormFieldProps> }) => object;
}

@observer
export default class TableFilterBar extends Component<FilterBarProps, any> {
  static get contextType(): typeof TableContext {
    return TableContext;
  }

  static defaultProps = {
    paramName: 'params',
  };

  // @ts-ignore
  context: TableContextValue;

  get prefixCls(): string {
    const { prefixCls } = this.props;
    const { tableStore: { getProPrefixCls = getProPrefixClsDefault } } = this.context;
    return getProPrefixCls('table', prefixCls);
  }

  renderSuffix() {
    const { prefixCls } = this;
    return <ColumnFilter prefixCls={prefixCls} />;
  }

  getButtons(): ReactNode {
    const { buttons } = this.props;
    const { prefixCls } = this;
    if (buttons.length) {
      return (
        <div key="toolbar" className={`${prefixCls}-toolbar`}>
          <span className={`${prefixCls}-toolbar-button-group`}>{buttons}</span>
        </div>
      );
    }
  }

  render() {
    const { dataSet, queryDataSet, paramName, placeholder = $l('Table', 'filter_bar_placeholder'), pagination, onQuery = noop, onReset = noop, editable, editorProps, onBeforeQuery = noop } = this.props;
    const { prefixCls } = this;
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
        onBeforeQuery={onBeforeQuery}
        onReset={onReset}
        editable={editable}
        editorProps={editorProps}
      />,
    ];
  }
}
