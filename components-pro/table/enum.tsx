export const enum ColumnLock {
  left = 'left',
  right = 'right',
}

export const enum ColumnAlign {
  left = 'left',
  center = 'center',
  right = 'right',
}

export const enum ScrollPosition {
  left = 'left',
  right = 'right',
  both = 'both',
  middle = 'middle',
}

export const enum SelectionMode {
  rowbox = 'rowbox',
  click = 'click',
  none = 'none',
  dblclick = 'dblclick',
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

export const enum TableMode {
  list = 'list',
  tree = 'tree',
}

export const enum TableEditMode {
  cell = 'cell',
  inline = 'inline',
}

export const enum TableQueryBarType {
  normal = 'normal',
  bar = 'bar',
  none = 'none',
  advancedBar = 'advancedBar',
}

export const enum TablePaginationPosition {
  top = 'top',
  bottom = 'bottom',
  both = 'both',
}

export const enum TableColumnTooltip {
  none = 'none',
  always = 'always',
  overflow = 'overflow',
}
