import React, { CSSProperties, MouseEventHandler, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import ResizeObserver from 'resize-observer-polyfill';
import raf from 'raf';
import { observer } from 'mobx-react';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import isString from 'lodash/isString';
import isNil from 'lodash/isNil';
import isUndefined from 'lodash/isUndefined';
import noop from 'lodash/noop';
import { action, runInAction, toJS } from 'mobx';
import {
  DragDropContext,
  DragDropContextProps,
  DraggableProps,
  DraggableProvided,
  DraggableRubric,
  DraggableStateSnapshot,
  DragStart,
  DroppableProps,
  DroppableStateSnapshot,
  DropResult,
  ResponderProvided,
} from 'react-beautiful-dnd';
import warning from 'choerodon-ui/lib/_util/warning';
import { isCalcSize, isPercentSize, pxToRem, toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import ReactResizeObserver from 'choerodon-ui/lib/_util/resizeObserver';
import Column, { ColumnProps } from './Column';
import TableRow, { TableRowProps } from './TableRow';
import TableHeaderCell from './TableHeaderCell';
import DataSet, { ValidationErrors } from '../data-set/DataSet';
import Record from '../data-set/Record';
import Field from '../data-set/Field';
import { TransportProps } from '../data-set/Transport';
import TableStore from './TableStore';
import TableHeader from './TableHeader';
import autobind from '../_util/autobind';
import Pagination, { PaginationProps } from '../pagination/Pagination';
import Spin, { SpinProps } from '../spin';
import DataSetComponent, { DataSetComponentProps } from '../data-set/DataSetComponent';
import { TableContextProvider } from './TableContext';
import TableWrapper from './TableWrapper';
import Profiler from './Profiler';
import TableTBody, { TableTBodyProps } from './TableTBody';
import ExpandableTableTBody from './ExpandableTableTBody';
import TableFooter from './TableFooter';
import {
  ColumnLock,
  DragColumnAlign,
  GroupType,
  HighLightRowType,
  RowBoxPlacement,
  ScrollPosition,
  SelectionMode,
  TableAutoHeightType,
  TableButtonType,
  TableCommandType,
  TableEditMode,
  TableHeightType,
  TableMode,
  TablePaginationPosition,
  TableQueryBarType,
} from './enum';
import TableQueryBar from './query-bar';
import ToolBar from './query-bar/TableToolBar';
import FilterBar from './query-bar/TableFilterBar';
import AdvancedQueryBar from './query-bar/TableAdvancedQueryBar';
import ProfessionalBar, { TableProfessionalBarProps } from './query-bar/TableProfessionalBar';
import ComboBar, { ComboBarProps } from './query-bar/TableComboBar';
import DynamicFilterBar, { TableDynamicFilterBarProps } from './query-bar/TableDynamicFilterBar';
import FilterSelect from './query-bar/FilterSelect';
import {
  findCell,
  findIndexedSibling,
  findRow,
  getHeight,
  getPaginationPosition,
  isCanEdictingRow,
  isDropresult,
  isStickySupport,
  onlyCustomizedColumn,
} from './utils';
import { ButtonProps } from '../button/Button';
import TableBody from './TableBody';
import VirtualWrapper from './VirtualWrapper';
import SelectionTips from './SelectionTips';
import { DataSetEvents, DataSetSelection } from '../data-set/enum';
import { Size } from '../core/enum';
import { HighlightRenderer } from '../field/FormField';
import StickyShadow from './StickyShadow';
import ColumnGroups from './ColumnGroups';
import { getUniqueFieldNames } from '../data-set/utils';
import mergeProps from '../_util/mergeProps';
import ErrorBar from './ErrorBar';

export type TableGroup = {
  name: string;
  type: GroupType;
  hidden?: boolean;
  parentField?: string;
  columnProps?: ColumnProps;
}

export type TableButtonProps = ButtonProps & { afterClick?: MouseEventHandler<any>; children?: ReactNode };

/**
 * 表头汇总栏hook
 */
export type SummaryBarHook = (props: SummaryBarProps) => { label: ReactNode | string; value: ReactNode | string };

export type Buttons =
  | TableButtonType
  | [TableButtonType, TableButtonProps]
  | ReactElement<TableButtonProps>;

export type Suffixes =
  | 'filter'
  | ReactElement
  | ((props: { queryDataSet?: DataSet; dataSet: DataSet }) => ReactElement);

export type SummaryBar =
  | Field
  | SummaryBarHook;

export interface SummaryBarProps {
  dataSet: DataSet;
  summaryFieldsLimit: number;
  summaryBarFieldWidth?: number;
}

export interface TableQueryBarBaseProps {
  dataSet: DataSet;
  queryDataSet?: DataSet;
  buttons: ReactElement<ButtonProps>[];
  queryFields: ReactElement<any>[];
}

export interface TableQueryBarCustomProps {
  queryFieldsLimit: number;
  buttonsLimit?: number;
  summaryFieldsLimit: number;
  pagination?: ReactElement<PaginationProps>;
  summaryBar?: ReactElement<any>;
  onQuery?: () => void;
  onReset?: () => void;
  autoQueryAfterReset?: boolean;
}

export interface TableQueryBarHookProps extends TableQueryBarBaseProps, TableQueryBarCustomProps {
}

export interface expandedRowRendererProps {
  dataSet: DataSet;
  record: Record;
}

export interface expandIconProps {
  prefixCls?: string;
  expanded: boolean;
  onExpand: Function;
  record: Record;
  expandable?: boolean;
  needIndentSpaced: boolean;
}

export interface onRowProps {
  dataSet: DataSet;
  record: Record;
  index: number;
  expandedRow: boolean;
}

// onColumnResize
export interface onColumnResizeProps {
  column: ColumnProps;
  width: number;
  index: number;
}

export type TableQueryBarHookCustomProps =
  Omit<object, keyof TableQueryBarBaseProps>
  & TableQueryBarCustomProps
  & ComboBarProps
  & TableProfessionalBarProps
  & TableDynamicFilterBarProps;
export type TableQueryBarHook = (props: TableQueryBarHookProps & TableQueryBarHookCustomProps) => ReactNode;
export type Commands =
  | TableCommandType
  | [TableCommandType, TableButtonProps]
  | ReactElement<TableButtonProps>;

export interface TablePaginationConfig extends PaginationProps {
  position?: TablePaginationPosition;
}

export type SpinIndicator = ReactElement<any>;

export interface TableSpinConfig extends SpinProps {
  spinning?: boolean;
  indicator?: SpinIndicator;
}

export interface DynamicFilterBarConfig {
  searchCode?: string; // 由 table props  searchCode 替换，后期废弃
  searchText?: string;
  suffixes?: Suffixes[];
  prefixes?: React.ReactElement<any>[];
  tableFilterAdapter?: TransportProps;
}

export interface Instance {
  tbody: React.ReactElement | HTMLElement;
  headtr: React.ReactElement | HTMLElement;
}

/**
 * DraggableRubric 可以获取拖动起来item的index和id从列表获取信息
 */
export interface DragTableHeaderCellProps {
  rubric: DraggableRubric;
  snapshot: DraggableStateSnapshot;
  provided: DraggableProvided;
}

export interface DragTableRowProps extends TableRowProps {
  rubric: DraggableRubric;
}

export interface RowRenderIcon {
  record: Record;
}

export interface ColumnRenderIcon {
  column: ColumnProps;
  dataSet: DataSet;
  snapshot?: DraggableStateSnapshot;
}

export interface DragRender {
  droppableProps?: DroppableProps;
  draggableProps?: DraggableProps;
  renderClone?: ((dragRenderProps: DragTableRowProps | DragTableHeaderCellProps) => ReactElement<any>);
  renderIcon?: ((rowRenderIcon: RowRenderIcon | ColumnRenderIcon) => ReactElement<any>);
}

export interface TableCustomized {
  columns: { [key: string]: ColumnProps };
  heightType?: TableHeightType;
  height?: number;
  heightDiff?: number;
  aggregation?: boolean;
  size?: Size;
  parityRow?: boolean;
  aggregationExpandType?: 'cell' | 'row' | 'column';
}

let _instance;
// 构造一个单例table来防止body下不能有table元素的报错
export const instance = (wrapperClassName: string | undefined, prefixCls?: string): Instance => {
  // Using a table as the portal so that we do not get react
  // warnings when mounting a tr element
  const _tableContain = (): Instance => {
    const table: HTMLElement = document.createElement('table');
    if (wrapperClassName) {
      table.className = wrapperClassName;
    }
    const thead: HTMLElement = document.createElement('thead');
    thead.className = `${prefixCls}-thead`;
    table.appendChild(thead);

    const headtr: HTMLElement = document.createElement('tr');
    thead.appendChild(headtr);
    const tbody: HTMLElement = document.createElement('tbody');

    tbody.className = `${prefixCls}-tbody`;
    table.appendChild(tbody);
    if (!document.body) {
      throw new Error('document.body required a body to append');
    }
    document.body.appendChild(table);
    return {
      tbody,
      headtr,
    };
  };
  if (_instance) {
    return _instance;
  }
  return _instance = _tableContain();
};

export interface TableProps extends DataSetComponentProps {
  columns?: ColumnProps[] | undefined;
  children?: ReactNode;
  /**
   * 表头
   */
  header?: ReactNode | ((records: Record[]) => ReactNode);
  /**
   * 是否显示表头
   */
  showHeader?: boolean;
  /**
   * 表脚
   */
  footer?: ReactNode | ((records: Record[]) => ReactNode);
  /**
   * 是否显示边框
   * @default true
   */
  border?: boolean;
  /**
   * 单元格编辑器边框
   */
  columnEditorBorder?: boolean;
  /**
   * 数据源
   */
  dataSet: DataSet;
  /**
   * 选择记录的模式
   */
  selectionMode?: SelectionMode;
  /**
   * 行选择框位置
   */
  rowBoxPlacement?: RowBoxPlacement | number;
  /**
   * 在其他模式下是不是要是要rowbox
   */
  alwaysShowRowBox?: boolean;
  /**
   * 显示选择提示
   */
  showSelectionTips?: boolean;
  /**
   * 显示缓存选中记录的按钮
   */
  showSelectionCachedButton?: boolean;
  /**
   * 显示缓存选中记录
   */
  showCachedSelection?: boolean;
  /**
   * 显示缓存选中记录变化
   */
  onShowCachedSelectionChange?: (showCachedSelection: boolean) => void;
  /**
   * 显示切换跨页全选按钮
   */
  showAllPageSelectionButton?: boolean;
  /**
   * 设置行属性
   * @param {onRowProps} props
   * @return {Object} 行属性
   */
  onRow?: (props: onRowProps) => object;
  /**
   * @deprecated
   * 请使用 onRow
   */
  rowRenderer?: (record: Record, index: number) => object;
  /**
   * 功能按钮
   * 可选值：`add` `delete` `remove` `save` `query` `reset` `expandAll` `collapseAll` `export` 或 自定义按钮
   * 给内置按钮加属性：buttons={[['add', { color: 'red' }], ...]}
   */
  buttons?: Buttons[];
  /**
   * 头部显示的功能按钮数量，超出限制的查询字段放入更多
   */
  buttonsLimit?: number;
  /**
   * 自定义查询字段组件
   * @example
   * { age: <NumberField /> }
   *
   * 默认会根据queryDataSet中定义的field类型自动匹配组件， 匹配类型如下
   * lovCode => Lov
   * lookupCode => Select
   * type:number => NumberField
   * type:date => DatePicker
   * type:dateTime => DatePicker[mode=dateTime]
   * type:week => DatePicker[mode=week]
   * default => TextField
   */
  queryFields?: { [key: string]: ReactElement<any> };
  /**
   * 头部显示的查询字段的数量，超出限制的查询字段放入弹出窗口
   * @default 1
   */
  queryFieldsLimit?: number | undefined;
  /**
   * 显示查询条
   * 可选值: `advancedBar` `normal` `bar` `none` `professionalBar` `filterBar` `comboBar`
   * @default 'normal'
   */
  queryBar?: TableQueryBarType | TableQueryBarHook | undefined;
  /**
   * 查询条自定义参数
   */
  queryBarProps?: Partial<TableQueryBarHookCustomProps>;
  /**
   * 显示汇总条
   * @default 'normal'
   */
  summaryBar?: SummaryBar[];
  /**
   * 头部显示的汇总字段的数量，超出限制的查询字段放入弹出窗口
   * @default 3
   */
  summaryFieldsLimit?: number;
  /**
   * 头部显示的汇总字段单个宽度
   * @default 170
   */
  summaryBarFieldWidth?: number;
  /**
   * 是否使用拖拽选择
   * @default false
   */
  useMouseBatchChoose?: boolean;
  /**
   * @deprecated
   * 请使用 queryBar="none"
   */
  showQueryBar?: boolean;
  /**
   * 行高
   * @default 30
   */
  rowHeight?: number | 'auto' | ((props: { size: Size }) => 'auto' | number);
  /**
   * 头行高
   * @default rowHeight
   */
  headerRowHeight?: number | 'auto' | ((props: { size: Size }) => 'auto' | number);
  /**
   * 脚行高
   * @default rowHeight
   */
  footerRowHeight?: number | 'auto' | ((props: { size: Size }) => 'auto' | number);
  /**
   * 默认行是否展开，当dataSet没有设置expandField时才有效
   * @default false;
   */
  defaultRowExpanded?: boolean;
  /**
   * 通过点击行来展开子行
   */
  expandRowByClick?: boolean;
  /**
   * 展开行渲染器
   */
  expandedRowRenderer?: (props: expandedRowRendererProps) => ReactNode;
  /**
   * 自定义展开图标
   */
  expandIcon?: (props: expandIconProps) => ReactNode;
  /**
   * 展开图标是否单独单元格展示
   */
  expandIconAsCell?: boolean;
  /**
   * 展开图标所在列索引
   */
  expandIconColumnIndex?: number;
  /**
   * 展示树形数据时，每层缩进的宽度
   */
  indentSize?: number;
  /**
   * 数据过滤
   * 返回值 true - 显示 false - 不显示
   * @param {Record} record 记录
   * @return {boolean}
   */
  filter?: (record: Record) => boolean;
  /**
   * 表格展示的模式
   * tree需要配合dataSet的`idField`和`parentField`来展示
   * 可选值: `list` `tree`
   */
  mode?: TableMode;
  /**
   * 表格编辑的模式
   * 可选值: `cell` `inline`
   * @default cell
   */
  editMode?: TableEditMode;
  /**
   * queryBar为bar时，直接输入的过滤条件的字段名
   */
  filterBarFieldName?: string;
  /**
   * queryBar为bar时输入框的占位符
   */
  filterBarPlaceholder?: string;
  /**
   * 分页导航条属性
   */
  pagination?: TablePaginationConfig | false;
  /**
   * 高亮行
   */
  highLightRow?: boolean | HighLightRowType;
  /**
   * 勾选高亮行
   */
  selectedHighLightRow?: boolean;
  /**
   * 奇偶行
   */
  parityRow?: boolean;
  /**
   * 可调整列宽
   */
  columnResizable?: boolean;
  /**
   * 可调整列显示
   */
  columnHideable?: boolean;
  /**
   * 可编辑列标题
   */
  columnTitleEditable?: boolean;
  /**
   * 可设置高度
   */
  heightChangeable?: boolean;
  /**
   * 显示原始值
   */
  pristine?: boolean;
  /**
   * 点击展开图标时触发
   */
  onExpand?: (expanded: boolean, record: Record) => void;
  /**
   * 列宽改变时触发
   */
  onColumnResize?: (props: onColumnResizeProps) => void;
  /**
   * 加载条属性
   */
  spin?: TableSpinConfig | false;
  /**
   * 虚拟滚动
   */
  virtual?: boolean;
  /**
   * 虚拟单元格
   */
  virtualCell?: boolean;
  /**
   * 虚拟滚动是否显示加载
   */
  virtualSpin?: boolean;
  /**
   * 是否开启自适应高度
   */
  autoHeight?: boolean | { type: TableAutoHeightType; diff: number };
  /**
   * 是否开启自适应宽度
   */
  autoWidth?: boolean;
  /**
   * @deprecated
   */
  autoMaxWidth?: boolean;
  /**
   * 是否单独处理column footer
   */
  autoFootHeight?: boolean;
  /**
   * 设置drag框体位置
   */
  dragColumnAlign?: DragColumnAlign;
  /**
   * 开启列拖拽
   */
  columnDraggable?: boolean;
  /**
   * 开启行拖拽
   */
  rowDraggable?: boolean;
  /**
   * 拖拽触发事件
   */
  onDragEnd?: (dataSet: DataSet, columns: ColumnProps[], resultDrag: DropResult, provided: ResponderProvided) => void;
  /**
   * 拖拽触发事件位置切换前回调
   */
  onDragEndBefore?: (dataSet: DataSet, columns: ColumnProps[], resultDrag: DropResult, provided: ResponderProvided) => DropResult | boolean | void;
  /**
   * DragDropContext
   */
  dragDropContextProps?: DragDropContextProps;
  /**
   * 渲染列拖拽
   */
  columnsDragRender?: DragRender;
  /**
   * 渲染行拖拽
   */
  rowDragRender?: DragRender;
  /**
   * 是否开启回车跳转下一行编辑
   */
  editorNextKeyEnterDown?: boolean;
  /**
   * 是否开启关闭快捷键（只关闭新加组合快捷键）
   */
  keyboard?: boolean;
  /**
   * @deprecated
   * 筛选条属性配置 使用 queryBarProps.dynamicFilterBar
   */
  dynamicFilterBar?: DynamicFilterBarConfig;
  /**
   * 异步树
   */
  treeAsync?: boolean;
  /**
   * 树节点展开时，加载数据钩子
   */
  treeLoadData?: ({ record, dataSet }) => Promise<any>;
  /**
   * 树形结构下queryBar触发查询,自动展开树形结构
   */
  treeQueryExpanded?: boolean;
  /**
   * 显示行号
   */
  rowNumber?: boolean | ((props: { record?: Record | null; dataSet?: DataSet | null; text: string; pathNumbers: number[] }) => ReactNode);
  /**
   * 个性化编码
   */
  customizedCode?: string;
  /**
   * 是否显示个性化设置入口按钮
   */
  customizable?: boolean | undefined;
  /**
   * @deprecated
   * 同 columnDraggable
   */
  dragColumn?: boolean;
  /**
   * @deprecated
   * 同 rowDraggable
   */
  dragRow?: boolean;
  /**
   * 客户端导出一次查询数量配置
   */
  clientExportQuantity?: number;
  /**
   * @deprecated
   * 可以修改由于样式导致的虚拟高度和rowHeight不一致
   */
  virtualRowHeight?: number;
  /**
   * 摘要
   */
  summary?: string;
  /**
   * 聚合视图
   */
  aggregation?: boolean;
  /**
   * 聚合视图切换钩子
   */
  onAggregationChange?: (aggregation: boolean) => void;
  /**
   * 高亮渲染器
   */
  cellHighlightRenderer?: HighlightRenderer;
  /**
   * 是否显示临时移除的行
   */
  showRemovedRow?: boolean;
  /**
   * 动态筛选条编码
   */
  searchCode?: string;
  /**
   * 分组
   */
  groups?: TableGroup[];
  /**
   * 横向滚动事件
   */
  onScrollLeft?: (left: number) => void;
  /**
   * 纵向滚动事件
   */
  onScrollTop?: (top: number) => void;
  /**
   * 表格体是否可展开
   */
  bodyExpandable?: boolean;
  /**
   * 默认表格体是否展开
   */
  defaultBodyExpanded?: boolean;
  /**
   * 表格体是否展开
   */
  bodyExpanded?: boolean;
  /**
   * 表格体展开变更事件
   */
  onBodyExpand?: (expanded: boolean) => void;
  /**
   * 自定义渲染数据为空的状态
   */
  renderEmpty?: () => ReactNode;
  /**
   * 校验失败自动定位
   */
  autoValidationLocate?: boolean;
}

@observer
export default class Table extends DataSetComponent<TableProps> {
  static displayName = 'Table';

  static Column = Column;

  static FilterBar = FilterBar;

  static AdvancedQueryBar = AdvancedQueryBar;

  static ProfessionalBar = ProfessionalBar;

  static ComboBar = ComboBar;

  static DynamicFilterBar = DynamicFilterBar;

  static FilterSelect = FilterSelect;

  static ToolBar = ToolBar;

  static TableRow = TableRow;

  static TableHeaderCell = TableHeaderCell;

  static defaultProps = {
    suffixCls: 'table',
    tabIndex: 0,
    selectionMode: SelectionMode.rowbox,
    rowBoxPlacement: RowBoxPlacement.start,
    queryFields: {},
    defaultRowExpanded: false,
    expandRowByClick: false,
    indentSize: 15,
    summaryFieldsLimit: 3,
    summaryBarFieldWidth: 170,
    filterBarFieldName: 'params',
    virtualSpin: false,
    autoHeight: false,
    autoMaxWidth: true,
    autoFootHeight: false,
    clientExportQuantity: 100,
    showSelectionCachedButton: true,
    showHeader: true,
  };

  tableStore: TableStore = new TableStore(this);

  nextFrameActionId?: number;

  scrollId?: number;

  resizeLine: HTMLDivElement | null;

  tableHeadWrap: HTMLDivElement | null;

  tableBodyWrap: HTMLDivElement | null;

  tableFootWrap: HTMLDivElement | null;

  tableContentWrap: HTMLDivElement | null;

  fixedColumnsBodyLeft: HTMLDivElement | null;

  fixedColumnsBodyRight: HTMLDivElement | null;

  lastScrollLeft: number;

  lastScrollTop: number;

  wrapperWidth: number[] = [];

  wrapperWidthTimer?: number;

  resizeObserver?: ResizeObserver;

  get currentRow(): HTMLTableRowElement | null {
    const { prefixCls } = this;
    return this.element.querySelector(
      `.${prefixCls}-row-current`,
    ) as HTMLTableRowElement | null;
  }

  get firstRow(): HTMLTableRowElement | null {
    const { prefixCls } = this;
    return this.element.querySelector(
      `.${prefixCls}-row:first-child`,
    ) as HTMLTableRowElement | null;
  }

  get lastRow(): HTMLTableRowElement | null {
    const { prefixCls } = this;
    return this.element.querySelector(
      `.${prefixCls}-row:last-child`,
    ) as HTMLTableRowElement | null;
  }

  @autobind
  saveResizeRef(node: HTMLDivElement | null) {
    this.resizeLine = node;
  }

  @autobind
  saveContentRef(node) {
    this.tableContentWrap = node;
  }

  useFocusedClassName() {
    return false;
  }

  setCode(props) {
    const { customizedCode } = props;
    if (customizedCode) {
      this.code = customizedCode;
    } else {
      super.setCode(props);
    }
  }

  @autobind
  @action
  handleResize(width?: number) {
    const { element, tableStore, wrapperWidth } = this;
    if (width !== undefined) {
      const duplicate = wrapperWidth.includes(width);
      wrapperWidth.unshift(width);
      window.clearTimeout(this.wrapperWidthTimer);
      this.wrapperWidthTimer = window.setTimeout(() => {
        wrapperWidth.pop();
      }, 500);
      if (wrapperWidth.length > 2) {
        wrapperWidth.pop();
      }
      if (duplicate) {
        return;
      }
    }
    if (!element.offsetParent) {
      tableStore.styledHidden = true;
    } else if (!tableStore.hidden) {
      this.syncSizeInFrame(width);
    } else {
      tableStore.styledHidden = false;
    }
  }

  @autobind
  handleWindowResize() {
    this.handleResize();
  }

  @autobind
  @action
  handleDataSetLoad() {
    const { tableStore } = this;
    if (tableStore.performanceEnabled) {
      tableStore.performanceOn = true;
    }
    this.initDefaultExpandedRows();
  }

  @autobind
  handleDataSetCreate({ record, dataSet }) {
    const { tableStore } = this;
    if (tableStore.inlineEdit) {
      if (tableStore.currentEditRecord) {
        tableStore.currentEditRecord.reset();
        dataSet.remove(record);
      } else {
        tableStore.currentEditRecord = record;
      }
    }
  }

  @autobind
  handleDataSetValidate({ valid, dataSet, errors: validationErrors, noLocate }: { valid: boolean; dataSet: DataSet; errors: ValidationErrors[]; noLocate?: boolean }) {
    const { autoValidationLocate } = this.props;
    if (autoValidationLocate !== false && !noLocate && !valid) {
      const { tableStore } = this;
      const [firstInvalidRecord] = validationErrors;
      if (firstInvalidRecord) {
        const { errors, record } = firstInvalidRecord;
        if (errors.length) {
          if (!tableStore.showCachedSelection) {
            if (dataSet.cachedRecords.includes(record)) {
              runInAction(() => {
                tableStore.showCachedSelection = true;
              });
            }
          }
          const [{ field: { name } }] = errors;
          if (tableStore.virtual && !findRow(tableStore, record)) {
            const { tableBodyWrap } = this;
            if (tableBodyWrap) {
              const { rowMetaData } = tableStore;
              if (rowMetaData) {
                const metaData = rowMetaData.find(m => m.record === record);
                if (metaData) {
                  tableBodyWrap.scrollTop = metaData.offset;
                }
              } else {
                tableBodyWrap.scrollTop = record.index * tableStore.virtualRowHeight;
              }
            }
          }
          raf(() => {
            const cell = findCell(tableStore, name, undefined, record);
            if (cell) {
              cell.focus();
            }
          });
        }
      }
    }
  }

  @autobind
  handleKeyDown(e) {
    const { tableStore } = this;
    const { keyboard } = tableStore;
    if (!tableStore.editing) {
      try {
        const { dataSet } = this.props;
        const ctrlKey = e.ctrlKey || e.metaKey;
        const altKey = e.altKey;
        const shiftKey = e.shiftKey;
        switch (e.keyCode) {
          case KeyCode.UP:
            if (shiftKey && keyboard) {
              this.handleKeyDownUpShift(e);
            } else {
              this.handleKeyDownUp(e);
            }
            break;
          case KeyCode.DOWN:
            if (shiftKey && keyboard) {
              this.handleKeyDownDownShift(e);
            } else {
              this.handleKeyDownDown(e);
            }
            break;
          case KeyCode.RIGHT:
            this.handleKeyDownRight(e);
            break;
          case KeyCode.LEFT:
            this.handleKeyDownLeft(e);
            break;
          case KeyCode.PAGE_UP:
            e.preventDefault();
            dataSet.prePage();
            break;
          case KeyCode.PAGE_DOWN:
            e.preventDefault();
            dataSet.nextPage();
            break;
          case KeyCode.HOME:
            this.handleKeyDownHome(e);
            break;
          case KeyCode.END:
            this.handleKeyDownEnd(e);
            break;
          case KeyCode.S:
            if (ctrlKey === true && keyboard) this.handleKeyDownCTRLS(e);
            break;
          case KeyCode.N:
            if (altKey === true && keyboard) this.handleKeyDownCTRLN(e);
            break;
          case KeyCode.D:
            if (ctrlKey === true && keyboard) this.handleKeyDownCTRLD(e);
            break;
          case KeyCode.DELETE:
            if (altKey === true && keyboard) this.handleKeyDownCTRLDELETE(e);
            break;
          default:
        }
      } catch (error) {
        warning(false, error.message);
      }
    }
    const { onKeyDown = noop } = this.props;
    onKeyDown(e);
  }

  focusRow(row: HTMLTableRowElement | null): Record | void {
    if (row) {
      const { index } = row.dataset;
      if (index) {
        const { dataSet } = this.props;
        const record = dataSet.findRecordById(index);
        if (record) {
          dataSet.current = record;
          return record;
        }
      }
    }
  }

  async handleKeyDownHome(e) {
    e.preventDefault();
    const { dataSet } = this.props;
    if (!this.tableStore.isTree) {
      await dataSet.first();
    }
    this.focusRow(this.firstRow);
  }

  async handleKeyDownEnd(e) {
    e.preventDefault();
    const { dataSet } = this.props;
    if (!this.tableStore.isTree) {
      await dataSet.last();
    }
    this.focusRow(this.lastRow);
  }

  async handleKeyDownCTRLS(e) {
    e.preventDefault();
    const {
      tableStore: { dataSet },
    } = this;
    dataSet.submit();
  }

  async handleKeyDownCTRLN(e) {
    const {
      tableStore: { dataSet, editors },
    } = this;
    if (editors.size) {
      e.preventDefault();
      dataSet.create({}, 0);
    }
  }

  // TODO: To be optimized
  async handleKeyDownCTRLD(e) {
    e.preventDefault();
    const { currentRow, tableStore } = this;
    const { dataSet } = tableStore;
    let currentElementSibling: HTMLTableRowElement | null = null;
    // to justice it can be change or standards compliant
    if (
      isCanEdictingRow(currentRow)
    ) {
      currentElementSibling = currentRow;
    }
    if (currentElementSibling && tableStore && dataSet) {
      const previousElementSibling = findIndexedSibling(currentElementSibling, -1);
      if (previousElementSibling) {
        const { index } = previousElementSibling.dataset;
        const { index: currentIndex } = currentElementSibling.dataset;
        if (index && currentIndex) {
          const record = dataSet.findRecordById(index);
          const currentRecord = dataSet.findRecordById(currentIndex);
          // exculde the primery key and merge has columns which has edictor
          if (record && currentRecord && tableStore) {
            const cloneRecodData = record.clone().toData() || {};
            const dealCloneRecodData = {};
            const editeColumn = tableStore.columns
              .filter((column) => !!column.editor)
              .reduce((accumulator, nowValue) => [...accumulator, nowValue.name], [])
              .filter((v) => !(v === null || v === undefined || v === ''));
            if (editeColumn && editeColumn.length > 0) {
              editeColumn.forEach(element => {
                if (element) {
                  dealCloneRecodData[element] = cloneRecodData[element];
                }
              });
            }
            // remove the unique name of fields
            const uniqueFieldNames: string[] = getUniqueFieldNames(dataSet);
            if (uniqueFieldNames && uniqueFieldNames.length > 0) {
              uniqueFieldNames.forEach(element => {
                if (element) {
                  delete dealCloneRecodData[element];
                }
              });
            }
            currentRecord.set(dealCloneRecodData);
          }
        }
      }
    }
  }

  async handleKeyDownCTRLDELETE(e) {
    e.preventDefault();
    const {
      tableStore: { dataSet },
    } = this;
    dataSet.delete(dataSet.selected);
  }

  async handleKeyDownUp(e): Promise<void | Record> {
    e.preventDefault();
    const { currentRow } = this;
    let returnRecod: void | Record;
    if (currentRow) {
      const previousElementSibling = findIndexedSibling(currentRow, -1);
      if (previousElementSibling) {
        returnRecod = this.focusRow(previousElementSibling);
      } else {
        const { dataSet } = this.props;
        await dataSet.prePage();
        returnRecod = this.focusRow(this.lastRow);
      }
      if (returnRecod) {
        return Promise.resolve(returnRecod);
      }
    }
    return Promise.reject();
  }

  async handleKeyDownDown(e): Promise<void | Record> {
    e.preventDefault();
    const { currentRow } = this;
    let returnRecod: void | Record;
    if (currentRow) {
      const nextElementSibling = findIndexedSibling(currentRow, 1);
      if (nextElementSibling) {
        returnRecod = this.focusRow(nextElementSibling);
      } else {
        const { dataSet } = this.props;
        await dataSet.nextPage();
        returnRecod = this.focusRow(this.firstRow);
      }
      if (returnRecod) {
        return Promise.resolve(returnRecod);
      }
    }
    return Promise.reject();
  }

  async handleKeyDownDownShift(e) {
    e.preventDefault();
    const { dataSet } = this.tableStore;
    const { currentRow } = this;
    if (currentRow && isCanEdictingRow(currentRow)) {
      const { index } = currentRow.dataset;
      if (index) {
        const record = dataSet.findRecordById(index);
        if (record) {
          if (!record.selectable) {
            this.handleKeyDownDown(e);
          } else if (!record.isSelected) {
            dataSet.select(record);
          } else {
            const currentRecord = await this.handleKeyDownDown(e);
            if (currentRecord && dataSet) {
              dataSet.select(currentRecord);
            }
          }
        }
      }
    } else {
      this.handleKeyDownDown(e);
    }
  }

  async handleKeyDownUpShift(e) {
    e.preventDefault();
    const { dataSet } = this.tableStore;
    const { currentRow } = this;
    if (currentRow && isCanEdictingRow(currentRow)) {
      const { index } = currentRow.dataset;
      if (index) {
        const record = dataSet.findRecordById(index);
        if (record) {
          if (!record.selectable) {
            this.handleKeyDownUp(e);
          } else if (!record.isSelected) {
            dataSet.select(record);
          } else {
            const currentRecord = await this.handleKeyDownUp(e);
            if (currentRecord) {
              dataSet.select(currentRecord);
            }
          }
        }
      }
    } else {
      this.handleKeyDownUp(e);
    }
  }

  handleKeyDownRight(e) {
    const {
      tableStore,
      props: { expandedRowRenderer, dataSet },
    } = this;
    if (tableStore.isTree || expandedRowRenderer) {
      const { current } = dataSet;
      if (current) {
        e.preventDefault();
        tableStore.setRowExpanded(current, true);
      }
    }
  }

  handleKeyDownLeft(e) {
    const {
      tableStore,
      props: { expandedRowRenderer, dataSet },
    } = this;
    if (tableStore.isTree || expandedRowRenderer) {
      const { current } = dataSet;
      if (current) {
        e.preventDefault();
        tableStore.setRowExpanded(current, false);
      }
    }
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'columns',
      'header',
      'showHeader',
      'footer',
      'border',
      'columnEditorBorder',
      'selectionMode',
      'rowBoxPlacement',
      'alwaysShowRowBox',
      'showSelectionTips',
      'showSelectionCachedButton',
      'showCachedSelection',
      'onShowCachedSelectionChange',
      'showAllPageSelectionButton',
      'onRow',
      'onColumnResize',
      'rowRenderer',
      'buttons',
      'buttonsLimit',
      'rowHeight',
      'headerRowHeight',
      'footerRowHeight',
      'queryFields',
      'queryFieldsLimit',
      'summaryFieldsLimit',
      'summaryBarFieldWidth',
      'queryBar',
      'queryBarProps',
      'autoFocus',
      'summaryBar',
      'defaultRowExpanded',
      'expandRowByClick',
      'expandedRowRenderer',
      'expandIconColumnIndex',
      'indentSize',
      'filter',
      'mode',
      'editMode',
      'filterBarFieldName',
      'filterBarPlaceholder',
      'pagination',
      'highLightRow',
      'selectedHighLightRow',
      'columnResizable',
      'columnTitleEditable',
      'pristine',
      'expandIcon',
      'spin',
      'virtual',
      'virtualCell',
      'virtualSpin',
      'autoWidth',
      'autoHeight',
      'autoFootHeight',
      'useMouseBatchChoose',
      'autoMaxWidth',
      'dragColumnAlign',
      'columnDraggable',
      'rowDraggable',
      'onDragEnd',
      'rowDragRender',
      'columnsDragRender',
      'editorNextKeyEnterDown',
      'onDragEndBefore',
      'keyboard',
      'dynamicFilterBar',
      'parityRow',
      'rowNumber',
      'treeAsync',
      'treeLoadData',
      'customizable',
      'customizedCode',
      'dragColumn',
      'dragRow',
      'clientExportQuantity',
      'treeQueryExpanded',
      'summary',
      'aggregation',
      'onAggregationChange',
      'showRemovedRow',
      'searchCode',
      'groups',
      'onScrollLeft',
      'onScrollTop',
      'bodyExpandable',
      'defaultBodyExpanded',
      'bodyExpanded',
      'onBodyExpanded',
    ]);
  }

  getWrapperProps(props: any = {}): any {
    const { autoWidth } = this.props;
    const wrapperProps = {
      ...props,
    };
    if (autoWidth) {
      const { columnGroups, overflowY, border } = this.tableStore;
      wrapperProps.style = {
        width: columnGroups.width + (overflowY ? measureScrollbar() : 0) + (border ? 2 : 0),
      };
    }
    return super.getWrapperProps(wrapperProps);
  }

  getOtherProps() {
    const otherProps = super.getOtherProps();
    otherProps.onKeyDown = this.handleKeyDown;
    const { rowHeight } = this.tableStore;
    if (rowHeight === 'auto') {
      delete otherProps.style;
    } else {
      otherProps.style = { lineHeight: pxToRem(rowHeight) };
    }
    return otherProps;
  }

  getClassName(): string | undefined {
    const {
      tableStore: { border, parityRow, aggregation, size },
      prefixCls,
    } = this;
    return super.getClassName({
      [`${prefixCls}-${size}`]: size !== Size.default,
      [`${prefixCls}-bordered`]: border,
      [`${prefixCls}-parity-row`]: parityRow,
      [`${prefixCls}-aggregation`]: aggregation,
    });
  }

  /**
   * 获取传入的 Spin props
   */
  getSpinProps(): SpinProps {
    const { spin, dataSet } = this.props;
    if (spin && !isUndefined(spin.spinning)) return { ...spin };
    const { loading } = this.tableStore;
    if (loading) {
      return {
        ...spin,
        spinning: true,
      };
    }
    return {
      ...spin,
      dataSet,
    };
  }

  componentWillMount() {
    this.initDefaultExpandedRows();
  }

  componentDidMount() {
    super.componentDidMount();
    this.connect();
    this.syncSize();
    this.syncSizeInFrame();
  }

  private columnsSize?: number;

  componentDidUpdate() {
    const { tableStore } = this;
    const { currentEditorName } = tableStore;
    if (currentEditorName) {
      const { columns: { length } } = tableStore;
      const currentEditor = tableStore.editors.get(currentEditorName);
      if (currentEditor && length !== this.columnsSize) {
        this.columnsSize = length;
        currentEditor.alignEditor();
      }
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    super.componentWillReceiveProps(nextProps, nextContext);
    this.disconnect();
    this.columnsSize = this.tableStore.columns.length;
    this.tableStore.updateProps(nextProps);
    this.connect();
  }

  componentWillUnmount() {
    this.disconnect();
    if (this.scrollId !== undefined) {
      raf.cancel(this.scrollId);
    }
  }

  @autobind
  @action
  syncParentSize(entries: ResizeObserverEntry[]) {
    const [entry] = entries;
    const { contentRect: { height } } = entry;
    const { tableStore, element, wrapper } = this;
    const wrapperHeight = (wrapper as HTMLDivElement).getBoundingClientRect().height;
    if (wrapperHeight !== height) {
      tableStore.parentHeight = height;
      tableStore.parentPaddingTop =
        (element as HTMLDivElement).getBoundingClientRect().top - (entry.target as HTMLDivElement).getBoundingClientRect().top;
    }
  }

  connect() {
    this.processDataSetListener(true);
    const { styleMaxHeight, styleMinHeight, styleHeight, heightType } = this.tableStore;
    if ((isString(styleHeight) && isPercentSize(styleHeight)) || (isString(styleMaxHeight) && isPercentSize(styleMaxHeight)) || (isString(styleMinHeight) && isPercentSize(styleMinHeight))) {
      const { wrapper } = this;
      if (wrapper) {
        const { parentNode } = wrapper;
        if (parentNode) {
          const resizeObserver = new ResizeObserver(this.syncParentSize);
          resizeObserver.observe(parentNode);
          this.resizeObserver = resizeObserver;
        }
      }
    }
    if (heightType === TableHeightType.flex || (isString(styleMaxHeight) && isCalcSize(styleMaxHeight)) || (isString(styleMinHeight) && isCalcSize(styleMinHeight))) {
      window.addEventListener('resize', this.handleWindowResize, false);
    }
  }

  disconnect() {
    const { resizeObserver } = this;
    if (resizeObserver) {
      resizeObserver.disconnect();
      delete this.resizeObserver;
    }
    this.processDataSetListener(false);
    window.removeEventListener('resize', this.handleWindowResize, false);
  }

  processDataSetListener(flag: boolean) {
    const { dataSet, inlineEdit } = this.tableStore;
    if (dataSet) {
      const handler = flag ? dataSet.addEventListener : dataSet.removeEventListener;
      handler.call(dataSet, DataSetEvents.load, this.handleDataSetLoad);
      if (inlineEdit) {
        handler.call(dataSet, DataSetEvents.create, this.handleDataSetCreate);
      }
      handler.call(dataSet, DataSetEvents.validate, this.handleDataSetValidate);
    }
  }

  render() {
    const {
      tableStore: { overflowX, overflowY, isAnyColumnsLeftLock, isAnyColumnsRightLock, isFold },
      props: {
        dataSet,
        treeQueryExpanded,
        virtualSpin,
        buttons,
        buttonsLimit,
        queryFields,
        queryFieldsLimit,
        summaryFieldsLimit,
        summaryBarFieldWidth,
        filterBarFieldName,
        filterBarPlaceholder,
        summaryBar,
        dynamicFilterBar,
        clientExportQuantity,
        indentSize,
        selectionMode,
        rowRenderer,
        onRow,
        onColumnResize,
        expandedRowRenderer,
        expandRowByClick,
        rowDragRender,
        columnsDragRender,
        mode,
        pristine,
        showSelectionCachedButton,
        onShowCachedSelectionChange,
        autoMaxWidth,
        summary,
        searchCode,
      },
      tableStore,
      prefixCls,
    } = this;
    const content = this.getTable();
    const pagination = this.getPagination(TablePaginationPosition.top);
    const tableSpinProps = mergeProps(this.getContextConfig('tableSpinProps'), this.getSpinProps());
    const tableButtonsLimit = isNil(buttonsLimit) ? this.getContextConfig('tableButtonsLimit') : buttonsLimit;
    return (
      <ReactResizeObserver resizeProp="width" onResize={this.handleResize}>
        <div {...this.getWrapperProps()}>
          <TableContextProvider
            code={this.code}
            prefixCls={prefixCls}
            dataSet={dataSet}
            tableStore={tableStore}
            indentSize={indentSize!}
            selectionMode={selectionMode}
            onRow={onRow}
            onColumnResize={onColumnResize}
            rowRenderer={rowRenderer}
            expandedRowRenderer={expandedRowRenderer}
            expandRowByClick={expandRowByClick}
            rowDragRender={rowDragRender}
            columnsDragRender={columnsDragRender}
            showSelectionCachedButton={showSelectionCachedButton}
            onShowCachedSelectionChange={onShowCachedSelectionChange}
            autoMaxWidth={autoMaxWidth}
            pristine={pristine}
            summary={summary}
            virtualSpin={virtualSpin}
            spinProps={tableSpinProps}
            isTree={mode === TableMode.tree}
          >
            {!isFold && this.getHeader()}
            <TableQueryBar
              buttons={buttons}
              buttonsLimit={tableButtonsLimit}
              pagination={pagination}
              queryFields={queryFields}
              clientExportQuantity={clientExportQuantity}
              summaryBar={summaryBar}
              dynamicFilterBar={dynamicFilterBar}
              queryFieldsLimit={queryFieldsLimit}
              summaryBarFieldWidth={summaryBarFieldWidth}
              summaryFieldsLimit={summaryFieldsLimit}
              filterBarFieldName={filterBarFieldName}
              filterBarPlaceholder={filterBarPlaceholder}
              treeQueryExpanded={treeQueryExpanded}
              searchCode={searchCode}
            />
            {!isFold && <ErrorBar dataSet={dataSet} prefixCls={prefixCls} />}
            {!isFold &&
            <Spin {...tableSpinProps} key="content">
              <div {...this.getOtherProps()}>
                <div
                  className={classNames(`${prefixCls}-content`, { [`${prefixCls}-content-overflow`]: isStickySupport() && overflowX && !overflowY })}
                  ref={this.saveContentRef}
                  onScroll={this.handleBodyScroll}
                >
                  {!isStickySupport() && isAnyColumnsLeftLock && overflowX && this.getLeftFixedTable()}
                  {content}
                  {!isStickySupport() && isAnyColumnsRightLock && overflowX && this.getRightFixedTable()}
                </div>
                {isStickySupport() && overflowX && <StickyShadow position="left" />}
                {isStickySupport() && overflowX && <StickyShadow position="right" />}
                <div ref={this.saveResizeRef} className={`${prefixCls}-split-line`} />
              </div>
            </Spin>
            }
            {!isFold && this.getFooter()}
            {!isFold && this.getPagination(TablePaginationPosition.bottom)}
          </TableContextProvider>
        </div>
      </ReactResizeObserver>
    );
  }

  @action
  reorderDataSet(startIndex: number, endIndex: number) {
    const { dataSet } = this.tableStore;
    dataSet.move(startIndex, endIndex);
  }


  /**
   * 触发组合或拖拽排序, 移除原纪录
   * @param currentRecord
   */
  @action
  removeSourceRecord(currentRecord: Record) {
    const { parent } = currentRecord;
    if (parent) {
      const { children } = parent;
      if (children) {
        const index = children.indexOf(currentRecord);
        if (index !== -1) {
          children.splice(index, 1);
        }
        if (!children.length) {
          parent.children = undefined;
        }
      }
    }
  }

  @autobind
  @action
  handleDragStart(initial: DragStart, provided: ResponderProvided): void {
    const { dragDropContextProps } = this.props;
    const { rowMetaData, isTree } = this.tableStore;
    if (isTree && rowMetaData) {
      const { source } = initial;
      const currentRecord = rowMetaData[source.index].record;
      if (currentRecord.children && currentRecord.children.length) {
        currentRecord.isExpanded = false;
      }
    }
    if (dragDropContextProps && dragDropContextProps.onDragStart) {
      dragDropContextProps.onDragStart(initial, provided);
    }
  }

  @autobind
  @action
  handleDragEnd(resultDrag: DropResult, provided: ResponderProvided) {
    const { dataSet, rowMetaData, isTree } = this.tableStore;
    const { parentField, idField, childrenField } = dataSet.props;
    const { onDragEnd, onDragEndBefore, dragDropContextProps } = this.props;
    let resultBefore: DropResult | undefined = resultDrag;
    if (onDragEndBefore) {
      const result = onDragEndBefore(this.tableStore.dataSet, toJS(this.tableStore.columns), resultDrag, provided);
      if (result === false) {
        return;
      }
      if (isDropresult(result)) {
        resultBefore = result;
      }
    }
    if (resultBefore && isTree && rowMetaData) {
      const { destination, source, combine } = resultBefore;
      const currentRecord = rowMetaData[source.index].record;
      // 平铺数据
      if (!childrenField && parentField && idField) {
        // 拖拽组合关联
        if (combine) {
          const parentRecord = dataSet.find(record => String(record.key) === combine.draggableId)!;
          currentRecord.set(parentField, parentRecord.get(idField));
          parentRecord.isExpanded = true;
        }
        // 拖拽排序更新
        if (destination && destination.index !== source.index && rowMetaData) {
          const destinationRecord = rowMetaData[destination.index].record;
          const { parent } = destinationRecord;
          if (parent) {
            if (currentRecord.parent !== parent && parent !== currentRecord && parent.children) {
              currentRecord.set(parentField, parent.get(idField));
            } else if (parent.children) {
              const childIndex = parent.children.indexOf(destinationRecord);
              this.removeSourceRecord(currentRecord);
              parent.children.splice(childIndex, 0, currentRecord);
            }
          } else {
            currentRecord.set(parentField, undefined);
            dataSet.move(currentRecord.index, destinationRecord.index);
          }
        }
      }
      // 树形数据
      if (childrenField) {
        // 拖拽组合关联
        if (combine) {
          const parentRecord = dataSet.find(record => String(record.key) === combine.draggableId)!;
          this.removeSourceRecord(currentRecord);
          currentRecord.parent = parentRecord;
          if (parentRecord.children && parentRecord.children.length) {
            parentRecord.children.unshift(currentRecord);
          } else {
            parentRecord.children = [currentRecord];
          }
          parentRecord.isExpanded = true;
        }
        // 拖拽排序更新
        if (destination && destination.index !== source.index && rowMetaData) {
          const destinationRecord = rowMetaData[destination.index].record;
          const { parent } = destinationRecord;
          if (parent) {
            if (currentRecord.parent !== parent && parent !== currentRecord && parent.children) {
              const childIndex = parent.children.indexOf(destinationRecord);
              this.removeSourceRecord(currentRecord);
              currentRecord.parent = parent;
              parent.children.splice(childIndex, 0, currentRecord);
            } else if (parent.children) {
              const childIndex = parent.children.indexOf(destinationRecord);
              this.removeSourceRecord(currentRecord);
              parent.children.splice(childIndex, 0, currentRecord);
            }
          } else {
            if (currentRecord.parent) {
              this.removeSourceRecord(currentRecord);
              currentRecord.parent = undefined;
            }
            dataSet.move(currentRecord.index, destinationRecord.index);
          }
        }
      }
    } else if (resultBefore && resultBefore.destination) {
      if (resultBefore.source.index !== resultBefore.destination.index) {
        // 非树形拖拽排序
        this.reorderDataSet(
          resultBefore.source.index,
          resultBefore.destination.index,
        );
      }
    }
    /**
     * 相应变化后的数据
     */
    const onDragEndFun = onDragEnd || (dragDropContextProps ? dragDropContextProps.onDragEnd : undefined) as Function | undefined;
    if (onDragEndFun) {
      onDragEndFun(this.tableStore.dataSet, toJS(this.tableStore.columns), resultBefore, provided);
    }
  }

  @autobind
  handleBodyScroll(e: React.SyntheticEvent) {
    const { currentTarget } = e;
    const handle = () => {
      this.handleBodyScrollTop(e, currentTarget);
      this.handleBodyScrollLeft(e, currentTarget);
    };
    if (isStickySupport()) {
      handle();
    } else {
      e.persist();
      this.scrollId = raf(handle);
    }
  }

  handleBodyScrollTop(e, currentTarget) {
    const { target } = e;
    const { tableStore } = this;
    if (
      // (isStickySupport() && !tableStore.virtual) ||
    // (![TableHeightType.fixed, TableHeightType.flex].includes(tableStore.heightType)) ||
      !tableStore.overflowY ||
      currentTarget !== target ||
      target === this.tableFootWrap
    ) {
      return;
    }
    const { scrollTop } = target;
    this.setScrollTop(scrollTop, target);
  }

  handleBodyScrollLeft(e, currentTarget) {
    const { target } = e;
    const { tableStore } = this;
    if (
      !tableStore.overflowX ||
      currentTarget !== target ||
      target === this.fixedColumnsBodyRight ||
      target === this.fixedColumnsBodyLeft
    ) {
      return;
    }
    const { scrollLeft } = target;
    this.setScrollLeft(scrollLeft, target);
  }

  setScrollPositionClassName(target?: any): void {
    const { tableStore } = this;
    if (tableStore.isAnyColumnsLock && tableStore.overflowX) {
      const node = target || this.tableBodyWrap || this.tableContentWrap;
      if (node) {
        const scrollToLeft = node.scrollLeft === 0;
        const table = node.querySelector('table');
        const scrollToRight = table && node.scrollLeft >= table.offsetWidth - node.offsetWidth;
        if (scrollToLeft && scrollToRight) {
          this.setScrollPosition(ScrollPosition.both);
        } else if (scrollToLeft) {
          this.setScrollPosition(ScrollPosition.left);
        } else if (scrollToRight) {
          this.setScrollPosition(ScrollPosition.right);
        } else {
          this.setScrollPosition(ScrollPosition.middle);
        }
      }
    }
  }

  @action
  setScrollPosition(position: ScrollPosition): void {
    const { tableStore } = this;
    if (tableStore.scrollPosition !== position) {
      tableStore.scrollPosition = position;
    }
  }

  renderTable(
    hasHeader: boolean,
    hasBody: boolean,
    hasFooter: boolean,
    lock?: ColumnLock,
    virtual?: boolean,
  ): ReactNode {
    const { tableStore } = this;
    const columnGroups = (() => {
      if (lock === ColumnLock.right) {
        return tableStore.rightColumnGroups;
      }
      if (lock) {
        return tableStore.leftColumnGroups;
      }
      return tableStore.columnGroups;
    })();

    /* eslint-disable react/no-this-in-sfc */
    const wrapper = (snapshot?: DroppableStateSnapshot, dragRowHeight?: number) => (
      <TableWrapper
        key="tableWrapper"
        lock={lock}
        hasBody={hasBody}
        hasHeader={hasHeader}
        hasFooter={hasFooter}
        columnGroups={columnGroups}
      >
        {hasHeader && this.getTableHeader(lock)}
        {hasBody && this.getTableBody(columnGroups, lock, snapshot, dragRowHeight)}
        {hasFooter && this.getTableFooter(columnGroups, lock)}
      </TableWrapper>
    );
    /* eslint-enable react/no-this-in-sfc */
    const virtualWrapper = virtual ? <VirtualWrapper>{wrapper}</VirtualWrapper> : wrapper();
    if (hasBody && tableStore.rowDraggable) {
      const { dragDropContextProps } = this.props;
      return (
        <DragDropContext {...dragDropContextProps} onDragStart={this.handleDragStart} onDragEnd={this.handleDragEnd}>
          {virtualWrapper}
        </DragDropContext>
      );
    }
    return virtualWrapper;
  }

  getHeader(): ReactNode {
    const {
      props: { header, dataSet },
    } = this;
    if (header) {
      const { prefixCls } = this;
      const data = dataSet ? dataSet.records : [];
      return (
        <div key="header" className={`${prefixCls}-header`}>
          {typeof header === 'function' ? header(data) : header}
        </div>
      );
    }
  }

  getFooter(): ReactNode | undefined {
    const {
      props: { footer, dataSet },
    } = this;
    if (footer) {
      const { prefixCls } = this;
      const data = dataSet ? dataSet.records : [];
      return (
        <div key="footer" className={`${prefixCls}-footer`}>
          {typeof footer === 'function' ? footer(data) : footer}
        </div>
      );
    }
  }

  getPagination(position: TablePaginationPosition): ReactElement<PaginationProps> | undefined {
    const {
      props: { dataSet, selectionMode },
      prefixCls,
      tableStore: { pagination, showSelectionTips },
    } = this;
    if (pagination !== false && dataSet && dataSet.paging) {
      const paginationPosition = getPaginationPosition(pagination);
      if (paginationPosition === TablePaginationPosition.both || paginationPosition === position) {
        const paginationProps = omit(pagination, 'position');
        return (
          <Pagination
            key={`pagination-${position}`}
            {...paginationProps}
            className={classNames(`${prefixCls}-pagination`, paginationProps.className, { [`${prefixCls}-pagination-with-selection-tips`]: showSelectionTips })}
            dataSet={dataSet}
          >
            {selectionMode !== SelectionMode.none && dataSet.selection === DataSetSelection.multiple && <SelectionTips />}
          </Pagination>
        );
      }
    }
  }

  getTable(lock?: ColumnLock): ReactNode {
    const { props, tableStore } = this;
    const { overflowX, heightType, hasFooter: footer, virtual } = tableStore;
    let tableHead: ReactNode;
    let tableBody: ReactNode;
    let tableFooter: ReactNode;
    if (virtual || (!isStickySupport() && overflowX) || [TableHeightType.flex, TableHeightType.fixed].includes(heightType) || tableStore.height !== undefined) {
      const { prefixCls } = this;
      let tableHeadRef;
      let tableBodyRef;
      let tableFootRef;
      if (!lock) {
        tableHeadRef = node => (this.tableHeadWrap = node);
        tableFootRef = node => (this.tableFootWrap = node);
        tableBodyRef = node => (this.tableBodyWrap = node);
      } else if (lock === ColumnLock.right) {
        tableBodyRef = (node) => {
          this.fixedColumnsBodyRight = node;
          if (node) {
            this.syncSize();
          }
        };
      } else {
        tableBodyRef = (node) => {
          this.fixedColumnsBodyLeft = node;
          if (node) {
            this.syncSize();
          }
        };
      }
      const style: CSSProperties | undefined = lock ? {
        width: pxToRem(lock === ColumnLock.right
          ? (tableStore.rightColumnGroups.width - 1 + (tableStore.overflowY ? measureScrollbar() : 0))
          : tableStore.leftColumnGroups.width, true),
        marginLeft: lock === ColumnLock.right ? pxToRem(1) : undefined,
      } : undefined;

      tableHead = (
        <div key="tableHead" ref={tableHeadRef} className={`${prefixCls}-head`} style={style}>
          {this.renderTable(true, false, false, lock)}
        </div>
      );
      if (lock !== ColumnLock.right || !onlyCustomizedColumn(tableStore)) {
        const body = this.renderTable(false, true, false, lock, virtual);
        tableBody = (
          <TableBody
            key="tableBody"
            getRef={tableBodyRef}
            lock={lock}
            onScroll={this.handleBodyScroll}
            style={pick(props.style, ['maxHeight', 'minHeight'])}
          >
            {body}
          </TableBody>
        );
      }

      if (footer) {
        tableFooter = (
          <div
            key="tableFooter"
            ref={tableFootRef}
            className={`${prefixCls}-foot`}
            style={style}
            onScroll={this.handleBodyScroll}
          >
            {this.renderTable(false, false, true, lock)}
          </div>
        );
      }
    } else {
      tableBody = this.renderTable(true, true, footer, lock);
    }
    return [tableHead, tableBody, tableFooter];
  }

  getLeftFixedTable(): ReactNode {
    return (
      <StickyShadow position="left">
        {this.getTable(ColumnLock.left)}
      </StickyShadow>
    );
  }

  getRightFixedTable(): ReactNode {
    return (
      <StickyShadow position="right">
        {this.getTable(ColumnLock.right)}
      </StickyShadow>
    );
  }

  getTableBody(columnGroups: ColumnGroups, lock?: ColumnLock, snapshot?: DroppableStateSnapshot, dragRowHeight?: number): ReactNode {
    const {
      tableStore: { performanceEnabled },
      props: {
        bodyExpandable,
      },
    } = this;
    const tBodyProps: TableTBodyProps = {
      key: 'tbody',
      lock,
      columnGroups,
      snapshot,
      dragRowHeight,
    };
    const body = bodyExpandable ? <ExpandableTableTBody {...tBodyProps} /> : <TableTBody {...tBodyProps} />;
    return performanceEnabled ? <Profiler>{body}</Profiler> : body;
  }

  getTableHeader(lock?: ColumnLock): ReactNode {
    const { showHeader } = this.props;
    return showHeader || this.tableStore.customizable ? (
      <TableHeader key="thead" lock={lock} />
    ) : undefined;
  }

  getTableFooter(columnGroups: ColumnGroups, lock?: ColumnLock): ReactNode {
    return <TableFooter key="tfoot" lock={lock} columnGroups={columnGroups} />;
  }

  getStyleHeight(): number | undefined {
    const { style } = this.props;
    if (style) {
      return toPx(style.height);
    }
  }

  syncSizeInFrame(width: number = this.getWidth()) {
    if (this.nextFrameActionId !== undefined) {
      raf.cancel(this.nextFrameActionId);
    }
    this.nextFrameActionId = raf(this.syncSize.bind(this, width));
  }

  @autobind
  @action
  syncSize(width: number = this.getWidth()) {
    const { element, tableStore } = this;
    if (tableStore.hidden || !element.offsetParent) {
      return;
    }
    if (element) {
      tableStore.width = Math.floor(width);
      const { prefixCls } = this;
      const tableHeader: HTMLTableSectionElement | null = tableStore.props.showHeader ? element.querySelector(
        `.${prefixCls}-thead`,
      ) : null;
      const tableFooter: HTMLDivElement | null = tableStore.hasFooter ? element.querySelector(`.${prefixCls}-tfoot`) : null;
      tableStore.screenHeight = document.documentElement.clientHeight;
      tableStore.headerHeight = tableHeader ? getHeight(tableHeader) : 0;
      tableStore.footerHeight = tableFooter ? getHeight(tableFooter) : 0;
    }
    this.setScrollPositionClassName();
  }

  @action
  initDefaultExpandedRows() {
    const {
      tableStore,
      props: { dataSet, defaultRowExpanded },
    } = this;
    if (tableStore.isTree && defaultRowExpanded) {
      dataSet.forEach((record) => {
        if (record.children) {
          record.isExpanded = true;
        }
      });
    }
  }

  handleHeightTypeChange(immediate?: boolean) {
    this.disconnect();
    if (immediate) {
      this.syncSize();
    } else {
      this.syncSizeInFrame();
    }
    this.connect();
  }

  getWidth(): number {
    const { wrapper } = this;
    if (wrapper) {
      return wrapper.offsetWidth;
    }
    return 0;
  }

  public setColumnWidth(width: number, indexOrKeyOrName: number | string) {
    const { tableStore } = this;
    const target = tableStore.findColumnGroup(indexOrKeyOrName);
    if (target) {
      tableStore.setColumnWidth(target, width);
    }
  }

  public setScrollTop(scrollTop: number, target?: HTMLElement) {
    if (scrollTop !== this.lastScrollTop) {
      const { tableStore, fixedColumnsBodyLeft, tableBodyWrap, fixedColumnsBodyRight, tableContentWrap } = this;
      if (fixedColumnsBodyLeft && target !== fixedColumnsBodyLeft) {
        fixedColumnsBodyLeft.scrollTop = scrollTop;
      }
      if (tableBodyWrap && target !== tableBodyWrap) {
        tableBodyWrap.scrollTop = scrollTop;
      }
      if (fixedColumnsBodyRight && target !== fixedColumnsBodyRight) {
        fixedColumnsBodyRight.scrollTop = scrollTop;
      }
      if (tableContentWrap && target !== tableContentWrap) {
        tableContentWrap.scrollTop = scrollTop;
      }
      this.lastScrollTop = scrollTop;
      tableStore.setLastScrollTop(scrollTop);
      if (target) {
        const { onScrollTop = noop } = this.props;
        onScrollTop(scrollTop);
      }
    }
  }

  public setScrollLeft(scrollLeft: number, target?: HTMLElement) {
    if (scrollLeft !== this.lastScrollLeft) {
      const { tableStore } = this;
      const { tableHeadWrap, tableBodyWrap, tableFootWrap, tableContentWrap } = this;
      if (isStickySupport()) {
        tableStore.editors.forEach((editor) => {
          if (editor.lock && editor.cellNode) {
            if (tableStore.inlineEdit) {
              editor.alignEditor(editor.cellNode);
            } else {
              editor.hideEditor();
            }
          }
        });
      }
      if (tableHeadWrap && target !== tableHeadWrap) {
        tableHeadWrap.scrollLeft = scrollLeft;
      }
      if (tableBodyWrap && target !== tableBodyWrap) {
        tableBodyWrap.scrollLeft = scrollLeft;
      }
      if (tableFootWrap && target !== tableFootWrap) {
        tableFootWrap.scrollLeft = scrollLeft;
      }
      if (tableContentWrap && target !== tableContentWrap) {
        tableContentWrap.scrollLeft = scrollLeft;
      }
      this.setScrollPositionClassName(target);
      this.lastScrollLeft = scrollLeft;
      if (target) {
        const { onScrollLeft = noop } = this.props;
        onScrollLeft(scrollLeft);
      }
    }
  }
}
