import { Children, Context, isValidElement, Key, ReactChildren } from 'react';
import RcTableRowContext from '../rc-components/table/TableRowContext';
import { ColumnProps } from './interface';

export const TableRowContext: Context<any> = RcTableRowContext;

export function flatArray(data: any[] = [], childrenName = 'children') {
  const result: any[] = [];
  const loop = (array: any[]) => {
    array.forEach(item => {
      if (item[childrenName]) {
        const newItem = { ...item };
        delete newItem[childrenName];
        result.push(newItem);
        if (item[childrenName].length > 0) {
          loop(item[childrenName]);
        }
      } else {
        result.push(item);
      }
    });
  };
  loop(data);
  return result;
}

export function treeMap<Node>(
  tree: Node[],
  mapper: (node: Node, index: number) => any,
  childrenName = 'children',
) {
  return tree.map((node: any, index) => {
    const extra: any = {};
    if (node[childrenName]) {
      extra[childrenName] = treeMap(node[childrenName], mapper, childrenName);
    }
    return {
      ...mapper(node as Node, index),
      ...extra,
    };
  });
}

export function flatFilter<T>(
  tree: ColumnProps<T>[],
  callback: (node: ColumnProps<T>) => any,
): ColumnProps<T>[] {
  return tree.reduce<ColumnProps<T>[]>(
    (acc, node) => {
      if (callback(node)) {
        acc.push(node);
      }
      if (node.children) {
        const children = flatFilter(node.children, callback);
        acc.push(...children);
      }
      return acc;
    },
    [],
  );
}

export function normalizeColumns(elements: ReactChildren) {
  const columns: any[] = [];
  Children.forEach(elements, element => {
    if (!isValidElement(element)) {
      return;
    }
    const column: any = {
      ...(element.props as Record<string, any>),
    };
    if (element.key) {
      column.key = element.key;
    }
    if (element.type && (element.type as any).__C7N_TABLE_COLUMN_GROUP) {
      column.children = normalizeColumns(column.children);
    }
    columns.push(column);
  });
  return columns;
}

export function getLeafColumns<T>(columns: ColumnProps<T>[]) {
  return flatFilter(columns, c => !c.children);
}

export function getColumnKey<T>(column: ColumnProps<T>, index?: number): Key | undefined {
  return column.key || column.dataIndex || index;
}

export function findColumnByFilterValue<T>(
  record: T,
  columns: ColumnProps<T>[],
  inputValue: string,
): ColumnProps<T> | undefined {
  return columns.find(col => {
    const key = getColumnKey(col);
    if (key) {
      let value = (record as any)[key];
      if (value && typeof value !== 'object') {
        value = value.toString();
        if (value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1) {
          return true;
        }
      }
    }
    return false;
  });
}

export function filterByInputValue<T>(
  dataSource: T[],
  columns: ColumnProps<T>[],
  inputValue: string,
  cb: (record: T, column: ColumnProps<T>) => void,
) {
  dataSource.forEach(data => {
    const column = findColumnByFilterValue<T>(data, columns, inputValue);
    if (column) {
      cb(data, column);
    }
  });
}

export function removeHiddenColumns<T>(columns: ColumnProps<T>[]) {
  return columns.filter(c => {
    if (c.hidden) {
      return false;
    }
    if (c.children) {
      const children = removeHiddenColumns(c.children);
      if (children.length) {
        c.children = children;
      } else {
        return false;
      }
    }
    return true;
  });
}

export function getHeight(el: HTMLElement) {
  return el.getBoundingClientRect().height;
}

export function isNumber(obj: any): boolean {
  return typeof obj === 'number' && !isNaN(obj);
}
