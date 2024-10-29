import React from 'react';
import { action, computed, get, observable, runInAction, set } from 'mobx';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isObject from 'lodash/isObject';
import isUndefined from 'lodash/isUndefined';
import sortBy from 'lodash/sortBy';
import debounce from 'lodash/debounce';
import isNil from 'lodash/isNil';
import isPlainObject from 'lodash/isPlainObject';
import { math } from 'choerodon-ui/dataset';
import { Config, ConfigKeys, DefaultConfig } from 'choerodon-ui/lib/configure';
import { Size } from 'choerodon-ui/lib/_util/enum';
import { isCalcSize, toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import CustomizationColumnHeader from './customization-settings/CustomizationColumnHeader';
import CustomizationSettings from './customization-settings';
import DataSet from '../data-set';
import { getColumnKey } from './utils';
import PerformanceTable, { PerformanceTableCustomized, TableProps, TableQueryBarProps, TableRowSelection } from './Table';
import Column, { ColumnProps } from './Column';
import autobind from '../_util/autobind';
import { ModalProps } from '../modal/Modal';
import { $l } from '../locale-context';
import { ColumnLock, TableAutoHeightType, TableColumnResizeTriggerType, TableHeightType } from '../table/enum';

export function getRowSelection(props: TableProps): TableRowSelection {
  return props.rowSelection || {};
}

export function mergeDefaultProps(
  originalColumns: ColumnProps[],
  customizedColumns?: object,
  parent: ColumnProps | null = null,
  defaultKey: number[] = [0],
  columnSort = {
    left: 0,
    center: 0,
    right: 0,
  },
): any[] {
  const columns: any[] = [];
  const leftColumns: any[] = [];
  const rightColumns: any[] = [];
  originalColumns.forEach((column) => {
    if (isPlainObject(column)) {
      const newColumn: ColumnProps = { ...Column.defaultProps, ...column };
      if (isNil(getColumnKey(newColumn))) {
        newColumn.key = `anonymous-${defaultKey[0]++}`;
      }
      const { children } = newColumn;
      if (customizedColumns) {
        const customized = customizedColumns[getColumnKey(newColumn).toString()];
        if (customized) {
          const { width } = customized;
          if (width && math.isBigNumber(width)) {
            customized.width = width.toNumber();
          }
          Object.assign(newColumn, customized);
        }
      }
      if (parent) {
        newColumn.fixed = parent.fixed;
      }
      if (children) {
        // @ts-ignore
        const childrenColumns = mergeDefaultProps(children, customizedColumns, newColumn, defaultKey);
        newColumn.children = childrenColumns;
        newColumn.width = childrenColumns.reduce((prev, current) => prev + current.width, 0);
      }
      if (parent || !newColumn.fixed) {
        if (newColumn.sort === undefined) {
          newColumn.sort = columnSort.center;
        }
        columnSort.center++;
        columns.push(newColumn);
      } else if (newColumn.fixed === true || newColumn.fixed === ColumnLock.left) {
        if (newColumn.sort === undefined) {
          newColumn.sort = columnSort.left;
        }
        columnSort.left++;
        leftColumns.push(newColumn);
      } else {
        if (newColumn.sort === undefined) {
          newColumn.sort = columnSort.right;
        }
        columnSort.right++;
        rightColumns.push(newColumn);
      }
    }
  }, []);
  if (parent) {
    return sortBy(columns, ({ sort }) => sort);
  }
  return [
    ...sortBy(leftColumns, ({ sort }) => sort),
    ...sortBy(columns, ({ sort }) => sort),
    ...sortBy(rightColumns, ({ sort }) => sort),
  ];
}

export interface CheckboxPropsCache {
  [key: string]: any;
}

export default class TableStore {
  node: PerformanceTable;

  searchText: string;

  highlightRowIndexs: number[] = [];

  originalChildren: any[];

  checkboxPropsCache: CheckboxPropsCache = {};

  selectionDirty?: boolean;

  @observable props: any;

  @observable originalColumns: ColumnProps[];

  @observable customizedActiveKey: string[];

  @observable tempCustomized: PerformanceTableCustomized;

  @observable customized: PerformanceTableCustomized;

  @observable totalHeight?: number;

  @observable height?: number;

  @observable loading?: boolean;

  @observable rowZIndex?: number[];

  @observable selectedRowKeys: string[] | number[];

  mouseBatchChooseStartId = 0;

  mouseBatchChooseEndId = 0;

  @observable mouseBatchChooseState: boolean;

  @observable mouseBatchChooseIdList: number[];

  get queryBar(): TableQueryBarProps | false | undefined {
    return this.node.props.queryBar;
  }

  /**
   * 表头支持编辑
   */
  @computed
  get columnTitleEditable(): boolean {
    if ('columnTitleEditable' in this.node.props) {
      return this.node.props.columnTitleEditable!;
    }
    return this.getConfig('performanceTableColumnTitleEditable') === true;
  }

  get useMouseBatchChoose(): boolean {
    if ('useMouseBatchChoose' in this.node.props) {
      return this.node.props.useMouseBatchChoose!;
    }
    return this.getConfig('performanceTableUseMouseBatchChoose') === true;
  }



  get dataSet(): DataSet | undefined {
    const { queryBar } = this;
    if (queryBar) {
      return queryBar.dataSet;
    }
  }

  get tableColumnResizeTrigger(): TableColumnResizeTriggerType {
    return this.getConfig('tableColumnResizeTrigger');
  }

  // @computed
  // get selectedRowKeys(): string[] {
  //   const { queryBar } = this.node.props;
  //   return queryBar && queryBar.dataSet;
  // }

  async loadCustomized() {
    const { customizedCode } = this.node.props;
    if (this.customizable && customizedCode) {
      const tableCustomizedLoad = this.getConfig('tableCustomizedLoad') || this.getConfig('customizedLoad');
      runInAction(() => {
        this.loading = true;
      });
      try {
        const customized: PerformanceTableCustomized | undefined | null = await tableCustomizedLoad(customizedCode, 'PerformanceTable');
        runInAction(() => {
          this.customized = { columns: {}, ...customized };
        });
      } finally {
        runInAction(() => {
          this.loading = false;
        });
      }
    }
  }

  @action
  updateProps(props, node) {
    this.node = node;
    this.originalColumns = props.columns;
    this.originalChildren = props.children;
    if (this.customizable && props.columns) {
      this.loadCustomized().then(this.handleLoadCustomized);
    }
  }

  @computed
  get prefixCls() {
    const { classPrefix } = this.node.props;
    return classPrefix;
  }

  @computed
  get proPrefixCls() {
    return this.node.context.getProPrefixCls('table');
  }

  @computed
  get columnHideable(): boolean {
    if ('columnHideable' in this.node.props) {
      return this.node.props.columnHideable;
    }
    return this.getConfig('performanceTableColumnHideable') !== false;
  }

  @computed
  get customizable(): boolean | undefined {
    const { customizedCode } = this.node.props;
    if (customizedCode && (this.columnTitleEditable || this.columnDraggable || this.columnHideable)) {
      if ('customizable' in this.node.props) {
        return this.node.props.customizable;
      }
      return this.getConfig('performanceTableCustomizable') || this.node.context.getCustomizable('PerformanceTable');
    }
    return false;
  }

  @computed
  get autoHeight(): boolean | { type: TableAutoHeightType; diff: number } {
    const { autoHeight } = this.node.props;
    if (isUndefined(autoHeight)) {
      const config: any = this.getConfig('performanceTableAutoHeight');
      if (isObject(config)) {
        return {
          type: TableAutoHeightType.minHeight,
          diff: 0,
          ...config
        };
      }
      return !!config
    } else if (isObject(autoHeight)) {
      return {
        type: autoHeight.type || TableAutoHeightType.minHeight,
        diff: autoHeight.diff || 0,
      };
    }
    return !!autoHeight

  }

  @computed
  get heightType(): TableHeightType {
    const tempHeightType = get(this.tempCustomized, 'heightType');
    if (tempHeightType !== undefined) {
      return tempHeightType;
    }
    const { heightType } = this.customized;
    if (heightType !== undefined) {
      return heightType;
    }
    return this.originalHeightType;
  }

  @computed
  get originalHeightType(): TableHeightType {
    const { height, autoHeight } = this.node.props;
    if (autoHeight) {
      return TableHeightType.flex;
    }
    if (height) {
      if (isString(height) && isCalcSize(height)) {
        return TableHeightType.flex;
      }
      if (isNumber(toPx(height))) {
        return TableHeightType.fixed;
      }
    }
    return TableHeightType.auto;
  }

  @autobind
  @action
  openCustomizationModal(modal) {
    const { customizedCode } = this.node.props;
    const modalProps: ModalProps = {
      drawer: true,
      size: Size.small,
      title: $l('Table', 'customization_settings'),
      children: <CustomizationSettings />,
      bodyStyle: {
        overflow: 'hidden auto',
        padding: 0,
      },
    };
    if (customizedCode) {
      modalProps.okText = $l('Table', 'save_button');
    }
    modal.open(modalProps);
  }

  @autobind
  customizedColumnHeader() {
    return <CustomizationColumnHeader onHeaderClick={this.openCustomizationModal} />;
  }

  @action
  initColumns() {
    const { customized, customizable } = this;
    const { columns = [] } = this.node.props;
    const customizedColumns = customizable ? customized.columns : undefined;
    this.originalColumns = mergeDefaultProps(columns, customizedColumns);
    this.node._cacheCells = null;
    this.node.forceUpdate();
  }

  @autobind
  @action
  handleLoadCustomized() {
    this.initColumns();
  }

  @action
  changeCustomizedColumnValue(columnKey: string, value: object) {
    const { customized: { columns } } = this;
    const oldCustomized = get(columns, columnKey);
    set(columns, columnKey, {
      ...oldCustomized,
      ...value,
    });
    this.saveCustomizedDebounce();
  }

  @action
  saveCustomized(customized?: PerformanceTableCustomized | null, otherInfo?: { columnDataSet?: DataSet }) {
    if (this.customizable) {
      const { customizedCode } = this.node.props;
      if (customized) {
        this.customized = customized;
      }
      this.node.forceUpdate();
      if (customizedCode) {
        const tableCustomizedSave = this.getConfig('tableCustomizedSave') || this.getConfig('customizedSave');
        tableCustomizedSave(customizedCode, this.customized, 'PerformanceTable', otherInfo);
      }
    }
  };

  saveCustomizedDebounce = debounce(this.saveCustomized, 1000);

  @computed
  get columnDraggable(): boolean {
    if ('columnDraggable' in this.node.props) {
      return this.node.props.columnDraggable!;
    }
    return this.getConfig('performanceTableColumnDraggable') === true;
  }

  setCheckboxPropsCache = (cache: CheckboxPropsCache) => this.checkboxPropsCache = cache;

  @autobind
  getConfig<T extends ConfigKeys>(key: T): T extends keyof DefaultConfig ? DefaultConfig[T] : Config[T] {
    return this.node.context.getConfig(key);
  }

  @action
  changeMouseBatchChooseIdList(idList: number[]) {
    this.mouseBatchChooseIdList = idList;
  }

  constructor(node: PerformanceTable) {
    runInAction(() => {
      this.node = node;
      this.rowZIndex = [];
      this.customizedActiveKey = ['columns'];
      this.tempCustomized = { columns: {} };
      this.customized = { columns: {} };
      this.selectedRowKeys = getRowSelection(this.node.props).selectedRowKeys || [];
      this.selectionDirty = false;
      if (this.customizable) {
        this.loadCustomized().then(this.handleLoadCustomized);
      }
    });
  }
}
