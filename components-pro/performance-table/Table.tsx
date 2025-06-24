// @ts-nocheck
import * as React from 'react';
import { action, get, isArrayLike, runInAction } from 'mobx';
import classNames from 'classnames';
import isFunction from 'lodash/isFunction';
import flatten from 'lodash/flatten';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import eq from 'lodash/eq';
import defaultTo from 'lodash/defaultTo';
import omit from 'lodash/omit';
import merge from 'lodash/merge';
import isNil from 'lodash/isNil';
import uniq from 'lodash/uniq';
import BScroll from '@better-scroll/core';
import bindElementResize, { unbind as unbindElementResize } from 'element-resize-event';
import { getTranslateDOMPositionXY } from 'dom-lib/lib/transition/translateDOMPositionXY';
import { addStyle, getHeight, getOffset, getWidth, on, scrollLeft, scrollTop, WheelHandler } from 'dom-lib';
import {
  DragDropContext,
  Draggable,
  DraggableChildrenFn,
  DraggableProps,
  DraggableProvided,
  DraggableStateSnapshot,
  DragStart,
  Droppable,
  DroppableProps,
  DroppableProvided,
  DropResult,
  ResponderProvided,
} from 'react-beautiful-dnd';
import isPromise from 'is-promise';

import ConfigContext, { ConfigContextValue } from 'choerodon-ui/lib/config-provider/ConfigContext';
import { toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import LocaleReceiver from 'choerodon-ui/lib/locale-provider/LocaleReceiver';
import { PerformanceTable as PerformanceTableLocal } from 'choerodon-ui/lib/locale-provider';
import { getRuntimeLocale } from 'choerodon-ui/lib/locale-provider/utils';
import warning from 'choerodon-ui/lib/_util/warning';
import { RadioChangeEvent } from 'choerodon-ui/lib/radio';
import { CheckboxChangeEvent } from 'choerodon-ui/lib/checkbox';

import { stopPropagation } from '../_util/EventManager';
import ModalProvider from '../modal-provider/ModalProvider';
import Row, { RowProps } from './Row';
import CellGroup from './CellGroup';
import Scrollbar from './Scrollbar';
import SelectionBox from './SelectionBox';
import SelectionCheckboxAll from './SelectionCheckboxAll';
import TableContext from './TableContext';
import { CELL_PADDING_HEIGHT, SCROLLBAR_LARGE_WIDTH, SCROLLBAR_WIDTH } from './constants';
import { TableQueryBarType } from './enum';
import {
  cancelAnimationTimeout,
  defaultClassPrefix,
  findAllParents,
  findRowKeys,
  flattenData,
  getTotalByColumns,
  getUnhandledProps,
  isNumberOrTrue,
  isRTL,
  mergeCells,
  prefix,
  requestAnimationTimeout,
  resetLeftForCells,
  shouldShowRowByExpanded,
  toggleClass,
} from './utils';

import isMobile from '../_util/isMobile';
import { transformZoomData } from '../_util/DocumentUtils';
import { RowDataType, SortType, StandardProps } from './common';
import ColumnGroup from './ColumnGroup';
import Column, { ColumnProps } from './Column';
import Cell from './Cell';
import HeaderCell from './HeaderCell';
import Spin from '../spin';
import PerformanceTableQueryBar from './query-bar';
import ProfessionalBar from './query-bar/TableProfessionalBar';
import DynamicFilterBar from './query-bar/TableDynamicFilterBar';
import TableStore, { mergeDefaultProps } from './TableStore';
import Toolbar, { ToolBarProps } from './tool-bar';
import { TableAutoHeightType, TableColumnResizeTriggerType, TableHeightType } from '../table/enum';
import { isDropresult } from '../table/utils';
import { arrayMove } from '../data-set/utils';
import { $l } from '../locale-context';
import DataSet from '../data-set';
import { TransportProps } from '../data-set/Transport';
import { FormProps } from '../form/Form';

export interface TableLocale {
  emptyMessage?: string;
  loading?: string;
}


export interface TableScrollLength {
  horizontal?: number;
  vertical?: number;
}

export {
  TableQueryBarType,
};

export interface TableQueryBarProps {
  type?: TableQueryBarType;
  renderer?: (props: TableQueryBarHookProps) => React.ReactNode;
  dataSet?: DataSet;
  queryFormProps?: FormProps;
  defaultExpanded?: Boolean;
  queryDataSet?: DataSet;
  queryFields?: React.ReactElement<any>[];
  queryFieldsLimit?: number;
  onQuery?: (props: object) => void;
  onReset?: () => void;
}

export interface TableQueryBarHookProps {
  dataSet: DataSet;
  queryDataSet?: DataSet;
  queryFields: React.ReactElement<any>[];
  queryFieldsLimit?: number;
  onQuery?: (props: object) => void;
  onReset?: () => void;
}

export interface DynamicFilterBarConfig {
  searchCode: string;
  searchText?: string;
  quickSearch?: boolean;
  suffixes?: React.ReactElement<any>[];
  prefixes?: React.ReactElement<any>[];
  tableFilterAdapter?: TransportProps;
}

export interface PerformanceTableCustomized {
  columns: object;
  heightType?: TableHeightType;
  height?: number;
  heightDiff?: number;
}

export type RowSelectionType = 'checkbox' | 'radio';
export type SelectionSelectFn = (
  record: object,
  selected: boolean,
  selectedRows: Object[],
  nativeEvent: Event,
) => void;

export type TableSelectWay = 'onSelect' | 'onSelectMultiple' | 'onSelectAll' | 'onSelectInvert';
export type SelectionItemSelectFn = (key: string[]) => void;

export interface SelectionItem {
  key: string;
  text: React.ReactNode;
  onSelect?: SelectionItemSelectFn;
}

export interface TableRowSelection {
  type?: RowSelectionType;
  selectedRowKeys?: string[] | number[];
  onChange?: (selectedRowKeys: string[] | number[], selectedRows: object[]) => void;
  getCheckboxProps?: (record: object) => Object;
  onSelect?: SelectionSelectFn;
  onSelectMultiple?: (selected: boolean, selectedRows: object[], changeRows: object[]) => void;
  onSelectAll?: (selected: boolean, selectedRows: object[], changeRows: object[]) => void;
  onSelectInvert?: (selectedRowKeys: string[] | number[]) => void;
  selections?: SelectionItem[] | boolean;
  hideDefaultSelections?: boolean;
  fixed?: boolean | string;
  columnWidth?: number;
  selectWay?: TableSelectWay;
  columnTitle?: string | React.ReactNode;
  columnIndex?: number;
}

export interface SelectionCheckboxAllProps {
  store: any;
  disabled: boolean;
  getCheckboxPropsByItem: (item: object, index: number) => { defaultChecked: boolean };
  getRecordKey: (record: object, index?: number) => string;
  data: object[];
  prefixCls: string | undefined;
  onSelect: (key: string, index: number, selectFunc: any) => void;
  hideDefaultSelections?: boolean;
  selections?: SelectionItem[] | boolean;
}

export interface SelectionCheckboxAllState {
  checked?: boolean;
  indeterminate?: boolean;
}

export interface SelectionBoxProps {
  store: any;
  type?: RowSelectionType;
  defaultSelection: string[];
  rowIndex: string;
  name?: string;
  disabled?: boolean;
  onChange: (e: RadioChangeEvent | CheckboxChangeEvent) => void;
}

export interface SelectionBoxState {
  checked?: boolean;
}

export interface SelectionInfo {
  selectWay: TableSelectWay;
  record?: object;
  checked?: boolean;
  changeRowKeys?: React.Key[];
  nativeEvent?: Event;
}

export interface ColumnRenderIcon {
  column: ColumnProps;
  dataSet?: DataSet | undefined;
  snapshot?: DraggableStateSnapshot;
}

export interface DragRender {
  droppableProps?: DroppableProps;
  draggableProps?: DraggableProps;
  renderClone?: DraggableChildrenFn;
  renderIcon?: ((rowRenderIcon: ColumnRenderIcon) => React.ReactElement<any>);
}

export interface TableProps extends StandardProps {
  /** 左上角的 title */
  headerTitle?: React.ReactNode;
  rowSelection?: TableRowSelection;
  queryBar?: false | TableQueryBarProps;
  components?: TableComponents;
  toolbar?: ToolBarProps,
  /** 渲染操作栏 */
  toolBarRender?: ToolBarProps['toolBarRender'] | false,
  columns?: ColumnProps[];
  autoHeight?: boolean | { type: TableAutoHeightType; diff: number };
  affixHeader?: boolean | number;
  affixHorizontalScrollbar?: boolean | number;
  bodyRef?: (ref: HTMLElement) => void;
  bordered?: boolean;
  className?: string;
  classPrefix?: string;
  children?: React.ReactNode;
  cellBordered?: boolean;
  defaultSortType?: SortType;
  disabledScroll?: boolean;
  defaultExpandAllRows?: boolean;
  defaultExpandedRowKeys?: string[] | number[];
  data: object[];
  expandedRowKeys?: string[] | number[];
  height?: number;
  hover?: boolean;
  headerHeight?: number;
  locale?: TableLocale;
  clickScrollLength?: TableScrollLength,
  loading?: boolean;
  loadAnimation?: boolean;
  minHeight?: number;
  rowHeight?: number | ((rowData: object) => number);
  rowKey?: string;
  isTree?: boolean;
  rowExpandedHeight?: number;
  rowClassName?: string | ((rowData: object) => string);
  showHeader?: boolean;
  showScrollArrow?: boolean;
  style?: React.CSSProperties;
  sortColumn?: string;
  sortType?: SortType;
  shouldUpdateScroll?: boolean;
  translate3d?: boolean;
  rtl?: boolean;
  width?: number;
  wordWrap?: boolean;
  virtualized?: boolean;
  renderTreeToggle?: (
    expandButton: React.ReactNode,
    rowData?: RowDataType,
    expanded?: boolean,
  ) => React.ReactNode;
  renderRowExpanded?: (rowDate?: object) => React.ReactNode;
  renderEmpty?: (info: React.ReactNode) => React.ReactNode;
  renderLoading?: (loading: React.ReactNode) => React.ReactNode;
  onRowClick?: (rowData: object, event: React.MouseEvent) => void;
  onRowDoubleClick?: (rowData: object, event: React.MouseEvent) => void;
  onRowContextMenu?: (rowData: object, event: React.MouseEvent) => void;
  onScroll?: (scrollX: number, scrollY: number) => void;
  onSortColumn?: (dataKey: string, sortType?: SortType) => void;
  onExpandChange?: (expanded: boolean, rowData: object) => void;
  onTouchStart?: (event: React.TouchEvent) => void; // for tests
  onTouchMove?: (event: React.TouchEvent) => void; // for tests
  onDataUpdated?: (nextData: object[], scrollTo: (coord: { x: number; y: number }) => void) => void;
  customizedCode?: string;
  customizable?: boolean;
  columnDraggable?: boolean;
  columnTitleEditable?: boolean;
  columnsDragRender?: DragRender;
  rowDraggable?: boolean;
  onDragStart?: (initial: DragStart, provided: ResponderProvided) => void;
  onDragEnd?: (result: DropResult, provided: ResponderProvided, data: object) => void;
  onDragEndBefore?: (result: DropResult, provided: ResponderProvided) => boolean;
}

export type CustomizeComponent = React.Component<any>;

export interface TableComponents {
  table?: CustomizeComponent;
  header?: {
    wrapper?: CustomizeComponent;
    row?: CustomizeComponent;
    cell?: CustomizeComponent;
  };
  body?: {
    wrapper?: CustomizeComponent;
    row?: CustomizeComponent;
    cell?: CustomizeComponent;
  };
}

interface TableRowProps extends RowProps {
  key?: string | number;
  depth?: number;
}

const SORT_TYPE = {
  DESC: 'desc',
  ASC: 'asc',
};

type Offset = {
  top?: number;
  left?: number;
  width?: number;
  height?: number;
};

type StartRowSpan = {
  rowIndex: number;
  rowSpan: number;
  height: number;
}

interface ColumnCellProps extends ColumnProps {
  parent?: React.ReactElement;
}

interface TableState {
  headerOffset?: Offset;
  tableOffset?: Offset;
  width: number;
  columnWidth: number;
  dataKey: number;
  shouldFixedColumn: boolean;
  contentHeight: number;
  contentWidth: number;
  tableRowsMaxHeight: number[];
  isColumnResizing?: boolean;
  expandedRowKeys: string[] | number[];
  searchText: string;
  sortType?: SortType;
  scrollY: number;
  isScrolling?: boolean;
  data: object[];
  cacheData: object[];
  fixedHeader: boolean;
  fixedHorizontalScrollbar?: boolean;
  isTree?: boolean;
  selectedRowKeys: string[] | number[];
  selectionDirty?: boolean;

  [key: string]: any;
}

const propTypeKeys = [
  'columns',
  'autoHeight',
  'affixHeader',
  'affixHorizontalScrollbar',
  'bordered',
  'bodyRef',
  'className',
  'classPrefix',
  'children',
  'cellBordered',
  'clickScrollLength',
  'data',
  'defaultExpandAllRows',
  'defaultExpandedRowKeys',
  'defaultSortType',
  'disabledScroll',
  'expandedRowKeys',
  'hover',
  'height',
  'headerHeight',
  'locale',
  'loading',
  'loadAnimation',
  'minHeight',
  'rowKey',
  'rowHeight',
  'renderTreeToggle',
  'renderRowExpanded',
  'rowExpandedHeight',
  'renderEmpty',
  'renderLoading',
  'rowClassName',
  'rtl',
  'style',
  'sortColumn',
  'sortType',
  'showHeader',
  'showScrollArrow',
  'shouldUpdateScroll',
  'translate3d',
  'wordWrap',
  'width',
  'virtualized',
  'isTree',
  'onRowClick',
  'onRowContextMenu',
  'onScroll',
  'onSortColumn',
  'onExpandChange',
  'onTouchStart',
  'onTouchMove',
  'onDataUpdated',
  'highLightRow',
  'queryBar',
  'customizedCode',
  'customizable',
  'columnDraggable',
  'columnTitleEditable',
  'columnsDragRender',
  'rowSelection',
  'rowDraggable',
  'onDragEndBefore',
  'onDragEnd',
  'onDragStart',
];

export const CUSTOMIZED_KEY = '__customized-column__'; // TODO:Symbol

function getRowSelection(props: TableProps): TableRowSelection {
  return props.rowSelection || {};
}

//计算两根手指之间的距离
function getDistance(start, stop) {
  return Math.sqrt(Math.pow(Math.abs(start.x - stop.x), 2) + Math.pow(Math.abs(start.y - stop.y), 2));
};

export default class PerformanceTable extends React.Component<TableProps, TableState> {
  static displayName = 'performance';

  static Column = Column;

  static Row = Row;

  static Cell = Cell;

  static CellGroup = CellGroup;

  static ColumnGroup = ColumnGroup;

  static HeaderCell = HeaderCell;

  static ProfessionalBar = ProfessionalBar;

  static DynamicFilterBar = DynamicFilterBar;

  static defaultProps = {
    classPrefix: defaultClassPrefix('performance-table'),
    data: [],
    defaultSortType: SORT_TYPE.ASC,
    height: 200,
    rowHeight: 33,
    headerHeight: 33,
    minHeight: 0,
    rowExpandedHeight: 100,
    hover: true,
    highLightRow: true,
    showHeader: true,
    showScrollArrow: false,
    bordered: true,
    rowKey: 'key',
    translate3d: true,
    shouldUpdateScroll: true,
    locale: {
      emptyMessage: 'No data found',
      loading: 'Loading...',
    },
    clickScrollLength: {
      horizontal: 100,
      vertical: 33,
    },
  };

  static getDerivedStateFromProps(props: TableProps, state: TableState) {
    if (props.data !== state.cacheData || props.isTree !== state.isTree) {
      return {
        cacheData: props.data,
        isTree: props.isTree,
        data: props.isTree ? flattenData(props.data) : props.data,
      };
    }
    return null;
  }

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  context: ConfigContextValue;

  translateDOMPositionXY = null;
  scrollListener: any = null;
  bscroll: any = null;

  tableRef: React.RefObject<any>;
  scrollbarYRef: React.RefObject<any>;
  scrollbarXRef: React.RefObject<any>;
  tableBodyRef: React.RefObject<any>;
  affixHeaderWrapperRef: React.RefObject<any>;
  mouseAreaRef: React.RefObject<any>;
  headerWrapperRef: React.RefObject<any>;
  tableHeaderRef: React.RefObject<any>;
  wheelWrapperRef: React.RefObject<any>;

  tableRows: { [key: string]: [HTMLElement, any] } = {};
  mounted = false;
  disableEventsTimeoutId = null;
  scrollY = 0;
  scrollX = 0;
  wheelHandler: any;
  minScrollY: any;
  minScrollX: any;
  mouseArea: any;
  touchX: any;
  touchY: any;
  wheelListener: any;
  touchStartListener: any;
  touchMoveListener: any;
  nextRowZIndex: Array<number> = [];
  calcStartRowSpan: StartRowSpan = { rowIndex: 0, rowSpan: 0, height: 0 };

  _cacheCalcStartRowSpan: Array<StartRowSpan> = []; // 缓存合并行的计算结果

  _cacheCells: any = null;
  _cacheScrollX: number = 0;
  _cacheRenderCols: any = [];
  _cacheChildrenSize = 0;
  _visibleRows: any = [];
  _lastRowIndex: string | number;

  tableStore: TableStore = new TableStore(this);

  scaleStore = {
    firstDistance: 0, // 手指距离
    centerPoint: [0, 0], // 中心点坐标
    scale: 1, // 缩放比例
    originScale: 1 // 原始缩放比例
  }

  constructor(props: TableProps, context: ConfigContextValue) {
    super(props, context);
    const {
      width,
      height,
      data,
      rowKey,
      defaultExpandAllRows,
      renderRowExpanded,
      defaultExpandedRowKeys,
      children = [],
      columns = [],
      isTree,
      defaultSortType,
    } = props;

    const expandedRowKeys = defaultExpandAllRows
      ? findRowKeys(data, rowKey!, isFunction(renderRowExpanded))
      : defaultExpandedRowKeys || [];

    let shouldFixedColumn = Array.from(children as Iterable<any>).some(
      (child: any) => child && child.props && child.props.fixed,
    );

    if (columns && columns.length) {
      shouldFixedColumn = Array.from(columns as Iterable<any>).some(
        (child: any) => child && child.fixed,
      );
    }

    if (isTree && !rowKey) {
      throw new Error('The `rowKey` is required when set isTree');
    }

    this.state = {
      isTree,
      expandedRowKeys,
      shouldFixedColumn,
      cacheData: data,
      data: isTree ? flattenData(data) : data,
      width: width || 0,
      height: height || 0,
      columnWidth: 0,
      dataKey: 0,
      contentHeight: 0,
      contentWidth: 0,
      tableRowsMaxHeight: [],
      sortType: defaultSortType,
      scrollY: 0,
      isScrolling: false,
      fixedHeader: false,
      searchText: '',
      pivot: undefined,
      selectedRowKeys: [],
      dragRowIndex: '',
    };

    this.scrollY = 0;
    this.scrollX = 0;
    this._cacheScrollX = 0;
    this._cacheRenderCols = [];
    this.wheelHandler = new WheelHandler(
      this.listenWheel,
      this.shouldHandleWheelX,
      this.shouldHandleWheelY,
      false,
    );

    this._cacheChildrenSize = flatten(children as any[] || columns).length;

    this.translateDOMPositionXY = getTranslateDOMPositionXY({
      enable3DTransform: props.translate3d,
    });
    this.tableRef = React.createRef();
    this.scrollbarYRef = React.createRef();
    this.scrollbarXRef = React.createRef();
    this.tableBodyRef = React.createRef();
    this.affixHeaderWrapperRef = React.createRef();
    this.mouseAreaRef = React.createRef();
    this.headerWrapperRef = React.createRef();
    this.wheelWrapperRef = React.createRef();
    this.tableHeaderRef = React.createRef();

    runInAction(() => this.setSelectionColumn(props));
  }

  setSelectionColumn = (props) => {
    const { rowSelection, columns = [], children = [] } = props;
    const index = columns.findIndex(column => column.key === 'rowSelection');
    if (rowSelection) {
      if (index > -1) columns.splice(index, 1);
      let rowSelectionFixed: any = 'left';
      if ('fixed' in rowSelection) {
        rowSelectionFixed = rowSelection.fixed;
      }
      if (columns && columns.length) {
        const columnsWithRowSelectionProps: ColumnProps = {
          title: $l('Table', 'select_current_page'),
          key: 'rowSelection',
          width: 50,
          align: 'center',
          fixed: rowSelectionFixed,
        };
        columns.splice(rowSelection.columnIndex || 0, 0, columnsWithRowSelectionProps);
        this._cacheChildrenSize = flatten(columns).length;
      }

      if (children && (children as any[]).length) {
        const columnsWithRowSelection = this.renderRowSelection(rowSelectionFixed);

        if (columnsWithRowSelection) {
          if (rowSelectionFixed) {
            (children as any[]).splice((rowSelectionFixed === true || 'left') ? (rowSelection.columnIndex || 0) : (rowSelection.columnIndex || (children as any[]).length), 0, columnsWithRowSelection);
            this.setState({ shouldFixedColumn: true });
          } else {
            (children as any[]).splice(rowSelection.columnIndex || 0, 0, columnsWithRowSelection);
          }
        }
        this._cacheChildrenSize = flatten(children as any[]).length;
      }
      const { customized, customizable } = this.tableStore;
      const customizedColumns = customizable ? customized.columns : undefined;
      this.tableStore.originalColumns = mergeDefaultProps(columns, customizedColumns);;
      this.tableStore.originalChildren = children as any[];
      this.tableStore.selectedRowKeys = rowSelection.selectedRowKeys || [];
    }
  };

  listenWheel = (deltaX: number, deltaY: number) => {
    this.handleWheel(deltaX, deltaY);
    const xRef = this.scrollbarXRef.current;
    if (xRef && xRef.onWheelScroll) {
      xRef.onWheelScroll(deltaX);
    }
    const yRef = this.scrollbarYRef.current;
    if (yRef && yRef.onWheelScroll) {
      yRef.onWheelScroll(deltaY);
    }
  };

  /**
   * @param height 内容区高度（未包含横向滚动条）
   * @returns 包含横向滚动条的内容区高度
   */
  getContentHeightWithScrollBarX(height: number) {
    const { showScrollArrow } = this.props;
    const { scrollBarOffset, decScrollBarOffset } = this.getScrollBarOffset();
    const table = this.tableRef.current;
    const width = getWidth(table);
    const row = table.querySelector(`.${this.addPrefix('row')}:not(.virtualized)`);
    const contentWidth = row ? getWidth(row) : 0;
    const length = width - decScrollBarOffset;
    const scrollLength = contentWidth - decScrollBarOffset;
    const scrollBarXHeight = showScrollArrow ? SCROLLBAR_LARGE_WIDTH : SCROLLBAR_WIDTH;
    return height + (scrollLength > length ? scrollBarXHeight : 0);
  }

  componentDidMount() {
    this.calculateTableWidth();
    this.calculateTableContextHeight();
    this.calculateRowMaxHeight();
    this.setOffsetByAffix();
    this.initPosition();
    bindElementResize(this.tableRef.current, debounce(this.calculateTableWidth, 400));

    const options = { passive: false };
    const tableBody = this.tableBodyRef.current;
    const wheelWrapper = this.wheelWrapperRef.current;
    if (tableBody) {
      if (isMobile()) {
        this.initBScroll(tableBody);
        // 移动端适配缩放功能
        if (wheelWrapper) {
          this.touchStartListener = on(wheelWrapper, 'touchstart', this.handleWheelTouchStart);
          this.touchMoveListener = on(wheelWrapper, 'touchmove', this.handleWheelTouchMove);
        }
      }
      this.wheelListener = on(tableBody, 'wheel', this.wheelHandler.onWheel, options);
      // this.touchStartListener = on(tableBody, 'touchstart', this.handleTouchStart, options);
      // this.touchMoveListener = on(tableBody, 'touchmove', this.handleTouchMove, options);
    }

    const { affixHeader, affixHorizontalScrollbar, bodyRef } = this.props;
    if (isNumberOrTrue(affixHeader) || isNumberOrTrue(affixHorizontalScrollbar)) {
      this.scrollListener = on(window, 'scroll', this.handleWindowScroll);
    }
    if (bodyRef) {
      bodyRef(this.wheelWrapperRef.current);
    }
  }

  shouldComponentUpdate(nextProps: TableProps, nextState: TableState) {
    const nextPropsRowSelection = getRowSelection(nextProps);
    const _cacheChildrenSize = flatten((nextProps.children as any[] || nextProps.columns) || []).length;
    const hasRowSelection = nextProps.columns?.some(column => column.key === 'rowSelection');

    /**
     * 单元格列的信息在初始化后会被缓存，在某些属性被更新以后，需要清除缓存。
     */
    const real_cacheChildrenSize = (!hasRowSelection && Object.keys(nextPropsRowSelection).length) ? 1 + _cacheChildrenSize : _cacheChildrenSize;
    if (real_cacheChildrenSize !== this._cacheChildrenSize) {
      this._cacheChildrenSize = _cacheChildrenSize;
      this._cacheCells = null;
      this.tableStore.updateProps(nextProps, this);
    } else if (
      this.props.children !== nextProps.children ||
      this.props.columns !== nextProps.columns ||
      this.props.sortColumn !== nextProps.sortColumn ||
      this.props.sortType !== nextProps.sortType
    ) {
      this._cacheCells = null;
      this.tableStore.updateProps(nextProps, this);
    } else if (this.props.data !== nextProps.data && this._cacheCells) {
      const { rowSelection } = nextProps;
      if (rowSelection && rowSelection.type !== 'radio') {
        const flatData = nextState.data.filter((item, index) => {
          if (rowSelection.getCheckboxProps) {
            return !this.getCheckboxPropsByItem(item, index).disabled;
          }
          return true;
        });
        const checkboxAllDisabled = flatData.every(
          (item, index) => this.getCheckboxPropsByItem(item, index).disabled,
        );
        const checkboxAllHeaderCell = React.cloneElement(
          this._cacheCells.headerCells[0],
          {
            children: React.cloneElement(
              this._cacheCells.headerCells[0].props.children,
              {
                disabled: checkboxAllDisabled,
                data: flatData,
              },
            ),
          },
        );
        this._cacheCells.headerCells[0] = checkboxAllHeaderCell;
      }
    }
    runInAction(() => this.setSelectionColumn(nextProps));

    return !eq(this.props, nextProps) || !isEqual(this.state, nextState);
  }

  componentDidUpdate(prevProps: TableProps, prevState: TableState) {
    const { rowHeight, data, autoHeight, height, virtualized, children, columns, rowDraggable } = prevProps;
    const { props, state } = this;
    const rowSelection = getRowSelection(this.props);
    const { data: nextData, autoHeight: nextAutoHeight, onDataUpdated, shouldUpdateScroll, columns: nextColumns, children: nextChildren, rowDraggable: nextRowDraggable } = props;
    if (data !== nextData) {
      this.calculateRowMaxHeight();
      if (onDataUpdated) {
        onDataUpdated(nextData, this.scrollTo);
      }
      const maxHeight =
        nextData.length * (typeof rowHeight === 'function' ? rowHeight({}) : rowHeight!);
      // 当开启允许更新滚动条，或者滚动条位置大于表格的最大高度，则初始滚动条位置
      if (shouldUpdateScroll || Math.abs(this.scrollY) > maxHeight) {
        this.scrollTo({ x: 0, y: 0 });
      }
    } else {
      this.updatePosition();
    }

    if (columns !== nextColumns || children !== nextChildren || this.tableStore.customizable) {
      let shouldFixedColumn = false;

      if ((!columns || columns.length === 0) && rowSelection && nextColumns && nextColumns.length) {
        let rowSelectionFixed: any = 'left';
        if ('fixed' in rowSelection) {
          rowSelectionFixed = rowSelection.fixed;
        }
        const columnsWithRowSelectionProps: ColumnProps = {
          title: $l('Table', 'select_current_page'),
          key: 'rowSelection',
          width: 50,
          align: 'center',
          fixed: rowSelectionFixed,
        };
        runInAction(() => {
          this.tableStore.originalColumns = nextColumns.splice(rowSelection.columnIndex || 0, 0, columnsWithRowSelectionProps);
        });
      }

      if (nextChildren) {
        shouldFixedColumn = Array.from(nextChildren as Iterable<any>).some(
          (child: any) => child && child.props && child.props.fixed,
        );
      }
      const { originalColumns } = this.tableStore;
      if (originalColumns && originalColumns.length) {
        shouldFixedColumn = Array.from(originalColumns as Iterable<any>).some(
          (child: any) => child && child.fixed,
        );
      }
      this.setState({ shouldFixedColumn: shouldFixedColumn });
    }

    if (
      // 当 Table 的 data 发生变化，需要重新计算高度
      data !== nextData ||
      // 当 Table 内容区的高度发生变化需要重新计算
      height !== props.height ||
      !isEqual(autoHeight, nextAutoHeight) ||
      // 当 Table 内容区的高度发生变化需要重新计算
      prevState.contentHeight !== state.contentHeight ||
      // 当 expandedRowKeys 发生变化，需要重新计算 Table 高度，如果重算会导致滚动条不显示。
      prevState.expandedRowKeys !== state.expandedRowKeys ||
      prevProps.expandedRowKeys !== props.expandedRowKeys
    ) {
      this.calculateTableContextHeight(prevProps);
    }

    this.calculateTableContentWidth(prevProps);
    if (virtualized) {
      this.calculateTableWidth();
    }

    const tableBody = this.tableBodyRef.current;

    if ((!this.wheelListener && tableBody) || (rowDraggable !== nextRowDraggable)) {
      const options = { passive: false };
      if (isMobile()) {
        this.initBScroll(tableBody);
      }
      this.wheelListener = on(tableBody, 'wheel', this.wheelHandler.onWheel, options);
    }
  }

  componentWillUnmount() {
    this.wheelHandler = null;
    const { current } = this.tableRef;
    if (current) {
      unbindElementResize(current);
    }
    const { wheelListener, touchStartListener, touchMoveListener, scrollListener } = this;
    if (wheelListener) {
      wheelListener.off();
    }
    if (touchStartListener) {
      touchStartListener.off();
    }
    if (touchMoveListener) {
      touchMoveListener.off();
    }
    if (scrollListener) {
      scrollListener.off();
    }
  }

  getExpandedRowKeys() {
    const { expandedRowKeys } = this.props;
    return typeof expandedRowKeys === 'undefined' ? this.state.expandedRowKeys : expandedRowKeys;
  }

  getSortType() {
    const { sortType } = this.props;
    return typeof sortType === 'undefined' ? this.state.sortType : sortType;
  }

  getScrollCellGroups() {
    const { current } = this.tableRef;
    return current && current.querySelectorAll(`.${this.addPrefix('cell-group-scroll')}`);
  }

  getFixedLeftCellGroups() {
    const { current } = this.tableRef;
    return current && current.querySelectorAll(`.${this.addPrefix('cell-group-fixed-left')}`);
  }

  getFixedRightCellGroups() {
    const { current } = this.tableRef;
    return current && current.querySelectorAll(`.${this.addPrefix('cell-group-fixed-right')}`);
  }

  isRTL() {
    return this.props.rtl || isRTL();
  }

  getRowHeight(rowData = {}) {
    const { rowHeight } = this.props;
    return typeof rowHeight === 'function' ? rowHeight(rowData) : rowHeight!;
  }

  get getScrollBarYWidth(): number {
    const { width } = this.state;
    const { showScrollArrow } = this.props;

    const table = this.tableRef && this.tableRef.current;
    if (table) {
      const row = table.querySelector(`.${this.addPrefix('row')}:not(.virtualized)`);
      const contentWidth = row ? getWidth(row) : 0;

      if (contentWidth > width && !!this.scrollbarXRef) {
        return showScrollArrow ? SCROLLBAR_LARGE_WIDTH : SCROLLBAR_WIDTH;
      }
    }

    return 0;
  }

  /**
   * 获取表头高度
   */
  getTableHeaderHeight() {
    const { headerHeight, showHeader } = this.props;
    return showHeader ? headerHeight! : 0;
  }

  /**
   * Table 个性化高度变更
   */
  handleHeightTypeChange() {
    this.calculateTableContextHeight();
  }

  /**
   * 获取 Table 需要渲染的高度
   */
  getTableHeight() {
    const { contentHeight } = this.state;
    const { minHeight, height, data, showScrollArrow } = this.props;
    const headerHeight = this.getTableHeaderHeight();
    const {
      tableStore: {
        customized: { heightType, height: cusHeight, heightDiff },
        tempCustomized,
        autoHeight,
      },
    } = this;

    let tableHeight: number = Math.max(height!, minHeight!);

    if (this.tableStore.customizable) {
      const tempHeightType = get(tempCustomized, 'heightType');
      if (tempHeightType) {
        if (tempHeightType === TableHeightType.fixed) {
          tableHeight = get(tempCustomized, 'height');
        }
        if (tempHeightType === TableHeightType.flex) {
          tableHeight = document.documentElement.clientHeight - (get(tempCustomized, 'heightDiff') || 0);
        }
      }
      if (heightType) {
        if (heightType === TableHeightType.fixed) {
          tableHeight = cusHeight as number;
        }
        if (heightType === TableHeightType.flex) {
          tableHeight = document.documentElement.clientHeight - (heightDiff || 0);
        }
      }

      this.setState({
        height: tableHeight,
      });
    }

    if ((data.length === 0 && !autoHeight)) {
      return tableHeight;
    }

    if (autoHeight) {
      if (typeof autoHeight === 'boolean') {
        return Math.max(headerHeight + contentHeight, minHeight!) + (showScrollArrow ? SCROLLBAR_LARGE_WIDTH : SCROLLBAR_WIDTH);
      } else {
        const tableRef = this.tableRef && this.tableRef.current;
        if (!tableRef) return tableHeight;
        const { parentNode } = tableRef;
        const { offsetHeight } = parentNode
        const { type, diff } = autoHeight;
        if (type === TableAutoHeightType.minHeight) {
          return offsetHeight - diff;
        } else {
          return Math.min(offsetHeight, headerHeight + contentHeight + (showScrollArrow ? SCROLLBAR_LARGE_WIDTH : SCROLLBAR_WIDTH) + diff) - diff;
        }
      }
    }
    return tableHeight;
  }

  /**
   * 处理 column props
   * @param column
   */
  getColumnProps(column) {
    return omit(column, ['title', 'dataIndex', 'key', 'render']);
  }

  /**
   * 处理columns json -> reactNode
   * @param columns
   */
  processTableColumns(columns: any[]) {
    const visibleColumn = columns.filter(col => !col.hidden);
    const { components } = this.props;
    return visibleColumn.map((column) => {
      const dataKey = column.dataIndex;
      if (column.type === 'ColumnGroup') {
        return <ColumnGroup {...this.getColumnProps(column)}>{this.processTableColumns(column.children)}</ColumnGroup>;
      }
      if (column.key === 'rowSelection') {
        return this.renderRowSelection(column.fixed);
      }
      return (
        // @ts-ignore
        <Column {...this.getColumnProps(column)} dataKey={dataKey} key={dataKey}>
          {
            <HeaderCell>
              {components &&
                components.header &&
                components.header.cell &&
                React.isValidElement(components.header.cell) ?
                React.cloneElement(components.header.cell, { ...column }) :
                (typeof column.title === 'function' ? column.title() : column.title)}
            </HeaderCell>
          }
          {typeof column.render === 'function' ? (
            <Cell dataKey={dataKey}>
              {
                (rowData, rowIndex) => column.render!({ rowData, rowIndex, dataIndex: dataKey })
              }
            </Cell>
          ) : (
            components &&
              components.body &&
              components.body.cell &&
              React.isValidElement(components.body.cell) ?
              React.cloneElement(components.body.cell, { ...column, dataKey }) :
              <Cell dataKey={dataKey} />
          )}
        </Column>
      );
    });
  }

  getFlattenColumn(column: React.ReactElement, cellProps: ColumnCellProps, array: Array<React.ReactElement>) {
    const { header, children: childColumns, align, fixed, verticalAlign } = column.props;
    for (let index = 0; index < childColumns.length; index += 1) {
      const childColumn = childColumns[index];
      if (childColumn) {
        const { verticalAlign: childVerticalAlign, align: childAlign } = childColumn.props;
        const parentProps = {
          align: childAlign || align,
          fixed,
          verticalAlign: childVerticalAlign || verticalAlign,
          ...cellProps,
        };
        const groupCellProps: any = {
          parent: column,
          ...childColumn.props,
          ...parentProps,
        };
        if (index === 0) {
          groupCellProps.groupCount = childColumns.length;
          groupCellProps.groupHeader = header;
        }
        if (childColumn.type && (childColumn.type as typeof ColumnGroup).__PRO_TABLE_COLUMN_GROUP) {
          const res = this.getFlattenColumn(childColumn, { ...parentProps, parent: column }, array);
          array.concat(res);
        } else {
          array.push(React.cloneElement(childColumn, groupCellProps));
        }
      }
    }
    return array;
  }

  /**
   * 获取 columns ReactElement 数组
   * - 处理 children 中存在 <Column> 数组的情况
   * - 过滤 children 中的空项
   */
  getTableColumns(): React.ReactNodeArray {
    const { originalColumns, originalChildren } = this.tableStore;
    let children = originalChildren;
    if (originalColumns && originalColumns.length) {
      children = this.processTableColumns(originalColumns);
    }

    if (!Array.isArray(children) && !isArrayLike(children)) {
      return children as React.ReactNodeArray;
    }

    // Fix that the `ColumnGroup` array cannot be rendered in the Table
    const flattenColumns = flatten(children).map((column: React.ReactElement) => {
      if (column) {
        const columnChildren: any = column.props.children;
        let cellProps: ColumnProps = {
          dataIndex: columnChildren.length > 1
            ?
            columnChildren[1].props.dataKey
            :
            columnChildren[0].props.dataKey,
        };
        cellProps.hidden = column.props.hidden;
        if (column.type && (column.type as typeof ColumnGroup).__PRO_TABLE_COLUMN_GROUP) {
          return this.getFlattenColumn(column, cellProps, []);
        }
        return React.cloneElement(column, cellProps);
      }
      return column;
    });

    // 把 Columns 中的数组，展平为一维数组，计算 lastColumn 与 firstColumn。
    const flatColumns = flatten(flattenColumns).filter(col => col && col.props && !col.props.hidden);
    /**
     * 将左固定列、右固定列和其他列提取出来
     * 排列成正常显示列的顺序
     * 提供给后面bodyCell使用
     */
    const { fixedLeftCells, fixedRightCells, scrollCells } = this.calculateFixedAndScrollColumn(flatColumns);
    // 重新计算列的时候需清除在虚拟滚动时候的渲染列缓存
    this._cacheRenderCols = [];
    return [...fixedLeftCells, ...scrollCells, ...fixedRightCells];
  }

  getRecordKey = (record: object, index: number) => {
    const { rowKey } = this.props;
    const recordKey = record[rowKey!];
    warning(
      recordKey !== undefined,
      'Each record in dataSource of table should have a unique `key` prop, ' +
      'or set `rowKey` of Table to an unique primary key.',
    );
    return recordKey === undefined ? index : recordKey;
  };

  getCheckboxPropsByItem = (item: object, index: number) => {
    const rowSelection = getRowSelection(this.props);
    if (!rowSelection.getCheckboxProps) {
      return {};
    }
    return rowSelection.getCheckboxProps(item);
    // const key = this.getRecordKey(item, index);
    // Cache checkboxProps
    // if (!this.tableStore.checkboxPropsCache[key]) {
    //   this.tableStore.checkboxPropsCache[key] = rowSelection.getCheckboxProps(item) || {};
    //   const checkboxProps = this.tableStore.checkboxPropsCache[key];
    //   warning(
    //     !('checked' in checkboxProps) && !('defaultChecked' in checkboxProps),
    //     'Do not set `checked` or `defaultChecked` in `getCheckboxProps`. Please use `selectedRowKeys` instead.',
    //   );
    // }
    // return this.tableStore.checkboxPropsCache[key];
  };

  getDefaultSelection() {
    const rowSelection = getRowSelection(this.props);
    if (!rowSelection.getCheckboxProps) {
      return [];
    }
    if (rowSelection.selectedRowKeys) {
      return rowSelection.selectedRowKeys;
    }
    return this.state.data
      .filter((item: any, rowIndex) => this.getCheckboxPropsByItem(item, rowIndex).defaultChecked)
      .map((record, rowIndex) => this.getRecordKey(record, rowIndex));
  }


  handleSelect = (record: object, rowIndex: number, e: CheckboxChangeEvent) => {
    const checked = e.target.checked;
    const nativeEvent = e.nativeEvent;
    const defaultSelection = this.tableStore.selectionDirty
      ? []
      : this.getDefaultSelection();

    // @ts-ignore
    let selectedRowKeys = uniq(this.tableStore.selectedRowKeys.concat(defaultSelection));
    const key = this.getRecordKey(record, rowIndex);
    const { pivot, data } = this.state;
    const rows = { ...data };
    let realIndex = rowIndex;
    if (this.props.expandedRowRender) {
      realIndex = rows.findIndex(row => this.getRecordKey(row, rowIndex) === key);
    }

    if (nativeEvent.shiftKey && pivot !== undefined && realIndex !== pivot) {
      const changeRowKeys: string[] = [];
      const direction = Math.sign(pivot - realIndex);
      const dist = Math.abs(pivot - realIndex);
      let step = 0;
      while (step <= dist) {
        const i = realIndex + step * direction;
        step += 1;
        const row = rows[i];
        const rowKey = this.getRecordKey(row, i);
        const checkboxProps = this.getCheckboxPropsByItem(row, i);
        if (!checkboxProps.disabled) {
          if (selectedRowKeys.includes(rowKey)) {
            if (!checked) {
              selectedRowKeys = selectedRowKeys.filter((j: string) => rowKey !== j);
              changeRowKeys.push(rowKey);
            }
          } else if (checked) {
            selectedRowKeys.push(rowKey);
            changeRowKeys.push(rowKey);
          }
        }
      }

      this.setState({ pivot: realIndex });
      this.tableStore.selectionDirty = true;
      this.setSelectedRowKeys(selectedRowKeys, {
        selectWay: 'onSelectMultiple',
        record,
        checked,
        changeRowKeys,
        nativeEvent,
      });
    } else {
      if (checked) {
        selectedRowKeys.push(this.getRecordKey(record, realIndex));
      } else {
        selectedRowKeys = selectedRowKeys.filter((i: string) => key !== i);
      }

      this.setState({ pivot: realIndex });
      this.setSelectedRowKeys(selectedRowKeys, {
        selectWay: 'onSelect',
        record,
        checked,
        changeRowKeys: undefined,
        nativeEvent,
      });
    }
  };

  handleSelectRow = (selectionKey: string, index: number, onSelectFunc: SelectionItemSelectFn) => {
    const { data } = this.state;
    const defaultSelection = this.tableStore.selectionDirty
      ? []
      : this.getDefaultSelection();
    //@ts-ignore
    const selectedRowKeys = this.tableStore.selectedRowKeys.concat(defaultSelection);
    const changeableRowKeys = data
      .filter((item, i) => !this.getCheckboxPropsByItem(item, i).disabled)
      .map((item, i) => this.getRecordKey(item, i));

    const changeRowKeys: string[] = [];
    let selectWay: TableSelectWay = 'onSelectAll';
    let checked;
    // handle default selection
    switch (selectionKey) {
      case 'all':
        changeableRowKeys.forEach(key => {
          if (selectedRowKeys.indexOf(key) < 0) {
            selectedRowKeys.push(key);
            changeRowKeys.push(key);
          }
        });
        selectWay = 'onSelectAll';
        checked = true;
        break;
      case 'removeAll':
        changeableRowKeys.forEach(key => {
          if (selectedRowKeys.indexOf(key) >= 0) {
            selectedRowKeys.splice(selectedRowKeys.indexOf(key), 1);
            changeRowKeys.push(key);
          }
        });
        selectWay = 'onSelectAll';
        checked = false;
        break;
      case 'invert':
        changeableRowKeys.forEach(key => {
          if (selectedRowKeys.indexOf(key) < 0) {
            selectedRowKeys.push(key);
          } else {
            selectedRowKeys.splice(selectedRowKeys.indexOf(key), 1);
          }
          changeRowKeys.push(key);
          selectWay = 'onSelectInvert';
        });
        break;
      default:
        break;
    }

    this.tableStore.selectionDirty = true;
    // when select custom selection, callback selections[n].onSelect
    const { rowSelection } = this.props;
    let customSelectionStartIndex = 2;
    if (rowSelection && rowSelection.hideDefaultSelections) {
      customSelectionStartIndex = 0;
    }
    if (index >= customSelectionStartIndex && typeof onSelectFunc === 'function') {
      return onSelectFunc(changeableRowKeys);
    }
    this.setSelectedRowKeys(selectedRowKeys, {
      selectWay,
      checked,
      changeRowKeys,
    });
  };

  handleRadioSelect = (record: object, rowIndex: number, e: RadioChangeEvent) => {
    const checked = e.target.checked;
    const nativeEvent = e.nativeEvent;
    const key = this.getRecordKey(record, rowIndex);
    const selectedRowKeys = [key];
    this.tableStore.selectionDirty = true;
    this.setSelectedRowKeys(selectedRowKeys, {
      selectWay: 'onSelect',
      record,
      checked,
      changeRowKeys: undefined,
      nativeEvent,
    });
  };

  getIdList = () => {
    const { mouseBatchChooseStartId, mouseBatchChooseEndId } = this.tableStore;
    const { data } = this.state;

    // const rows = Array.from<HTMLTableRowElement>(element.querySelectorAll(`.${prefixCls}-row`));
    let endId;
    const idList: number[] = [];
    data.some((row, i) => {
      const index = this.getRecordKey(row, i);
      if (!endId) {
        if (mouseBatchChooseStartId === index) {
          endId = mouseBatchChooseEndId;
        } else if (mouseBatchChooseEndId === index) {
          endId = mouseBatchChooseStartId;
        }
      }
      if (endId) {
        idList.push(index);
      }
      return endId === index;
    });
    return idList;
  }

  renderSelectionBox = (type: RowSelectionType | undefined, rowData: object, rowIndex: number) => {
    const { data } = this.state;
    const rowKey = this.getRecordKey(rowData, rowIndex);
    const props = this.getCheckboxPropsByItem(rowData, rowIndex);
    const batchSelectProps: any = {};
    const handleChange = (e: RadioChangeEvent | CheckboxChangeEvent) =>
      type === 'radio'
        ? this.handleRadioSelect(rowData, rowIndex, e)
        : this.handleSelect(rowData, rowIndex, e);
    if (type !== 'radio') {
      const handleDragMouseUp = action((e) => {
        const { mouseBatchChooseIdList } = this.tableStore;
        if (this.tableStore.mouseBatchChooseState) {
          this.tableStore.mouseBatchChooseState = false;
          const { mouseBatchChooseStartId, mouseBatchChooseEndId } = this.tableStore;
          if (mouseBatchChooseStartId === mouseBatchChooseEndId) {
            return;
          }
          const changeRowKeys: string[] = [];

          const checked = e.target.checked;
          const nativeEvent = e.nativeEvent;
          mouseBatchChooseIdList.map((itemKey: any) => {
            const checkboxProps = this.getCheckboxPropsByItem(data[itemKey], itemKey);
            if (!checkboxProps.disabled) {
              if (this.tableStore.selectedRowKeys.includes(itemKey)) {
                this.tableStore.selectedRowKeys = this.tableStore.selectedRowKeys.filter((j: string) => itemKey !== j);
                changeRowKeys.push(itemKey);
              } else {
                this.tableStore.selectedRowKeys.push(itemKey);
                changeRowKeys.push(itemKey);
              }
            }
          });
          this.tableStore.changeMouseBatchChooseIdList([]);
          this.tableStore.selectionDirty = true;
          this.setSelectedRowKeys(this.tableStore.selectedRowKeys, {
            selectWay: 'onSelectMultiple',
            record: rowData,
            checked,
            changeRowKeys,
            nativeEvent,
          });
        }
        document.removeEventListener('pointerup', handleDragMouseUp);
      });

      if (this.tableStore.useMouseBatchChoose) {
        batchSelectProps.onMouseDown = action(() => {
          this.tableStore.mouseBatchChooseStartId = rowKey;
          this.tableStore.mouseBatchChooseEndId = rowKey;
          this.tableStore.mouseBatchChooseState = true;
          // 为什么使用 pointerup
          // 因为需要对disabled的元素进行特殊处理
          // 因为状态的改变依赖 mouseup 而在disabled的元素上 无法触发mouseup事件
          // 导致状态无法进行修正
          // 以下两种方案通过 pointer-events:none 进行处理
          // https://stackoverflow.com/questions/322378/javascript-check-if-mouse-button-down
          // https://stackoverflow.com/questions/62081666/the-event-of-the-document-is-not-triggered-when-it-is-on-a-disabled-element
          // 而使用指针事件可以突破disabled的限制
          // https://stackoverflow.com/questions/62126515/how-to-get-the-state-of-the-mouse-through-javascript/62127845#62127845
          document.addEventListener('pointerup', handleDragMouseUp);
        });
        batchSelectProps.onMouseEnter = () => {
          if (this.tableStore.mouseBatchChooseState) {
            this.tableStore.mouseBatchChooseEndId = rowKey;
            this.tableStore.changeMouseBatchChooseIdList(this.getIdList());
          }
        };
      }
    }

    return (
      <span onClick={stopPropagation} {...batchSelectProps}>
        <SelectionBox
          store={this.tableStore}
          type={type}
          rowIndex={rowKey}
          onChange={handleChange}
          defaultSelection={this.getDefaultSelection()}
          {...props}
        />
      </span>
    );
  };

  renderRowSelection(fixed) {
    const { rowSelection, classPrefix, rowKey } = this.props;
    if (rowSelection) {
      const flatData = this.state.data.filter((item, index) => {
        if (rowSelection.getCheckboxProps) {
          return !this.getCheckboxPropsByItem(item, index).disabled;
        }
        return true;
      });
      const selectionColumn: any = {
        key: 'selection-column',
        fixed,
        width: rowSelection.columnWidth || 50,
        title: rowSelection.columnTitle,
      };

      let selectionCheckboxAll: any = null;

      if (rowSelection.type !== 'radio') {
        const checkboxAllDisabled = flatData.every(
          (item, index) => this.getCheckboxPropsByItem(item, index).disabled,
        );
        selectionCheckboxAll = rowSelection.columnTitle || (
          <SelectionCheckboxAll
            store={this.tableStore}
            data={flatData}
            getCheckboxPropsByItem={this.getCheckboxPropsByItem}
            getRecordKey={this.getRecordKey}
            disabled={checkboxAllDisabled}
            prefixCls={classPrefix}
            onSelect={this.handleSelectRow}
            selections={rowSelection.selections}
            hideDefaultSelections={rowSelection.hideDefaultSelections}
          />
        );
      }

      return (
        <Column
          key={selectionColumn.key}
          width={selectionColumn.width}
          align="center"
          fixed={fixed}
        >
          <HeaderCell>
            {selectionCheckboxAll}
          </HeaderCell>
          <Cell dataKey={rowKey}>
            {(rowData, rowIndex) => this.renderSelectionBox(rowSelection.type, rowData, rowIndex)}
          </Cell>
        </Column>
      );
    }
  }

  getCellDescriptor() {
    if (this._cacheCells) {
      return this._cacheCells;
    }
    let hasCustomTreeCol = false;
    let left = 0; // Cell left margin
    const headerCells = []; // Table header cell
    const bodyCells = []; // Table body cell
    const footerCells = [];
    const { children, columns: columnsJson } = this.props;
    let columnHack = children;
    if (columnsJson && columnsJson.length) {
      columnHack = columnsJson;
    }

    if (!columnHack) {
      this._cacheCells = {
        headerCells,
        bodyCells,
        footerCells,
        hasCustomTreeCol,
        allColumnsWidth: left,
      };
      return this._cacheCells;
    }

    const columns = this.getTableColumns();

    const { width: tableWidth } = this.state;
    const { sortColumn, rowHeight, showHeader } = this.props;
    const { totalFlexGrow, totalWidth } = getTotalByColumns(columns, this.state);
    const headerHeight = this.getTableHeaderHeight();
    const hasFooter = columns && columns.some(x => x.props.footer);
    React.Children.forEach(columns, (column, index) => {
      if (React.isValidElement(column)) {
        const columnChildren = column.props.children;
        const { width, resizable, flexGrow, minWidth, onResize, treeCol, footer, fixed } = column.props;

        if (treeCol) {
          hasCustomTreeCol = true;
        }

        if (resizable && flexGrow) {
          console.warn(
            `Cannot set 'resizable' and 'flexGrow' together in <Column>, column index: ${index}`,
          );
        }

        if (columnChildren.length !== 2) {
          throw new Error(`Component <HeaderCell> and <Cell> is required, column index: ${index} `);
        }

        let nextWidth =
          this.state[`${columnChildren[1].props.dataKey}_${index}_width`] || width || 0;

        if (tableWidth && flexGrow && totalFlexGrow) {
          nextWidth = Math.max(
            ((tableWidth - totalWidth) / totalFlexGrow) * flexGrow,
            minWidth || 60,
          );
        }

        const cellProps = {
          ...omit(column.props, ['children']),
          'aria-colindex': index + 1, // Use ARIA to improve accessibility
          left,
          index,
          headerHeight,
          key: index,
          width: nextWidth,
          height: rowHeight,
          firstColumn: index === 0,
          lastColumn: index === columns.length - 1,
          onCell: column.props.onCell,
        };

        const footerCellProps = {
          onCell: undefined,
          style: {
            width: nextWidth,
            height: rowHeight,
            left: fixed === 'right' ? 'unset' : left,
            position: 'absolute',
          }
        }

        const dataKey = columnChildren[1].props.dataKey
        if (showHeader && headerHeight) {
          const headerCellProps = {
            // index 用于拖拽列宽时候（Resizable column），定义的序号
            index,
            dataKey,
            isHeaderCell: true,
            minWidth: column.props.minWidth,
            sortable: column.props.sortable,
            onSortColumn: this.handleSortColumn,
            sortType: this.getSortType(),
            sortColumn,
            flexGrow,
          };

          if (resizable) {
            merge(headerCellProps, {
              onResize,
              onColumnResizeEnd: this.handleColumnResizeEnd,
              onColumnResizeStart: this.handleColumnResizeStart,
              onColumnResizeMove: this.handleColumnResizeMove,
              onMouseEnterHandler: this.handleShowMouseArea,
              onMouseLeaveHandler: this.handleHideMouseArea,
            });
          }

          headerCells.push(
            // @ts-ignore
            React.cloneElement(columnChildren[0], { ...cellProps, ...headerCellProps }),
          );
        }

        if (footer && typeof footer === 'function') {
          footerCells.push(
            // @ts-ignore
            React.cloneElement(<div className={this.addPrefix('cell-footer')}>{footer({ data: this.state.data, dataIndex: dataKey })}</div>, { ...cellProps, ...footerCellProps }),
          );
        } else if (hasFooter) {
          footerCells.push(
            // @ts-ignore
            React.cloneElement(<div className={this.addPrefix('cell-footer')}></div>, { ...cellProps, ...footerCellProps }),
          );
        }

        // @ts-ignore
        bodyCells.push(React.cloneElement(columnChildren[1], cellProps));

        left += nextWidth;
      }
    });

    if (this.tableStore.customizable) {
      const customizationHeaderProps = {
        'aria-colindex': 999, // Use ARIA to improve accessibility
        left: left - 30,
        headerHeight,
        key: CUSTOMIZED_KEY,
        width: 14,
        height: rowHeight,
        fixed: 'right',
        className: this.addPrefix('customization-header'),
        isHeaderCell: true,
      };

      const { tableStore: { customizedColumnHeader } } = this;
      // @ts-ignore
      headerCells.push(<HeaderCell {...customizationHeaderProps}>{customizedColumnHeader()}</HeaderCell>);
    }

    return (this._cacheCells = {
      headerCells,
      bodyCells,
      footerCells,
      allColumnsWidth: left,
      hasCustomTreeCol,
    });
  }

  setOffsetByAffix = () => {
    const { affixHeader, affixHorizontalScrollbar } = this.props;
    const { headerWrapperRef, tableRef } = this;
    const headerNode = headerWrapperRef && headerWrapperRef.current;
    if (isNumberOrTrue(affixHeader) && headerNode) {
      this.setState(() => ({ headerOffset: getOffset(headerNode) }));
    }

    const tableNode = tableRef && tableRef.current;
    if (isNumberOrTrue(affixHorizontalScrollbar) && tableNode) {
      this.setState(() => ({ tableOffset: getOffset(tableNode) }));
    }
  };

  handleWindowScroll = () => {
    const { affixHeader, affixHorizontalScrollbar } = this.props;
    if (isNumberOrTrue(affixHeader)) {
      this.affixTableHeader();
    }
    if (isNumberOrTrue(affixHorizontalScrollbar)) {
      this.affixHorizontalScrollbar();
    }
  };

  affixHorizontalScrollbar = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const windowHeight = getHeight(window);
    const height = this.getTableHeight();

    const { tableOffset, fixedHorizontalScrollbar } = this.state;
    const { affixHorizontalScrollbar } = this.props;
    const headerHeight = this.getTableHeaderHeight();
    const bottom = typeof affixHorizontalScrollbar === 'number' ? affixHorizontalScrollbar : 0;
    const offset = defaultTo(tableOffset && tableOffset.top, 0) + bottom;
    const fixedScrollbar =
      // @ts-ignore
      scrollY + windowHeight < height + offset &&
      // @ts-ignore
      scrollY + windowHeight - headerHeight > offset;
    const { scrollbarXRef } = this;
    if (scrollbarXRef) {
      const { current } = scrollbarXRef;
      if (current) {
        const { barRef } = current;
        if (
          barRef && barRef.current &&
          fixedHorizontalScrollbar !== fixedScrollbar
        ) {
          this.setState({ fixedHorizontalScrollbar: fixedScrollbar });
        }
      }
    }
  };

  affixTableHeader = () => {
    const { affixHeader } = this.props;
    const top = typeof affixHeader === 'number' ? affixHeader : 0;
    const { headerOffset, contentHeight } = this.state;
    const scrollY = window.scrollY || window.pageYOffset;
    const fixedHeader =
      // @ts-ignore
      scrollY - (headerOffset.top - top) >= 0 && scrollY < headerOffset.top - top + contentHeight;

    if (this.affixHeaderWrapperRef.current) {
      toggleClass(this.affixHeaderWrapperRef.current, 'fixed', fixedHeader);
    }
  };

  handleSortColumn = (dataKey: string) => {
    let sortType = this.getSortType();
    const { onSortColumn, sortColumn } = this.props;
    if (sortColumn === dataKey) {
      switch (sortType) {
        case SORT_TYPE.ASC:
          sortType = SORT_TYPE.DESC as SortType;
          break;
        case SORT_TYPE.DESC:
          sortType = undefined;
          break;
        default:
          sortType = SORT_TYPE.ASC as SortType;
      }
      this.setState({ sortType });
    }
    if (onSortColumn) {
      onSortColumn(dataKey, sortType);
    }
  };

  handleShowMouseArea = (width: number, left: number, fixed: boolean | string | undefined): void => {
    const { tableColumnResizeTrigger } = this.tableStore;
    if (tableColumnResizeTrigger !== TableColumnResizeTriggerType.hover) return;
    this.handleColumnResizeMove(width, left, !!fixed);
  };

  handleHideMouseArea = () => {
    const { tableColumnResizeTrigger } = this.tableStore;
    if (tableColumnResizeTrigger !== TableColumnResizeTriggerType.hover) return;
    addStyle(this.mouseAreaRef.current, { display: 'none' });
  };

  handleColumnResizeEnd = (
    columnWidth: number,
    _cursorDelta: number,
    dataKey: any,
    index: number,
  ) => {
    this._cacheCells = null;

    if (this.tableStore.customizable) {
      this.tableStore.changeCustomizedColumnValue(dataKey, {
        width: columnWidth,
      });
    }
    this.setState({ isColumnResizing: false, [`${dataKey}_${index}_width`]: columnWidth });

    addStyle(this.mouseAreaRef.current, { display: 'none' });
    this.scrollLeft(-this.scrollX);
  };

  handleColumnResizeStart = (width: number, left: number, fixed: boolean) => {
    this.setState({ isColumnResizing: true });
    this.handleColumnResizeMove(width, left, fixed);
  };

  handleColumnResizeMove = (width: number, left: number, fixed: boolean) => {
    let mouseAreaLeft = width + left;
    let x = mouseAreaLeft;
    let dir = 'left';

    if (this.isRTL()) {
      mouseAreaLeft += this.minScrollX + this.getScrollBarYWidth;
      dir = 'right';
    }

    if (!fixed) {
      x = mouseAreaLeft + (this.isRTL() ? -this.scrollX : this.scrollX);
    }

    addStyle(this.mouseAreaRef.current, { display: 'block', [dir]: `${x}px` });
  };

  handleTreeToggle = (rowKey: any, _rowIndex: number, rowData: any) => {
    const expandedRowKeys = this.getExpandedRowKeys();

    let open = false;
    const nextExpandedRowKeys = [];

    for (let i = 0; i < expandedRowKeys.length; i++) {
      const key = expandedRowKeys[i];
      if (key === rowKey) {
        open = true;
      } else {
        // @ts-ignore
        nextExpandedRowKeys.push(key);
      }
    }

    if (!open) {
      // @ts-ignore
      nextExpandedRowKeys.push(rowKey);
    }
    this.setState({ expandedRowKeys: nextExpandedRowKeys });
    const { onExpandChange } = this.props;
    if (onExpandChange) {
      onExpandChange(!open, rowData);
    }
  };

  setSelectedRowKeys(selectedRowKeys: string[], selectionInfo: SelectionInfo) {
    const { selectWay, record, checked, changeRowKeys, nativeEvent } = selectionInfo;
    const rowSelection = getRowSelection(this.props);
    if (rowSelection) {
      runInAction(() => {
        this.tableStore.selectedRowKeys = selectedRowKeys;
      });
    }
    const { data } = this.state;
    if (!rowSelection.onChange && !rowSelection[selectWay]) {
      return;
    }
    const selectedRows = data.filter(
      (row, i) => selectedRowKeys.indexOf(this.getRecordKey(row, i)) >= 0,
    );
    if (rowSelection.onChange) {
      rowSelection.onChange(selectedRowKeys, selectedRows);
    }
    if (selectWay === 'onSelect' && rowSelection.onSelect) {
      rowSelection.onSelect(record!, checked!, selectedRows, nativeEvent!);
    } else if (selectWay === 'onSelectMultiple' && rowSelection.onSelectMultiple) {
      const changeRows = data.filter(
        (row, i) => changeRowKeys!.indexOf(this.getRecordKey(row, i)) >= 0,
      );
      rowSelection.onSelectMultiple(checked!, selectedRows, changeRows);
    } else if (selectWay === 'onSelectAll' && rowSelection.onSelectAll) {
      const changeRows = data.filter(
        (row, i) => changeRowKeys!.indexOf(this.getRecordKey(row, i)) >= 0,
      );
      rowSelection.onSelectAll(checked!, selectedRows, changeRows);
    } else if (selectWay === 'onSelectInvert' && rowSelection.onSelectInvert) {
      rowSelection.onSelectInvert(selectedRowKeys);
    }
  }

  handleScrollX = (delta: number) => {
    this.handleWheel(delta, 0);
  };
  handleScrollY = (delta: number) => {
    this.handleWheel(0, delta);
  };

  handleWheel = (deltaX: number, deltaY: number) => {
    const { onScroll, virtualized } = this.props;
    const { contentWidth, width } = this.state;

    if (!this.tableRef.current) {
      return;
    }

    const nextScrollX = contentWidth <= width ? 0 : this.scrollX - deltaX;
    const nextScrollY = this.scrollY - deltaY;

    this.scrollY = Math.min(0, nextScrollY < this.minScrollY ? this.minScrollY : nextScrollY);
    this.scrollX = Math.min(0, nextScrollX < this.minScrollX ? this.minScrollX : nextScrollX);
    this.updatePosition();
    if (onScroll) {
      onScroll(this.scrollX, this.scrollY);
    }
    if (virtualized) {
      this.setState({
        isScrolling: true,
        scrollX: this.scrollX,
        scrollY: this.scrollY,
      });
      if (this.disableEventsTimeoutId) {
        // @ts-ignore
        cancelAnimationTimeout(this.disableEventsTimeoutId);
      }

      // @ts-ignore
      this.disableEventsTimeoutId = requestAnimationTimeout(this.debounceScrollEndedCallback, 150);
    }
  };

  debounceScrollEndedCallback = () => {
    this.disableEventsTimeoutId = null;
    this.setState({
      isScrolling: false,
    });
  };

  // 处理移动端 Touch 事件,  Start 的时候初始化 x,y
  handleTouchStart = (event: React.TouchEvent) => {
    if (event.touches) {
      const { pageX, pageY } = event.touches[0];
      this.touchX = transformZoomData(pageX);
      this.touchY = transformZoomData(pageY);
    }
    const { onTouchStart } = this.props;
    if (onTouchStart) {
      onTouchStart(event);
    }
  };

  // 处理移动端 Touch 事件, Move 的时候初始化，更新 scroll
  handleTouchMove = ({ e }) => {
    const { autoHeight, onTouchMove } = this.props;

    if (e.touches) {
      const eTouch = e.touches[0];
      const pageX = transformZoomData(eTouch.pageX);
      const pageY = transformZoomData(eTouch.pageY);
      const deltaX = this.touchX - pageX;
      const deltaY = autoHeight ? 0 : this.touchY - pageY;

      if (!this.shouldHandleWheelY(deltaY) && !this.shouldHandleWheelX(deltaX)) {
        return;
      }
      if (e.preventDefault) {
        e.preventDefault();
      }

      this.handleWheel(deltaX, deltaY);
      const xRef = this.scrollbarXRef.current;
      if (xRef && xRef.onWheelScroll) {
        xRef.onWheelScroll(deltaX);
      }
      const yRef = this.scrollbarYRef.current;
      if (yRef && yRef.onWheelScroll) {
        yRef.onWheelScroll(deltaY);
      }

      this.touchX = pageX;
      this.touchY = pageY;
    }
    if (onTouchMove) {
      onTouchMove(e);
    }
  };

  handleWheelTouchStart = (e) => {
    const { touches } = e;
    //判断是否是两指
    if (touches.length === 2) {
      const events1 = touches[0];
      const events2 = touches[1];
      // 第一根手指的坐标
      const one = {
        x: events1.pageX,
        y: events1.pageY,
      };
      // 第二根手指的坐标
      const two = {
        x: events2.pageX,
        y: events2.pageY,
      };
      // 取手指中间坐标
      const centerX = (one.x + two.x) / 2;
      const centerY = (one.y + two.y) / 2;
      this.scaleStore.centerPoint = [centerX, centerY];
      this.scaleStore.firstDistance = getDistance(one, two);
      this.scaleStore.originScale = this.scaleStore.scale || 1;
    }
  }

  handleWheelTouchMove = (e) => {
    const { touches } = e;
    if (touches.length === 2) {
      e.stopPropagation();
      const events1 = touches[0];
      const events2 = touches[1];
      // 第一根手指的横坐标
      const one = {
        x: events1.pageX,
        y: events1.pageY,
      };
      // 第二根手指的横坐标
      const two = {
        x: events2.pageX,
        y: events2.pageY,
      };
      const distance = getDistance(one, two);
      let zoom = distance / this.scaleStore.firstDistance;

      let newScale = this.scaleStore.originScale * zoom;
      // 最大缩放比例限制
      if (newScale > 3) {
        newScale = 3;
      } else if (newScale < 1) {
        newScale = 1;
      }
      // 记住使用的缩放值
      this.scaleStore.scale = newScale;
      document.documentElement.style.transformOrigin = `${this.scaleStore.centerPoint[0]}px ${this.scaleStore.centerPoint[1]}px`;
      document.documentElement.style.transform = 'scale(' + newScale + ')';
    }
  }

  /**
   * 当用户在 Table 内使用 tab 键，触发了 onScroll 事件，这个时候应该更新滚动条位置
   * https://github.com/rsuite/rsuite/issues/234
   */
  handleBodyScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (event.target !== this.tableBodyRef.current) {
      return;
    }

    const left = scrollLeft(event.target);
    const top = scrollTop(event.target);

    if (top === 0 && left === 0) {
      return;
    }

    this.listenWheel(left, top);

    scrollLeft(event.target, 0);
    scrollTop(event.target, 0);
  };

  handleDragStart = (initial: DragStart, provided: ResponderProvided) => {
    const { onDragStart } = this.props;
    const { draggableId } = initial;
    this.setState({
      dragRowIndex: draggableId,
    });
    if (isFunction(onDragStart)) {
      onDragStart(initial, provided);
    }
  };

  handleDragEnd = async (resultDrag: DropResult, provided: ResponderProvided) => {
    const { onDragEnd, onDragEndBefore } = this.props;
    const { data } = this.state;
    this.setState({
      dragRowIndex: '',
    });
    let resultBefore: DropResult | undefined = resultDrag;
    if (onDragEndBefore) {
      const resultStatus = onDragEndBefore(resultDrag, provided);
      let result = isPromise(resultStatus) ? await resultStatus : resultStatus;
      if (!result) {
        return;
      }
      if (isDropresult(result)) {
        resultBefore = result;
      }
    }
    if (resultBefore && resultBefore.destination) {
      const resData = [...data];
      arrayMove(resData, resultBefore.source.index, resultBefore.destination.index);
      // 使setState变成同步处理
      setTimeout(() => {
        this.setState({
          data: resData,
        });
      });
      if (onDragEnd) {
        onDragEnd(resultBefore, provided, resData);
      }
    }
  };

  initPosition() {
    if (this.isRTL()) {
      setTimeout(() => {
        const { contentWidth, width } = this.state;

        this.scrollX = width - contentWidth - this.getScrollBarYWidth;
        this.updatePosition();
        const { scrollbarXRef } = this;
        if (scrollbarXRef) {
          const { current } = scrollbarXRef;
          if (current && current.resetScrollBarPosition) {
            current.resetScrollBarPosition(-this.scrollX);
          }
        }
      }, 0);
    }
  }

  initBScroll(tableBody) {
    this.bscroll = new BScroll(tableBody, {
      disableMouse: false,
      disableTouch: false,
      useTransition: false,
      scrollbar: false,
      probeType: 3,
      scrollX: true,
      click: true,
      momentumLimitTime: 500,
    });

    const hooks = this.bscroll.scroller.actions.hooks;

    hooks.on('start', this.handleTouchStart);

    const thHooks = this.bscroll.scroller.actionsHandler.hooks;

    thHooks.on('move', this.handleTouchMove);

    this.bscroll.on('scroll', (pos) => {
      this.handleScrollY(this.scrollY - pos.y);
      this.scrollY = pos.y;
    });
  }

  updatePosition() {
    /**
     * 当存在锁定列情况处理
     */
    if (this.state.shouldFixedColumn) {
      this.updatePositionByFixedCell();
    } else {
      const wheelStyle = {};
      const headerStyle = {};

      // @ts-ignore
      this.translateDOMPositionXY(wheelStyle, this.scrollX, this.scrollY);
      // @ts-ignore
      this.translateDOMPositionXY(headerStyle, this.scrollX, 0);

      const wheelElement = this.wheelWrapperRef && this.wheelWrapperRef.current;
      const headerElement = this.headerWrapperRef && this.headerWrapperRef.current;
      const affixHeaderElement = this.affixHeaderWrapperRef && this.affixHeaderWrapperRef.current;

      wheelElement && addStyle(wheelElement, wheelStyle);
      headerElement && addStyle(headerElement, headerStyle);

      if (affixHeaderElement && affixHeaderElement.hasChildNodes && affixHeaderElement.hasChildNodes()) {
        addStyle(affixHeaderElement.firstChild, headerStyle);
      }
    }
    const header = this.tableHeaderRef && this.tableHeaderRef.current;
    if (header) {
      toggleClass(
        header,
        this.addPrefix('cell-group-shadow'),
        this.scrollY < 0,
      );
    }
  }

  updatePositionByFixedCell() {
    const wheelGroupStyle = {};
    const wheelStyle = {};
    const headerTranslateStyle = {};
    const scrollGroups = this.getScrollCellGroups();
    const fixedLeftGroups = this.getFixedLeftCellGroups();
    const fixedRightGroups = this.getFixedRightCellGroups();
    const { contentWidth, width } = this.state;

    // @ts-ignore
    this.translateDOMPositionXY(wheelGroupStyle, this.scrollX, 0);
    // @ts-ignore
    this.translateDOMPositionXY(wheelStyle, 0, this.scrollY);
    // @ts-ignore
    this.translateDOMPositionXY(headerTranslateStyle, 0, 0);

    const scrollArrayGroups = Array.from(scrollGroups);

    for (let i = 0; i < scrollArrayGroups.length; i++) {
      const group = scrollArrayGroups[i];
      addStyle(group, wheelGroupStyle);
    }
    const header = this.wheelWrapperRef && this.wheelWrapperRef.current;
    const headerTranslate = this.headerWrapperRef && this.headerWrapperRef.current;
    if (header) {
      addStyle(header, wheelStyle);
      addStyle(headerTranslate, headerTranslateStyle);
    }

    const leftShadowClassName = this.addPrefix('cell-group-left-shadow');
    const rightShadowClassName = this.addPrefix('cell-group-right-shadow');
    const showLeftShadow = this.scrollX < 0;
    const showRightShadow = width - contentWidth - this.getScrollBarYWidth !== this.scrollX;

    toggleClass(fixedLeftGroups, leftShadowClassName, showLeftShadow);
    toggleClass(fixedRightGroups, rightShadowClassName, showRightShadow);
  }

  shouldHandleWheelX = (delta: number) => {
    const { disabledScroll, loading } = this.props;

    if (delta === 0 || disabledScroll || loading) {
      return false;
    }

    return true;
  };
  shouldHandleWheelY = (delta: number) => {
    const { disabledScroll, loading } = this.props;
    if (delta === 0 || disabledScroll || loading) {
      return false;
    }
    return (delta >= 0 && this.scrollY > this.minScrollY) || (delta < 0 && this.scrollY < 0);
  };

  shouldRenderExpandedRow(rowData: object) {
    const { rowKey, renderRowExpanded, isTree } = this.props;
    const expandedRowKeys = this.getExpandedRowKeys() || [];

    return (
      isFunction(renderRowExpanded) &&
      !isTree &&
      expandedRowKeys.some(key => key === rowData[rowKey!])
    );
  }

  addPrefix = (name: string): string => prefix(this.props.classPrefix!)(name);

  calculateRowMaxHeight() {
    const { wordWrap } = this.props;
    if (wordWrap) {
      const tableRowsMaxHeight = [];
      const tableRows = Object.values(this.tableRows);

      for (let i = 0; i < tableRows.length; i++) {
        const [row] = tableRows[i];
        if (row) {
          const cells = row.querySelectorAll(`.${this.addPrefix('cell-wrap')}`) || [];
          const cellArray = Array.from(cells);
          let maxHeight = 0;

          for (let j = 0; j < cellArray.length; j++) {
            const cell = cellArray[j];
            const h = getHeight(cell);
            maxHeight = Math.max(maxHeight, h);
          }

          // @ts-ignore
          tableRowsMaxHeight.push(maxHeight);
        }
      }

      this.setState({ tableRowsMaxHeight });
    }
  }

  calculateTableWidth = () => {
    const table = this.tableRef && this.tableRef.current;
    const { width } = this.state;

    if (table) {
      const nextWidth = getWidth(table);
      if (width !== nextWidth) {
        this.scrollX = 0;
        const current = this.scrollbarXRef && this.scrollbarXRef.current;
        current && current.resetScrollBarPosition();
        this._cacheCells = null;
      }

      if (nextWidth !== 0) {
        this.setState({ width: nextWidth });
      }
    }
    this.setOffsetByAffix();
  };

  calculateTableContentWidth(prevProps: TableProps) {
    const table = this.tableRef && this.tableRef.current;
    const row = table.querySelector(`.${this.addPrefix('row')}:not(.virtualized)`);
    const contentWidth = row ? getWidth(row) : 0;

    this.setState({ contentWidth });
    // 这里 -SCROLLBAR_WIDTH 是为了让滚动条不挡住内容部分
    this.minScrollX = -(contentWidth - this.state.width) - this.getScrollBarYWidth;
    /**
     * 1.判断 Table 列数是否发生变化
     * 2.判断 Table 内容区域是否宽度有变化
     *
     * 满足 1 和 2 则更新横向滚动条位置
     */

    if (
      flatten(this.props.children as any[]).length !==
      flatten(prevProps.children as any[]).length &&
      this.state.contentWidth !== contentWidth
    ) {
      this.scrollLeft(0);
    }
  }

  calculateTableContextHeight(prevProps?: TableProps) {
    const table = this.tableRef.current;
    const rows = table.querySelectorAll(`.${this.addPrefix('row')}`) || [];
    const { affixHeader } = this.props;
    const height = this.getTableHeight();

    const headerHeight = this.getTableHeaderHeight();
    const contentHeight = rows.length
      ? Array.from(rows)
        .map((row: HTMLElement) => {
          return Math.max(getHeight(row), Number(toPx(row.style.height)), this.getRowHeight()) || this.getRowHeight();
        })
        .reduce((x, y) => x + y)
      : 0;

    // 当设置 affixHeader 属性后要减掉两个 header 的高度
    const nextContentHeight = contentHeight - (affixHeader ? headerHeight * 2 : headerHeight);

    if (nextContentHeight !== this.state.contentHeight) {
      this.setState({ contentHeight: this.getContentHeightWithScrollBarX(nextContentHeight) });
    }

    if (
      prevProps &&
      // 当 data 更新，或者表格高度更新，则更新滚动条
      (prevProps.height !== height || prevProps.data !== this.props.data) &&
      this.scrollY !== 0
    ) {
      this.scrollTop(Math.abs(this.scrollY));
      this.updatePosition();
    }

    this.minScrollY = -(contentHeight - height) - this.getScrollBarYWidth;

    // 如果内容区域的高度小于表格的高度，则重置 Y 坐标滚动条
    if (contentHeight < height) {
      this.scrollTop(0);
    }

    // 如果 scrollTop 的值大于可以滚动的范围 ，则重置 Y 坐标滚动条
    // 当 Table 为 virtualized 时， wheel 事件触发每次都会进入该逻辑， 避免在滚动到底部后滚动条重置, +SCROLLBAR_WIDTH
    if (Math.abs(this.scrollY) + height - headerHeight > nextContentHeight + this.getScrollBarYWidth) {
      this.scrollTop(this.scrollY);
    }
  }

  getControlledScrollTopValue(value) {
    if (this.props.autoHeight) {
      return [0, 0];
    }
    const { contentHeight } = this.state;
    const headerHeight = this.getTableHeaderHeight();
    const height = this.getTableHeight();

    // 滚动值的最大范围判断
    value = Math.min(value, Math.max(0, contentHeight - (height - headerHeight)));

    // value 值是表格理论滚动位置的一个值，通过 value 计算出 scrollY 坐标值与滚动条位置的值
    return [-value, (value / contentHeight) * (height - headerHeight)];
  }

  getControlledScrollLeftValue(value) {
    const { contentWidth, width } = this.state;

    // 滚动值的最大范围判断
    value = Math.min(value, Math.max(0, contentWidth - width));

    return [-value, (value / contentWidth) * width];
  }

  /**
   * public method
   */
  scrollTop = (top = 0) => {
    const [scrollY, handleScrollY] = this.getControlledScrollTopValue(top);

    this.scrollY = scrollY;
    const current = this.scrollbarYRef && this.scrollbarYRef.current;
    current && current.resetScrollBarPosition && current.resetScrollBarPosition(handleScrollY);
    this.updatePosition();

    /**
     * 当开启 virtualized，调用 scrollTop 后会出现白屏现象，
     * 原因是直接操作 DOM 的坐标，但是组件没有重新渲染，需要调用 forceUpdate 重新进入 render。
     * Fix: rsuite#1044
     */
    if (this.props.virtualized && this.state.contentHeight > this.getTableHeight()) {
      this.forceUpdate();
    }
  };

  // public method
  scrollLeft = (left = 0) => {
    const [scrollX, handleScrollX] = this.getControlledScrollLeftValue(left);
    this.scrollX = scrollX;
    const current = this.scrollbarXRef && this.scrollbarXRef.current;
    current && current.resetScrollBarPosition && current.resetScrollBarPosition(handleScrollX);
    this.updatePosition();
    /**
     * 这里的条件与 scrollTop 触发强制更新的条件相反，避免重复的渲染。
     */
    if (this.props.virtualized && this.state.contentHeight <= this.getTableHeight()) {
      this.forceUpdate();
    }
  };

  scrollTo = (coord: { x: number; y: number }) => {
    const { x, y } = coord || {};
    if (typeof x === 'number') {
      this.scrollLeft(x);
    }
    if (typeof y === 'number') {
      this.scrollTop(y);
    }
  };

  bindTableRowsRef = (index: number | string, rowData: any, provided?: DraggableProvided) => (ref: HTMLElement) => {
    if (ref) {
      this.tableRows[index] = [ref, rowData];
      if (provided) {
        provided.innerRef(ref);
      }
    }
  };

  bindRowClick = (rowIndex: number | string, index: number | string, rowData: object) => {
    return (event: React.MouseEvent) => {
      this.onRowClick(rowData, event, rowIndex, index, 'click');
    };
  };

  bindRowDblClick = (rowIndex: number | string, index: number | string, rowData: object) => {
    return (event: React.MouseEvent) => {
      this.onRowClick(rowData, event, rowIndex, index, 'dblclick');
    };
  };

  onRowClick(rowData, event, rowIndex, index, type) {
    const { highLightRow, rowKey, rowDraggable, isTree, onRowClick, onRowDoubleClick, virtualized } = this.props;
    const useRowKey = rowDraggable || isTree || virtualized;
    const rowNum = useRowKey ? rowData[rowKey!] : rowIndex;
    if (highLightRow && (!useRowKey || useRowKey && !isNil(rowNum))) {
      const tableRows = Object.values(this.tableRows);
      if (tableRows[0][0].className.includes(`${this.addPrefix('row-header')}`)) tableRows.shift();
      const ref = useRowKey ? this.tableRows[rowNum] && this.tableRows[rowNum][0] : tableRows[index] && tableRows[index][0];
      if (this._lastRowIndex !== rowNum && ref) {
        if (this._lastRowIndex || this._lastRowIndex === 0) {
          const row = useRowKey ? this.tableRows[this._lastRowIndex] : tableRows[this._lastRowIndex];
          if (row && row[0]) {
            row[0].className = row[0].className.replace(` ${this.addPrefix('row-highLight')}`, '');
          }
        }
        ref.className = `${ref.className} ${this.addPrefix('row-highLight')}`;
      }
      this._lastRowIndex = rowNum;
    }
    if (onRowClick && type === 'click') {
      onRowClick(rowData, event);
    }
    if (onRowDoubleClick && type === 'dblclick') {
      onRowDoubleClick(rowData, event);
    }
  }

  bindRowContextMenu = (rowData: object) => {
    return (event: React.MouseEvent) => {
      const { onRowContextMenu } = this.props;
      if (onRowContextMenu) {
        onRowContextMenu(rowData, event);
      }
    };
  };

  renderRowData(
    bodyCells: any[],
    rowData: any,
    props: TableRowProps,
    shouldRenderExpandedRow?: boolean,
  ) {
    const { renderTreeToggle, rowKey, wordWrap, isTree, components } = this.props;
    const hasChildren = isTree && rowData.children && Array.isArray(rowData.children);
    const nextRowKey = typeof rowData[rowKey!] !== 'undefined' ? rowData[rowKey!] : props.key;

    const rowProps: TableRowProps = {
      ...props,
      // Fixed Row missing custom rowKey
      key: nextRowKey,
      'aria-rowindex': (props.key as number) + 2,
      rowRef: this.bindTableRowsRef(props.key!, rowData),
      onClick: this.bindRowClick(props.rowIndex, props.key!, rowData),
      onDoubleClick: this.bindRowDblClick(props.rowIndex, props.key!, rowData),
      onContextMenu: this.bindRowContextMenu(rowData),
    };

    const expandedRowKeys = this.getExpandedRowKeys() || [];
    const expanded = expandedRowKeys.some(key => key === rowData[rowKey!]);
    const cells = [];

    const headerHeight = this.getTableHeaderHeight();
    const height = this.getTableHeight();

    for (let i = 0; i < bodyCells.length; i++) {
      const cell = bodyCells[i];
      cells.push(
        // @ts-ignore
        React.cloneElement<any>(cell, {
          hasChildren,
          rowData,
          wordWrap,
          renderTreeToggle,
          height: props.height,
          rowIndex: props.rowIndex,
          depth: props.depth,
          onTreeToggle: this.handleTreeToggle,
          rowKey: nextRowKey,
          expanded,
          isLastRow: props.isLast && height - headerHeight < this.state.contentHeight
        }),
      );
    }

    return components &&
      components.body &&
      components.body.row &&
      React.isValidElement(components.body.row) ?
      (React.cloneElement(components.body.row, { rowProps, cells, shouldRenderExpandedRow, rowData })) :
      this.renderRow(rowProps, cells, shouldRenderExpandedRow, rowData);
  }

  calculateFixedAndScrollColumn(cells: any[]) {
    const fixedLeftCells: any[] = [];
    const fixedRightCells: any[] = [];
    const scrollCells: any[] = [];
    let fixedLeftCellGroupWidth: number = 0;
    let fixedRightCellGroupWidth: number = 0;

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const { fixed, width } = cell.props;

      let isFixedStart = fixed === 'left' || fixed === true;
      let isFixedEnd = fixed === 'right';

      if (this.isRTL()) {
        isFixedStart = fixed === 'right';
        isFixedEnd = fixed === 'left' || fixed === true;
      }

      if (isFixedStart) {
        // @ts-ignore
        fixedLeftCells.push(cell);
        fixedLeftCellGroupWidth += width;
      } else if (isFixedEnd) {
        // @ts-ignore
        fixedRightCells.push(cell);
        if (cell.key !== CUSTOMIZED_KEY) {
          fixedRightCellGroupWidth += width;
        }
      } else {
        // @ts-ignore
        scrollCells.push(cell);
      }
    }
    return { fixedLeftCells, fixedRightCells, scrollCells, fixedLeftCellGroupWidth, fixedRightCellGroupWidth };
  }

  renderRow(props: TableRowProps, cells: any[], shouldRenderExpandedRow?: boolean, rowData?: any) {
    const { rowClassName, highLightRow, virtualized, rowDraggable } = this.props;
    const { shouldFixedColumn, width, contentWidth, dragRowIndex } = this.state;
    const { depth, rowIndex, isHeaderRow, style, ...restRowProps } = props;

    const rowKey = rowData && this.getRecordKey(rowData, rowIndex);

    const className = typeof rowClassName === 'function' ? rowClassName(rowData) : rowClassName;
    restRowProps.className = className;
    if (rowKey === this._lastRowIndex && virtualized && highLightRow && !isHeaderRow) {
      restRowProps.className = `${className} ${this.addPrefix('row-highLight')}`;
    }

    const rowStyles: React.CSSProperties = {};
    let rowRight = 0;

    if (this.isRTL() && contentWidth > width) {
      rowRight = width - contentWidth;
      rowStyles.right = rowRight;
    }
    let currnetRowIndex: string = '';
    // 修复合并行的最后一行没有borderBottom 和 合并行后的单元格被遮挡的问题
    for (let i = 0; i < cells.length; i++) {
      const cellUnit = cells[i];
      const { onCell, dataIndex, fixed } = cellUnit.props;
      if (onCell && typeof onCell === 'function') {
        const cellExternalProps = onCell({
          rowData,
          dataIndex,
          rowIndex,
        }) || {};
        const { rowSpan = 1 } = cellExternalProps;
        if (rowSpan > 1 && !currnetRowIndex) {
          currnetRowIndex = `${rowIndex}`;
          rowStyles.zIndex = fixed ? cells.length - i : 0;
        }
      }
    }
    // 优化拖拽行被 rowSpan 合并行覆盖的问题
    if (dragRowIndex === `${rowIndex}`) {
      rowStyles.zIndex = 1;
    }
    // IF there are fixed columns, add a fixed group
    if (shouldFixedColumn && contentWidth > width) {
      // if (rowData && uniq(this.tableStore.rowZIndex!.slice()).includes(rowIndex)) {
      //   rowStyles.zIndex = 1;
      // }
      const {
        fixedLeftCells = [],
        fixedRightCells = [],
        scrollCells = [],
        fixedLeftCellGroupWidth = 0,
        fixedRightCellGroupWidth = 0,
      } = this.calculateFixedAndScrollColumn(cells);

      if (rowDraggable && !isHeaderRow && !restRowProps.isFooterRow) {
        return (
          <Draggable
            draggableId={String(rowKey)}
            index={rowIndex}
            key={rowKey}
          >
            {(
              provided: DraggableProvided,
              snapshot: DraggableStateSnapshot,
            ) => (
              <Row
                {...restRowProps}
                data-depth={depth}
                style={{ ...rowStyles, ...style }}
                rowDraggable={rowDraggable}
                isHeaderRow={isHeaderRow}
                provided={provided}
                snapshot={snapshot}
                rowRef={this.bindTableRowsRef(props.key!, rowData, provided)}
              >
                {fixedLeftCellGroupWidth ? (
                  <CellGroup
                    provided={provided}
                    snapshot={snapshot}
                    rowDraggable={rowDraggable}
                    fixed="left"
                    height={props.isHeaderRow ? props.headerHeight : props.height}
                    width={fixedLeftCellGroupWidth}
                    // @ts-ignore
                    style={this.isRTL() ? { right: width - fixedLeftCellGroupWidth - rowRight } : null}
                  >
                    {mergeCells(resetLeftForCells(fixedLeftCells))}
                  </CellGroup>
                ) : null}

                <CellGroup
                  provided={provided}
                  snapshot={snapshot}
                  rowDraggable={rowDraggable}
                >
                  {mergeCells(scrollCells)}
                </CellGroup>

                {fixedRightCellGroupWidth || fixedRightCells.length ? (
                  <CellGroup
                    provided={provided}
                    snapshot={snapshot}
                    rowDraggable={rowDraggable}
                    fixed="right"
                    style={
                      this.isRTL()
                        ? { right: 0 - rowRight }
                        : { left: width - fixedRightCellGroupWidth - this.getScrollBarYWidth }
                    }
                    height={props.isHeaderRow ? props.headerHeight : props.height}
                    width={fixedRightCellGroupWidth + this.getScrollBarYWidth}
                  >
                    {mergeCells(resetLeftForCells(fixedRightCells, this.getScrollBarYWidth))}
                  </CellGroup>
                ) : null}

                {shouldRenderExpandedRow && this.renderRowExpanded(rowData)}
              </Row>
            )}
          </Draggable>
        );
      }

      return (
        <Row {...restRowProps} isHeaderRow={isHeaderRow} data-depth={depth} style={{ ...rowStyles, ...style }} rowRef={this.bindTableRowsRef(props.key!, rowData)}>
          {fixedLeftCellGroupWidth ? (
            <CellGroup
              fixed="left"
              height={props.isHeaderRow ? props.headerHeight : props.height}
              width={fixedLeftCellGroupWidth}
              // @ts-ignore
              style={this.isRTL() ? { right: width - fixedLeftCellGroupWidth - rowRight } : null}
            >
              {mergeCells(resetLeftForCells(fixedLeftCells))}
            </CellGroup>
          ) : null}

          <CellGroup>{mergeCells(scrollCells, fixedLeftCells.length)}</CellGroup>

          {fixedRightCellGroupWidth || fixedRightCells.length ? (
            <CellGroup
              fixed="right"
              style={
                this.isRTL()
                  ? { right: 0 - rowRight }
                  : { left: width - fixedRightCellGroupWidth - this.getScrollBarYWidth }
              }
              height={props.isHeaderRow ? props.headerHeight : props.height}
              width={fixedRightCellGroupWidth + this.getScrollBarYWidth}
            >
              {mergeCells(resetLeftForCells(fixedRightCells, this.getScrollBarYWidth))}
            </CellGroup>
          ) : null}

          {shouldRenderExpandedRow && this.renderRowExpanded(rowData)}
        </Row>
      );
    }

    if (rowDraggable && !isHeaderRow && !restRowProps.isFooterRow) {
      return (
        <Draggable
          draggableId={String(rowKey)}
          index={rowIndex}
          key={rowKey}
        >
          {(
            provided: DraggableProvided,
            snapshot: DraggableStateSnapshot,
          ) => (
            <Row
              {...restRowProps}
              data-depth={depth}
              style={{ ...rowStyles, ...style }}
              rowDraggable={rowDraggable}
              provided={provided}
              snapshot={snapshot}
              isHeaderRow={isHeaderRow}
              rowRef={this.bindTableRowsRef(props.key!, rowData, provided)}
            // {...(rowDragRender && rowDragRender.draggableProps)} todo
            >
              <CellGroup
                provided={provided}
                snapshot={snapshot}
                rowDraggable={rowDraggable}
              >
                {mergeCells(cells)}
              </CellGroup>
              {shouldRenderExpandedRow && this.renderRowExpanded(rowData)}
            </Row>
          )}
        </Draggable>
      );
    }

    return (
      <Row {...restRowProps} isHeaderRow={isHeaderRow} data-depth={depth} style={{ ...rowStyles, ...style }} rowRef={this.bindTableRowsRef(props.key!, rowData)}>
        <CellGroup>{mergeCells(cells)}</CellGroup>
        {shouldRenderExpandedRow && this.renderRowExpanded(rowData)}
      </Row>
    );
  }

  renderRowExpanded(rowData?: object) {
    const { renderRowExpanded, rowExpandedHeight } = this.props;
    const styles = { height: rowExpandedHeight };

    if (isFunction(renderRowExpanded)) {
      return (
        <div className={this.addPrefix('row-expanded')} style={styles}>
          {renderRowExpanded(rowData)}
        </div>
      );
    }
    return null;
  }

  renderMouseArea() {
    const headerHeight = this.getTableHeaderHeight();
    const styles = { height: this.getTableHeight() };
    const spanStyles = { height: headerHeight - 1 };

    return (
      <div ref={this.mouseAreaRef} className={this.addPrefix('mouse-area')} style={styles}>
        <span style={spanStyles} />
      </div>
    );
  }

  renderTableHeader(headerCells: any[], rowWidth: number) {
    const { affixHeader, components } = this.props;
    const { width: tableWidth } = this.state;
    const top = typeof affixHeader === 'number' ? affixHeader : 0;
    const headerHeight = this.getTableHeaderHeight();
    const rowProps: TableRowProps = {
      'aria-rowindex': 1,
      rowRef: this.tableHeaderRef,
      width: rowWidth,
      height: this.getRowHeight(),
      headerHeight,
      isHeaderRow: true,
      top: 0,
    };

    const fixedStyle: React.CSSProperties = {
      position: 'fixed',
      overflow: 'hidden',
      height: this.getTableHeaderHeight(),
      width: tableWidth,
      top,
    };

    // Affix header
    const header = (
      <div
        className={classNames(this.addPrefix('affix-header'))}
        style={fixedStyle}
        ref={this.affixHeaderWrapperRef}
      >
        {this.renderRow(rowProps, headerCells)}
      </div>
    );

    // cusomized header
    const cusomizedHeader = components &&
      components.header &&
      components.header.row &&
      React.isValidElement(components.header.row) ?
      (React.cloneElement(components.header.row, { rowProps, headerCells })) :
      this.renderRow(rowProps, headerCells);

    return (
      <React.Fragment>
        {(affixHeader === 0 || affixHeader) && header}
        {components &&
          components.header &&
          components.header.wrapper &&
          React.isValidElement(components.header.wrapper) ?
          (React.cloneElement(components.header.wrapper,
            { role: "rowgroup", className: this.addPrefix('header-row-wrapper'), ref: this.headerWrapperRef },
            cusomizedHeader,
          )) : (
            <div
              role="rowgroup"
              className={this.addPrefix('header-row-wrapper')}
              ref={this.headerWrapperRef}
            >
              {cusomizedHeader}
            </div>
          )
        }
      </React.Fragment>
    );
  }

  renderTableBody(bodyCells: any[], rowWidth: number) {
    const {
      rowExpandedHeight,
      renderRowExpanded,
      isTree,
      rowKey,
      wordWrap,
      virtualized,
      rowHeight,
      rowDraggable,
      components,
    } = this.props;

    const headerHeight = this.getTableHeaderHeight();
    const { tableRowsMaxHeight, isScrolling, data, contentWidth, shouldFixedColumn, width } = this.state;
    const height = this.getTableHeight();
    const bodyHeight = height - headerHeight;
    const minLeft = Math.abs(this.scrollX);
    const bodyStyles = {
      top: headerHeight,
      height: bodyHeight,
    };

    let contentHeight = 0;
    let topHideHeight = 0;
    let bottomHideHeight = 0;

    this._visibleRows = [];
    this.nextRowZIndex = [];
    this._cacheCalcStartRowSpan = [];

    if (data) {
      let top = 0; // Row position
      let renderCols: any[] = bodyCells; // Render Col
      const minTop = Math.abs(this.scrollY);
      // @ts-ignore
      const maxTop = minTop + height + rowExpandedHeight!;
      const isCustomRowHeight = isFunction(rowHeight);
      const isUncertainHeight = !!(renderRowExpanded || isCustomRowHeight || isTree);

      /**
       * 如果开启了虚拟滚动 则计算列显示
       * 判断是否有缓存，如果minLeft 没有变化，就取缓存的值，有变化就重新计算
       */
      if (virtualized && contentWidth > width && (this._cacheScrollX !== minLeft || !this._cacheRenderCols.length)) {
        // 计算渲染列数量
        let colIndex: number = 0; // 列索引
        let displayColWidth: number = 0; // 显示列的宽度
        let renderLeftFixedCol: any[] = []; // 需要渲染的固定左边列
        let renderRightFixedCol: any[] = []; // 需要渲染的固定右边列
        let showNum: number = 0; // 显示列数

        let divideLeftFixedCol: number = 0;
        let divideRightFixedCol: number = 0;
        // 找到左固定列
        if (shouldFixedColumn) {
          for (let i = 0; i < bodyCells.length; i++) {
            const bc = bodyCells[i];
            const { fixed } = bc.props;
            if ((fixed && fixed !== 'right') || fixed === 'left') {
              renderLeftFixedCol.push(bc);
            } else {
              break;
            }
          }
          // 找到右固定列
          for (let i = bodyCells.length - 1; i >= 0; i--) {
            const bc = bodyCells[i];
            const { fixed } = bc.props;
            if (fixed === 'right') {
              renderRightFixedCol.push(bc);
            } else {
              break;
            }
          }
          renderRightFixedCol = renderRightFixedCol.reverse();
          // 计算需要减去左右固定列的宽度和
          divideLeftFixedCol = renderLeftFixedCol.reduce((val, item) => val + item.props.width, 0);
          divideRightFixedCol = renderRightFixedCol.reduce((val, item) => val + item.props.width, 0);
        }
        // 遍历显示列的总宽度与x滚动条关系
        for (let i = 0; i < bodyCells.length; i++) {
          const elem: any = bodyCells[i];
          displayColWidth += elem.props.width;
          if ((displayColWidth - divideLeftFixedCol) > minLeft) {
            colIndex = i;
            break;
          }
        }
        // 计算显示列开始下标
        const colStartIndex: number = colIndex > renderLeftFixedCol.length ? colIndex - 1 : colIndex; //
        // 判断当前容器宽度能容纳列数
        let currentDisplayColWidth: number = 0;

        // 总宽度减去左右固定列的宽度
        const divideWidth = width - divideLeftFixedCol - divideRightFixedCol;
        // 遍历列宽度 与 容器宽度 得出该容器下显示的列数
        for (let i = colIndex + 1 + renderRightFixedCol.length; i < bodyCells.length; i++) {
          const elem: any = bodyCells[i];
          currentDisplayColWidth += elem.props.width;
          if (currentDisplayColWidth > divideWidth) {
            showNum = i - colIndex;
            break;
          }
        }
        // 计算列显示的结束下标
        const colEndIndex: number = (showNum ? (colIndex + showNum) + 1 : bodyCells.length) - renderRightFixedCol.length; //
        // 最后slice 需要渲染的部分列
        if (renderLeftFixedCol.length + renderRightFixedCol.length === bodyCells.length) {
          renderCols = [...renderLeftFixedCol, ...renderRightFixedCol];
        } else {
          renderCols = [...renderLeftFixedCol, ...bodyCells.slice(colStartIndex, colEndIndex), ...renderRightFixedCol];
        }
        this._cacheScrollX = minLeft;
        this._cacheRenderCols = renderCols;
      } else {
        renderCols = this._cacheRenderCols.length ? this._cacheRenderCols : bodyCells;
      }

      /**
       如果开启了 virtualized  同时 Table 中的的行高是可变的，
       则需要循环遍历 data, 获取每一行的高度。
       */
      if ((isUncertainHeight && virtualized) || !virtualized) {
        // temp test
        let keyIndex = 0;
        for (let index = 0; index < data.length; index++) {
          const rowData = data[index];
          const maxHeight = tableRowsMaxHeight[index];
          const shouldRenderExpandedRow = this.shouldRenderExpandedRow(rowData);

          let nextRowHeight = 0;
          let depth = 0;

          if (typeof rowHeight === 'function') {
            nextRowHeight = rowHeight(rowData);
          } else {
            nextRowHeight = maxHeight
              ? Math.max(maxHeight + CELL_PADDING_HEIGHT, rowHeight!)
              : rowHeight!;
            if (shouldRenderExpandedRow) {
              // @ts-ignore
              nextRowHeight += rowExpandedHeight!;
            }
          }

          if (isTree) {
            const parents = findAllParents(rowData, rowKey);
            const expandedRowKeys = this.getExpandedRowKeys();
            depth = parents.length;

            //  如果是 Tree Table,  判断当前的行是否展开/折叠，如果是折叠则不显示该行。
            // @ts-ignore
            if (!shouldShowRowByExpanded(expandedRowKeys, parents)) {
              continue;
            }
          }

          contentHeight += nextRowHeight;

          const rowProps = {
            key: keyIndex,
            rowIndex: index,
            top,
            width: rowWidth,
            depth,
            height: nextRowHeight,
            isLast: index === data.length - 1
          };

          top += nextRowHeight;

          if (virtualized && !wordWrap) {
            if (top + nextRowHeight < minTop) {
              topHideHeight += nextRowHeight;
              continue;
            } else if (top > maxTop) {
              bottomHideHeight += nextRowHeight;
              continue;
            }
          }

          this._visibleRows.push(
            // @ts-ignore
            this.renderRowData(renderCols, rowData, rowProps, shouldRenderExpandedRow),
          );
          keyIndex++;
        }
      } else {
        /**
         如果 Table 的行高是固定的，则直接通过行高与行数进行计算，
         减少遍历所有 data 带来的性能消耗
         */
        const nextRowHeight = this.getRowHeight();
        const startIndex = Math.max(Math.floor(minTop / nextRowHeight), 0);
        const endIndex = Math.min(startIndex + Math.ceil(bodyHeight / nextRowHeight), data.length);

        contentHeight = data.length * nextRowHeight;
        topHideHeight = startIndex * nextRowHeight;
        bottomHideHeight = (data.length - endIndex) * nextRowHeight;

        /**
         * 判断行合并的情况，并遍历出合并行，在滚动的时候根据滚动高度判断是否显示
         */
        const hasSpanRow: any = [];
        let keyIndex: number = 0;
        let rowSpanStartIndex: number;
        if (this.calcStartRowSpan.rowIndex > startIndex) {
          // 从缓存记录往上找
          const lastHistory: StartRowSpan | undefined = this._cacheCalcStartRowSpan.pop();
          this.calcStartRowSpan = lastHistory || { rowIndex: 0, rowSpan: 0, height: 0 };
        }
        if (this.calcStartRowSpan.height >= minTop) {
          rowSpanStartIndex = this.calcStartRowSpan.rowIndex;
        } else {
          rowSpanStartIndex = (this.calcStartRowSpan.rowIndex + this.calcStartRowSpan.rowSpan);
        }

        const hasOnCellCol = renderCols.filter(x => x.props.onCell);
        for (let i = rowSpanStartIndex; i < endIndex; i++) {
          const rowData = data[i];
          for (let j = 0; j < hasOnCellCol.length; j++) {
            const col = hasOnCellCol[j];
            const onCellInfo = col.props.onCell({ rowData, dataIndex: col.props.dataIndex, rowIndex: i });
            const cellRowSpan = onCellInfo.rowSpan; // 12
            const calcHeight = (cellRowSpan + i) * nextRowHeight;
            if (cellRowSpan > 1 && minTop < calcHeight) {
              const rowProps = {
                key: keyIndex,
                rowIndex: i,
                top: i * nextRowHeight,
                width: rowWidth,
                height: nextRowHeight,
                isLast: i === data.length - 1,
              };
              if (calcHeight > this.calcStartRowSpan.height && rowSpanStartIndex >= i) {
                const tempCalc = { rowIndex: i, rowSpan: cellRowSpan, height: calcHeight };
                this.calcStartRowSpan = tempCalc;
                this._cacheCalcStartRowSpan.push(tempCalc);
              }
              const isExits = hasSpanRow.find(x => x.rowIndex === i);
              if (!isExits) {
                hasSpanRow.push({ rowIndex: i, render: this.renderRowData(renderCols, rowData, rowProps, false) });
              }
              keyIndex++;
            }
          }
        }

        for (let index = startIndex; index < endIndex; index++) {
          const rowData = data[index];
          const rowProps = {
            key: keyIndex,
            rowIndex: index,
            top: index * nextRowHeight,
            width: rowWidth,
            height: nextRowHeight,
            isLast: index === data.length - 1,
          };
          if (!hasSpanRow.length) {
            this._visibleRows.push(this.renderRowData(renderCols, rowData, rowProps, false));
            keyIndex++;
          } else {
            const findHasSpanRow = hasSpanRow.find(x => x.rowIndex === index);
            if (!findHasSpanRow) {
              hasSpanRow.push({ rowIndex: index, render: this.renderRowData(renderCols, rowData, rowProps, false) });
              keyIndex++;
            }
          }
        }
        if (hasSpanRow.length) {
          const sortRow = hasSpanRow.sort((a, b) => a.rowIndex - b.rowIndex);
          this._visibleRows = sortRow.map(x => x.render);
        }
      }
    }

    const wheelStyles: React.CSSProperties = {
      position: 'absolute',
      height: contentHeight,
      minHeight: height,
      pointerEvents: isScrolling ? 'none' : undefined,
    };
    const topRowStyles = { height: topHideHeight };
    const bottomRowStyles = { height: bottomHideHeight };

    const { footerCells } = this.getCellDescriptor();

    const getFooterProps = ()=>({
      width: rowWidth,
      height: this.getRowHeight(),
      headerHeight,
      isFooterRow: true,
      bottom: 0,
      style: {
        bottom: contentWidth > width ? 10 : 0,
        width: rowWidth,
      }
    })
    
    const body = (
      <LocaleReceiver componentName="PerformanceTable" defaultLocale={getRuntimeLocale().PerformanceTable || {}}>
        {(locale: PerformanceTableLocal) => {
          const rowWrapperChildren = (
            <>
              <div
                style={wheelStyles}
                className={this.addPrefix('body-wheel-area')}
                ref={this.wheelWrapperRef}
              >
                {topHideHeight ? <Row style={topRowStyles} className="virtualized" /> : null}
                {this._visibleRows}
                {bottomHideHeight ? <Row style={bottomRowStyles} className="virtualized" /> : null}
              </div>
              {!!footerCells.length ? this.renderRow(getFooterProps(), footerCells) : null}
              {this.renderInfo(locale)}
              {this.renderScrollbar()}
              {this.renderLoading()}
            </>
          )
          return components && components.body && components.body.wrapper && React.isValidElement(components.body.wrapper) ?
            React.cloneElement(components.body.wrapper, {
              refs: this.tableBodyRef,
              role: "rowgroup",
              className: this.addPrefix('body-row-wrapper'),
              style: bodyStyles,
              onScroll: this.handleBodyScroll,
            }, components.body.wrapper.props.children || rowWrapperChildren) : (
              <div
                ref={this.tableBodyRef}
                role="rowgroup"
                className={this.addPrefix('body-row-wrapper')}
                style={bodyStyles}
                onScroll={this.handleBodyScroll}
              >
                {rowWrapperChildren}
              </div>
            );
        }}
      </LocaleReceiver>
    );

    return rowDraggable ? (
      <DragDropContext onDragStart={this.handleDragStart} onDragEnd={this.handleDragEnd}>
        <Droppable
          droppableId="table"
          key="table"
        >
          {(droppableProvided: DroppableProvided) => (
            <div
              ref={droppableProvided.innerRef}
              {...droppableProvided.droppableProps}
            >
              {body}
              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    ) : body;
  }

  renderInfo(locale: PerformanceTableLocal) {
    const { renderEmpty, loading } = this.props;
    if (this._visibleRows.length || loading) {
      return null;
    }
    const emptyMessage = <div className={this.addPrefix('body-info')}>{locale.emptyMessage}</div>;

    return renderEmpty ? renderEmpty(emptyMessage) : <div
      className={this.addPrefix('body-info')}>{this.tableStore.getConfig('renderEmpty')('Table')}</div>;
  }

  getScrollBarOffset() {
    const { showScrollArrow } = this.props;
    const { contentWidth, contentHeight } = this.state;
    const height = this.getTableHeight();
    const headerHeight = this.getTableHeaderHeight();
    const scrollBarOffset = (contentWidth <= this.state.width) || contentHeight <= (height - headerHeight) ? 40 : 60;
    // 减去border的左右边框像素
    const decScrollBarOffset = showScrollArrow ? scrollBarOffset : 2;
    return { scrollBarOffset, decScrollBarOffset };
  }

  renderScrollbar() {
    const { disabledScroll, affixHorizontalScrollbar, id, showScrollArrow, clickScrollLength } = this.props;
    const { contentWidth, contentHeight, width, fixedHorizontalScrollbar } = this.state;
    const bottom = typeof affixHorizontalScrollbar === 'number' ? affixHorizontalScrollbar : 0;

    const headerHeight = this.getTableHeaderHeight();
    const height = this.getTableHeight();

    if (disabledScroll) {
      return null;
    }

    const { scrollBarOffset, decScrollBarOffset } = this.getScrollBarOffset();
    return (
      <div>
        <Scrollbar
          tableId={id}
          showScrollArrow={showScrollArrow}
          clickScrollLength={clickScrollLength!}
          className={classNames({ fixed: fixedHorizontalScrollbar })}
          style={{ width, bottom: fixedHorizontalScrollbar ? bottom : undefined }}
          length={this.state.width - decScrollBarOffset}
          onScroll={this.handleScrollX}
          scrollLength={contentWidth - decScrollBarOffset}
          ref={this.scrollbarXRef}
          scrollBarOffset={decScrollBarOffset}
        />
        <Scrollbar
          vertical
          tableId={id}
          showScrollArrow={showScrollArrow}
          clickScrollLength={clickScrollLength!}
          length={height - headerHeight - decScrollBarOffset}
          scrollLength={contentHeight - decScrollBarOffset}
          onScroll={this.handleScrollY}
          ref={this.scrollbarYRef}
          scrollBarOffset={decScrollBarOffset}
        />
      </div>
    );
  }

  /**
   *  show loading
   */
  renderLoading() {
    const { loading, loadAnimation, renderLoading } = this.props;

    if (!loadAnimation && !loading) {
      return null;
    }

    const loadingElement = (
      <div className={this.addPrefix('loader-wrapper')}>
        <div className={this.addPrefix('loader')}>
          <Spin />
        </div>
      </div>
    );

    return renderLoading ? renderLoading(loadingElement) : loadingElement;
  }

  renderTableToolbar() {
    const {
      toolbar,
      toolBarRender,
    } = this.props;

    if (toolBarRender === false || !toolbar) return null;

    const { header, buttons, settings } = toolbar;

    /** 内置的工具栏 */
    return (
      <Toolbar
        header={header}
        hideToolbar={
          settings === false && !header && !toolBarRender && !toolbar
        }
        buttons={buttons}
        settings={settings}
        toolBarRender={toolBarRender}
      />
    );
  }

  render() {
    const {
      children,
      columns,
      className,
      data,
      style,
      isTree = false,
      hover,
      bordered,
      cellBordered,
      wordWrap,
      classPrefix,
      loading,
      showHeader,
      queryBar,
      components,
      ...rest
    } = this.props;
    const { isColumnResizing, width } = this.state;
    const { headerCells, bodyCells, allColumnsWidth, hasCustomTreeCol } = this.getCellDescriptor();
    const rowWidth = allColumnsWidth > width ? allColumnsWidth : width;
    const clesses = classNames(classPrefix, className, {
      [this.addPrefix('word-wrap')]: wordWrap,
      [this.addPrefix('treetable')]: isTree,
      [this.addPrefix('bordered')]: bordered,
      [this.addPrefix('cell-bordered')]: cellBordered,
      [this.addPrefix('column-resizing')]: isColumnResizing,
      [this.addPrefix('hover')]: hover,
      [this.addPrefix('loading')]: loading,
    });

    const height = this.getTableHeight();

    const styles = {
      width: rest.width || 'auto',
      height: height,
      lineHeight: `${toPx(this.getRowHeight())}px`,
      ...style,
    };

    runInAction(() => {
      this.tableStore.totalHeight = height;
    });

    const unhandled = getUnhandledProps(propTypeKeys, rest);

    const { tableStore, translateDOMPositionXY } = this;

    const gridChildren = (
      <>
        {showHeader && this.renderTableHeader(headerCells, rowWidth)}
        {columns && columns.length ? this.renderTableBody(bodyCells, rowWidth) : children && this.renderTableBody(bodyCells, rowWidth)}
        {showHeader && this.renderMouseArea()}
      </>
    )

    const gridProps = {
      role: isTree ? 'treegrid' : 'grid',
      // The aria-rowcount is specified on the element with the table.
      // Its value is an integer equal to the total number of rows available, including header rows.
      "aria-rowcount": data.length + 1,
      "aria-colcount": this._cacheChildrenSize,
      ...unhandled,
      className: clesses,
      style: styles,
    }

    return (
      <TableContext.Provider
        value={{
          translateDOMPositionXY,
          rtl: this.isRTL(),
          isTree,
          hasCustomTreeCol,
          scrollX: this.scrollX,
          tableWidth: width,
          tableStore,
        }}
      >
        <ModalProvider>
          {queryBar === false ? null : <PerformanceTableQueryBar />}
          {this.renderTableToolbar()}
          {
            components && components.table && React.isValidElement(components.table) ?
              React.cloneElement(
                components.table,
                { ...gridProps, ref: this.tableRef },
                components.table.props.children || gridChildren) :
              (
                <div
                  {...gridProps}
                  ref={this.tableRef}
                >
                  {gridChildren}
                </div>
              )
          }
        </ModalProvider>
      </TableContext.Provider>
    );
  }
}
