import React, { Component, Key } from 'react';
import classNames from 'classnames';
import { action } from 'mobx';
import noop from 'lodash/noop';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { getConfig } from 'choerodon-ui/lib/configure';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Table, { onColumnResizeProps, TableProps } from '../table/Table';
import TableProfessionalBar from '../table/query-bar/TableProfessionalBar';
import { SelectionMode, TableMode, TableQueryBarType } from '../table/enum';
import { DataSetEvents, DataSetSelection } from '../data-set/enum';
import { LovConfig } from './Lov';
import { ColumnProps } from '../table/Column';
import { modalChildrenProps } from '../modal/interface';
import autobind from '../_util/autobind';
import { getColumnKey } from '../table/utils';

export interface LovViewProps {
  dataSet: DataSet;
  config: LovConfig;
  tableProps?: Partial<TableProps>;
  multiple: boolean;
  values: any[];
  popup?: boolean;
  onSelect: (records: Record | Record[]) => void;
  onBeforeSelect?: (records: Record | Record[]) => boolean | undefined;
  modal?: modalChildrenProps;
  popupHidden?: boolean;
}

export default class LovView extends Component<LovViewProps> {
  selection: DataSetSelection | false;

  selectionMode: SelectionMode | undefined;

  resizedColumns: Map<Key, number> = new Map<Key, number>();

  @action
  componentWillMount() {
    const {
      dataSet,
      dataSet: { selection },
      multiple,
      popup,
    } = this.props;
    this.selection = selection;
    dataSet.selection = multiple ? DataSetSelection.multiple : DataSetSelection.single;
    if (popup && multiple) {
      dataSet.addEventListener(DataSetEvents.batchSelect, this.handleSelect);
      dataSet.addEventListener(DataSetEvents.batchUnSelect, this.handleSelect);
    }
  }

  @action
  componentWillUnmount() {
    const { dataSet, multiple, popup } = this.props;
    dataSet.selection = this.selection;
    if (popup && multiple) {
      dataSet.removeEventListener(DataSetEvents.batchSelect, this.handleSelect);
      dataSet.removeEventListener(DataSetEvents.batchUnSelect, this.handleSelect);
    }
  }

  shouldComponentUpdate(nextProps: Readonly<LovViewProps>): boolean {
    const { popup } = this.props;
    if (popup && nextProps.popupHidden) {
      return false;
    }
    return true;
  }

  /* istanbul ignore next */
  getColumns(): ColumnProps[] | undefined {
    const {
      config: { lovItems },
      tableProps,
      popup,
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
            width: popup ? gridFieldName ? this.resizedColumns.get(gridFieldName) : undefined : gridFieldWidth,
            align: gridFieldAlign,
            editor: false,
          };
        })
      : undefined;
  }

  @autobind
  handleSelect(event?: React.MouseEvent) {
    const { selectionMode } = this;
    const { onSelect, onBeforeSelect = noop, modal, multiple, dataSet, tableProps } = this.props;
    let records: Record[] = selectionMode === SelectionMode.treebox ?
      dataSet.treeSelected : (selectionMode === SelectionMode.rowbox || multiple) ?
        dataSet.selected : dataSet.current ? [dataSet.current] : [];
    // 满足单选模式下，双击和勾选框选中均支持
    if (tableProps && tableProps.alwaysShowRowBox && !event) {
      records = dataSet.selected;
    }
    const record: Record | Record[] | undefined = multiple ? records : records[0];
    if (record && onBeforeSelect(record) !== false) {
      if (modal) {
        modal.close();
      }
      onSelect(record);
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
  };

  @autobind
  handleColumnResize(props: onColumnResizeProps) {
    const { width, column } = props;
    this.resizedColumns.set(getColumnKey(column), width);
  }

  render() {
    const {
      dataSet,
      config: { queryBar, height, treeFlag, queryColumns, tableProps: configTableProps },
      multiple,
      popup,
      tableProps,
      modal,
    } = this.props;
    if (modal) {
      modal.handleOk(this.handleSelect);
    }
    const columns = this.getColumns();
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
}
