import React from 'react';
import { action, computed, get, isArrayLike, observable, runInAction, set } from 'mobx';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import sortBy from 'lodash/sortBy';
import flatten from 'lodash/flatten';
import debounce from 'lodash/debounce';
import includes from 'lodash/includes';
import isNil from 'lodash/isNil';
import isPlainObject from 'lodash/isPlainObject';
import { getConfig, getProPrefixCls } from 'choerodon-ui/lib/configure';
import { Size } from 'choerodon-ui/lib/_util/enum';
import { isCalcSize, toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import CustomizationColumnHeader from './customization-settings/CustomizationColumnHeader';
import CustomizationSettings from './customization-settings';
import DataSet from '../data-set';
import { getColumnKey } from './utils';
import { Customized, TableQueryBarHookProps } from './Table.d';
import { ColumnProps } from './Column.d';
import Column from './Column';
import autobind from '../_util/autobind';
import { ModalProps } from '../modal/Modal';
import { $l } from '../locale-context';
import { ColumnLock, TableHeightType } from '../table/enum';
import ColumnGroup from './ColumnGroup';
import { findHiddenKeys } from './utils';
// import isFragment from '../_util/isFragment';

// export function normalizeColumns(
//   elements: ReactNode,
//   customizedColumns?: object,
//   parent: ColumnProps | null = null,
//   defaultKey: number[] = [0],
//   columnSort = {
//     left: 0,
//     center: 0,
//     right: 0,
//   },
// ): any[] {
//   const columns: any[] = [];
//   const leftColumns: any[] = [];
//   const rightColumns: any[] = [];
//   const normalizeColumn = (element) => {
//     if (isValidElement<any>(element)) {
//       const { props, key, type } = element;
//       if (isFragment(element)) {
//         const { children } = props;
//         if (children) {
//           Children.forEach(children, normalizeColumn);
//         }
//       } else if ((type as typeof Column).__PFM_TABLE_COLUMN) {
//         const column: any = {
//           ...props,
//         };
//         if (key) {
//           column.key = key;
//         } else {
//           column.key = `anonymous-${defaultKey[0]++}`;
//         }
//         // tree children todo
//         const { children } = column;
//         if (!isNil(customizedColumns)) {
//           const key = column.dataIndex || children[1].props.dataKey;
//           Object.assign(column, customizedColumns[key.toString()]);
//         }
//         if (parent) {
//           column.fixed = parent.fixed;
//         }
//         if (column.title) {
//           const childrenColumns = children[0];
//           column.children = [React.cloneElement(childrenColumns, { children: column.title }), children[1]];
//         }
//
//         if (parent || !column.fixed) {
//           if (column.sort === undefined) {
//             column.sort = columnSort.center++;
//           }
//           columns.push(React.cloneElement(element, column));
//         } else if (column.fixed === true || column.fixed === 'left') {
//           if (column.sort === undefined) {
//             column.sort = columnSort.left++;
//           }
//           leftColumns.push(React.cloneElement(element, column));
//           // leftColumns.push(column);
//         } else {
//           if (column.sort === undefined) {
//             column.sort = columnSort.right++;
//           }
//           rightColumns.push(React.cloneElement(element, column));
//           // rightColumns.push(column);
//         }
//       }
//     }
//   };
//   Children.forEach(elements, normalizeColumn);
//   if (parent) {
//     return sortBy(columns, ({ props: { sort } }) => sort);
//   }
//   return [
//     ...sortBy(leftColumns, ({ props: { sort } }) => sort),
//     ...sortBy(columns, ({ props: { sort } }) => sort),
//     ...sortBy(rightColumns, ({ props: { sort } }) => sort),
//   ];
// }

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
        Object.assign(newColumn, customizedColumns[getColumnKey(newColumn).toString()]);
      }
      if (parent) {
        newColumn.fixed = parent.fixed;
      }
      if (children) {
        // @ts-ignore
        const childrenColumns = mergeDefaultProps(children, customizedColumns, newColumn, defaultKey);
        newColumn.children = childrenColumns;
      }
      if (parent || !newColumn.fixed) {
        if (newColumn.sort === undefined) {
          newColumn.sort = columnSort.center++;
        }
        columns.push(newColumn);
      } else if (newColumn.fixed === true || newColumn.fixed === ColumnLock.left) {
        if (newColumn.sort === undefined) {
          newColumn.sort = columnSort.left++;
        }
        leftColumns.push(newColumn);
      } else {
        if (newColumn.sort === undefined) {
          newColumn.sort = columnSort.right++;
        }
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

export default class TableStore {
  node: any;

  searchText: string;

  highlightRowIndexs: number[] = [];

  @observable props: any;

  @observable originalColumns: ColumnProps[];

  @observable originalChildren: any[];

  @observable customizedActiveKey: string[];

  @observable tempCustomized: Customized;

  @observable customized: Customized;

  @observable totalHeight?: number;

  @observable height?: number;

  @observable loading?: boolean;

  @computed
  get queryBar(): TableQueryBarHookProps {
    return this.node.props.queryBar;
  }

  /**
   * 表头支持编辑
   */
  @computed
  get columnTitleEditable(): boolean {
    if ('columnTitleEditable' in this.node.props) {
      return this.node.props.columnTitleEditable;
    }
    return getConfig('performanceTableColumnTitleEditable') === true;
  }


  @computed
  get dataSet(): DataSet {
    return this.node.props.queryBar?.dataSet;
  }

  async loadCustomized() {
    const { customizedCode } = this.node.props;
    if (this.customizable && customizedCode) {
      const tableCustomizedLoad = getConfig('tableCustomizedLoad');
      runInAction(() => {
        this.loading = true;
      });
      try {
        const customized = await tableCustomizedLoad(customizedCode);
        if (customized) {
          runInAction(() => {
            this.customized = { columns: {}, ...customized };
          });
        }
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
    return getProPrefixCls('table');
  }

  @computed
  get columnHideable(): boolean {
    if ('columnHideable' in this.node.props) {
      return this.node.props.columnHideable;
    }
    return getConfig('performanceTableColumnHideable') !== false;
  }

  @computed
  get customizable(): boolean {
    const { customizedCode } = this.node.props;
    if (customizedCode && (this.columnTitleEditable || this.columnDraggable || this.columnHideable)) {
      if ('customizable' in this.node.props) {
        return this.node.props.customizable;
      }
      return getConfig('performanceTableCustomizable');
    }
    return false;
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
    const {
      node: { element, props: { height } },
    } = this;
    if (height === undefined) {
      this.totalHeight = element.offsetHeight;
    }
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
    const { columns } = this.node.props;
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
  saveCustomized(customized?: Customized | null) {
    if (this.customizable) {
      const { customizedCode } = this.node.props;
      if (customized) {
        this.customized = customized;
      }
      this.node.forceUpdate();
      if (customizedCode) {
        const tableCustomizedSave = getConfig('tableCustomizedSave');
        tableCustomizedSave(customizedCode, this.customized);
      }
    }
  };

  saveCustomizedDebounce = debounce(this.saveCustomized, 1000);

  @computed
  get columnDraggable(): boolean {
    if ('columnDraggable' in this.node.props) {
      return this.node.props.columnDraggable;
    }
    return getConfig('performanceTableColumnDraggable') === true;
  }

  @computed
  get primevalColumns(): React.ReactNodeArray {
    const { columns } = this.node.props;
    let children = this.node.props.children;
    if (columns && columns.length) {
      children = this.node.processTableColumns(columns);
    }

    if (!Array.isArray(children) && !isArrayLike(children)) {
      return children as React.ReactNodeArray;
    }

    // Fix that the `ColumnGroup` array cannot be rendered in the Table
    const flattenColumns = flatten(children).map((column: React.ReactElement) => {
      if (column) {
        const hiddenColumnKeys = findHiddenKeys(children, columns);
        const columnChildren: any = column.props.children;
        // @ts-ignore
        const columnHidden = includes(hiddenColumnKeys, `${columnChildren[1].props.dataKey}`);
        let cellProps: ColumnProps = {
          dataIndex: columnChildren[1].props.dataKey,
        };
        cellProps.hidden = columnHidden !== undefined ? columnHidden : false;
        if ((column.type as typeof ColumnGroup)?.__PRO_TABLE_COLUMN_GROUP) {
          const { header, children: childColumns, align, fixed, verticalAlign } = column.props;
          return childColumns.map((childColumn, index) => {
            // 把 ColumnGroup 设置的属性覆盖到 Column
            const groupCellProps: any = {
              ...childColumn?.props,
              ...cellProps,
              align,
              fixed,
              verticalAlign,
            };

            /**
             * 为分组中的第一列设置属性:
             * groupCount: 分组子项个数
             * groupHeader: 分组标题
             * resizable: 设置为不可自定义列宽
             */
            if (index === 0) {
              groupCellProps.groupCount = childColumns.length;
              groupCellProps.groupHeader = header;
              groupCellProps.resizable = false;
            }

            return React.cloneElement(childColumn, groupCellProps);
          });
        }
        return React.cloneElement(column, cellProps);
      }
      return column;
    });

    // 把 Columns 中的数组，展平为一维数组，计算 lastColumn 与 firstColumn。
    return flatten(flattenColumns);
    // return flatten(flattenColumns).map((column) => {
    //   const fixed = getColumnFixed(column.props.fixed);
    //   return {...column.props, fixed};
    // });
  }

  constructor(node) {
    runInAction(() => {
      // this.setProps(node.props);
      this.node = node;
      this.customizedActiveKey = ['columns'];
      this.tempCustomized = { columns: {} };
      this.customized = { columns: {} };
      if (this.customizable) {
        this.loadCustomized().then(this.handleLoadCustomized);
      }
    });
  }
}
