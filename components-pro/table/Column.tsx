import { Component, ComponentState, CSSProperties, ReactElement, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { get } from 'mobx';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import { FormFieldProps, Renderer } from '../field/FormField';
import { ElementProps } from '../core/ViewComponent';
import { ColumnAlign, ColumnLock, TableColumnTooltip } from './enum';
import { ShowHelp } from '../field/enum';
import { Commands } from './Table';

export const defaultMinWidth = 100;

export type onCellProps = { dataSet: DataSet; record: Record; column: ColumnProps; };
export type commandProps = { dataSet: DataSet; record: Record; };

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
  header?: ReactNode | ((dataSet: DataSet, name?: string, title?: string) => ReactNode);
  /**
   * 列脚
   */
  footer?: ReactNode | ((dataSet: DataSet, name?: string) => ReactNode);
  /**
   * 单元格渲染回调
   */
  renderer?: Renderer;
  /**
   * 编辑器
   */
  editor?:
    | ReactElement<FormFieldProps>
    | ((record: Record, name?: string) => ReactElement<FormFieldProps> | boolean)
    | boolean;
  /**
   * 是否锁定
   * 可选值： false | true | 'left' | 'right'
   * @default false
   */
  lock?: ColumnLock | boolean;
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
  sortable?: boolean;
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
}

export interface ColumnProps extends ColumnPropsBase {
  children?: ColumnProps[];
}

export interface ColumnPropsInner extends ColumnPropsBase {
  children?: ReactElement<ColumnProps>[] | ReactElement<ColumnProps>;
}

/* eslint-disable react/prefer-stateless-function,react/no-unused-prop-types */
export default class Column extends Component<ColumnPropsInner, ComponentState> {

  static propTypes = {
    /**
     * 列对照的字段名
     */
    name: PropTypes.string,
    /**
     * 列宽
     * 不推荐给所有列设置宽度，而是给某一列不设置宽度达到自动宽度的效果
     */
    width: PropTypes.number,
    /**
     * 最小列宽
     */
    minWidth: PropTypes.number,
    /**
     * 列头
     */
    header: PropTypes.oneOfType([PropTypes.string, PropTypes.element, PropTypes.func]),
    /**
     * 列脚
     */
    footer: PropTypes.oneOfType([PropTypes.string, PropTypes.element, PropTypes.func]),
    /**
     * 单元格渲染回调
     */
    renderer: PropTypes.func,
    /**
     * 编辑器
     */
    editor: PropTypes.oneOfType([PropTypes.element, PropTypes.func, PropTypes.bool]),
    /**
     * 是否锁定
     * 可选值： false | true | 'left' | 'right'
     * @default false
     */
    lock: PropTypes.oneOf([ColumnLock.left, ColumnLock.right, true, false]),
    /**
     * 文字对齐方式
     * 可选值： 'left' | 'center' | 'right'
     */
    align: PropTypes.oneOf([ColumnAlign.left, ColumnAlign.center, ColumnAlign.right]),
    /**
     * 是否可调整宽度
     * @default true
     */
    resizable: PropTypes.bool,
    /**
     * 是否可排序
     * @default false
     */
    sortable: PropTypes.bool,
    /**
     * 是否可隐藏，设为false时不会出现在列过滤选项中
     * @default true
     */
    hideable: PropTypes.bool,
    /**
     * 是否可排序
     * @default false
     */
    /**
     * 列头提示信息
     */
    help: PropTypes.string,
    /**
     * 显示提示信息的方式
     *
     */
    showHelp: PropTypes.oneOf([ShowHelp.tooltip, ShowHelp.newLine, ShowHelp.none]),
    hidden: PropTypes.bool,
    colSpan: PropTypes.number,
    rowSpan: PropTypes.number,
    children: PropTypes.array,
  };

  static __PRO_TABLE_COLUMN = true;

  static defaultProps = {
    hidden: false,
    lock: false,
    resizable: true,
    sortable: false,
    hideable: true,
    minWidth: defaultMinWidth,
    showHelp: ShowHelp.tooltip,
  };
}

export function minColumnWidth(col): number {
  const hidden = get(col, 'hidden');
  if (hidden) {
    return 0;
  }
  const width: number | undefined = get(col, 'width');
  const min: number | undefined = get(col, 'minWidth');
  const minWidth = min === undefined ? defaultMinWidth : min;
  if (width === undefined) {
    return minWidth;
  }
  return Math.min(width, minWidth);
}

export function columnWidth(col): number {
  const hidden = get(col, 'hidden');
  if (hidden) {
    return 0;
  }
  const width: number | undefined = get(col, 'width');
  if (width === undefined) {
    const minWidth: number | undefined = get(col, 'minWidth');
    if (minWidth === undefined) {
      return defaultMinWidth;
    }
    return minWidth;
  }
  return width;
}
