import React, { Component, Key } from 'react';
import classNames from 'classnames';
import { action, toJS } from 'mobx';
import isPromise from 'is-promise';
import noop from 'lodash/noop';
import debounce from 'lodash/debounce';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { math } from 'choerodon-ui/dataset';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Table, { onColumnResizeProps, TableProps, TableQueryBarHookCustomProps } from '../table/Table';
import TableProfessionalBar from '../table/query-bar/TableProfessionalBar';
import { SelectionMode, TableMode, TableQueryBarType } from '../table/enum';
import { DataSetEvents, DataSetSelection } from '../data-set/enum';
import { ColumnProps } from '../table/Column';
import { ModalChildrenProps } from '../modal/interface';
import autobind from '../_util/autobind';
import { getColumnKey } from '../table/utils';
import SelectionList, { SelectionsPosition } from './SelectionList';
import { LovConfig, ViewRenderer, SelectionProps } from './Lov';
import { FormContextValue } from '../form/FormContext';
import { TriggerViewMode } from '../trigger-field/TriggerField';
import Picture from '../picture';
import ObserverNumberField from '../number-field';

export interface LovViewProps {
  dataSet: DataSet;
  config: LovConfig;
  context: FormContextValue;
  tableProps?: Partial<TableProps>;
  multiple: boolean;
  values: any[];
  viewMode?: TriggerViewMode;
  onSelect: (records: Record | Record[]) => void;
  onBeforeSelect?: (records: Record | Record[]) => boolean | Promise<boolean | undefined> | undefined;
  modal?: ModalChildrenProps;
  popupHidden?: boolean;
  valueField?: string;
  textField?: string;
  viewRenderer?: ViewRenderer;
  showSelectedInView?: boolean;
  getSelectionProps?: () => SelectionProps,
}

export default class LovView extends Component<LovViewProps> {
  static get contextType(): typeof ConfigContext {
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
    if (viewMode === TriggerViewMode.popup && multiple) {
      dataSet.addEventListener(DataSetEvents.batchSelect, this.handleSelect);
      dataSet.addEventListener(DataSetEvents.batchUnSelect, this.handleSelect);
    }
  }

  @action
  componentWillUnmount() {
    const { dataSet, multiple, viewMode } = this.props;
    dataSet.selection = this.selection;
    if (viewMode === TriggerViewMode.popup && multiple) {
      dataSet.removeEventListener(DataSetEvents.batchSelect, this.handleSelect);
      dataSet.removeEventListener(DataSetEvents.batchUnSelect, this.handleSelect);
    }
  }

  shouldComponentUpdate(nextProps: Readonly<LovViewProps>): boolean {
    const { viewMode } = this.props;
    if (viewMode === TriggerViewMode.popup && nextProps.popupHidden) {
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
        .map<ColumnProps>(({ display, gridFieldName, gridFieldWidth, gridFieldAlign, gridFieldType }) => {
          let column: ColumnProps | undefined = {};
          if (tableProps && tableProps.columns) {
            column = tableProps.columns.find(c => c.name === gridFieldName);
          }
          // 渲染 lov 中的 超链接 和 图片类型字段
          column = column || {};
          if (gridFieldType && gridFieldType.toLowerCase() === 'href') {
            column.renderer = ({ value }) => (
              value ? (
                <a
                  href={value}
                  title={value}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {value}
                </a>
              ) : undefined
            );
          }
          else if (gridFieldType && gridFieldType.toLowerCase() === 'picture') {
            column.renderer = ({ value }) => (
              value ? <Picture src={value} objectFit="contain" height={"inherit" as any} block={false} /> : undefined
            );
          } else if (gridFieldType && gridFieldType.toLowerCase() === 'percent') {
            column.renderer = ({ value }) => (
              value ? `${math.multipliedBy(value, 100)}%` : value
            );
          }
          return {
            ...column,
            key: gridFieldName,
            header: display,
            name: gridFieldName,
            width: viewMode === TriggerViewMode.popup ? gridFieldName ? this.resizedColumns.get(gridFieldName) : undefined : gridFieldWidth,
            align: gridFieldAlign,
            editor: false,
          };
        })
      : undefined;
  }

  closeModal(record: Record | Record[] | undefined) {
    if (record) {
      const { onSelect, modal } = this.props;
      if (modal) {
        modal.close();
      }
      onSelect(record);
    }
  }

  handleSelect = debounce((event?: React.MouseEvent) => {
    const { selectionMode } = this;
    const {
      onBeforeSelect = noop,
      multiple,
      dataSet,
      tableProps,
    } = this.props;
    let records: Record[] = selectionMode === SelectionMode.treebox ?
      dataSet.treeSelected : (selectionMode === SelectionMode.rowbox || multiple) ?
        dataSet.selected : dataSet.current ? [dataSet.current] : [];
    // 满足单选模式下，双击和勾选框选中均支持
    if (tableProps && tableProps.alwaysShowRowBox && !event) {
      records = dataSet.selected;
    }
    if (!multiple && records[0].disabled) {
      return false;
    }
    const record: Record | Record[] | undefined = multiple ? records : records[0];
    const beforeSelect = onBeforeSelect(record);
    if (isPromise(beforeSelect)) {
      return beforeSelect.then(result => {
        if (result !== false) {
          this.closeModal(record);
        }
      });
    }
    if (beforeSelect !== false) {
      this.closeModal(record);
    }
    return false;
  }, 300)

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
  handleSingleRow(props) {
    const { tableProps } = this.props;
    if (tableProps) {
      const { onRow } = tableProps;
      if (onRow) {
        return {
          onClick: this.handleSelect,
          ...onRow(props),
        };
      }
    }
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
      config: { queryBar, height, treeFlag, queryColumns, tableProps: configTableProps = {}, lovItems },
      multiple,
      tableProps,
      viewMode,
      context,
      showSelectedInView,
    } = this.props;
    const { getConfig } = context;
    const columns = this.getColumns();
    const popup = viewMode === TriggerViewMode.popup;
    const modal = viewMode === TriggerViewMode.modal;
    const drawer = viewMode === TriggerViewMode.drawer;

    const percentItems = {};
    if (lovItems) {
      lovItems.filter(x => x.gridFieldType && x.gridFieldType.toLowerCase() === 'percent' && x.conditionField === 'Y').forEach(x => {
        percentItems[x.gridFieldName!] = <ObserverNumberField suffix={<span>%</span>} />;
      });
    }

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
      queryFields: {
        ...(tableProps && tableProps.queryFields),
        ...percentItems,
      },
      className: classNames(configTableProps && configTableProps.className, tableProps && tableProps.className),
      style: {
        ...(configTableProps && configTableProps.style),
        height,
        ...(tableProps && tableProps.style),
      },
      queryBarProps: {
        ...(tableProps && tableProps.queryBarProps),
        ...(configTableProps && configTableProps.queryBarProps),
        ...getConfig('lovQueryBarProps'),
      } as TableQueryBarHookCustomProps,
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
      lovTableProps.autoFocus = false;
      lovTableProps.autoWidth = 'autoWidth' in lovTableProps ? lovTableProps.autoWidth : true;
      lovTableProps.onColumnResize = this.handleColumnResize;
    }

    const isProfessionalBar = lovTableProps.queryBar === TableQueryBarType.professionalBar;
    if (!popup && !lovTableProps.queryBar && isProfessionalBar) {
      lovTableProps.queryBar = (props) => <TableProfessionalBar {...props} />;
    }
    if ((modal || drawer) && showSelectedInView) {
      lovTableProps.showSelectionTips = false;
    }
    this.selectionMode = lovTableProps.selectionMode;
    return (
      <>
        <Table {...lovTableProps} />
        {modal && this.renderSelectionList()}
      </>
    );
  }

  renderSelectionList() {
    const {
      dataSet,
      valueField = '',
      textField = '',
      config: { treeFlag, tableProps: configTableProps },
      tableProps,
      multiple,
      viewMode,
      showSelectedInView,
      getSelectionProps,
      context,
    } = this.props;
    if (!showSelectedInView || !multiple) {
      return null;
    }

    if (!this.selectionMode) {
      const selectionMode = tableProps && tableProps.selectionMode || configTableProps && configTableProps.selectionMode;
      if (!selectionMode) {
        this.selectionMode = treeFlag === 'Y' ? SelectionMode.treebox : SelectionMode.rowbox;
      } else {
        this.selectionMode = selectionMode;
      }
    }

    const selectionsPosition = viewMode === TriggerViewMode.drawer ?
      SelectionsPosition.side :
      (viewMode === TriggerViewMode.modal ? SelectionsPosition.below : undefined);

    return (
      <SelectionList
        dataSet={dataSet}
        treeFlag={treeFlag}
        valueField={valueField}
        textField={textField}
        selectionsPosition={selectionsPosition}
        selectionProps={getSelectionProps && getSelectionProps()}
        context={context}
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
      multiple,
    } = this.props;
    if (modal) {
      modal.handleOk(this.handleSelect);
    }
    return (
      <>
        {viewMode === TriggerViewMode.drawer && this.renderSelectionList()}
        <div>
          {viewRenderer
            ? toJS(
              viewRenderer({
                dataSet,
                lovConfig,
                textField,
                valueField,
                multiple,
                modal,
              }),
            )
            : this.renderTable()}
        </div>
      </>
    );
  }
}
