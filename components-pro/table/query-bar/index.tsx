import React, { cloneElement, Component, isValidElement, ReactElement, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { isArrayLike } from 'mobx';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { TableButtonType, TableQueryBarType } from '../enum';
import TableButtons from './TableButtons';
import Table, { Buttons, TableQueryBarHook, TableQueryBarHookProps } from '../Table';
import Button, { ButtonProps } from '../../button/Button';
import { ButtonColor, ButtonType, FuncType } from '../../button/enum';
import { DataSetStatus, FieldType } from '../../data-set/enum';
import { $l } from '../../locale-context';
import TableContext from '../TableContext';
import autobind from '../../_util/autobind';
import DataSet from '../../data-set';
import Modal from '../../modal';
import findBindFieldBy from '../../_util/findBindFieldBy';
import Column from '../Column';
import { getEditorByField } from '../utils';
import TableToolBar from './TableToolBar';
import TableFilterBar from './TableFilterBar';
import TableAdvancedQueryBar from './TableAdvancedQueryBar';
import { PaginationProps } from '../../pagination/Pagination';

export interface TableQueryBarProps {
  prefixCls?: string;
  buttons?: Buttons[];
  queryFields?: { [key: string]: ReactElement<any> };
  queryFieldsLimit?: number;
  showQueryBar?: boolean;
  pagination?: ReactElement<PaginationProps>;
  filterBarFieldName?: string;
  filterBarPlaceholder?: string;
}

@observer
export default class TableQueryBar extends Component<TableQueryBarProps> {
  static displayName = 'TableQueryBar';

  static contextType = TableContext;

  exportModal;

  exportDataSet: DataSet;

  get showQueryBar(): boolean {
    const {
      props: { showQueryBar },
      context: {
        tableStore: { queryBar },
      },
    } = this;
    return showQueryBar !== false && queryBar !== TableQueryBarType.none;
  }

  componentWillUnmount() {
    if (this.exportModal) {
      this.exportModal.close(true);
    }
  }

  @autobind
  handleButtonCreate() {
    const {
      tableStore: { dataSet },
    } = this.context;
    dataSet.create({}, 0);
  }

  @autobind
  handleButtonSubmit() {
    const {
      tableStore: { dataSet },
    } = this.context;
    dataSet.submit();
  }

  @autobind
  handleButtonDelete() {
    const {
      tableStore: { dataSet },
    } = this.context;
    dataSet.delete(dataSet.selected);
  }

  @autobind
  handleButtonRemove() {
    const {
      tableStore: { dataSet },
    } = this.context;
    dataSet.remove(dataSet.selected);
  }

  @autobind
  handleButtonReset() {
    const {
      tableStore: { dataSet },
    } = this.context;
    dataSet.reset();
  }

  @autobind
  handleQueryReset() {
    const {
      tableStore: {
        dataSet: { queryDataSet },
      },
    } = this.context;
    if (queryDataSet) {
      const { current } = queryDataSet;
      if (current) {
        current.reset();
      }
      this.handleQuery();
    }
  }

  @autobind
  handleExpandAll() {
    const { tableStore } = this.context;
    tableStore.expandAll();
  }

  @autobind
  handleCollapseAll() {
    const { tableStore } = this.context;
    tableStore.collapseAll();
  }

  @autobind
  async handleButtonExport() {
    const { tableStore } = this.context;
    const columnHeaders = await tableStore.getColumnHeaders();
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
  }

  @autobind
  handleQuery() {
    const {
      tableStore: { dataSet },
    } = this.context;
    dataSet.query();
  }

  @autobind
  handleExport() {
    const { selected } = this.exportDataSet;
    if (selected.length) {
      const {
        tableStore: { dataSet },
      } = this.context;
      dataSet.export(
        selected.reduce((columns, record) => {
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
        }, {}),
      );
    } else {
      return false;
    }
  }

  getButtonProps(type: TableButtonType): ButtonProps & { children?: ReactNode } | undefined {
    const {
      tableStore: { isTree, dataSet },
    } = this.context;
    const disabled = dataSet.parent ? !dataSet.parent.current : false;
    switch (type) {
      case TableButtonType.add:
        return {
          icon: 'playlist_add',
          onClick: this.handleButtonCreate,
          children: $l('Table', 'create_button'),
          disabled,
        };
      case TableButtonType.save:
        return {
          icon: 'save',
          onClick: this.handleButtonSubmit,
          children: $l('Table', 'save_button'),
          type: ButtonType.submit,
          disabled: dataSet.status === DataSetStatus.submitting,
        };
      case TableButtonType.delete:
        return {
          icon: 'delete',
          onClick: this.handleButtonDelete,
          children: $l('Table', 'delete_button'),
          disabled: dataSet.status === DataSetStatus.submitting || dataSet.selected.length === 0,
        };
      case TableButtonType.remove:
        return {
          icon: 'remove_circle',
          onClick: this.handleButtonRemove,
          children: $l('Table', 'remove_button'),
          disabled: dataSet.status === DataSetStatus.submitting || dataSet.selected.length === 0,
        };
      case TableButtonType.reset:
        return {
          icon: 'undo',
          onClick: this.handleButtonReset,
          children: $l('Table', 'reset_button'),
          type: ButtonType.reset,
        };
      case TableButtonType.query:
        return { icon: 'search', onClick: this.handleQuery, children: $l('Table', 'query_button') };
      case TableButtonType.export:
        return {
          icon: 'export',
          onClick: this.handleButtonExport,
          children: $l('Table', 'export_button'),
        };
      case TableButtonType.expandAll:
        return isTree
          ? {
              icon: 'add_box',
              onClick: this.handleExpandAll,
              children: $l('Table', 'expand_button'),
            }
          : undefined;
      case TableButtonType.collapseAll:
        return isTree
          ? {
              icon: 'short_text',
              onClick: this.handleCollapseAll,
              children: $l('Table', 'collapse_button'),
            }
          : undefined;
      default:
    }
  }

  getButtons(): ReactElement<ButtonProps>[] {
    const { buttons } = this.props;
    const children: ReactElement<ButtonProps>[] = [];
    if (buttons) {
      buttons.forEach(button => {
        let props = {};
        if (isArrayLike(button)) {
          props = button[1];
          button = button[0];
        }
        if (isString(button) && button in TableButtonType) {
          const defaultButtonProps = this.getButtonProps(button);
          if (defaultButtonProps) {
            children.push(
              <Button
                color={ButtonColor.primary}
                funcType={FuncType.flat}
                key={button}
                {...defaultButtonProps}
                {...props}
              />,
            );
          }
        } else if (isValidElement<ButtonProps>(button)) {
          children.push(button);
        }
      });
    }
    return children;
  }

  getQueryFields(): ReactElement<any>[] {
    const {
      context: {
        tableStore: { dataSet },
      },
      props: { queryFields },
    } = this;
    const { queryDataSet } = dataSet;
    const result: ReactElement<any>[] = [];
    if (queryDataSet) {
      const { fields } = queryDataSet;
      return [...fields.entries()].reduce((list, [name, field]) => {
        if (!field.get('bind')) {
          const props: any = {
            key: name,
            name,
            dataSet: queryDataSet,
          };
          const element = queryFields![name];
          list.push(
            isValidElement(element)
              ? cloneElement(element, props)
              : cloneElement(getEditorByField(field), {
                  ...props,
                  ...(isObject(element) ? element : {}),
                }),
          );
        }
        return list;
      }, result);
    }
    return result;
  }

  renderToolBar(props: TableQueryBarHookProps) {
    const { prefixCls } = this.props;
    return <TableToolBar key="toolbar" prefixCls={prefixCls} {...props} />;
  }

  renderFilterBar(props: TableQueryBarHookProps) {
    const {
      props: { prefixCls, filterBarFieldName, filterBarPlaceholder },
    } = this;
    return (
      <TableFilterBar
        key="toolbar"
        prefixCls={prefixCls}
        paramName={filterBarFieldName!}
        placeholder={filterBarPlaceholder}
        {...props}
      />
    );
  }

  renderAdvancedQueryBar(props: TableQueryBarHookProps) {
    const { prefixCls } = this.props;
    return <TableAdvancedQueryBar key="toolbar" prefixCls={prefixCls} {...props} />;
  }

  render() {
    const buttons = this.getButtons();
    const {
      context: {
        tableStore: { dataSet, queryBar },
      },
      props: { queryFieldsLimit, prefixCls, pagination },
      showQueryBar,
    } = this;
    if (showQueryBar) {
      const { queryDataSet } = dataSet;
      const queryFields = this.getQueryFields();
      const props: TableQueryBarHookProps = {
        dataSet,
        queryDataSet,
        buttons,
        pagination,
        queryFields,
        queryFieldsLimit: queryFieldsLimit!,
      };
      if (typeof queryBar === 'function') {
        return (queryBar as TableQueryBarHook)(props);
      }
      switch (queryBar) {
        case TableQueryBarType.normal:
          return this.renderToolBar(props);
        case TableQueryBarType.bar:
          return this.renderFilterBar(props);
        case TableQueryBarType.advancedBar:
          return this.renderAdvancedQueryBar(props);
        default:
      }
    }
    return [<TableButtons key="toolbar" prefixCls={prefixCls} buttons={buttons} />, pagination];
  }
}
