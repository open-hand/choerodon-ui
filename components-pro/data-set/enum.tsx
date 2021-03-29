export enum DataSetEvents {
  query = 'query',
  beforeLoad = 'beforeLoad',
  beforeAppend = 'beforeAppend',
  load = 'load',
  append = 'append',
  loadFailed = 'loadFailed',
  submit = 'submit',
  submitSuccess = 'submitSuccess',
  submitFailed = 'submitFailed',
  select = 'select',
  unSelect = 'unSelect',
  selectAll = 'selectAll',
  unSelectAll = 'unSelectAll',
  indexChange = 'indexChange',
  update = 'update',
  fieldChange = 'fieldChange',
  export = 'export',
  create = 'create',
  beforeRemove = 'beforeRemove',
  remove = 'remove',
  beforeDelete = 'beforeDelete',
  reset = 'reset',
  validate = 'validate',
}

export enum ExportMode {
  server = 'server',
  client = 'client',
}

export enum DataSetSelection {
  single = 'single',
  multiple = 'multiple',
}

export enum DataSetStatus {
  loading = 'loading',
  submitting = 'submitting',
  ready = 'ready',
}

export enum DataSetExportStatus {
  exporting = 'exporting',
  success = 'success',
  progressing = 'progressing',
  start = 'start',
  failed = 'failed',
}

export enum RecordStatus {
  delete = 'delete',
  update = 'update',
  add = 'add',
  sync = 'sync',
}

export enum FieldType {
  auto = 'auto',
  boolean = 'boolean',
  number = 'number',
  currency = 'currency',
  string = 'string',
  date = 'date',
  dateTime = 'dateTime',
  week = 'week',
  month = 'month',
  year = 'year',
  time = 'time',
  object = 'object',
  intl = 'intl',
  email = 'email',
  url = 'url',
  color = 'color',
  reactNode = 'reactNode',
}

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

export enum BooleanValue {
  trueValue = 'trueValue',
  falseValue = 'falseValue',
}

export enum FieldIgnore {
  always = 'always',
  clean = 'clean',
  never = 'never',
}

export enum FieldTrim {
  both = 'both',
  left = 'left',
  right = 'right',
  none = 'none',
}

export enum FieldFormat {
  uppercase = 'uppercase',
  lowercase = 'lowercase',
  capitalize = 'capitalize',
}

export enum DataToJSON {
  dirty = 'dirty',
  selected = 'selected',
  all = 'all',
  normal = 'normal',
  'dirty-self' = 'dirty-self',
  'selected-self' = 'selected-self',
  'all-self' = 'all-self',
  'normal-self' = 'normal-self',
}
