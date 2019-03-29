import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DataSet from '../data-set/DataSet';
import Table, { TableProps } from '../table/Table';
import { SelectionMode, TableMode } from '../table/enum';
import { DataSetSelection } from '../data-set/enum';
import { action } from 'mobx';
import { LovConfig } from '../stores/LovCodeStore';
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

  getColumns() {
    const { lovItems } = this.props.config;
    return lovItems.reduce((columns, { display, gridField, gridFieldName, gridFieldWidth, gridFieldAlign }) => (
      gridField === 'Y' && columns.push(
        {
          key: gridFieldName,
          header: display,
          name: gridFieldName,
          width: gridFieldWidth,
          align: gridFieldAlign,
        },
      ),
        columns
    ), [] as ColumnProps[]);
  }

  handleKeyDown = (e) => {
    if (e.keyCode === KeyCode.ENTER) {
      const { onEnterDown } = this.props;
      onEnterDown();
    }
  };

  rowRenderer = () => {
    return {
      onDoubleClick: this.props.onDoubleClick,
    };
  };

  render() {
    const { dataSet, config: { height, treeFlag }, multiple } = this.props;
    const tableProps: TableProps = {
      autoFocus: true,
      mode: treeFlag === 'Y' ? TableMode.tree : TableMode.list,
      onKeyDown: this.handleKeyDown,
      dataSet,
      columns: this.getColumns(),
      queryFieldsLimit: 2,
    };
    if (multiple) {
      tableProps.selectionMode = SelectionMode.rowbox;
    } else {
      tableProps.selectionMode = SelectionMode.none;
      tableProps.rowRenderer = this.rowRenderer;
    }
    if (height) {
      tableProps.style = { height };
    }
    return <Table {...tableProps} />;
  }
}
