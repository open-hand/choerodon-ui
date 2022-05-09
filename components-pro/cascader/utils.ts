import DataSet from '../data-set/DataSet';
import { DataSetSelection, FieldType } from '../data-set/enum';
import Record from '../data-set/Record';

export type Tree = object[] | object | undefined;
export type List = object[] | object | undefined;
export type Stack = {
  key: string;
  value: object;
}

/**
 * transform tree to stack
 */
function _transformStack(tree: Tree, parentValue: unknown, parentField: string): Partial<Stack>[] {
  const stack: Partial<Stack>[] = [];

  if (Array.isArray(tree)) { // array tree
    tree.forEach((node) => {
      node[parentField] = parentValue;
      stack.push({
        value: node,
      });
    });
  } else if (tree instanceof Object) { // object tree
    Object.keys(tree).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(tree, key)) {
        const node = tree[key];
        node[parentField] = parentValue;
        stack.push({
          key,
          value: node,
        });
      }
    })
  }
  return stack;
}

function treeToList(tree: Tree, valueField = 'value', parentField = "parentValue", key = 'children'): object[] | undefined {
  let list: List = [];

  if (Array.isArray(tree)) { // array tree
    list = [];
  } else if (tree instanceof Object) { // object tree
    list = {};
  } else {
    // @ts-ignore
    return list;
  }
  let parentValue: unknown;
  let stack = _transformStack(tree, parentValue, parentField)
  while (stack.length) {
    const curStack: Partial<Stack> = stack.shift()!;

    const { key: nodeKey, value: node } = curStack;
    if (!node) continue; // invalid node

    const item = (nodeKey ? list[nodeKey] : {}) || {};
    Object.keys(node).forEach((prop) => {
      if (Object.prototype.hasOwnProperty.call(node, prop) && prop !== key) {
        item[prop] = node[prop];
      }
    })

    if (nodeKey) { // object
      list[nodeKey] = item;
    } else { // array
      (list as object[]).push(item);
    }

    const subTree = node[key] || [];
    parentValue = node[valueField]
    stack = _transformStack(subTree, parentValue, parentField).concat(stack);
  }
  return list as object[];
}

export default function normalizeOptions({
  data,
  textField,
  valueField,
  disabledField,
  multiple,
  parentField,
  idField,
  getConfig,
}): DataSet {
  const fields = [
    {
      name: textField,
      type: FieldType.reactNode,
    },
    {
      name: valueField,
    },
    {
      name: disabledField,
      type: FieldType.boolean,
    },
  ];
  const treeNormalData: object[] | undefined = treeToList(data, valueField, parentField);
  return new DataSet({
    data: treeNormalData,
    fields,
    paging: false,
    idField,
    selection: multiple ? DataSetSelection.multiple : DataSetSelection.single,
    autoLocateFirst: false,
    parentField,
  }, { getConfig });
}

export function expandTreeRecords(records: Record[], isAllleaf = true): Record[] {
  const mapRecords = new Map();
  const expandRecords: Record[] = [];
  const TreeToArray = (PRecords: Record[]): void => {
    PRecords.forEach((record: Record) => {
      if (record.children && record.children.length > 0) {
        TreeToArray(record.children)
      } else if (!mapRecords.has(record.id)) {
        mapRecords.set(record.id, record);
      }
    })
  }
  const parentRecords = records.filter(item => !!item.children)
  // 先优先获取根节点再对子节点进行拆分
  records.filter(item => {
    return !item.children;
  }).forEach((record) => {
    if (!mapRecords.has(record.id)) {
      mapRecords.set(record.id, record);
    }
  })
  TreeToArray(parentRecords);
  // Map去重

  mapRecords.forEach(record => {
    expandRecords.push(record);
  })
  // 如果不全为子集的设置加上父亲节点
  if (!isAllleaf) {
    return parentRecords.concat(expandRecords);
  }
  return expandRecords
}
