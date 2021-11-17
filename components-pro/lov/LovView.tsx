import React, { Component, Key } from 'react';
import classNames from 'classnames';
import { action, toJS } from 'mobx';
import noop from 'lodash/noop';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Table, { onColumnResizeProps, TableProps } from '../table/Table';
import TableProfessionalBar from '../table/query-bar/TableProfessionalBar';
import { SelectionMode, TableMode, TableQueryBarType } from '../table/enum';
import { DataSetEvents, DataSetSelection } from '../data-set/enum';
import { ColumnProps } from '../table/Column';
import { modalChildrenProps } from '../modal/interface';
import autobind from '../_util/autobind';
import { getColumnKey } from '../table/utils';
import SelectionList, { TIMESTAMP } from './SelectionList';
import { LovConfig, ViewRenderer, NodeRenderer } from './Lov';
import { FormContextValue } from '../form/FormContext';

export interface LovViewProps {
  dataSet: DataSet;
  config: LovConfig;
  context: FormContextValue;
  tableProps?: Partial<TableProps>;
  multiple: boolean;
  values: any[];
  viewMode?: string;
  onSelect: (records: Record | Record[]) => void;
  onBeforeSelect?: (records: Record | Record[]) => boolean | undefined;
  modal?: modalChildrenProps;
  popupHidden?: boolean;
  label?: string;
  valueField?: string;
  textField?: string;
  viewRenderer?: ViewRenderer;
  nodeRenderer?: NodeRenderer,
}

export default class LovView extends Component<LovViewProps> {
  static get contextType() {
    return ConfigContext;
  }

  selection: DataSetSelection | false;

  selectionMode: SelectionMode | undefined;

  resizedColumns: Map<Key, number> = new Map<Key, number>();

  @action
  componentWillMount() {
    const {
      dataSet,
      dataSet: { selection },
      multiple,
      viewMode,
    } = this.props;
    this.selection = selection;
    dataSet.selection = multiple ? DataSetSelection.multiple : DataSetSelection.single;
    if ((viewMode === 'popup' || viewMode === 'drawer') && multiple) {
      dataSet.addEventListener(DataSetEvents.batchSelect, this.handleSelect);
      dataSet.addEventListener(DataSetEvents.batchUnSelect, this.handleSelect);
    }
  }

  @action
  componentWillUnmount() {
    const { dataSet, multiple, viewMode } = this.props;
    dataSet.selection = this.selection;
    if ((viewMode === 'popup' || viewMode === 'drawer') && multiple) {
      dataSet.removeEventListener(DataSetEvents.batchSelect, this.handleSelect);
      dataSet.removeEventListener(DataSetEvents.batchUnSelect, this.handleSelect);
    }
  }

  shouldComponentUpdate(nextProps: Readonly<LovViewProps>): boolean {
    const { viewMode } = this.props;
    if (viewMode === 'popup' && nextProps.popupHidden) {
      return false;
    }
    return true;
  }

  /* istanbul ignore next */
  getColumns(): ColumnProps[] | undefined {
    const {
      config: { lovItems },
      tableProps,
      viewMode,
    } = this.props;
    return lovItems
      ? lovItems
        .filter(({ gridField }) => gridField === 'Y')
        .sort(({ gridFieldSequence: seq1 }, { gridFieldSequence: seq2 }) => seq1 - seq2)
        .map<ColumnProps>(({ display, gridFieldName, gridFieldWidth, gridFieldAlign }) => {
          let column: ColumnProps | undefined = {};
          if (tableProps && tableProps.columns) {
            column = tableProps.columns.find(c => c.name === gridFieldName);
          }
          return {
            ...column,
            key: gridFieldName,
            header: display,
            name: gridFieldName,
            width: viewMode === 'popup' ? gridFieldName ? this.resizedColumns.get(gridFieldName) : undefined : gridFieldWidth,
            align: gridFieldAlign,
            editor: false,
          };
        })
      : undefined;
  }

  @autobind
  handleSelect(event?: React.MouseEvent | string) {
    const { selectionMode } = this;
    const {
      onSelect,
      onBeforeSelect = noop,
      modal,
      multiple,
      dataSet,
      tableProps,
      viewMode,
      config: { treeFlag },
    } = this.props;
    // 为了drawer模式下右侧勾选项的顺序
    if (viewMode === 'drawer' && multiple) {
      dataSet.map(item => {
        const timeStampState = item.getState(TIMESTAMP);
        if (!item.isSelected && timeStampState) {
          item.setState(TIMESTAMP, 0);
        }
        if (item.isSelected && !timeStampState) {
          const timestamp = new Date().getTime();
          item.setState(TIMESTAMP, timestamp);
        }
        return item;
      });
    }
    let records: Record[] = treeFlag === 'Y' && multiple ?
      dataSet.treeSelected : (selectionMode === SelectionMode.rowbox || multiple) ?
        dataSet.selected : dataSet.current ? [dataSet.current] : [];
    // 满足单选模式下，双击和勾选框选中均支持
    if (tableProps && tableProps.alwaysShowRowBox && !event) {
      records = dataSet.selected;
    }
    const record: Record | Record[] | undefined = multiple ? records : records[0];
    if (record && onBeforeSelect(record) !== false) {
      if (modal && (!multiple || event === 'close')) {
        modal.close();
      }
      if (!multiple || viewMode === 'popup' || event === 'close') {
        onSelect(record);
      }
    }
    return false;
  }

  /* istanbul ignore next */
  @autobind
  handleKeyDown(e) {
    if (e.keyCode === KeyCode.ENTER) {
      this.handleSelect();
    }
  }

  /**
   * 单选 onRow 处理
   * @param props
   */
  @autobind
  handleRow(props) {
    const { tableProps } = this.props;
    if (tableProps) {
      const { onRow } = tableProps;
      if (onRow) {
        return {
          onDoubleClick: this.handleSelect,
          ...onRow(props),
        };
      }
    }
    return {
      onDoubleClick: this.handleSelect,
    };
  }

  @autobind
  handleSingleRow() {
    return {
      onClick: this.handleSelect,
    };
  }

  @autobind
  handleColumnResize(props: onColumnResizeProps) {
    const { width, column } = props;
    this.resizedColumns.set(getColumnKey(column), width);
  }

  renderTable() {
    const {
      dataSet,
      config: { queryBar, height, treeFlag, queryColumns, tableProps: configTableProps = {} },
      multiple,
      tableProps,
      viewMode,
      context,
    } = this.props;
    const { getConfig } = context;
    const columns = this.getColumns();
    const popup = viewMode === 'popup';
    const lovTableProps: TableProps = {
      autoFocus: true,
      mode: treeFlag === 'Y' ? TableMode.tree : TableMode.list,
      onKeyDown: this.handleKeyDown,
      dataSet,
      columns,
      queryFieldsLimit: queryColumns,
      queryBar: queryBar || getConfig('lovQueryBar') || getConfig('queryBar'),
      selectionMode: SelectionMode.none,
      ...configTableProps,
      ...tableProps,
      className: classNames(configTableProps && configTableProps.className, tableProps && tableProps.className),
      style: {
        ...(configTableProps && configTableProps.style),
        height,
        ...(tableProps && tableProps.style),
      },
      queryBarProps: {
        ...(tableProps && tableProps.queryBarProps),
        ...getConfig('lovQueryBarProps'),
      },
    };
    if (multiple) {
      if (popup || !tableProps || !tableProps.selectionMode) {
        if (lovTableProps.mode === TableMode.tree) {
          lovTableProps.selectionMode = SelectionMode.treebox;
        } else {
          lovTableProps.selectionMode = SelectionMode.rowbox;
        }
      }
      if (lovTableProps.selectionMode !== SelectionMode.rowbox && lovTableProps.selectionMode !== SelectionMode.treebox) {
        lovTableProps.highLightRow = false;
        lovTableProps.selectedHighLightRow = true;
      }
    } else if (popup) {
      lovTableProps.onRow = this.handleSingleRow;
    } else if (lovTableProps.selectionMode !== SelectionMode.rowbox) {
      lovTableProps.onRow = this.handleRow;
    } else {
      lovTableProps.highLightRow = false;
      lovTableProps.selectedHighLightRow = true;
    }
    if (popup) {
      if (lovTableProps.showSelectionCachedButton === undefined) {
        lovTableProps.showSelectionCachedButton = false;
        lovTableProps.showCachedSelection = true;
      }
      lovTableProps.autoWidth = true;
      lovTableProps.onColumnResize = this.handleColumnResize;
    }

    const isProfessionalBar = lovTableProps.queryBar === TableQueryBarType.professionalBar;
    if (!popup && !lovTableProps.queryBar && isProfessionalBar) {
      lovTableProps.queryBar = (props) => <TableProfessionalBar {...props} />;
    }
    this.selectionMode = lovTableProps.selectionMode;
    return <Table {...lovTableProps} />;
  }

  renderSelectionList() {
    const {
      dataSet,
      label = '',
      valueField = '',
      textField = '',
      nodeRenderer,
      config: { treeFlag },
    } = this.props;
    return (
      <SelectionList
        dataSet={dataSet}
        treeFlag={treeFlag}
        valueField={valueField}
        textField={textField}
        label={label}
        nodeRenderer={nodeRenderer}
      />
    );
  }

  render() {
    const {
      modal,
      viewRenderer,
      dataSet,
      viewMode,
      config: lovConfig,
      textField,
      valueField,
      label,
      multiple,
    } = this.props;
    if (modal) {
      modal.handleOk(() => this.handleSelect('close'));
    }
    return (
      <>
        {viewMode === 'drawer' && this.renderSelectionList()}
        <div>
          {viewRenderer
            ? toJS(
              viewRenderer({
                dataSet,
                lovConfig,
                textField,
                valueField,
                label,
                multiple,
              }),
            )
            : this.renderTable()}
        </div>
      </>
    );
  }
}
