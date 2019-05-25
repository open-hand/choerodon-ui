import React, { ReactElement, ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ResizeObserver from 'resize-observer-polyfill';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import debounce from 'lodash/debounce';
import isNumber from 'lodash/isNumber';
import noop from 'lodash/noop';
import classes from 'component-classes';
import { action } from 'mobx';
import { pxToRem, toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import Column, { ColumnProps, defaultMinWidth } from './Column';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import TableStore from './TableStore';
import TableHeader from './TableHeader';
import autobind from '../_util/autobind';
import Pagination, { PaginationProps } from '../pagination/Pagination';
import Spin from '../spin';
import DataSetComponent, { DataSetComponentProps } from '../data-set/DataSetComponent';
import TableContext from './TableContext';
import TableWrapper from './TableWrapper';
import TableBody from './TableBody';
import TableFooter from './TableFooter';
import {
  ColumnLock,
  ScrollPosition,
  SelectionMode,
  TableButtonType,
  TableCommandType,
  TableEditMode,
  TableMode,
  TablePaginationPosition,
  TableQueryBar,
} from './enum';
import TableToolBar from './TableToolBar';
import Switch from '../switch/Switch';
import Tooltip from '../tooltip/Tooltip';
import { $l } from '../locale-context';
import FilterBar from './FilterBar';
import { findIndexedSibling, getHeight, getPaginationPosition } from './utils';
import { ButtonProps } from '../button/Button';

export type expandedRowRendererProps = { dataSet: DataSet, record: Record };
export type onRowProps = { dataSet: DataSet, record: Record, index: number, expandedRow: boolean };
export type Buttons = TableButtonType | [TableButtonType, ButtonProps] | ReactElement<ButtonProps>;
export type Commands = TableCommandType | [TableCommandType, ButtonProps] | ReactElement<ButtonProps>;

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
   * 数据源
   */
  dataSet: DataSet;
  /**
   * 选择记录的模式
   */
  selectionMode?: SelectionMode;
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
  queryFields?: { [key: string]: ReactElement<any> };
  /**
   * 头部显示的查询字段的数量，超出限制的查询字段放入弹出窗口
   * @default 1
   */
  queryFieldsLimit?: number;
  /**
   * 显示查询条
   * 可选值: `normal` `bar` `none`
   * @default 'normal'
   */
  queryBar?: TableQueryBar;
  /**
   * @deprecated
   * 请使用 queryBar="none"
   */
  showQueryBar?: boolean;
  /**
   * 行高
   * @default 31
   */
  rowHeight?: number | 'auto' | null;
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
}

@observer
export default class Table extends DataSetComponent<TableProps> {
  static displayName = 'Table';

  static Column = Column;

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
    buttons: PropTypes.arrayOf(PropTypes.oneOfType([
      buttonsEnumType,
      PropTypes.arrayOf(PropTypes.oneOfType([
        buttonsEnumType,
        PropTypes.object,
      ])),
      PropTypes.node,
    ])),
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
     * 显示查询条
     * @default true
     */
    queryBar: PropTypes.oneOf([TableQueryBar.normal, TableQueryBar.bar, TableQueryBar.none]),
    /**
     * 行高
     * @default 30
     */
    rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto', null])]),
    defaultRowExpanded: PropTypes.bool,
    expandRowByClick: PropTypes.bool,
    indentSize: PropTypes.number,
    filter: PropTypes.func,
    mode: PropTypes.oneOf([TableMode.list, TableMode.tree]),
    editMode: PropTypes.oneOf([TableEditMode.inline, TableEditMode.cell]),
    filterBarFieldName: PropTypes.string,
    filterBarPlaceholder: PropTypes.string,
    ...DataSetComponent.propTypes,
  };

  static defaultProps = {
    suffixCls: 'table',
    border: true,
    tabIndex: 0,
    selectionMode: SelectionMode.rowbox,
    queryFields: {},
    queryFieldsLimit: 1,
    queryBar: TableQueryBar.normal,
    rowHeight: 30,
    defaultRowExpanded: false,
    expandRowByClick: false,
    indentSize: 15,
    filterBarFieldName: 'params',
  };

  tableStore: TableStore = new TableStore(this);

  resizeObserver?: ResizeObserver;
  oldWidth?: number;
  isHidden?: boolean;

  resizeLine: HTMLDivElement | null;
  tableHeadWrap: HTMLDivElement | null;
  tableBodyWrap: HTMLDivElement | null;
  tableFootWrap: HTMLDivElement | null;
  fixedColumnsBodyLeft: HTMLDivElement | null;
  fixedColumnsBodyRight: HTMLDivElement | null;
  lastScrollLeft: number;
  lastScrollTop: number;
  scrollPosition: ScrollPosition;

  get currentRow(): HTMLTableRowElement | null {
    return this.element.querySelector(`.${this.prefixCls}-row-current`) as HTMLTableRowElement | null;
  }

  get firstRow(): HTMLTableRowElement | null {
    return this.element.querySelector(`.${this.prefixCls}-row:first-child`) as HTMLTableRowElement | null;
  }

  get lastRow(): HTMLTableRowElement | null {
    return this.element.querySelector(`.${this.prefixCls}-row:last-child`) as HTMLTableRowElement | null;
  }

  private handleSwitchChange = action((value) => {
    this.tableStore.showCachedSeletion = !!value;
  });

  private handleResize = debounce(() => {
    if (!this.element.offsetParent) {
      this.isHidden = true;
    } else if (!this.isHidden) {
      this.syncSize();
      this.setScrollPositionClassName();
    } else {
      this.isHidden = false;
    }
  }, 30);

  saveResizeRef = (node: HTMLDivElement | null) => {
    this.resizeLine = node;
  };

  handleDataSetLoad = () => {
    this.initDefaultExpandedRows();
  };

  handleDataSetCreate = ({ record }) => {
    const { tableStore } = this;
    if (tableStore.inlineEdit) {
      tableStore.currentEditRecord = record;
    }
  };

  handleKeyDown = (e) => {
    const { tableStore } = this;
    if (!tableStore.editing) {
      try {
        const { dataSet } = this.props;
        switch (e.keyCode) {
          case KeyCode.UP:
            this.handleKeyDownUp(e);
            break;
          case KeyCode.DOWN:
            this.handleKeyDownDown(e);
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
          default:
        }
      } catch (e) {
      }
    }
    const { onKeyDown = noop } = this.props;
    onKeyDown(e);
  };

  focusRow(row: HTMLTableRowElement | null) {
    if (row) {
      const { index } = row.dataset;
      if (index) {
        const { dataSet } = this.props;
        const record = dataSet.findRecordById(index);
        if (record) {
          dataSet.current = record;
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

  async handleKeyDownUp(e) {
    e.preventDefault();
    const { currentRow } = this;
    if (currentRow) {
      const previousElementSibling = findIndexedSibling(currentRow, -1);
      if (previousElementSibling) {
        this.focusRow(previousElementSibling);
      } else {
        const { dataSet } = this.props;
        await dataSet.prePage();
        this.focusRow(this.lastRow);
      }
    }
  }

  async handleKeyDownDown(e) {
    e.preventDefault();
    const { currentRow } = this;
    if (currentRow) {
      const nextElementSibling = findIndexedSibling(currentRow, 1);
      if (nextElementSibling) {
        this.focusRow(nextElementSibling);
      } else {
        const { dataSet } = this.props;
        await dataSet.nextPage();
        this.focusRow(this.firstRow);
      }
    }
  }

  handleKeyDownRight(e) {
    const { tableStore, props: { expandedRowRenderer, dataSet } } = this;
    if (tableStore.isTree || expandedRowRenderer) {
      const { current } = dataSet;
      if (current) {
        e.preventDefault();
        tableStore.setRowExpanded(current, true);
      }
    }
  }

  handleKeyDownLeft(e) {
    const { tableStore, props: { expandedRowRenderer, dataSet } } = this;
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
      'onRow',
      'rowRenderer',
      'buttons',
      'rowHeight',
      'queryFields',
      'queryFieldsLimit',
      'queryBar',
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
    ]);
    otherProps.onKeyDown = this.handleKeyDown;
    const { rowHeight } = this.props;
    if (rowHeight !== 'auto') {
      otherProps.style = { lineHeight: pxToRem(rowHeight) };
    }
    return otherProps;
  }

  getClassName(): string | undefined {
    const { prefixCls, props: { border, rowHeight } } = this;
    return super.getClassName(`${prefixCls}-scroll-position-left`, {
      [`${prefixCls}-bordered`]: border,
      [`${prefixCls}-row-height-fixed`]: isNumber(rowHeight),
      [`${prefixCls}-has-tfoot`]: this.tableStore.hasFooter,
    });
  }

  getWrapperProps(props = {}) {
    const { style } = this.props;
    const { tableStore } = this;
    const newStyle: any = omit(style, ['width', 'height']);
    if (style && style.width !== void 0 && style.width !== 'auto') {
      newStyle.width = Math.max(style.width as number,
        tableStore.leftLeafColumnsWidth + tableStore.rightLeafColumnsWidth + defaultMinWidth);
    }
    return super.getWrapperProps({
      style: newStyle,
      ...props,
    });
  }

  componentWillMount() {
    super.componentWillMount();
    this.initDefaultExpandedRows();
    this.processDataSetListener(true);
  }

  componentDidMount() {
    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(this.element);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    super.componentWillReceiveProps(nextProps, nextContext);
    this.processDataSetListener(false);
    this.tableStore.setProps(nextProps);
    this.processDataSetListener(true);
  }

  // componentDidUpdate() {
  //   this.handleResize();
  // }

  componentWillUnmount() {
    this.handleResize.cancel();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.processDataSetListener(false);
  }

  processDataSetListener(flag: boolean) {
    const { isTree, dataSet } = this.tableStore;
    if (dataSet) {
      const handler = flag ? dataSet.addEventListener : dataSet.removeEventListener;
      if (isTree) {
        handler.call(dataSet, 'load', this.handleDataSetLoad);
      }
      handler.call(dataSet, 'create', this.handleDataSetCreate);
    }
  }

  renderBar() {
    const {
      prefixCls,
      props: { dataSet, filterBarFieldName, filterBarPlaceholder },
    } = this;
    return <FilterBar key="querybar" prefixCls={prefixCls} dataSet={dataSet} paramName={filterBarFieldName!} placeholder={filterBarPlaceholder} />;
  }

  render() {
    const {
      prefixCls,
      tableStore,
      tableStore: { overflowX, isAnyColumnsLeftLock, isAnyColumnsRightLock },
      props: { dataSet, buttons, queryFieldsLimit, queryFields, queryBar, header, showQueryBar },
    } = this;
    const content = this.getTable();
    const context = { tableStore };
    return (
      <TableContext.Provider value={context}>
        <div {...this.getWrapperProps()}>
          {this.getHeader()}
          <TableToolBar
            key="toolbar"
            header={header}
            buttons={buttons}
            queryFieldsLimit={queryFieldsLimit!}
            queryFields={queryFields!}
            showQueryBar={queryBar === TableQueryBar.normal && showQueryBar !== false}
            prefixCls={prefixCls}
          />
          {this.getPagination(TablePaginationPosition.top)}
          {queryBar === TableQueryBar.bar && this.renderBar()}
          <Spin key="content" dataSet={dataSet}>
            <div {...this.getOtherProps()}>
              <div className={`${prefixCls}-content`}>
                {content}
                {isAnyColumnsLeftLock && overflowX && this.getLeftFixedTable()}
                {isAnyColumnsRightLock && overflowX && this.getRightFixedTable()}
                <div ref={this.saveResizeRef} className={`${prefixCls}-split-line`} />
              </div>
              {this.getFooter()}
            </div>
          </Spin>
          {this.getPagination(TablePaginationPosition.bottom)}
        </div>
      </TableContext.Provider>
    );
  }

  @autobind
  handleBodyScroll(e) {
    this.handleBodyScrollTop(e);
    this.handleBodyScrollLeft(e);
  }

  handleBodyScrollTop(e) {
    const { target, currentTarget } = e;
    if (this.tableStore.height === void 0 || currentTarget !== target || target === this.tableFootWrap) {
      return;
    }
    const fixedColumnsBodyLeft = this.fixedColumnsBodyLeft;
    const bodyTable = this.tableBodyWrap;
    const fixedColumnsBodyRight = this.fixedColumnsBodyRight;
    const { scrollTop } = target;
    if (scrollTop !== this.lastScrollTop) {
      if (fixedColumnsBodyLeft && target !== fixedColumnsBodyLeft) {
        fixedColumnsBodyLeft.scrollTop = scrollTop;
      }
      if (bodyTable && target !== bodyTable) {
        bodyTable.scrollTop = scrollTop;
      }
      if (fixedColumnsBodyRight && target !== fixedColumnsBodyRight) {
        fixedColumnsBodyRight.scrollTop = scrollTop;
      }
    }
    this.lastScrollTop = scrollTop;
  }

  handleBodyScrollLeft(e) {
    const { target, currentTarget } = e;
    const headTable = this.tableHeadWrap;
    const bodyTable = this.tableBodyWrap;
    const footTable = this.tableFootWrap;
    if (this.tableStore.overflowX === void 0
      || currentTarget !== target
      || target === this.fixedColumnsBodyRight
      || target === this.fixedColumnsBodyLeft) {
      return;
    }
    const { scrollLeft } = target;
    if (scrollLeft !== this.lastScrollLeft) {
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
      const { prefixCls } = this;
      const cls = classes(this.element).remove(new RegExp(`^${prefixCls}-scroll-position-.+$`));
      if (position === ScrollPosition.both) {
        cls.add(`${prefixCls}-scroll-position-left`).add(`${prefixCls}-scroll-position-right`);
      } else {
        cls.add(`${prefixCls}-scroll-position-${position}`);
      }
    }
  }

  renderTable(hasHeader: boolean, hasBody: boolean, hasFooter: boolean, lock?: ColumnLock | boolean): ReactNode {
    const { prefixCls, props: { rowHeight } } = this;
    return (
      <TableWrapper
        prefixCls={prefixCls}
        rowHeight={rowHeight!}
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
    const { prefixCls, props: { header, dataSet } } = this;
    const data = dataSet ? dataSet.data : [];
    if (header) {
      return (
        <div key="header" className={`${prefixCls}-header`}>
          {typeof header === 'function' ? header(data) : header}
        </div>
      );
    }
  }

  getFooter(): ReactNode | undefined {
    const { prefixCls, props: { footer, dataSet } } = this;
    const data = dataSet ? dataSet.data : [];
    if (footer) {
      return (
        <div key="footer" className={`${prefixCls}-footer`}>
          {typeof footer === 'function' ? footer(data) : footer}
        </div>
      );
    }
  }

  getPagination(position: TablePaginationPosition): ReactNode {
    const { prefixCls, props: { dataSet, pagination } } = this;
    if (pagination !== false && dataSet && dataSet.paging) {
      const paginationPosition = getPaginationPosition(pagination);
      if (paginationPosition === TablePaginationPosition.both || paginationPosition === position) {
        const props = omit(pagination, 'position');
        return (
          <Pagination key={`pagination-${position}`} {...props} className={classNames(`${prefixCls}-pagination`, props.className)} dataSet={dataSet}>
            {this.getCacheSelectionSwitch()}
          </Pagination>
        );
      }
    }
  }

  getCacheSelectionSwitch() {
    const { props: { dataSet }, prefixCls } = this;
    if (dataSet && dataSet.cacheSelectionKeys && dataSet.cachedSelected.length) {
      const { showCachedSeletion } = this.tableStore;
      return (
        <Tooltip title={$l('Table', showCachedSeletion ? 'hide_cached_seletion' : 'show_cached_seletion')}>
          <Switch className={`${prefixCls}-switch`} checked={showCachedSeletion} onChange={this.handleSwitchChange} />
        </Tooltip>
      );
    }
  }

  getTable(lock?: ColumnLock | boolean): ReactNode {
    const { prefixCls, props: { rowHeight } } = this;
    const { overflowX, height, hasFooter: footer } = this.tableStore;
    let tableHead: ReactNode;
    let tableBody: ReactNode;
    let tableFooter: ReactNode;
    if (height !== void 0 || overflowX) {
      const { lockColumnsBodyRowsHeight, leftLeafColumnsWidth } = this.tableStore;
      let bodyHeight = height;
      let tableHeadRef;
      let tableBodyRef;
      let tableFootRef;
      if (!lock) {
        tableHeadRef = (node) => this.tableHeadWrap = node;
        tableFootRef = (node) => this.tableFootWrap = node;
        tableBodyRef = (node) => this.tableBodyWrap = node;
      } else if (lock === 'right') {
        tableBodyRef = (node) => this.fixedColumnsBodyRight = node;
      } else {
        tableBodyRef = (node) => this.fixedColumnsBodyLeft = node;
      }
      if (bodyHeight !== void 0) {
        bodyHeight = Math.max(bodyHeight, isNumber(rowHeight) ? rowHeight : lockColumnsBodyRowsHeight[0] || 0);
        if (lock && !footer) {
          bodyHeight -= measureScrollbar();
        }
      }

      tableHead = (
        <div
          key="tableHead"
          ref={tableHeadRef}
          className={`${prefixCls}-head`}
        >{this.renderTable(true, false, false, lock)}
        </div>
      );
      const fixedLeft = lock === true || lock === ColumnLock.left;
      tableBody = (
        <div
          key="tableBody"
          ref={tableBodyRef}
          className={`${prefixCls}-body`}
          style={{ height: pxToRem(bodyHeight), width: fixedLeft ? pxToRem(leftLeafColumnsWidth + measureScrollbar()) : void 0 }}
          onScroll={this.handleBodyScroll}
        >{this.renderTable(false, true, false, lock)}
        </div>
      );
      if (fixedLeft) {
        tableBody = (
          <div key="tableBody" style={{ width: pxToRem(leftLeafColumnsWidth), overflow: 'hidden' }}>
            {tableBody}
          </div>
        );
      }
      if (footer) {
        tableFooter = (
          <div
            key="tableFooter"
            ref={tableFootRef}
            className={`${prefixCls}-foot`}
            onScroll={this.handleBodyScroll}
          >{this.renderTable(false, false, true, lock)}
          </div>
        );
      }
    } else {
      tableBody = this.renderTable(true, true, footer, lock);
    }
    return [tableHead, tableBody, tableFooter];
  }

  getLeftFixedTable(): ReactNode {
    const { overflowX, height } = this.tableStore;
    if (!overflowX && height === void 0) {
      return;
    }
    const { prefixCls } = this;
    const table = this.getTable(ColumnLock.left);
    return <div className={`${prefixCls}-fixed-left`}>{table}</div>;
  }

  getRightFixedTable(): ReactNode | undefined {
    const { overflowX, height } = this.tableStore;
    if (!overflowX && height === void 0) {
      return;
    }
    const { prefixCls } = this;
    const table = this.getTable(ColumnLock.right);
    return <div className={`${prefixCls}-fixed-right`}>{table}</div>;
  }

  getTableBody(lock?: ColumnLock | boolean): ReactNode {
    const { prefixCls, props: { indentSize, rowHeight, filter } } = this;
    return (
      <TableBody
        key="tbody"
        prefixCls={prefixCls}
        lock={lock}
        indentSize={indentSize!}
        rowHeight={rowHeight!}
        filter={filter}
      />
    );
  }

  getTableHeader(lock?: ColumnLock | boolean): ReactNode {
    const { prefixCls, props: { rowHeight, dataSet } } = this;
    return (
      <TableHeader key="thead" prefixCls={prefixCls} rowHeight={rowHeight!} lock={lock} dataSet={dataSet} />
    );
  }

  getTableFooter(lock?: ColumnLock | boolean): ReactNode {
    const { prefixCls, props: { rowHeight, dataSet } } = this;
    return (
      <TableFooter key="tfoot" prefixCls={prefixCls} rowHeight={rowHeight!} lock={lock} dataSet={dataSet} />
    );
  }

  getStyleHeight(): number | undefined {
    const { style } = this.props;
    if (style) {
      return toPx(style.height);
    }
  }

  @action
  syncSize() {
    const { element, tableStore } = this;
    if (element) {
      const width = element.offsetWidth;
      if (this.oldWidth !== width) {
        this.oldWidth = tableStore.width;
        tableStore.width = width;
      }
      const { prefixCls } = this;
      let height = this.getStyleHeight();
      if (element && isNumber(height)) {
        const tableTitle: HTMLDivElement | null = element.querySelector(`.${prefixCls}-title`);
        const tableHeader: HTMLTableSectionElement | null = element.querySelector(`.${prefixCls}-thead`);
        const tableFooter: HTMLTableSectionElement | null = element.querySelector(`.${prefixCls}-footer`);
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
  }

  @action
  initDefaultExpandedRows() {
    const { tableStore, props: { dataSet, defaultRowExpanded } } = this;
    if (tableStore.isTree && defaultRowExpanded && !dataSet.props.expandField) {
      tableStore.expandedRows = dataSet.data.filter(record => !!record.children);
    }
  }
}
