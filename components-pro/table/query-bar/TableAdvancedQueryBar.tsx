import React, { cloneElement, Component, CSSProperties, ReactElement, ReactNode } from 'react';
import { observer } from 'mobx-react';
import isFunction from 'lodash/isFunction';
import noop from 'lodash/noop';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { getProPrefixCls as getProPrefixClsDefault } from 'choerodon-ui/lib/configure/utils';
import Field from '../../data-set/Field';
import DataSet from '../../data-set';
import Button from '../../button';
import { ElementProps } from '../../core/ViewComponent';
import { ButtonColor, FuncType } from '../../button/enum';
import { ButtonProps } from '../../button/Button';
import { $l } from '../../locale-context';
import autobind from '../../_util/autobind';
import { PaginationProps } from '../../pagination/Pagination';
import TableButtons from './TableButtons';
import FilterSelect from './FilterSelect';
import Modal from '../../modal';
import Form from '../../form/Form';
import { LabelLayout } from '../../form/enum';
import TableContext, { TableContextValue } from '../TableContext';

export interface TableAdvancedQueryBarProps extends ElementProps {
  dataSet: DataSet;
  queryDataSet?: DataSet;
  queryFields: ReactElement<any>[];
  queryFieldsLimit?: number;
  buttons: ReactElement<ButtonProps>[];
  pagination?: ReactElement<PaginationProps>;
  onBeforeQuery?: () => (Promise<boolean | void> | boolean | void);
  onQuery?: () => void;
  onReset?: () => void;
}

@observer
export default class TableAdvancedQueryBar extends Component<TableAdvancedQueryBarProps> {
  static get contextType(): typeof TableContext {
    return TableContext;
  }

  static defaultProps = {
    queryFieldsLimit: 1,
  };

  // @ts-ignore
  context: TableContextValue;

  moreFields: Field[];

  modal;

  get prefixCls(): string {
    const { prefixCls } = this.props;
    const { tableStore: { getProPrefixCls = getProPrefixClsDefault } } = this.context;
    return getProPrefixCls('table', prefixCls);
  }

  componentWillUnmount() {
    if (this.modal) {
      this.modal.close(true);
    }
  }

  @autobind
  handleFieldEnter() {
    this.handleQuery();
    if (this.modal) {
      this.modal.close();
    }
  }

  @autobind
  handleQuery() {
    const { dataSet } = this.props;
    dataSet.query();
  }

  @autobind
  valueFilter(value: string): boolean {
    const { queryFields, queryFieldsLimit } = this.props;
    return queryFields.slice(0, queryFieldsLimit).every(element => element.props.name !== value);
  }

  getMoreFieldsButton(fields: ReactElement<any>[]) {
    if (fields.length) {
      return (
        <Button
          funcType={FuncType.raised}
          color={ButtonColor.primary}
          onClick={() => this.openMore(fields)}
        >
          {$l('Table', 'advanced_query')}
        </Button>
      );
    }
  }

  openMore(children: ReactElement<any>[]) {
    this.modal = Modal.open({
      title: $l('Table', 'advanced_query'),
      children: <Form labelLayout={LabelLayout.float}>{children}</Form>,
      okText: $l('Table', 'query_button'),
      onOk: this.handleQuery,
      style: {
        width: pxToRem(380),
      },
      drawer: true,
    });
  }

  getResetButton() {
    return (
      <Button funcType={FuncType.raised} onClick={this.handleQueryReset}>
        {$l('Table', 'reset_button')}
      </Button>
    );
  }

  getQueryBar(): ReactNode {
    const { queryFieldsLimit, queryFields, buttons, queryDataSet } = this.props;
    const { prefixCls } = this;
    if (queryDataSet && queryFields.length) {
      const currentFields = this.createFields(
        queryFields.slice(0, queryFieldsLimit),
        queryDataSet,
        false,
      );
      const moreFields = this.createFields(queryFields.slice(queryFieldsLimit), queryDataSet, true);
      const moreFieldsButton: ReactElement | undefined = this.getMoreFieldsButton(moreFields);
      return (
        <div key="toolbar" className={`${prefixCls}-advanced-query-bar`}>
          {currentFields}
          <span className={`${prefixCls}-advanced-query-bar-button`}>
            {this.getResetButton()}
            {moreFieldsButton}
            {buttons}
          </span>
        </div>
      );
    }
  }

  createFields(elements: ReactElement<any>[], dataSet: DataSet, isMore: boolean): ReactElement[] {
    return elements.map(element => {
      const { name, style, onEnterDown } = element.props;
      const newStyle: CSSProperties = {};
      if (!isMore) {
        newStyle.width = pxToRem(260);
        newStyle.marginRight = pxToRem(10);
      }
      const props: any = {
        onEnterDown: isFunction(onEnterDown) ? onEnterDown : this.handleFieldEnter,
        labelLayout: LabelLayout.float,
        style: {
          marginRight: !isMore ? pxToRem(10) : 0,
          ...style,
        },
      };
      const field = dataSet.getField(name);
      if (field) {
        const label = field.get('label');
        if (label) {
          if (isMore) {
            props.label = label;
          } else {
            props.placeholder = label;
          }
        }
      }
      return cloneElement(element, props);
    });
  }

  @autobind
  handleQueryReset() {
    const { queryDataSet, dataSet, queryFields, onReset = noop } = this.props;
    if (queryDataSet) {
      const { current } = queryDataSet;
      if (current) {
        current.reset();
        onReset();
      }
      dataSet.fireEvent('queryBarReset', {
        dataSet,
        queryFields,
      });
      this.handleQuery();
    }
  }

  getFilterSelect() {
    const { dataSet, queryDataSet, onQuery = noop, onBeforeQuery = noop } = this.props;
    const { prefixCls } = this;
    return (
      <FilterSelect
        key="filter"
        prefixCls={`${prefixCls}-filter-select`}
        className={`${prefixCls}-advanced-query-bar-options`}
        optionDataSet={dataSet}
        queryDataSet={queryDataSet}
        prefix={`${$l('Table', 'advanced_query_conditions')}:`}
        editable={false}
        filter={this.valueFilter}
        hiddenIfNone
        onQuery={onQuery}
        onBeforeQuery={onBeforeQuery}
      />
    );
  }

  render() {
    const { buttons } = this.props;
    const { prefixCls } = this;
    const queryBar = this.getQueryBar();

    if (queryBar) {
      return [queryBar, this.getFilterSelect()];
    }

    return <TableButtons key="toolbar" prefixCls={prefixCls} buttons={buttons} />;
  }
}
