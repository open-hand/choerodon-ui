import React, { cloneElement, Component, ReactElement, ReactNode } from 'react';
import { observer } from 'mobx-react';
import noop from 'lodash/noop';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import DataSet from '../../data-set/DataSet';
import { ElementProps } from '../../core/ViewComponent';
import Button, { ButtonProps } from '../../button/Button';
import { PaginationProps } from '../../pagination/Pagination';
import { ButtonColor, FuncType } from '../../button/enum';
import Modal from '../../modal';
import Form from '../../form/Form';
import Icon from '../../icon';
import { $l } from '../../locale-context';
import autobind from '../../_util/autobind';
import TableButtons from './TableButtons';

export interface TableToolBarProps extends ElementProps {
  dataSet: DataSet;
  queryDataSet?: DataSet;
  queryFields: ReactElement<any>[];
  queryFieldsLimit?: number;
  buttons: ReactElement<ButtonProps>[];
  pagination?: ReactElement<PaginationProps>;
  onQuery?: () => void;
  onReset?: () => void;
}

@observer
export default class TableToolBar extends Component<TableToolBarProps, any> {
  static displayName = 'TableToolBar';

  static defaultProps = {
    prefixCls: getProPrefixCls('table'),
    queryFieldsLimit: 1,
    pagination: null,
  };

  modal;

  @autobind
  handleFieldEnter() {
    this.handleQuery();
    if (this.modal) {
      this.modal.close();
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

  @autobind
  async handleQuery(collapse?: boolean) {
    const { dataSet, queryDataSet, onQuery = noop } = this.props;
    if (await queryDataSet?.validate()) {
      dataSet.query();
      if (!collapse) {
        onQuery();
      }
    }
  }

  componentWillUnmount() {
    if (this.modal) {
      this.modal.close(true);
    }
  }

  getQueryBar(): ReactNode {
    const { prefixCls, queryFieldsLimit, queryFields, queryDataSet } = this.props;
    if (queryDataSet && queryFields.length) {
      const currentFields = this.createFields(
        queryFields.slice(0, queryFieldsLimit),
        queryDataSet,
        false,
      );
      const moreFields = this.createFields(queryFields.slice(queryFieldsLimit), queryDataSet, true);
      let more;
      let dirtyInfo;
      if (moreFields.length) {
        more = this.getMoreButton(moreFields);
        dirtyInfo = this.getDirtyInfo(queryDataSet, moreFields);
      }
      return (
        <span className={`${prefixCls}-query-bar`}>
          {dirtyInfo}
          {currentFields}
          <Button color={ButtonColor.primary} onClick={() => {this.handleQuery()}}>
            {$l('Table', 'query_button')}
          </Button>
          {more}
        </span>
      );
    }
  }

  getDirtyInfo(dataSet: DataSet | undefined, moreFields: ReactElement<any>[]) {
    if (
      dataSet &&
      moreFields.some(element => {
        const { name } = element.props;
        const field = dataSet.getField(name);
        return field ? field.isDirty(dataSet.current) : false;
      })
    ) {
      const { prefixCls } = this.props;
      return (
        <span className={`${prefixCls}-query-bar-dirty-info`}>
          <Icon type="info" />
          <span>{$l('Table', 'dirty_info')}</span>
          <a onClick={this.handleQueryReset}>{$l('Table', 'restore')}</a>
        </span>
      );
    }
  }

  getMoreButton(moreFields: ReactElement<any>[]) {
    return (
      <Button
        color={ButtonColor.primary}
        funcType={FuncType.flat}
        onClick={() => this.openMore(moreFields)}
      >
        {$l('Table', 'advanced_search')}
      </Button>
    );
  }

  createFields(elements: ReactElement<any>[], dataSet: DataSet, isMore: boolean) {
    return elements.map((element, index) => {
      const { name } = element.props;
      const props: any = {
        autoFocus: isMore && index === 0,
        onEnterDown: this.handleFieldEnter,
        style: isMore ? undefined : { width: pxToRem(130) },
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

  openMore(children: ReactNode) {
    this.modal = Modal.open({
      title: $l('Table', 'advanced_search'),
      children: <Form>{children}</Form>,
      okText: $l('Table', 'query_button'),
      onOk: this.handleQuery,
      style: {
        width: pxToRem(400),
      },
      drawer: true,
    });
  }

  render() {
    const { prefixCls, pagination, buttons } = this.props;
    return [
      <TableButtons key="toolbar" prefixCls={prefixCls} buttons={buttons}>
        {this.getQueryBar()}
      </TableButtons>,
      pagination,
    ];
  }
}
