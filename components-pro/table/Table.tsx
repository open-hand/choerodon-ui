import React, { CSSProperties, MouseEventHandler, ReactElement, ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import raf from 'raf';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import isNumber from 'lodash/isNumber';
import isUndefined from 'lodash/isUndefined';
import debounce from 'lodash/debounce';
import isObject from 'lodash/isObject';
import noop from 'lodash/noop';
import classes from 'component-classes';
import { action, toJS } from 'mobx';
import {
  DragDropContext,
  DraggableProps,
  DraggableRubric,
  DraggableStateSnapshot,
  DroppableProps,
  DropResult,
  ResponderProvided,
} from 'react-beautiful-dnd';
import { getConfig } from 'choerodon-ui/lib/configure';
import warning from 'choerodon-ui/lib/_util/warning';
import { pxToRem, toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import ReactResizeObserver from 'choerodon-ui/lib/_util/resizeObserver';
import Column, { ColumnProps, defaultMinWidth } from './Column';
import TableRow, { TableRowProps } from './TableRow';
import TableHeaderCell, { TableHeaderCellProps } from './TableHeaderCell';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Field from '../data-set/Field';
import { TransportProps } from '../data-set/Transport';
import TableStore from './TableStore';
import TableHeader from './TableHeader';
import autobind from '../_util/autobind';
import Pagination, { PaginationProps } from '../pagination/Pagination';
import Spin, { SpinProps } from '../spin';
import DataSetComponent, { DataSetComponentProps } from '../data-set/DataSetComponent';
import TableContext from './TableContext';
import TableWrapper from './TableWrapper';
import TableTBody from './TableTBody';
import TableFooter from './TableFooter';
import {
  ColumnLock,
  DragColumnAlign,
  HighLightRowType,
  ScrollPosition,
  SelectionMode,
  TableAutoHeightType,
  TableButtonType,
  TableCommandType,
  TableEditMode,
  TableMode,
  TablePaginationPosition,
  TableQueryBarType,
} from './enum';
import TableQueryBar from './query-bar';
import ToolBar from './query-bar/TableToolBar';
import FilterBar from './query-bar/TableFilterBar';
import AdvancedQueryBar from './query-bar/TableAdvancedQueryBar';
import ProfessionalBar from './query-bar/TableProfessionalBar';
import DynamicFilterBar from './query-bar/TableDynamicFilterBar';
import { findIndexedSibling, getHeight, getPaginationPosition, isCanEdictingRow, isDropresult, isStickySupport } from './utils';
import { ButtonProps } from '../button/Button';
import TableBody from './TableBody';
import VirtualWrapper from './VirtualWrapper';
import ModalProvider from '../modal-provider/ModalProvider';
import SelectionTips from './SelectionTips';
import { DataSetSelection } from '../data-set/enum';

export type TableButtonProps = ButtonProps & { afterClick?: MouseEventHandler<any>; children?: ReactNode; };

/**
 * 表头汇总栏hook
 */
export type SummaryBarHook = (props: SummaryBarProps) => { label: ReactNode | string, value: ReactNode | string };

export type Buttons =
  | TableButtonType
  | [TableButtonType, TableButtonProps]
  | ReactElement<TableButtonProps>;

export type Suffixes =
  | 'filter'
  | ReactElement;


export type SummaryBar =
  | Field
  | SummaryBarHook;

export interface SummaryBarProps {
  dataSet: DataSet;
  summaryFieldsLimit: number;
}

export interface TableQueryBarHookProps {
  dataSet: DataSet;
  queryDataSet?: DataSet;
  buttons: ReactElement<ButtonProps>[];
  queryFields: ReactElement<any>[];
  queryFieldsLimit: number;
  summaryFieldsLimit: number;
  pagination?: ReactElement<PaginationProps>;
  summaryBar?: ReactElement<any>;
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
  expandable: boolean;
  needIndentSpaced: boolean;
}

export interface onRowProps {
  dataSet: DataSet;
  record: Record;
  index: number;
  expandedRow: boolean;
}

export type TableQueryBarHook = (props: TableQueryBarHookProps) => ReactNode;
export type Commands =
  | TableCommandType
  | [TableCommandType, TableButtonProps]
  | ReactElement<TableButtonProps>;

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

export interface TablePaginationConfig extends PaginationProps {
  position?: TablePaginationPosition;
}

export type SpinIndicator = ReactElement<any>;

export interface TableSpinConfig extends SpinProps {
  spinning?: boolean;
  indicator?: SpinIndicator;
}

export interface DynamicFilterBarConfig {
  searchCode: string;
  searchText?: string;
  suffixes?: Suffixes[];
  tableFilterAdapter?: TransportProps;
}

export interface Instance {
  tbody: React.ReactElement;
  headtr: React.ReactElement;
}

/**
 * DraggableRubric 可以获取拖动起来item的index和id从列表获取信息
 */
export interface DragTableHeaderCellProps extends TableHeaderCellProps {
  rubric: DraggableRubric
}

export interface DragTableRowProps extends TableRowProps {
  rubric: DraggableRubric
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
  renderClone?: ((dragRenderProps: DragTableRowProps) => ReactElement<any>) | ((dragRenderProps: DragTableHeaderCellProps) => ReactElement<any>);
  renderIcon?: ((rowRenderIcon: RowRenderIcon) => ReactElement<any>) | ((columnRenderIcon: ColumnRenderIcon) => ReactElement<any>);
}

export interface Customized {
  columns: object,
}

let _instance;
// 构造一个单例table来防止body下不能有table元素的报错
export const instance = (wrapperClassName: string, prefixCls?: string): Instance => {
  // Using a table as the portal so that we do not get react
  // warnings when mounting a tr element
  const _tableContain = (): Instance => {
    const table: HTMLElement = document.createElement('table');
    table.className = wrapperClassName;

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
      // @ts-ignore
      tbody,
      // @ts-ignore
      headtr,
    };
  };
  if (_instance) {
    return _instance;
  }
  return _instance = _tableContain();
};

export interface TableProps extends DataSetComponentProps {
  columns?: ColumnProps[];
  /**
   * 表头
   */
  header?: ReactNode | ((records: Record[]) => ReactNode);
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
   * 是否自动聚焦
   * @default true
   */
  autoFocus?: boolean;
  /**
   * 数据源
   */
  dataSet: DataSet;
  /**
   * 选择记录的模式
   */
  selectionMode?: SelectionMode;
  /**
   * 在其他模式下是不是要是要rowbox
   */
  alwaysShowRowBox?: boolean;
  /**
   * 显示选择提示
   */
  showSelectionTips?: boolean;
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
  queryFields?: { [key: string]: ReactElement<any>; };
  /**
   * 头部显示的查询字段的数量，超出限制的查询字段放入弹出窗口
   * @default 1
   */
  queryFieldsLimit?: number;
  /**
   * 显示查询条
   * 可选值: `advancedBar` `normal` `bar` `none` `professionalBar` `filterBar`
   * @default 'normal'
   */
  queryBar?: TableQueryBarType | TableQueryBarHook;
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
   * @default 31
   */
  rowHeight?: number | 'auto';
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
   * 显示原始值
   */
  pristine?: boolean;
  /**
   * 点击展开图标时触发
   */
  onExpand?: (expanded: boolean, record: Record) => void;
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
  autoHeight?: boolean | { type: TableAutoHeightType, diff: number };
  /**
   * 是否开启宽度双击最大值
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
  onDragEnd?: (dataSet: DataSet, columns: ColumnProps[], resultDrag: DropResult, provided: ResponderProvided) => void
  /**
   * 拖拽触发事件位置切换前回调
   */
  onDragEndBefore?: (dataSet: DataSet, columns: ColumnProps[], resultDrag: DropResult, provided: ResponderProvided) => DropResult | boolean | void,
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
  keyboard?: boolean,
  /**
   * 筛选条属性配置
   */
  dynamicFilterBar?: DynamicFilterBarConfig,
  /**
   * 异步树
   */
  treeAsync?: boolean;
  /**
   * 树节点展开时，加载数据钩子
   */
  treeLoadData?: ({ record, dataSet }) => Promise<any>,
  /**
   * 显示行号
   */
  rowNumber?: boolean | ((props: { record?: Record | null, dataSet?: DataSet | null, text: string, pathNumbers: number[] }) => ReactNode);
  /**
   * 个性化编码
   */
  customizedCode?: string;
  /**
   * 是否显示个性化设置入口按钮
   */
  customizable?: string;
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
   * 可以修改由于样式导致的虚拟高度和rowHeight不一致
  */
  virtualRowHeight?: number;
}

@observer
export default class Table extends DataSetComponent<TableProps> {
  static displayName = 'Table';

  static Column = Column;

  static FilterBar = FilterBar;

  static AdvancedQueryBar = AdvancedQueryBar;

  static ProfessionalBar = ProfessionalBar;

  static DynamicFilterBar = DynamicFilterBar;

  static ToolBar = ToolBar;

  static TableRow = TableRow;

  static TableHeaderCell = TableHeaderCell;

  static propTypes = {
    columns: PropTypes.array,
    /**
     * 表头
     */
    header: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    /**
     * 表脚
     */
    footer: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    /**
     * 是否显示边框
     * @default true
     */
    border: PropTypes.bool,
    /**
     * 功能按钮
     * 可选值：`add` `delete` `remove` `save` `query` `expandAll` `collapseAll` 或 自定义按钮
     */
    buttons: PropTypes.arrayOf(
      PropTypes.oneOfType([
        buttonsEnumType,
        PropTypes.arrayOf(PropTypes.oneOfType([buttonsEnumType, PropTypes.object])),
        PropTypes.node,
      ]),
    ),
    /**
     * 自定义查询字段组件
     * 默认会根据queryDataSet中定义的field类型自动匹配组件， 匹配类型如下
     * lovCode => Lov
     * lookupCode => Select
     * type:number => NumberField
     * type:date => DatePicker
     * type:dateTime => DatePicker[mode=dateTime]
     * type:week => DatePicker[mode=week]
     * default => TextField
     */
    queryFields: PropTypes.object,
    /**
     * 头部显示的查询字段的数量，超出限制的查询字段放入弹出窗口
     * @default 1
     */
    queryFieldsLimit: PropTypes.number,
    /**
     * 头部显示的汇总字段的数量，超出限制的查询字段放入弹出窗口
     * @default 3
     */
    summaryFieldsLimit: PropTypes.number,
    /**
     * 显示查询条
     * @default true
     */
    queryBar: PropTypes.oneOfType([
      PropTypes.oneOf([
        TableQueryBarType.advancedBar,
        TableQueryBarType.normal,
        TableQueryBarType.bar,
        TableQueryBarType.none,
        TableQueryBarType.professionalBar,
        TableQueryBarType.filterBar,
      ]),
      PropTypes.func,
    ]),
    useMouseBatchChoose: PropTypes.bool,
    /**
     * 行高
     * @default 30
     */
    rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])]),
    alwaysShowRowBox: PropTypes.bool,
    defaultRowExpanded: PropTypes.bool,
    expandRowByClick: PropTypes.bool,
    indentSize: PropTypes.number,
    filter: PropTypes.func,
    mode: PropTypes.oneOf([TableMode.list, TableMode.tree]),
    editMode: PropTypes.oneOf([TableEditMode.inline, TableEditMode.cell]),
    filterBarFieldName: PropTypes.string,
    filterBarPlaceholder: PropTypes.string,
    highLightRow: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf([HighLightRowType.focus, HighLightRowType.click])]),
    selectedHighLightRow: PropTypes.bool,
    parityRow: PropTypes.bool,
    autoMaxWidth: PropTypes.bool,
    /**
     * 设置drag框体位置
     */
    dragColumnAlign: PropTypes.oneOf([DragColumnAlign.left, DragColumnAlign.right]),
    /**
     * 开启列拖拽，但是无法使用宽度拖拽
     */
    columnDraggable: PropTypes.bool,
    /**
     * 开启行拖拽
     */
    rowDraggable: PropTypes.bool,
    columnsDragRender: PropTypes.object,
    expandIcon: PropTypes.func,
    rowDragRender: PropTypes.object,
    onDragEndBefore: PropTypes.func,
    /**
     * 开启新建自动定位
     */
    autoFocus: PropTypes.bool,
    /**
     * 新增的组合键开关闭
     */
    keyboard: PropTypes.bool,
    /**
     * 是否单独处理column footer
     */
    autoFootHeight: PropTypes.bool,
    /**
     * 客户端查询导出，查询数目设置
     */
    clientExportQuantity: PropTypes.number,
    /**
     * 可以修改由于样式导致的虚拟高度和rowHeight不一致
     */
    virtualRowHeight: PropTypes.number,
    ...DataSetComponent.propTypes,
  };

  static defaultProps = {
    suffixCls: 'table',
    tabIndex: 0,
    selectionMode: SelectionMode.rowbox,
    queryFields: {},
    defaultRowExpanded: false,
    expandRowByClick: false,
    indentSize: 15,
    summaryFieldsLimit: 3,
    filterBarFieldName: 'params',
    virtual: false,
    virtualSpin: false,
    autoHeight: false,
    autoMaxWidth: true,
    autoFootHeight: false,
    clientExportQuantity: 100,
  };

  tableStore: TableStore = new TableStore(this);

  nextFrameActionId?: number;

  scrollId?: number;

  resizeLine: HTMLDivElement | null;

  tableHeadWrap: HTMLDivElement | null;

  tableBodyWrap: HTMLDivElement | null;

  tableFootWrap: HTMLDivElement | null;

  fixedColumnsBodyLeft: HTMLDivElement | null;

  fixedColumnsBodyRight: HTMLDivElement | null;

  lastScrollLeft: number;

  scrollPosition: ScrollPosition;

  refSpin: HTMLDivElement | null = null;

  get currentRow(): HTMLTableRowElement | null {
    const { tableStore: { prefixCls } } = this;
    return this.element.querySelector(
      `.${prefixCls}-row-current`,
    ) as HTMLTableRowElement | null;
  }

  get firstRow(): HTMLTableRowElement | null {
    const { tableStore: { prefixCls } } = this;
    return this.element.querySelector(
      `.${prefixCls}-row:first-child`,
    ) as HTMLTableRowElement | null;
  }

  get lastRow(): HTMLTableRowElement | null {
    const { tableStore: { prefixCls } } = this;
    return this.element.querySelector(
      `.${prefixCls}-row:last-child`,
    ) as HTMLTableRowElement | null;
  }

  @autobind
  saveResizeRef(node: HTMLDivElement | null) {
    this.resizeLine = node;
  }

  @autobind
  @action
  handleResize(width: number) {
    const { element, tableStore } = this;
    if (!element.offsetParent) {
      tableStore.styledHidden = true;
    } else if (!tableStore.hidden) {
      this.syncSizeInFrame(width);
    } else {
      tableStore.styledHidden = false;
    }
  }

  @autobind
  handleDataSetLoad() {
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
    e.preventDefault();
    const {
      tableStore: { dataSet },
    } = this;
    dataSet.create({}, 0);
  }

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
            const uniqueFieldIterator = new Map([...dataSet.fields.entries()]
              .filter(([_key, field]) => !!field.get('unique'))).keys();
            const uniqueFieldNames = Array.from(uniqueFieldIterator);
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

  getOtherProps() {
    const otherProps = omit(super.getOtherProps(), [
      'columns',
      'header',
      'footer',
      'border',
      'style',
      'selectionMode',
      'alwaysShowRowBox',
      'onRow',
      'rowRenderer',
      'buttons',
      'rowHeight',
      'queryFields',
      'queryFieldsLimit',
      'summaryFieldsLimit',
      'queryBar',
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
    ]);
    otherProps.onKeyDown = this.handleKeyDown;
    const { rowHeight } = this.tableStore;
    if (rowHeight !== 'auto') {
      otherProps.style = { lineHeight: pxToRem(rowHeight) };
    }
    return otherProps;
  }

  getClassName(): string | undefined {
    const {
      tableStore: { prefixCls, border, rowHeight, parityRow },
    } = this;
    return super.getClassName(`${prefixCls}-scroll-position-left`, {
      [`${prefixCls}-bordered`]: border,
      [`${prefixCls}-parity-row`]: parityRow,
      [`${prefixCls}-row-height-fixed`]: isNumber(rowHeight),
    });
  }

  getWrapperProps(props = {}) {
    const { style } = this.props;
    const { tableStore } = this;
    const newStyle: any = omit(style, ['width', 'height']);
    if (style && style.width !== undefined && style.width !== 'auto') {
      newStyle.width = Math.max(
        style.width as number,
        tableStore.leftLeafColumnsWidth + tableStore.rightLeafColumnsWidth + defaultMinWidth,
      );
    }
    return super.getWrapperProps({
      style: newStyle,
      ...props,
    });
  }

  /**
   * 获取传入的 Spin props
   */
  getSpinProps() {
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


  @autobind
  handleDragMouseUp() {
    const { dataSet, mouseBatchChooseIdList } = this.tableStore;
    if (this.tableStore.mouseBatchChooseState) {
      this.tableStore.mouseBatchChooseState = false;
      const { mouseBatchChooseStartId, mouseBatchChooseEndId } = this.tableStore;
      if (mouseBatchChooseStartId === mouseBatchChooseEndId) {
        return;
      }
      (mouseBatchChooseIdList || []).forEach((id: number) => {
        const record = dataSet.find((innerRecord) => innerRecord.id === id);
        if (record) {
          dataSet.select(record);
        }
      });
    }
  };

  componentWillMount() {
    super.componentWillMount();
    this.initDefaultExpandedRows();
    this.connect();
  }

  componentDidMount() {
    this.syncSize();
    this.syncSizeInFrame();
  }

  componentWillReceiveProps(nextProps, nextContext) {
    super.componentWillReceiveProps(nextProps, nextContext);
    this.disconnect();
    this.tableStore.updateProps(nextProps);
    this.connect();
  }

  componentWillUnmount() {
    this.disconnect();
    if (this.scrollId !== undefined) {
      raf.cancel(this.scrollId);
    }
  }

  connect() {
    this.processDataSetListener(true);
    // 为什么使用 pointerup
    // 因为需要对disabled的元素进行特殊处理
    // 因为状态的改变依赖 mouseup 而在disabled的元素上 无法触发mouseup事件
    // 导致状态无法进行修正
    // 以下两种方案通过 pointer-events:none 进行处理
    // https://stackoverflow.com/questions/322378/javascript-check-if-mouse-button-down
    // https://stackoverflow.com/questions/62081666/the-event-of-the-document-is-not-triggered-when-it-is-on-a-disabled-element
    // 而使用指针事件可以突破disabled的限制
    // https://stackoverflow.com/questions/62126515/how-to-get-the-state-of-the-mouse-through-javascript/62127845#62127845
    if (this.tableStore.useMouseBatchChoose) {
      document.addEventListener('pointerup', this.handleDragMouseUp);
    }
  }

  disconnect() {
    this.processDataSetListener(false);
    if (this.tableStore.useMouseBatchChoose) {
      document.removeEventListener('pointerup', this.handleDragMouseUp);
    }
  }

  processDataSetListener(flag: boolean) {
    const { isTree, dataSet, inlineEdit } = this.tableStore;
    if (dataSet) {
      const handler = flag ? dataSet.addEventListener : dataSet.removeEventListener;
      if (isTree) {
        handler.call(dataSet, 'load', this.handleDataSetLoad);
      }
      if (inlineEdit) {
        handler.call(dataSet, 'create', this.handleDataSetCreate);
      }
    }
  }

  render() {
    const {
      tableStore,
      tableStore: { prefixCls, virtual, overflowX, overflowY, isAnyColumnsLeftLock, isAnyColumnsRightLock },
      props: {
        style,
        spin,
        virtualSpin,
        buttons,
        queryFields,
        queryFieldsLimit,
        summaryFieldsLimit,
        filterBarFieldName,
        filterBarPlaceholder,
        summaryBar,
        dynamicFilterBar,
        clientExportQuantity,
      },
    } = this;
    const content = this.getTable();
    const context = { tableStore };
    const pagination = this.getPagination(TablePaginationPosition.top);
    const tableSpinProps = getConfig('tableSpinProps');
    const styleHeight = style ? toPx(style.height) : 0;

    return (
      <ReactResizeObserver resizeProp="width" onResize={this.handleResize}>
        <div {...this.getWrapperProps()}>
          <TableContext.Provider value={context}>
            <ModalProvider>
              {this.getHeader()}
              <TableQueryBar
                buttons={buttons}
                pagination={pagination}
                queryFields={queryFields}
                clientExportQuantity={clientExportQuantity}
                summaryBar={summaryBar}
                dynamicFilterBar={dynamicFilterBar}
                queryFieldsLimit={queryFieldsLimit}
                summaryFieldsLimit={summaryFieldsLimit}
                filterBarFieldName={filterBarFieldName}
                filterBarPlaceholder={filterBarPlaceholder}
              />
              <Spin {...tableSpinProps} {...this.getSpinProps()} key="content">
                {
                  virtual && (
                    <div
                      ref={(node) => this.refSpin = node}
                      style={{
                        display: 'none',
                      }}
                    >
                      {virtualSpin && <Spin
                        key="virtual"
                        spinning
                        style={{
                          height: pxToRem(styleHeight),
                          lineHeight: pxToRem(styleHeight),
                          position: 'absolute',
                          width: '100%',
                          zIndex: 4,
                        }}
                        {...tableSpinProps}
                        {...spin}
                      />}
                    </div>
                  )
                }
                <div {...this.getOtherProps()}>
                  <div
                    className={classNames(`${prefixCls}-content`, { [`${prefixCls}-content-overflow`]: isStickySupport() && overflowX && !overflowY })}
                    onScroll={this.handleBodyScroll}
                  >
                    {!isStickySupport() && isAnyColumnsLeftLock && overflowX && this.getLeftFixedTable()}
                    {content}
                    {!isStickySupport() && isAnyColumnsRightLock && overflowX && this.getRightFixedTable()}
                  </div>
                  <div ref={this.saveResizeRef} className={`${prefixCls}-split-line`} />
                  {this.getFooter()}
                </div>
              </Spin>
              {this.getPagination(TablePaginationPosition.bottom)}
            </ModalProvider>
          </TableContext.Provider>
        </div>
      </ReactResizeObserver>
    );
  }

  @action
  reorderDataSet(startIndex: number, endIndex: number) {
    const { dataSet } = this.tableStore;
    dataSet.move(startIndex, endIndex);
  };

  @autobind
  handleDragEnd(resultDrag: DropResult, provided: ResponderProvided) {
    const { onDragEnd, onDragEndBefore } = this.props;

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
    if (resultBefore && resultBefore.destination) {
      this.reorderDataSet(
        resultBefore.source.index,
        resultBefore.destination.index,
      );
    }
    /**
     * 相应变化后的数据
     */
    if (onDragEnd) {
      onDragEnd(this.tableStore.dataSet, toJS(this.tableStore.columns), resultBefore, provided);
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

  /**
   * 滚动结束隐藏spin
   */
  setSpin = debounce(() => {
    this.refSpin!.style.display = 'none';
  }, 300);

  handleBodyScrollTop(e, currentTarget) {
    const { target } = e;
    const {
      props: { autoHeight },
      tableStore: { virtual, height, lastScrollTop },
    } = this;
    if (
      (isStickySupport() && !virtual) ||
      (height === undefined && !autoHeight) ||
      currentTarget !== target ||
      target === this.tableFootWrap
    ) {
      return;
    }
    const fixedColumnsBodyLeft = this.fixedColumnsBodyLeft;
    const bodyTable = this.tableBodyWrap;
    const fixedColumnsBodyRight = this.fixedColumnsBodyRight;
    const { scrollTop } = target;
    if (scrollTop !== lastScrollTop) {
      if (fixedColumnsBodyLeft && target !== fixedColumnsBodyLeft) {
        fixedColumnsBodyLeft.scrollTop = scrollTop;
      }
      if (bodyTable && target !== bodyTable) {
        bodyTable.scrollTop = scrollTop;
      }
      if (fixedColumnsBodyRight && target !== fixedColumnsBodyRight) {
        fixedColumnsBodyRight.scrollTop = scrollTop;
      }

      if (virtual) {
        this.refSpin!.style.display = 'block';
        this.setSpin();
      }
      this.tableStore.setLastScrollTop(scrollTop);
    }
  }

  handleBodyScrollLeft(e, currentTarget) {
    const { target } = e;
    const { tableStore } = this;
    const headTable = this.tableHeadWrap;
    const bodyTable = this.tableBodyWrap;
    const footTable = this.tableFootWrap;
    if (
      !tableStore.overflowX ||
      currentTarget !== target ||
      target === this.fixedColumnsBodyRight ||
      target === this.fixedColumnsBodyLeft
    ) {
      return;
    }
    const { scrollLeft } = target;
    if (scrollLeft !== this.lastScrollLeft) {
      if (isStickySupport()) {
        [...tableStore.editors.values()].forEach((editor) => {
          if (editor.lock && editor.cellNode) {
            if (tableStore.inlineEdit) {
              editor.alignEditor(editor.cellNode);
            } else {
              editor.hideEditor();
            }
          }
        });
      }
      if (headTable && target !== headTable) {
        headTable.scrollLeft = scrollLeft;
      }
      if (bodyTable && target !== bodyTable) {
        bodyTable.scrollLeft = scrollLeft;
      }
      if (footTable && target !== footTable) {
        footTable.scrollLeft = scrollLeft;
      }
      this.setScrollPositionClassName(target);
    }
    this.lastScrollLeft = scrollLeft;
  }

  setScrollPositionClassName(target?: any): void {
    if (this.tableStore.isAnyColumnsLock) {
      const node = target || this.tableBodyWrap;
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

  setScrollPosition(position: ScrollPosition): void {
    if (this.scrollPosition !== position) {
      this.scrollPosition = position;
      const { prefixCls } = this.tableStore;
      const cls = classes(this.element).remove(new RegExp(`^${prefixCls}-scroll-position-.+$`));
      if (position === ScrollPosition.both) {
        cls.add(`${prefixCls}-scroll-position-left`).add(`${prefixCls}-scroll-position-right`);
      } else {
        cls.add(`${prefixCls}-scroll-position-${position}`);
      }
    }
  }

  renderTable(
    hasHeader: boolean,
    hasBody: boolean,
    hasFooter: boolean,
    lock?: ColumnLock | boolean,
  ): ReactNode {
    const {
      tableStore: { virtual },
    } = this;

    return virtual ? (
      <>
        {
          hasHeader && (
            <TableWrapper
              key="tableWrapper-header"
              lock={lock}
              hasBody={hasBody}
              hasHeader={hasHeader}
              hasFooter={hasFooter}
            >
              {this.getTableHeader(lock)}
            </TableWrapper>
          )
        }
        {
          hasBody && (
            <VirtualWrapper>
              <TableWrapper
                key="tableWrapper-body"
                lock={lock}
                hasBody={hasBody}
                hasHeader={hasHeader}
                hasFooter={hasFooter}
              >
                {this.getTableBody(lock)}
              </TableWrapper>
            </VirtualWrapper>
          )
        }
        {
          hasFooter && (
            <TableWrapper
              key="tableWrapper-footer"
              lock={lock}
              hasBody={hasBody}
              hasHeader={hasFooter}
              hasFooter={hasFooter}
            >
              {this.getTableFooter(lock)}
            </TableWrapper>
          )
        }
      </>
    ) : (
      <TableWrapper
        key="tableWrapper"
        lock={lock}
        hasBody={hasBody}
        hasHeader={hasHeader}
        hasFooter={hasFooter}
      >
        {hasHeader && this.getTableHeader(lock)}
        {hasBody && this.getTableBody(lock)}
        {hasFooter && this.getTableFooter(lock)}
      </TableWrapper>
    );
  }

  getHeader(): ReactNode {
    const {
      props: { header, dataSet },
    } = this;
    if (header) {
      const { prefixCls } = this.tableStore;
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
      const { prefixCls } = this.tableStore;
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
      tableStore: { prefixCls, pagination, showSelectionTips },
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

  getTable(lock?: ColumnLock | boolean): ReactNode {
    const { autoHeight } = this.props;
    const { overflowX, height, hasFooter: footer } = this.tableStore;
    let tableHead: ReactNode;
    let tableBody: ReactNode;
    let tableFooter: ReactNode;
    if ((!isStickySupport() && overflowX) || height !== undefined || autoHeight) {
      const { prefixCls, lockColumnsBodyRowsHeight, rowHeight, leftLeafColumnsWidth, rightLeafColumnsWidth, overflowY } = this.tableStore;
      let bodyHeight = height;
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
      if (isObject(autoHeight) && autoHeight.type === TableAutoHeightType.maxHeight) {
        bodyHeight = undefined;
      }
      if (bodyHeight !== undefined) {
        bodyHeight = Math.max(
          bodyHeight,
          isNumber(rowHeight) ? rowHeight : lockColumnsBodyRowsHeight[0] || 0,
        );
        if (lock && !footer) {
          bodyHeight -= measureScrollbar();
        }
      }
      const style: CSSProperties | undefined = lock ? {
        width: pxToRem(lock === ColumnLock.right
          ? (rightLeafColumnsWidth - 1 + (overflowY ? measureScrollbar() : 0))
          : leftLeafColumnsWidth),
        marginLeft: lock === ColumnLock.right ? pxToRem(1) : undefined,
      } : undefined;

      tableHead = (
        <div key="tableHead" ref={tableHeadRef} className={`${prefixCls}-head`} style={style}>
          {this.renderTable(true, false, false, lock)}
        </div>
      );

      tableBody = (
        <TableBody
          key="tableBody"
          getRef={tableBodyRef}
          lock={lock}
          height={bodyHeight}
          onScroll={this.handleBodyScroll}
        >
          {this.renderTable(false, true, false, lock)}
        </TableBody>
      );

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
    const { overflowX, height, prefixCls } = this.tableStore;
    if (!overflowX && height === undefined) {
      return;
    }
    const table = this.getTable(ColumnLock.left);
    return <div className={`${prefixCls}-fixed-left`}>{table}</div>;
  }

  getRightFixedTable(): ReactNode | undefined {
    const { overflowX, height, prefixCls } = this.tableStore;
    if (!overflowX && height === undefined) {
      return;
    }
    const table = this.getTable(ColumnLock.right);
    return <div className={`${prefixCls}-fixed-right`}>{table}</div>;
  }

  getTableBody(lock?: ColumnLock | boolean): ReactNode {
    const {
      props: { indentSize, style },
      tableStore: { rowDraggable },
    } = this;
    const body = <TableTBody key="tbody" lock={lock} indentSize={indentSize!} style={style} />;
    return rowDraggable ? (
      <DragDropContext onDragEnd={this.handleDragEnd}>
        {body}
      </DragDropContext>
    ) : body;
  }

  getTableHeader(lock?: ColumnLock | boolean): ReactNode {
    const {
      props: { dataSet },
    } = this;
    return (
      <TableHeader key="thead" lock={lock} dataSet={dataSet} />
    );
  }

  getTableFooter(lock?: ColumnLock | boolean): ReactNode {
    const {
      props: { dataSet },
    } = this;
    return <TableFooter key="tfoot" lock={lock} dataSet={dataSet} />;
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

  getContentHeight() {
    const { wrapper, element, props: { autoHeight }, tableBodyWrap, tableStore: { prefixCls } } = this;
    if (autoHeight) {
      const { top: parentTop, height: parentHeight } = wrapper.parentNode.getBoundingClientRect();
      const { paddingBottom } = wrapper.parentNode.style;
      const { top: tableTop } = element.getBoundingClientRect();
      let diff = getConfig('tableAutoHeightDiff') || 80;
      let type = TableAutoHeightType.minHeight;
      if (isObject(autoHeight)) {
        type = autoHeight.type || TableAutoHeightType.minHeight;
        diff = autoHeight.diff || diff;
      }
      const paddingBottomPx = toPx(paddingBottom) || 0;
      if (wrapper) {
        if (type === TableAutoHeightType.minHeight) {
          return parentHeight - (tableTop - parentTop) - diff - paddingBottomPx;
        }
        const maxHeight = parentHeight - (tableTop - parentTop) - diff - paddingBottomPx;
        // 保证max高度和Height维持一致防止scroll问题 maxHeight - 外框paddingBottom 以及 diff 和其他 tableBody 以外的高度。
        if (tableBodyWrap) {
          let maxBodyHeight = maxHeight;
          const tableHeader: HTMLTableSectionElement | null = element.querySelector(
            `.${prefixCls}-thead`,
          );
          const tableFooter: HTMLTableSectionElement | null = element.querySelector(
            `.${prefixCls}-footer`,
          );
          const tableFootWrap: HTMLDivElement | null = element.querySelector(`.${prefixCls}-foot`);
          if (tableHeader) {
            maxBodyHeight -= getHeight(tableHeader);
          }
          if (tableFooter) {
            maxBodyHeight -= getHeight(tableFooter);
          }
          if (tableFootWrap) {
            maxBodyHeight -= getHeight(tableFootWrap);
          }
          tableBodyWrap.style.maxHeight = pxToRem(maxBodyHeight) || '';
        }
        return maxHeight || 0;
      }
    }
    return this.getStyleHeight();
  };

  @autobind
  @action
  syncSize(width: number = this.getWidth()) {
    const { element, tableStore } = this;
    if (element) {
      tableStore.width = Math.floor(width);
      const { prefixCls } = tableStore;
      let height = this.getContentHeight();
      if (element && isNumber(height)) {
        const tableTitle: HTMLDivElement | null = element.querySelector(`.${prefixCls}-title`);
        const tableHeader: HTMLTableSectionElement | null = element.querySelector(
          `.${prefixCls}-thead`,
        );
        const tableFooter: HTMLTableSectionElement | null = element.querySelector(
          `.${prefixCls}-footer`,
        );
        const tableFootWrap: HTMLDivElement | null = element.querySelector(`.${prefixCls}-foot`);
        if (tableTitle) {
          height -= getHeight(tableTitle);
        }
        if (tableHeader) {
          height -= getHeight(tableHeader);
        }
        if (tableFooter) {
          height -= getHeight(tableFooter);
        }
        if (tableFootWrap) {
          height -= getHeight(tableFootWrap);
        }
        this.tableStore.height = height;
      }
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

  getWidth(): number {
    const { wrapper } = this;
    if (wrapper) {
      return Math.floor(wrapper.getBoundingClientRect().width);
    }
    return 0;
  }
}
