import React, { cloneElement, Component, ReactElement, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, observable, runInAction } from 'mobx';
import isFunction from 'lodash/isFunction';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import Icon from 'choerodon-ui/lib/icon';
import { getProPrefixCls } from 'choerodon-ui/lib/configure/utils';
import DataSet from '../../data-set';
import Button from '../../button';
import TableContext from '../TableContext';
import { ElementProps } from '../../core/ViewComponent';
import { ButtonColor, FuncType } from '../../button/enum';
import Form from '../../form';
import { FormProps } from '../../form/Form';
import { $l } from '../../locale-context';
import autobind from '../../_util/autobind';
import isEmpty from '../../_util/isEmpty';
import { TableQueryBarType } from '../../table/enum';

export interface TableProfessionalBarProps extends ElementProps {
  dataSet: DataSet;
  queryDataSet?: DataSet;
  queryFields: ReactElement<any>[];
  queryFieldsLimit?: number;
  queryFormProps?: FormProps;
  defaultExpanded?: boolean;
  onQuery?: (props: object) => void;
  onReset?: () => void;
}

@observer
export default class TableProfessionalBar extends Component<TableProfessionalBarProps> {
  static get contextType(): typeof TableContext {
    return TableContext;
  }

  static defaultProps = {
    queryFieldsLimit: 3,
  };

  static __TableQueryBarType = TableQueryBarType.professionalBar;

  @observable moreFields: ReactElement[];

  get prefixCls(): string {
    if ('prefixCls' in this.props) {
      const { prefixCls } = this.props;
      return prefixCls!;
    }
    const { tableStore: { prefixCls = getProPrefixCls('performance-table') } } = this.context;
    return prefixCls;
  }

  componentDidMount(): void {
    const { queryFieldsLimit, queryFields, queryDataSet, defaultExpanded } = this.props;
    if (queryDataSet && queryFields.length && defaultExpanded) {
      runInAction(() => {
        this.moreFields = this.createFields(queryFields.slice(queryFieldsLimit));
      });
    }
    this.processDataSetListener(true);
  }

  componentWillUnmount(): void {
    this.processDataSetListener(false);
  }

  processDataSetListener(flag: boolean) {
    const { queryDataSet } = this.props;
    if (queryDataSet) {
      const handler = flag ? queryDataSet.addEventListener : queryDataSet.removeEventListener;
      handler.call(queryDataSet, 'validate', this.handleDataSetValidate);
    }
  }

  /**
   * queryDataSet 查询前校验事件 触发展开动态字段
   * @param dataSet 查询DS
   * @param result
   */
  @autobind
  async handleDataSetValidate({ result }) {
    const { queryFieldsLimit, queryFields } = this.props;
    const moreFields = this.createFields(queryFields.slice(queryFieldsLimit));
    if (!await result) {
      runInAction(() => {
        this.moreFields = moreFields;
      });
    }
  }

  @autobind
  handleFieldEnter() {
    this.handleQuery();
  }

  @autobind
  async handleQuery(collapse?: boolean) {
    const { dataSet, queryDataSet, onQuery = noop } = this.props;
    if (queryDataSet && await queryDataSet.validate()) {
      await dataSet.query();
      if (!collapse) {
        const { current } = queryDataSet;
        const queryData = current ? omit(current.toData(true), ['__dirty']) : undefined;
        const data = queryData ? Object.keys(queryData).reduce((p, key) => {
          const value = queryData[key];
          if (!isEmpty(value)) {
            p[key] = value;
          }
          return p;
        }, {}) : {};
        await onQuery({ dataSet, queryDataSet, data });
      }
    }
  }

  @action
  openMore = (fields: ReactElement[]) => {
    if (this.moreFields && this.moreFields.length) {
      this.moreFields = [];
    } else {
      this.moreFields = fields;
    }
    return this.moreFields;
  };

  getResetButton() {
    const { prefixCls } = this;
    return (
      <Button key='lov_reset_btn' className={`${prefixCls}-professional-reset-btn`} funcType={FuncType.raised} onClick={this.handleQueryReset}>
        {$l('Table', 'reset_button')}
      </Button>
    );
  }

  getMoreFieldsButton(fields) {
    const { prefixCls } = this;
    if (fields.length) {
      return (
        <Button
          className={`${prefixCls}-professional-query-more`}
          funcType={FuncType.raised}
          onClick={() => this.openMore(fields)}
        >
          {$l('Table', 'more')}
          {this.moreFields && this.moreFields.length ? <Icon type='expand_less' /> : <Icon type='expand_more' />}
        </Button>
      );
    }
  }

  /**
   * 注入 onEnterDown 事件
   * @param elements
   */
  createFields(elements): ReactElement[] {
    return elements.map(element => {
      const { onEnterDown } = element.props;
      if (onEnterDown && isFunction(onEnterDown)) {
        return element;
      }
      const props: any = {
        onEnterDown: this.handleFieldEnter,
      };
      return cloneElement(element, props);
    });
  }

  getQueryBar(): ReactNode {
    const { queryFieldsLimit, queryFields, queryDataSet, queryFormProps } = this.props;
    const { prefixCls } = this;
    if (queryDataSet && queryFields.length) {
      const currentFields = (
        <Form
          dataSet={queryDataSet}
          columns={queryFieldsLimit}
          {...queryFormProps}
        >
          {this.createFields(queryFields.slice(0, queryFieldsLimit))}
          {this.moreFields}
        </Form>
      );

      const moreFields = this.createFields(queryFields.slice(queryFieldsLimit));
      const moreFieldsButton: ReactElement | undefined = this.getMoreFieldsButton(moreFields);

      return (
        <div key="query_bar" className={`${prefixCls}-professional-query-bar`}>
          {currentFields}
          <span className={`${prefixCls}-professional-query-bar-button`}>
            {moreFieldsButton}
            {this.getResetButton()}
            <Button color={ButtonColor.primary} wait={500} onClick={() => this.handleQuery()}>
              {$l('Table', 'query_button')}
            </Button>
          </span>
        </div>
      );
    }
  }

  @autobind
  handleQueryReset() {
    const { queryDataSet, onReset = noop } = this.props;
    if (queryDataSet) {
      const { current } = queryDataSet;
      if (current) {
        current.reset();
        onReset();
      }
      this.handleQuery(true);
    }
  }

  render() {
    return this.getQueryBar();
  }
}
