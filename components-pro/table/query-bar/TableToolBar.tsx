import React, { cloneElement, Component, ReactElement, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import DataSet from '../../data-set/DataSet';
import Record from '../../data-set/Record';
import { ElementProps } from '../../core/ViewComponent';
import Button, { ButtonProps } from '../../button/Button';
import { PaginationProps } from '../../pagination/Pagination';
import Field, { Fields } from '../../data-set/Field';
import { ButtonColor, FuncType } from '../../button/enum';
import Modal from '../../modal';
import Form from '../../form/Form';
import Icon from '../../icon';
import TableContext from '../TableContext';
import { $l } from '../../locale-context';
import autobind from '../../_util/autobind';
import TableButtons from './TableButtons';

/**
 * 去除级联字段
 *
 * @export
 * @param {Fields} fields 待筛选的字段数组
 * @returns {{ [key: string]: Field }} 不含级联字段的字段数组
 */
export function filterBindField(fields: Fields): { [key: string]: Field } {
  return [...fields.entries()].reduce(
    (newFields, [key, field]) => {
      if (!field.get('bind')) {
        newFields[key] = field;
      }
      return newFields;
    },
    {} as { [key: string]: Field },
  );
}

export interface TableToolBarProps extends ElementProps {
  dataSet: DataSet;
  queryDataSet?: DataSet;
  queryFields: ReactElement<any>[];
  queryFieldsLimit?: number;
  buttons: ReactElement<ButtonProps>[];
  pagination?: ReactElement<PaginationProps>;
}

@observer
export default class TableToolBar extends Component<TableToolBarProps, any> {
  static displayName = 'TableToolBar';

  static contextType = TableContext;

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
    const { queryDataSet } = this.props;
    if (queryDataSet) {
      const { current } = queryDataSet;
      if (current) {
        current.reset();
      }
      this.handleQuery();
    }
  }

  @autobind
  async handleQuery() {
    const { dataSet, queryDataSet } = this.props;
    if (await queryDataSet?.validate()) {
      dataSet.query();
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
        dirtyInfo = this.getDirtyInfo(queryDataSet.current, moreFields);
      }
      return (
        <span className={`${prefixCls}-query-bar`}>
          {dirtyInfo}
          {currentFields}
          <Button color={ButtonColor.primary} onClick={this.handleQuery}>
            {$l('Table', 'query_button')}
          </Button>
          {more}
        </span>
      );
    }
  }

  getDirtyInfo(current: Record | undefined, moreFields: ReactElement<any>[]) {
    if (
      current &&
      moreFields.some(element => {
        const { name } = element.props;
        const field = current.getField(name);
        return field ? field.dirty : false;
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
