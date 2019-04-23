import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DataSet from '../data-set/DataSet';
import Table, { TableProps } from '../table/Table';
import { SelectionMode, TableMode } from '../table/enum';
import { DataSetSelection } from '../data-set/enum';
import { action } from 'mobx';
import { LovConfig } from './Lov';
import { ColumnProps } from '../table/Column';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';

export interface LovViewProps {
  dataSet: DataSet;
  config: LovConfig;
  multiple: boolean;
  values: any[];
  onDoubleClick: () => void;
  onEnterDown: () => void;
}

export default class LovView extends Component<LovViewProps> {

  static propTypes = {
    dataSet: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    onDoubleClick: PropTypes.func.isRequired,
    onEnterDown: PropTypes.func.isRequired,
  };

  selection: DataSetSelection | false;

  @action
  componentWillMount() {
    const { dataSet, dataSet: { selection }, multiple } = this.props;
    this.selection = selection;
    dataSet.selection = multiple ? DataSetSelection.multiple : DataSetSelection.single;
  }

  @action
  componentWillUnmount() {
    this.props.dataSet.selection = this.selection;
  }

  getColumns(): ColumnProps[] | undefined {
    const { lovItems } = this.props.config;
    return lovItems ? lovItems
      .filter(({ gridField }) => gridField === 'Y')
      .sort(({ gridFieldSequence: seq1 }, { gridFieldSequence: seq2 }) => seq1 - seq2)
      .map<ColumnProps>(({ display, gridFieldName, gridFieldWidth, gridFieldAlign }) => ({
        key: gridFieldName,
        header: display,
        name: gridFieldName,
        width: gridFieldWidth,
        align: gridFieldAlign,
      })) : void 0;
  }

  handleKeyDown = (e) => {
    if (e.keyCode === KeyCode.ENTER) {
      const { onEnterDown } = this.props;
      onEnterDown();
    }
  };

  handleRow = () => {
    return {
      onDoubleClick: this.props.onDoubleClick,
    };
  };

  render() {
    const { dataSet, config: { height, treeFlag, queryColumns }, multiple } = this.props;
    const tableProps: TableProps = {
      autoFocus: true,
      mode: treeFlag === 'Y' ? TableMode.tree : TableMode.list,
      onKeyDown: this.handleKeyDown,
      dataSet,
      columns: this.getColumns(),
      queryFieldsLimit: queryColumns,
    };
    if (multiple) {
      tableProps.selectionMode = SelectionMode.rowbox;
    } else {
      tableProps.selectionMode = SelectionMode.none;
      tableProps.onRow = this.handleRow;
    }
    if (height) {
      tableProps.style = { height };
    }
    return <Table {...tableProps} />;
  }
}
