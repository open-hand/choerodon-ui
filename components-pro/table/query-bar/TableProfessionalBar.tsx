import React, { Component, ReactElement, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import Icon from 'choerodon-ui/lib/icon';
import Field from '../../data-set/Field';
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
}

@observer
export default class TableProfessionalBar extends Component<TableProfessionalBarProps> {
  static contextType = TableContext;

  static defaultProps = {
    prefixCls: getProPrefixCls('table'),
    queryFieldsLimit: 3,
  };

  @observable moreFields: Field[];

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
  openMore = (fields: Field[]) => {
    if (this.moreFields && this.moreFields.length) {
      this.moreFields = [];
    } else {
      this.moreFields = fields;
    }
    return this.moreFields;
  };

  getResetButton() {
    return (
      <Button funcType={FuncType.raised} onClick={this.handleQueryReset}>
        {$l('Table', 'reset_button')}
      </Button>
    );
  }

  getMoreFieldsButton(fields) {
    if (fields.length) {
      return (
        <Button
          funcType={FuncType.raised}
          onClick={() => this.openMore(fields)}
        >
          {$l('Table', 'more')}
          {this.moreFields && this.moreFields.length ? <Icon type='expand_less' /> : <Icon type='expand_more' />}
        </Button>
      );
    }
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
          {queryFields.slice(0, queryFieldsLimit)}
          {this.moreFields}
        </Form>
      );

      const moreFields = queryFields.slice(queryFieldsLimit);
      // const currentFields = this.createFields(
      //   queryFields.slice(0, queryFieldsLimit),
      //   queryDataSet,
      // );
      // const moreFields = this.createFields(queryFields.slice(queryFieldsLimit), queryDataSet);
      const moreFieldsButton: ReactElement | undefined = this.getMoreFieldsButton(moreFields);

      return (
        <div key="query_bar" className={`${prefixCls}-professional-query-bar`}>
          {currentFields}
          <span className={`${prefixCls}-professional-query-bar-button`}>
            {moreFieldsButton}
            {this.getResetButton()}
            <Button color={ButtonColor.primary} onClick={this.handleQuery}>
              {$l('Table', 'query_button')}
            </Button>
          </span>
        </div>
      );
    }
  }

  // createFields(elements: ReactElement<any>[], dataSet: DataSet): ReactElement[] {
  //   const { prefixCls } = this.props;
  //   return elements.map(element => {
  //     const { name, style } = element.props;
  //     const props: any = {
  //       onEnterDown: this.handleFieldEnter,
  //       labelLayout: LabelLayout.horizontal,
  //       style: {
  //         marginRight: pxToRem(8),
  //         // width: pxToRem(180),
  //         // flexGrow
  //         ...style,
  //       },
  //     };
  //     const field = dataSet.getField(name);
  //     if (field) {
  //       const label = field.get('label');
  //       if (label) {
  //         props.label = label;
  //       }
  //     }
  //     return (<>
  //       <span title={isString(props.label) ? props.label : ''} className={`${prefixCls}-professional-query-bar-form-label`}>{props.label}</span>
  //       {cloneElement(element, props)}
  //     </>);
  //   });
  // }

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
    const { prefixCls, buttons } = this.props;
    const queryBar = this.getQueryBar();
    const tableButtons = buttons.length ? (
      <div key="professional_toolbar" className={`${prefixCls}-professional-toolbar`}>
        <TableButtons key="toolbar" prefixCls={prefixCls} buttons={buttons} />
      </div>
    ) : null;

    return [queryBar, tableButtons];
  }
}
