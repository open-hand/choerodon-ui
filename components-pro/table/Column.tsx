import { CSSProperties, FunctionComponent, Key, ReactElement, ReactNode } from 'react';
import { get } from 'mobx';
import DataSet, { Group } from '../data-set/DataSet';
import { SortOrder } from '../data-set/interface';
import Record from '../data-set/Record';
import Field from '../data-set/Field';
import { FormFieldProps, HighlightRenderer, Renderer, RenderProps, TagRendererProps } from '../field/FormField';
import { ElementProps } from '../core/ViewComponent';
import { ColumnAlign, ColumnLock, TableColumnTooltip } from './enum';
import { ShowHelp } from '../field/enum';
import { Commands, TableGroup } from './Table';
import TableStore from './TableStore';
import { AggregationTreeProps } from './AggregationTree';
import { TooltipProps } from '../tooltip/Tooltip';

export function defaultAggregationRenderer({ text }) {
  return text;
}

export type onCellProps = { dataSet: DataSet; record: Record; column: ColumnProps };
export type commandProps = { dataSet: DataSet; record: Record; aggregation?: boolean };
export type CompareFn = (a: Record, b: Record, sortOrder?: SortOrder) => number;
export type FilterPopoverProps = {
  dataSet: DataSet;
  field?: Field;
  filterText: any;
  setFilterText: Function;
  clearFilters: Function;
  confirm: Function;
  footer: ReactNode;
};

export interface ColumnRenderProps extends RenderProps {
  aggregation?: boolean;
  headerGroup?: Group;
  rowGroup?: Group;
  aggregationTree?: ReactElement<AggregationTreeProps>[];
}

export interface FooterHookOptions {
  dataSet: DataSet;
  name?: string | undefined;
  aggregationTree?: ReactElement<AggregationTreeProps>[];
}

export interface HeaderHookOptions extends FooterHookOptions {
  title?: string | undefined;
  aggregation?: boolean | undefined;
  group?: Group | undefined;
  groups?: Group[] | undefined;
}

export interface ColumnPropsBase extends ElementProps {
  /**
   * 列对照的字段名
   */
  name?: string;
  /**
   * 列宽
   * 不推荐给所有列设置宽度，而是给某一列不设置宽度达到自动宽度的效果
   */
  width?: number;
  /**
   * 默认列宽
   * 只在出横向滚动条时起作用
   */
  defaultWidth?: number;
  /**
   * 最小列宽
   */
  minWidth?: number;
  /**
   * 列头文字，优先级高于 header， 便于列头文字通过 header 钩子渲染的情况下可编辑
   */
  title?: string;
  /**
   * 列头
   */
  header?: ReactNode | ((dataSet: DataSet | HeaderHookOptions, name?: string, title?: string, aggregation?: boolean) => ReactNode);
  /**
   * 列脚
   */
  footer?: ReactNode | ((dataSet: DataSet | FooterHookOptions, name?: string) => ReactNode);
  /**
   * 单元格渲染回调
   */
  renderer?: Renderer<ColumnRenderProps>;
  /**
   * 编辑器
   */
  editor?:
    | ReactElement<FormFieldProps>
    | ((record: Record, name?: string) => ReactElement<FormFieldProps> | boolean)
    | boolean;
  /**
   * 多值 Tag 渲染器
   */
  tagRenderer?: (props: TagRendererProps) => ReactNode;
  /**
   * 是否锁定
   * 可选值： false | true | 'left' | 'right'
   * @default false
   */
  lock?: ColumnLock | boolean | undefined;
  /**
   * 文字对齐方式
   * 可选值： 'left' | 'center' | 'right'
   */
  align?: ColumnAlign;
  /**
   * 是否可调整宽度
   * @default true
   */
  resizable?: boolean;
  /**
   * 是否可编辑标题
   */
  titleEditable?: boolean;
  /**
   * 是否可排序
   * @default false
   */
  sortable?: boolean | CompareFn;
  /**
   * 排序结束的回调函数
   * @param props 
   * @returns 
   */
  sortableCallback?: (props: { dataSet: DataSet, field: Field, order?: string }) => void;
  /**
   * 是否可前端过滤
   * @default false
   */
  filter?: boolean | ((props: { record: Record, filterText?: string }) => boolean);
  /**
   * 可以自定义筛选，此函数只负责渲染图层，需要自行编写各种交互
   */
  filterPopover?: ReactNode | ((props: FilterPopoverProps) => ReactNode);
  /**
   * 是否可隐藏，设为false时不会出现在列过滤选项中
   * @default true
   */
  hideable?: boolean;
  /**
   * 列头内链样式
   */
  headerStyle?: CSSProperties;
  /**
   * 列头样式名
   */
  headerClassName?: string;
  /**
   * 列脚内链样式
   */
  footerStyle?: CSSProperties;
  /**
   * 列脚样式名
   */
  footerClassName?: string;
  /**
   * 列头提示信息
   */
  help?: string;
  /**
   * 显示提示信息的方式
   *
   */
  showHelp?: ShowHelp;
  /**
   * 用tooltip显示单元格内容
   * 可选值：`none` `always` `overflow`
   */
  tooltip?: TableColumnTooltip;
  /**
   * tooltip 的属性配置
   */
   tooltipProps?: TooltipProps;
  /**
   * 设置单元格属性
   * @param {onCellProps} props
   * @return {Object} 单元格属性
   */
  onCell?: (props: onCellProps) => object;
  /**
   * 行操作按钮
   * 可选值：`edit` `delete` 或 自定义按钮
   * 给内置按钮加属性：command={[['edit', { color: 'red' }], ...]}
   */
  command?: Commands[] | ((props: commandProps) => Commands[]);
  /**
   * 列排序，若无设置则按列数组顺序
   */
  sort?: number;
  /**
   * 是否聚合
   */
  aggregation?: boolean | undefined;
  /**
   * 聚合显示条目数量上限，超过限制的条目可通过展开按钮来显示
   * @default 4
   */
  aggregationLimit?: number;
  /**
   * 默认展开聚合列的展开按钮
   */
  aggregationLimitDefaultExpanded?: boolean | ((record: Record) => boolean);
  /**
   * 默认展开指定的聚合列树节点
   */
  aggregationDefaultExpandedKeys?: Key[];
  /**
   * 默认展开所有聚合列树节点
   */
  aggregationDefaultExpandAll?: boolean;
  /**
   * 聚合单元格中的列索引
   */
  aggregationTreeIndex?: number;
  /**
   * 在聚合列下是否隐藏
   */
  hiddenInAggregation?: boolean | ((record: Record) => boolean);
  /**
   * 高亮渲染器
   */
  highlightRenderer?: HighlightRenderer;
}

export interface ColumnProps extends ColumnPropsBase {
  children?: ColumnProps[];
  __tableGroup?: TableGroup;
  __group?: Group;
  __groups?: Group[];
  __originalKey?: Key;
}

export interface ColumnPropsInner extends ColumnPropsBase {
  children?: ReactElement<ColumnProps>[] | ReactElement<ColumnProps>;
}

export interface IColumn extends FunctionComponent<ColumnPropsInner> {
  __PRO_TABLE_COLUMN?: boolean;
}

export const ColumnDefaultProps: ColumnPropsBase = {
  hidden: false,
  lock: false,
  resizable: true,
  sortable: false,
  hideable: true,
  aggregationLimit: 4,
  showHelp: ShowHelp.tooltip,
};
const Column: IColumn = function Column() {
  return null;
};

Column.__PRO_TABLE_COLUMN = true;
Column.defaultProps = ColumnDefaultProps;
export default Column;

export function minColumnWidth(col: ColumnProps, store: TableStore): number {
  const hidden = get(col, 'hidden');
  if (hidden) {
    return 0;
  }
  const width: number | undefined = get(col, 'width');
  const min: number | undefined = get(col, 'minWidth');
  const aggregation: boolean | undefined = get(col, 'aggregation');
  const minWidth = min === undefined ? store.getConfig(aggregation ? 'tableAggregationColumnDefaultMinWidth' : 'tableColumnDefaultMinWidth') : min;
  if (width === undefined) {
    return minWidth;
  }
  return Math.min(width, minWidth);
}

function getDefaultWidth(col: ColumnProps, store: TableStore, aggregation?: boolean): number {
  const defaultWidth: number | undefined = get(col, 'defaultWidth');
  if (defaultWidth === undefined) {
    return store.getConfig(aggregation ? 'tableAggregationColumnDefaultWidth' : 'tableColumnDefaultWidth');
  }
  return defaultWidth;
}

function getMinWidth(col: ColumnProps, store: TableStore, aggregation?: boolean): number {
  const minWidth: number | undefined = get(col, 'minWidth');
  if (minWidth === undefined) {
    return store.getConfig(aggregation ? 'tableAggregationColumnDefaultMinWidth' : 'tableColumnDefaultMinWidth');
  }
  return minWidth;
}

export function columnWidth(col: ColumnProps, store: TableStore): number {
  const hidden = get(col, 'hidden');
  if (hidden) {
    return 0;
  }
  const width: number | undefined = get(col, 'width');
  if (width === undefined) {
    const aggregation: boolean | undefined = get(col, 'aggregation');
    const defaultWidth: number | undefined = getDefaultWidth(col, store, aggregation);
    const minWidth: number | undefined = getMinWidth(col, store, aggregation);
    return Math.max(minWidth, defaultWidth);
  }
  return width;
}
