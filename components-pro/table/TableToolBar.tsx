import React, { cloneElement, Component, isValidElement, ReactElement, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import { TableButtonType } from './enum';
import { ElementProps } from '../core/ViewComponent';
import Button, { ButtonProps } from '../button/Button';
import Field, { Fields } from '../data-set/Field';
import { ButtonColor, ButtonType, FuncType } from '../button/enum';
import { getEditorByField } from './utils';
import Modal from '../modal';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import Form from '../form/Form';
import Icon from '../icon';
import TableContext from './TableContext';
import { DataSetStatus, FieldType } from '../data-set/enum';
import { $l } from '../locale-context';
import Table from './Table';
import Column from './Column';
import { findBindFieldBy } from '../data-set/utils';

function filterBindField(fields: Fields): Fields {
  return Array.from(fields.entries()).reduce((newFields, [key, field]) => {
    if (!field.get('bind')) {
      newFields[key] = field;
    }
    return newFields;
  }, {} as Fields);
}

export type Buttons = TableButtonType | [TableButtonType, ButtonProps] | ReactElement<ButtonProps>;

export interface TabelToolBarProps extends ElementProps {
  header?: ReactNode | ((records: Record[]) => ReactNode);
  buttons?: Buttons[];
  queryFields: { [key: string]: ReactElement<any> };
  queryFieldsLimit: number;
  showQueryBar: boolean;
}

export const buttonsEnumType = PropTypes.oneOf([
  TableButtonType.add,
  TableButtonType.save,
  TableButtonType.remove,
  TableButtonType.delete,
  TableButtonType.reset,
  TableButtonType.query,
  TableButtonType.export,
  TableButtonType.expandAll,
  TableButtonType.collapseAll,
]);

@observer
export default class TableToolBar extends Component<TabelToolBarProps, any> {
  static displayName = 'TableToolBar';

  static propTypes = {
    prefixCls: PropTypes.string,
    header: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    buttons: PropTypes.arrayOf(PropTypes.oneOfType([
      buttonsEnumType,
      PropTypes.arrayOf(PropTypes.oneOfType([
        buttonsEnumType,
        PropTypes.object,
      ])),
      PropTypes.node,
    ])),
    queryFields: PropTypes.object,
    queryFieldsLimit: PropTypes.number.isRequired,
    showQueryBar: PropTypes.bool.isRequired,
  };

  static contextType = TableContext;

  modal;
  exportModal;

  exportDataSet: DataSet;

  handleFieldEnter = () => {
    this.handleQuery();
    if (this.modal) {
      this.modal.close();
    }
  };

  handleButtonCreate = () => this.context.tableStore.dataSet.create(void 0, 0);

  handleButtonSubmit = () => this.context.tableStore.dataSet.submit();

  handleButtonDelete = () => {
    const { dataSet } = this.context.tableStore;
    dataSet.delete(dataSet.selected);
  };

  handleButtonRemove = () => {
    const { dataSet } = this.context.tableStore;
    dataSet.remove(dataSet.selected);
  };

  handleButtonReset = () => this.context.tableStore.dataSet.reset();

  handleQueryReset = () => {
    const { current } = this.context.tableStore.dataSet.queryDataSet;
    if (current) {
      current.reset();
    }
    this.handleQuery();
  };

  handleExpandAll = () => this.context.tableStore.expandAll();
  handleCollapseAll = () => this.context.tableStore.collapseAll();

  handleButtonExport = () => {
    const { columnHeaders } = this.context.tableStore;
    this.exportDataSet = new DataSet({ data: columnHeaders, paging: false });
    this.exportDataSet.selectAll();
    this.exportModal = Modal.open({
      title: $l('Table', 'choose_export_columns'),
      children: (
        <Table dataSet={this.exportDataSet} style={{ height: pxToRem(300) }}>
          <Column header={$l('Table', 'column_name')} name="label" resizable={false} />
        </Table>
      ),
      okText: $l('Table', 'export_button'),
      onOk: this.handleExport,
      style: {
        width: pxToRem(400),
      },
    });
  };

  handleQuery = () => {
    this.context.tableStore.dataSet.query();
  };

  handleExport = () => {
    const { selected } = this.exportDataSet;
    if (selected.length) {
      const { dataSet } = this.context.tableStore;
      dataSet.export(selected.reduce((columns, record) => {
        let myName = record.get('name');
        const myField = dataSet.getField(myName);
        if (myField && myField.type === FieldType.object) {
          const bindField = findBindFieldBy(myField, dataSet.fields, 'textField');
          if (bindField) {
            myName = bindField.name;
          }
        }
        columns[myName] = record.get('label');
        return columns;
      }, {}));
    } else {
      return false;
    }
  };

  componentWillUnmount() {
    if (this.modal) {
      this.modal.close(true);
    }
    if (this.exportModal) {
      this.exportModal.close(true);
    }
  }

  getButtonProps(type: TableButtonType): ButtonProps & { children?: ReactNode } | undefined {
    const { tableStore } = this.context;
    const { dataSet, isTree } = tableStore;
    const disabled = dataSet.parent ? !dataSet.parent.current : false;
    const submitting = dataSet.status === DataSetStatus.submitting;
    const canRemove = !submitting && dataSet.selected.length > 0;
    switch (type) {
      case TableButtonType.add:
        return { icon: 'playlist_add', onClick: this.handleButtonCreate, children: $l('Table', 'create_button'), disabled };
      case TableButtonType.save:
        return {
          icon: 'save',
          onClick: this.handleButtonSubmit,
          children: $l('Table', 'save_button'),
          type: ButtonType.submit, disabled: submitting,
        };
      case TableButtonType.delete:
        return {
          icon: 'delete',
          onClick: this.handleButtonDelete,
          children: $l('Table', 'delete_button'),
          disabled: !canRemove,
        };
      case TableButtonType.remove:
        return {
          icon: 'remove_circle',
          onClick: this.handleButtonRemove,
          children: $l('Table', 'remove_button'),
          disabled: !canRemove,
        };
      case TableButtonType.reset:
        return { icon: 'undo', onClick: this.handleButtonReset, children: $l('Table', 'reset_button'), type: ButtonType.reset };
      case TableButtonType.query:
        return { icon: 'search', onClick: this.handleQuery, children: $l('Table', 'query_button') };
      case TableButtonType.export:
        return { icon: 'export', onClick: this.handleButtonExport, children: $l('Table', 'export_button') };
      case TableButtonType.expandAll:
        return isTree && { icon: 'add_box', onClick: this.handleExpandAll, children: $l('Table', 'expand_button') };
      case TableButtonType.collapseAll:
        return isTree && { icon: 'short_text', onClick: this.handleCollapseAll, children: $l('Table', 'collapse_button') };
      default:
    }
  }

  getButtons(): ReactNode {
    const { buttons, prefixCls } = this.props;
    if (buttons) {
      const children: ReactElement<ButtonProps>[] = [];
      buttons.forEach((button) => {
        let props = {};
        if (isArray(button)) {
          props = button[1];
          button = button[0];
        }
        if (isString(button) && button in TableButtonType) {
          children.push(<Button color={ButtonColor.blue} funcType={FuncType.flat} key={button} {...this.getButtonProps(button)} {...props} />);
        } else if (isValidElement<ButtonProps>(button)) {
          children.push(button);
        }
      });
      if (children.length) {
        return (
          <span className={`${prefixCls}-toolbar-button-group`}>
            {children}
          </span>
        );
      }
    }
  }

  getQueryBar(): ReactNode {
    const { prefixCls, showQueryBar, queryFieldsLimit } = this.props;
    const { queryDataSet } = this.context.tableStore.dataSet;
    if (showQueryBar && queryDataSet) {
      const fields = filterBindField(queryDataSet.fields);
      const keys = Object.keys(fields);
      const currentFields = keys.slice(0, queryFieldsLimit).map(name => fields[name]);
      const moreKeys = keys.slice(queryFieldsLimit);
      let more;
      let dirtyInfo;
      if (moreKeys.length) {
        const moreFields = keys.slice(queryFieldsLimit).map(name => fields[name]);
        more = this.getMoreButton(moreFields, queryDataSet);
        dirtyInfo = this.getDirtyInfo(queryDataSet.current, moreKeys);
      }
      return (
        <span className={`${prefixCls}-query-bar`}>
          {dirtyInfo}
          {this.getCurrentFields(currentFields, queryDataSet)}
          <Button color={ButtonColor.blue} onClick={this.handleQuery}>{$l('Table', 'query_button')}</Button>
          {more}
        </span>
      );
    }
  }

  getDirtyInfo(current: Record | undefined, moreKeys: string[]) {
    if (current && moreKeys.some(key => {
        const field = current.getField(key);
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

  getCurrentFields(fields: Field[], dataSet: DataSet) {
    return this.createFields(fields, dataSet, false);
  }

  getMoreButton(fields: Field[], dataSet: DataSet) {
    if (fields.length) {
      const moreFields = this.createFields(fields, dataSet, true);
      return (
        <Button color={ButtonColor.blue} funcType={FuncType.flat} onClick={() => this.openMore(moreFields)}>
          {$l('Table', 'advanced_search')}
        </Button>
      );
    }
  }

  createFields(fields: Field[], dataSet: DataSet, isMore: boolean) {
    const { queryFields } = this.props;
    return fields.map((field, index) => {
      const { name } = field;
      const props = {
        key: name,
        name,
        dataSet,
        autoFocus: isMore && index === 0,
        onEnterDown: this.handleFieldEnter,
        style: { width: pxToRem(isMore ? 250 : 130) },
        ...(isMore ? { label: field.get('label') } : { placeholder: field.get('label') }),
      };
      return isValidElement(queryFields[name]) ? (
        cloneElement(queryFields[name], props)
      ) : (
        cloneElement(getEditorByField(field), props)
      );
    });
  }

  openMore(children: ReactNode) {
    this.modal = Modal.open({
      title: $l('Table', 'advanced_search'),
      children: (
        <Form>
          {children}
        </Form>
      ),
      okText: $l('Table', 'query_button'),
      onOk: this.handleQuery,
      style: {
        width: pxToRem(400),
      },
      drawer: true,
    });
  }

  render() {
    const { prefixCls } = this.props;
    const buttons = this.getButtons();
    const queryBar = this.getQueryBar();
    if (buttons || queryBar) {
      const className = `${prefixCls}-toolbar`;
      return (
        <div className={className}>
          {buttons}
          {queryBar}
        </div>
      );
    }
    return null;
  }
}
