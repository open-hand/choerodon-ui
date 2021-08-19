import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { action } from 'mobx';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { getConfig } from 'choerodon-ui/lib/configure';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Table, { TableProps } from '../table/Table';
import TableProfessionalBar from '../table/query-bar/TableProfessionalBar';
import { SelectionMode, TableMode, TableQueryBarType } from '../table/enum';
import { DataSetSelection } from '../data-set/enum';
import { LovConfig } from './Lov';
import { ColumnProps } from '../table/Column';

export interface LovViewProps {
  dataSet: DataSet;
  config: LovConfig;
  tableProps?: Partial<TableProps>;
  multiple: boolean;
  values: any[];
  onSelect: (records: Record | Record[]) => void;
  modal?: { close: Function, handleOk: Function }
}

export default class LovView extends Component<LovViewProps> {
  static propTypes = {
    dataSet: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    tableProps: PropTypes.object,
    onSelect: PropTypes.func.isRequired,
  };

  selection: DataSetSelection | false;

  selectionMode: SelectionMode | undefined;

  @action
  componentWillMount() {
    const {
      dataSet,
      dataSet: { selection },
      multiple,
    } = this.props;
    this.selection = selection;
    dataSet.selection = multiple ? DataSetSelection.multiple : DataSetSelection.single;
  }

  @action
  componentWillUnmount() {
    const { dataSet } = this.props;
    dataSet.selection = this.selection;
  }

  /* istanbul ignore next */
  getColumns(): ColumnProps[] | undefined {
    const {
      config: { lovItems },
      tableProps,
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
            width: gridFieldWidth,
            align: gridFieldAlign,
            editor: false,
          };
        })
      : undefined;
  }

  handleSelect = () => {
    const { selectionMode } = this;
    const { onSelect, modal, multiple, dataSet } = this.props;
    const records: Record[] = selectionMode === SelectionMode.treebox ?
      dataSet.treeSelected : (selectionMode === SelectionMode.rowbox || multiple) ?
        dataSet.selected : dataSet.current ? [dataSet.current] : [];
    const record: Record | Record[] | undefined = multiple ? records : records[0];
    if (record) {
      onSelect(record);
      if (modal) {
        modal.close();
      }
    }
    return false;
  };

  /* istanbul ignore next */
  handleKeyDown = e => {
    if (e.keyCode === KeyCode.ENTER) {
      this.handleSelect();
    }
  };

  /**
   * 单选 onRow 处理
   * @param props
   */
  handleRow = (props) => {
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
  };

  getQueryBar() {
    const {
      config: { queryBar },
      tableProps,
    } = this.props;
    if (queryBar) {
      return queryBar;
    }
    if (tableProps && tableProps.queryBar) {
      return tableProps.queryBar;
    }
  };

  render() {
    const {
      dataSet,
      config: { height, treeFlag, queryColumns, tableProps: configTableProps },
      multiple,
      tableProps,
      modal,
    } = this.props;
    if (modal) {
      modal.handleOk(this.handleSelect);
    }
    const lovTableProps: TableProps = {
      customizable: getConfig('lovTableCustomizable'),
      autoFocus: true,
      mode: treeFlag === 'Y' ? TableMode.tree : TableMode.list,
      onKeyDown: this.handleKeyDown,
      dataSet,
      columns: this.getColumns(),
      queryFieldsLimit: queryColumns,
      queryBar: this.getQueryBar(),
      selectionMode: SelectionMode.none,
      ...configTableProps,
      ...tableProps,
      className: classNames(configTableProps && configTableProps.className, tableProps && tableProps.className),
      style: {
        ...(configTableProps && configTableProps.style),
        height,
        ...(tableProps && tableProps.style),
      },
    };
    if (multiple) {
      if (!tableProps || !tableProps.selectionMode) {
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
    } else if (lovTableProps.selectionMode !== SelectionMode.rowbox) {
      lovTableProps.onRow = this.handleRow;
    } else {
      lovTableProps.highLightRow = false;
      lovTableProps.selectedHighLightRow = true;
    }

    const isProfessionalBar = getConfig('queryBar') === TableQueryBarType.professionalBar;
    if (!lovTableProps.queryBar && isProfessionalBar) {
      lovTableProps.queryBar = (props) => <TableProfessionalBar {...props} queryBarProps={{ labelWidth: 80 }} />;
    }

    this.selectionMode = lovTableProps.selectionMode;

    return <Table {...lovTableProps} />;
  }
}
