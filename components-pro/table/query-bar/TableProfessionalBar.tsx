import React, { cloneElement, Component, ReactElement, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, observable, runInAction } from 'mobx';
import isFunction from 'lodash/isFunction';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import Icon from 'choerodon-ui/lib/icon';
import DataSet from '../../data-set';
import Button from '../../button';
import TableContext from '../TableContext';
import { ElementProps } from '../../core/ViewComponent';
import { ButtonColor, FuncType } from '../../button/enum';
import { ButtonProps } from '../../button/Button';
import Form from '../../form';
import { FormProps } from '../../form/Form';
import { $l } from '../../locale-context';
import autobind from '../../_util/autobind';
import TableButtons from './TableButtons';
import { LabelLayout } from '../../form/enum';

export interface TableProfessionalBarProps extends ElementProps {
  dataSet: DataSet;
  queryDataSet?: DataSet;
  queryFields: ReactElement<any>[];
  queryFieldsLimit?: number;
  buttons: ReactElement<ButtonProps>[];
  queryBarProps?: FormProps;
  summaryBar?: ReactElement<any>;
}

@observer
export default class TableProfessionalBar extends Component<TableProfessionalBarProps> {
  static contextType = TableContext;

  static defaultProps = {
    prefixCls: getProPrefixCls('table'),
    queryFieldsLimit: 3,
  };

  @observable moreFields: ReactElement[];

  componentDidMount(): void {
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
  async handleQuery() {
    const { dataSet, queryDataSet } = this.props;
    if (await queryDataSet?.validate()) {
      dataSet.query();
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
    const { prefixCls } = this.props;
    return (
      <Button key='lov_reset_btn' className={`${prefixCls}-professional-reset-btn`} funcType={FuncType.raised} onClick={this.handleQueryReset}>
        {$l('Table', 'reset_button')}
      </Button>
    );
  }

  getMoreFieldsButton(fields) {
    const { prefixCls } = this.props;
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
    const { prefixCls, queryFieldsLimit, queryFields, queryDataSet, queryBarProps } = this.props;
    if (queryDataSet && queryFields.length) {
      const currentFields = (
        <Form
          dataSet={queryDataSet}
          columns={queryFieldsLimit}
          labelLayout={LabelLayout.horizontal}
          {...queryBarProps}
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
            <Button color={ButtonColor.primary} wait={500} onClick={this.handleQuery}>
              {$l('Table', 'query_button')}
            </Button>
          </span>
        </div>
      );
    }
  }


  @autobind
  handleQueryReset() {
    const { queryDataSet } = this.props;
    if (queryDataSet) {
      const { current } = queryDataSet;
      if (current) {
        current.reset();
      }
      this.handleQuery();
    }
  }

  render() {
    const { prefixCls, buttons, summaryBar } = this.props;
    const queryBar = this.getQueryBar();
    const tableButtons = buttons.length ? (
      <div key="professional_toolbar" className={`${prefixCls}-professional-toolbar`}>
        <TableButtons key="toolbar" prefixCls={prefixCls} buttons={buttons} >
          {summaryBar}
        </TableButtons>
      </div>
    ) : (
      <div className={`${prefixCls}-toolbar`}>
        {summaryBar}
      </div>
    );

    return [queryBar, tableButtons];
  }
}
