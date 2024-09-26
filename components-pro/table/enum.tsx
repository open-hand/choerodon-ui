export { Tooltip as TableColumnTooltip } from '../core/enum';

export enum ColumnLock {
  left = 'left',
  right = 'right',
}

export enum RowBoxPlacement {
  start = 'start',
  end = 'end',
}

export enum ColumnAlign {
  left = 'left',
  center = 'center',
  right = 'right',
}

export enum DragColumnAlign {
  left = 'left',
  right = 'right',
}

export enum ScrollPosition {
  left = 'left',
  right = 'right',
  both = 'both',
  middle = 'middle',
}

export enum SelectionMode {
  rowbox = 'rowbox',
  treebox = 'treebox',
  click = 'click',
  none = 'none',
  dblclick = 'dblclick',
  mousedown = 'mousedown',
}

export enum TableButtonType {
  add = 'add',
  delete = 'delete',
  remove = 'remove',
  save = 'save',
  query = 'query',
  reset = 'reset',
  expandAll = 'expandAll',
  collapseAll = 'collapseAll',
  export = 'export',
}

export enum TableCommandType {
  edit = 'edit',
  delete = 'delete',
}

export enum TableMode {
  list = 'list',
  tree = 'tree',
}

export enum TableEditMode {
  cell = 'cell',
  inline = 'inline',
}

export enum TableQueryBarType {
  normal = 'normal',
  bar = 'bar',
  none = 'none',
  advancedBar = 'advancedBar',
  professionalBar = 'professionalBar',
  filterBar = 'filterBar',
  comboBar = 'comboBar'
}

export enum TablePaginationPosition {
  top = 'top',
  bottom = 'bottom',
  both = 'both',
}

export enum TableHeightType {
  auto = 'auto',
  fixed = 'fixed',
  flex = 'flex',
}

export enum TableAutoHeightType {
  maxHeight = 'maxHeight',
  minHeight = 'minHeight',
}

export enum HighLightRowType {
  click = 'click',
  focus = 'focus',
}

export enum GroupType {
  header = 'header',
  column = 'column',
  row = 'row',
  none = 'none',
}

export enum TableColumnResizeTriggerType {
  hover = 'hover',
  mouseDown = 'mouseDown',
}

export enum TableBoxSizing {
  content = 'content',
  wrapper = 'wrapper',
}

export enum MultiDragSelectMode {
  /**
   * ctrl + 点击
   */
  keyboard = 'keyboard',
  /**
   * 使用表格勾选框勾选
   */
  checkbox = 'checkbox',
}

export enum SortRangeOption {
  /**
   * 当前页排序
   */
  currentDataSort = 'currentDataSort',
  /**
   * 所有页排序
   */
  allDataSort = 'allDataSort',
}
