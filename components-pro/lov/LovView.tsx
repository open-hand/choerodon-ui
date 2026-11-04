import React, { Component, Key, ReactNode } from 'react';
import classNames from 'classnames';
import { action, computed, toJS } from 'mobx';
import { Observer } from 'mobx-react';
import isPromise from 'is-promise';
import noop from 'lodash/noop';
import debounce from 'lodash/debounce';
import isNil from 'lodash/isNil';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import Avatar from 'choerodon-ui/lib/avatar';
import { PresetColorTypes, PresetColorType } from 'choerodon-ui/lib/_util/colors';
import { math } from 'choerodon-ui/dataset';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import Alert from 'choerodon-ui/lib/alert';
import { DuplicateKeyConfig } from 'choerodon-ui/lib/configure/interface';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Table, { onColumnResizeProps, TableProps, TableQueryBarHookCustomProps } from '../table/Table';
import TableProfessionalBar from '../table/query-bar/TableProfessionalBar';
import { SelectionMode, TableMode, TableQueryBarType } from '../table/enum';
import { DataSetEvents, DataSetSelection, DataSetStatus } from '../data-set/enum';
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
import Output from '../output';
import Pagination from '../pagination';
import Spin from '../spin';
import CheckBox from '../check-box';
import { Size, Tooltip as TextTooltip } from '../core/enum';
import { $l } from '../locale-context';
import { Lang } from '../locale-context/enum';
import { processFieldValue } from '../field/utils';

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
  showDetailWhenReadonly?: boolean;
  lang?: Lang;
  renderAddNewOptionPrompt?: (type: 'prompt' | 'noDataPrompt', renderEmptyComponent: string) => ReactNode;
  duplicateKey?: DuplicateKeyConfig;
  popupMainField?: string;
  popupShowAvatar?: boolean;
  popupAvatarColorful?: boolean;
  popupSearchField?: ReactNode;
  popupEmptyContent?: ReactNode;
  popupOptionDisabled?: (record: Record) => boolean;
}

interface LovViewState {
  dataSetLoaded: boolean;
}

export default class LovView extends Component<LovViewProps, LovViewState> {
  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  selection: DataSetSelection | false;

  selectionMode: SelectionMode | undefined;

  resizedColumns: Map<Key, number> = new Map<Key, number>();

  popupList: HTMLDivElement | null;

  constructor(props: LovViewProps) {
    super(props);
    const {
      dataSet,
      showDetailWhenReadonly,
    } = props;
    if (showDetailWhenReadonly) {
      dataSet.addEventListener(DataSetEvents.load, this.handleDataSetLoad);
    }
    this.state = {
      dataSetLoaded: dataSet.status === DataSetStatus.ready,
    };
  }

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
    const { dataSet, multiple, viewMode, showDetailWhenReadonly } = this.props;
    dataSet.selection = this.selection;
    if (viewMode === TriggerViewMode.popup && multiple) {
      dataSet.removeEventListener(DataSetEvents.batchSelect, this.handleSelect);
      dataSet.removeEventListener(DataSetEvents.batchUnSelect, this.handleSelect);
    }
    if (showDetailWhenReadonly) {
      dataSet.removeEventListener(DataSetEvents.load, this.handleDataSetLoad);
    }
  }

  @action
  componentWillReceiveProps(nextProps: LovViewProps) {
    const { dataSet: beforeDataSet, showDetailWhenReadonly } = this.props;
    if (beforeDataSet !== nextProps.dataSet) {
      const {
        dataSet,
        dataSet: { selection },
        multiple,
        viewMode,
      } = nextProps;
      this.selection = selection;
      dataSet.selection = multiple ? DataSetSelection.multiple : DataSetSelection.single;
      if (viewMode === TriggerViewMode.popup && multiple) {
        dataSet.addEventListener(DataSetEvents.batchSelect, this.handleSelect);
        dataSet.addEventListener(DataSetEvents.batchUnSelect, this.handleSelect);
      }
      if (showDetailWhenReadonly) {
        dataSet.addEventListener(DataSetEvents.load, this.handleDataSetLoad);
      }
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
    return LovView.getLovColumns(this.props, this.resizedColumns);
  }

  static getLovColumns(
    props: Pick<LovViewProps, 'config' | 'tableProps' | 'viewMode' | 'context' | 'lang'>,
    resizedColumns: Map<Key, number> = new Map<Key, number>(),
  ): ColumnProps[] | undefined {
    const {
      config: { lovItems },
      tableProps,
      viewMode,
      context,
      lang,
    } = props;
    const { getConfig } = context;
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
            column.renderer = ({ value, name, record, dataSet }) => {
              if (isNil(value)) {
                return value;
              }
              const percentValue = math.multipliedBy(value, 100);
              if (dataSet) {
                const field = dataSet.getField(name);
                const processValue = processFieldValue(percentValue, field, {
                  getProp: (propName) => field && field.get(propName, record!),
                  lang,
                }, true, record!, getConfig);
                return `${processValue}%`;
              }
              return `${percentValue}%`;
            };
          }
          return {
            ...column,
            key: gridFieldName,
            header: display,
            name: gridFieldName,
            width: viewMode === TriggerViewMode.popup ? gridFieldName ? resizedColumns.get(gridFieldName) : undefined : gridFieldWidth,
            align: gridFieldAlign,
            editor: false,
          };
        })
      : undefined;
  }

  handleDataSetLoad = () => {
    const { showDetailWhenReadonly } = this.props;
    if (showDetailWhenReadonly) {
      this.setState({
        dataSetLoaded: true,
      });
    }
  }

  @computed
  get duplicateRecords(): Set<Record> {
    const { dataSet: { records }, valueField } = this.props;
    const firstRecordByValue = new Map<unknown, Record>();
    const duplicateRecords = new Set<Record>();
    if (valueField) {
      records.forEach(record => {
        const value = record.get(valueField);
        const firstRecord = firstRecordByValue.get(value);
        if (firstRecord) {
          duplicateRecords.add(firstRecord);
          duplicateRecords.add(record);
        } else {
          firstRecordByValue.set(value, record);
        }
      });
    }
    return duplicateRecords;
  }

  isDuplicateRecord(record: Record): boolean {
    const { duplicateKey = {} } = this.props;
    return !!duplicateKey.disable && this.duplicateRecords.has(record);
  }

  closeModal(record: Record | Record[] | undefined, closeModal?: boolean) {
    if (record) {
      const { onSelect, modal } = this.props;
      if (modal && closeModal) {
        modal.close();
      }
      onSelect(record);
    }
  }

  handleSelect = (event?: React.MouseEvent) => {
    const { type: eventType } = event || {};
    const { selectionMode } = this;
    const {
      onBeforeSelect = noop,
      multiple,
      dataSet,
      tableProps,
      config,
      viewMode,
    } = this.props;
    // @ts-ignore
    if (config && config.originData && config.originData.failed) {
      return;
    }
    let records: Record[] = selectionMode === SelectionMode.treebox ?
      dataSet.treeSelected : (selectionMode === SelectionMode.rowbox || selectionMode === SelectionMode.dblclick || multiple) ?
        dataSet.selected : dataSet.current ? [dataSet.current] : [];
    records = records.filter(record => !this.isDuplicateRecord(record));
    // 满足单选模式下，双击和勾选框选中均支持
    if (tableProps && tableProps.alwaysShowRowBox && !event && !(viewMode === TriggerViewMode.popup && !multiple)) {
      records = dataSet.selected.filter(record => !this.isDuplicateRecord(record));
    }
    const record: Record | Record[] | undefined = multiple ? records : records[0];
    if (!record || (multiple && !records.length && viewMode !== TriggerViewMode.popup)) {
      return;
    }
    const beforeSelect = onBeforeSelect(record);
    if (isPromise(beforeSelect)) {
      return beforeSelect.then(result => {
        if (result !== false) {
          this.closeModal(record, eventType === 'dblclick');
        }
        return result;
      });
    }
    if (beforeSelect !== false) {
      this.closeModal(record, eventType === 'dblclick');
      return beforeSelect;
    }
    return false;
  }

  handleDelaySelect = debounce(this.handleSelect, 300);

  /* istanbul ignore next */
  @autobind
  handleKeyDown(e) {
    if (e.keyCode === KeyCode.ENTER) {
      this.handleSelect();
    }
  }

  handleDoubleClickSelect = (e: React.MouseEvent) => {
    e.persist();
    this.handleSelect(e);
  }

  /**
   * 单选 onRow 处理
   * @param props
   */
  @autobind
  handleRow(props) {
    const { tableProps } = this.props;
    const { record: { disabled, selectable } } = props;
    const isDisabled = disabled || !selectable || this.isDuplicateRecord(props.record);
    if (tableProps) {
      const { onRow } = tableProps;
      if (onRow) {
        return {
          onDoubleClick: !isDisabled ? this.handleDoubleClickSelect : noop,
          ...onRow(props),
        };
      }
    }
    return {
      onDoubleClick: !isDisabled ? this.handleDoubleClickSelect : noop,
    };
  }

  @autobind
  handleSingleRow(props) {
    const { tableProps } = this.props;
    const { record: { disabled, selectable } } = props;
    const isDisabled = disabled || !selectable || this.isDuplicateRecord(props.record);
    if (tableProps) {
      const { onRow } = tableProps;
      if (onRow) {
        return {
          onClick: !isDisabled ? this.handleDelaySelect : noop,
          ...onRow(props),
        };
      }
    }
    return {
      onClick: !isDisabled ? this.handleDelaySelect : noop,
    };
  }

  @autobind
  handleColumnResize(props: onColumnResizeProps) {
    const { width, column } = props;
    this.resizedColumns.set(getColumnKey(column), width);
  }

  isPopupOptionDisabled(record: Record): boolean {
    const { popupOptionDisabled, config } = this.props;
    const { originData } = config as LovConfig & { originData?: { failed?: boolean } };
    return !!(record.disabled || !record.selectable || this.isDuplicateRecord(record) ||
      (popupOptionDisabled && popupOptionDisabled(record)) || (originData && originData.failed));
  }

  @action
  selectPopupRecord(record: Record, event?: React.MouseEvent) {
    if (this.isPopupOptionDisabled(record)) {
      return;
    }
    const { dataSet, multiple } = this.props;
    if (multiple) {
      if (record.isSelected) {
        dataSet.unSelect(record);
      } else {
        dataSet.select(record);
      }
      return;
    }
    this.selectionMode = SelectionMode.none;
    dataSet.current = record;
    return this.handleSelect(event);
  }

  handlePopupListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const { dataSet } = this.props;
    const { keyCode } = event;
    const target = event.target as HTMLElement;
    if (keyCode === KeyCode.ENTER && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      event.stopPropagation();
      return;
    }
    const records = dataSet.records.filter(record => !this.isPopupOptionDisabled(record));
    if (![KeyCode.UP, KeyCode.DOWN, KeyCode.HOME, KeyCode.END, KeyCode.ENTER].includes(keyCode) || !records.length) {
      return;
    }
    if ((target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
      (keyCode === KeyCode.HOME || keyCode === KeyCode.END)) {
      return;
    }
    if (target.closest('[data-lov-pagination]')) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (keyCode === KeyCode.ENTER) {
      const record = dataSet.current;
      if (record && !this.isPopupOptionDisabled(record)) {
        const option = this.popupList && this.popupList.querySelector<HTMLElement>(`[data-record-id="${record.id}"]`);
        if (option) {
          option.click();
        }
      }
      return;
    }
    const currentIndex = records.indexOf(dataSet.current!);
    const index = keyCode === KeyCode.HOME ? 0 : keyCode === KeyCode.END ? records.length - 1 :
      keyCode === KeyCode.UP ? Math.max(currentIndex - 1, 0) : Math.min(currentIndex + 1, records.length - 1);
    this.focusPopupRecord(records[index]);
  }

  @action
  focusPopupRecord(record: Record) {
    const { dataSet } = this.props;
    dataSet.current = record;
    const option = this.popupList && this.popupList.querySelector<HTMLElement>(`[data-record-id="${record.id}"]`);
    if (option) {
      option.scrollIntoView({ block: 'nearest' });
    }
  }

  renderPopupList() {
    const {
      dataSet, config, tableProps = {}, popupMainField, textField, popupShowAvatar, popupAvatarColorful, multiple,
      popupSearchField, popupEmptyContent, renderAddNewOptionPrompt, context, values, valueField: propValueField, lang,
    } = this.props;
    const configTableProps = config.tableProps || {};
    const mergedTableProps = { ...configTableProps, ...tableProps };
    const mainField = popupMainField || textField || config.textField || '';
    const columns = (this.getColumns() || []).map(column => ({
      ...column,
      ...((configTableProps.columns || []).find(item => item.name === column.name)),
      ...((tableProps.columns || []).find(item => item.name === column.name)),
    }));
    const secondaryColumns = columns.filter(column => column.name && !column.hidden && column.name !== mainField);
    const prefix = `${context.getProPrefixCls('select')}-lov-popup-list`;
    const { pagination: configPagination } = configTableProps;
    const { pagination: tablePagination } = tableProps;
    const pagination = tablePagination === undefined ? configPagination : tablePagination;
    const paginationProps = { ...(configPagination || {}), ...(tablePagination || {}) };
    const valueField = propValueField || config.valueField;
    this.selectionMode = SelectionMode.none;
    let emptyContent: ReactNode = popupEmptyContent;
    if (emptyContent === undefined) {
      emptyContent = mergedTableProps.renderEmpty ? mergedTableProps.renderEmpty() :
        renderAddNewOptionPrompt && dataSet.status !== DataSetStatus.loading ? renderAddNewOptionPrompt('noDataPrompt', 'Table') :
          context.getConfig('renderEmpty')('Table');
    }
    const renderField = (record: Record, name: string, rowIndex: number) => {
      const column = columns.find(item => item.name === name);
      return (
        <Output
          record={record}
          name={name}
          lang={lang}
          tooltip={TextTooltip.overflow}
          renderer={column && column.renderer ? props => column.renderer!({ ...props, rowIndex }) : undefined}
        />
      );
    };
    return (
      <div className={prefix} onKeyDown={this.handlePopupListKeyDown}>
        {popupSearchField}
        <Spin dataSet={dataSet}>
          <div className={`${prefix}-options`} role="listbox" aria-multiselectable={multiple} tabIndex={0} ref={node => { this.popupList = node; }}>
            {dataSet.length ? dataSet.records.map((record, index) => {
              const rowProps: React.HTMLAttributes<HTMLDivElement> = mergedTableProps.onRow ? mergedTableProps.onRow({ dataSet, record, expandedRow: false, index }) : {};
              const disabled = this.isPopupOptionDisabled(record);
              const visibleSecondaryColumns = secondaryColumns.filter(column => {
                const value = record.get(column.name!);
                return !isNil(value) && !(typeof value === 'string' && value.trim() === '') &&
                  !(Array.isArray(value) && value.length === 0);
              });
              const selected = multiple ? record.isSelected : record.isSelected || values.some(value => valueField && (
                value && typeof value === 'object' ? value[valueField] === record.get(valueField) : value === record.get(valueField)
              ));
              const avatarText = Array.from(String(isNil(record.get(mainField)) ? '' : record.get(mainField)))[0];
              let avatarColor: PresetColorType | undefined;
              if (popupShowAvatar && popupAvatarColorful) {
                const avatarKey = String(valueField && !isNil(record.get(valueField)) ? record.get(valueField) : record.get(mainField) || '');
                let hash = 0;
                for (let i = 0; i < avatarKey.length; i += 1) {
                  // 保留哈希计算的 32 位有符号整数截断。
                  // eslint-disable-next-line no-bitwise
                  hash = (hash * 31 + avatarKey.charCodeAt(i)) | 0;
                }
                const avatarColors = PresetColorTypes.filter(color => color !== 'dark' && color !== 'gray');
                avatarColor = avatarColors[Math.abs(hash) % avatarColors.length];
              }
              const checkbox = multiple && (
                <span className={`${prefix}-checkbox`}>
                  <CheckBox
                    checked={record.isSelected}
                    disabled={disabled}
                    onClick={event => event.stopPropagation()}
                    onChange={() => this.selectPopupRecord(record)}
                  />
                </span>
              );
              return (
                <div
                  {...rowProps}
                  key={record.key}
                  data-record-id={record.id}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={disabled}
                  tabIndex={-1}
                  className={classNames(`${prefix}-option`, rowProps.className, {
                    [`${prefix}-option-selected`]: selected,
                    [`${prefix}-option-disabled`]: disabled,
                    [`${prefix}-option-active`]: dataSet.current === record,
                  })}
                  onMouseDown={event => {
                    event.preventDefault();
                    if (rowProps.onMouseDown) {
                      rowProps.onMouseDown(event);
                    }
                  }}
                  onFocus={action(event => {
                    if (!disabled) {
                      dataSet.current = record;
                    }
                    if (rowProps.onFocus) {
                      rowProps.onFocus(event);
                    }
                  })}
                  onClick={event => {
                    if (rowProps.onClick) {
                      rowProps.onClick(event);
                    }
                    if (!multiple && !event.defaultPrevented) {
                      this.selectPopupRecord(record, event);
                    }
                  }}
                >
                  {popupShowAvatar && checkbox}
                  {popupShowAvatar && (
                    <Avatar
                      size={Size.small}
                      shape="square"
                      className={avatarColor === undefined ? undefined : `${prefix}-avatar-color-${avatarColor}`}
                    >
                      {avatarText}
                    </Avatar>
                  )}
                  <div className={`${prefix}-content`}>
                    <div className={`${prefix}-main-row`}>
                      {!popupShowAvatar && checkbox}
                      <div className={`${prefix}-main`}>{renderField(record, mainField, index)}</div>
                    </div>
                    {!!visibleSecondaryColumns.length && (
                      <div className={`${prefix}-secondary`}>
                        {visibleSecondaryColumns.map(column => <div key={column.name} className={`${prefix}-field`}>{renderField(record, column.name!, index)}</div>)}
                      </div>
                    )}
                  </div>
                </div>
              );
            }) : <div className={`${prefix}-empty`}>{emptyContent}</div>}
          </div>
        </Spin>
        {pagination !== false && dataSet.paging && (
          <div
            className={`${prefix}-pagination`}
            data-lov-pagination
            onMouseDown={event => {
              if ((event.target as HTMLElement).closest('button')) {
                event.preventDefault();
              }
            }}
          >
            <Pagination {...paginationProps} dataSet={dataSet} simple={false} showPager={false} showSizeChanger={false} showQuickJumper={false} showTotal />
          </div>
        )}
      </div>
    );
  }

  renderTable() {
    const {
      dataSet,
      config: { queryBar, height, treeFlag, delayLoad, expandFlag, queryColumns, tableProps: configTableProps = {}, lovItems, ...restConfig },
      multiple,
      tableProps,
      viewMode,
      context,
      showSelectedInView,
      showDetailWhenReadonly,
      values,
      renderAddNewOptionPrompt,
    } = this.props;
    const { dataSetLoaded } = this.state;
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
      treeAsync: delayLoad === 'Y',
      defaultRowExpanded: expandFlag === 'Y',
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
    if (renderAddNewOptionPrompt && dataSet.status !== DataSetStatus.loading && !dataSet.length && !(tableProps || {}).renderEmpty) {
      lovTableProps.renderEmpty = () => renderAddNewOptionPrompt('noDataPrompt', 'Table');
    }
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
    let warningNode: ReactNode;
    if (showDetailWhenReadonly) {
      lovTableProps.queryBar = TableQueryBarType.none;
      lovTableProps.selectionMode = SelectionMode.none;
      lovTableProps.filter = () => (values.length === dataSet.length);
      lovTableProps.pagination = false;
      warningNode = (
        <Alert
          style={{ marginBottom: '10px' }}
          message={$l('Lov', 'non_conformity_warning')}
          type="warning"
          showIcon
        />
      );
    }
    // @ts-ignore
    if (restConfig && restConfig.originData && restConfig.originData.failed) {
      lovTableProps.selectionMode = SelectionMode.none;
    }
    this.selectionMode = lovTableProps.selectionMode;
    return (
      <>
        {dataSetLoaded && values.length !== dataSet.length && warningNode}
        <Table {...lovTableProps} />
        {!showDetailWhenReadonly && modal && this.renderSelectionList()}
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
        selectionMode={this.selectionMode}
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
            : viewMode === TriggerViewMode.popup
              ? <Observer>{() => this.renderPopupList()}</Observer>
              : this.renderTable()}
        </div>
      </>
    );
  }
}
