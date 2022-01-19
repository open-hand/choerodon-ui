import { ReactNode } from 'react';
import { isArrayLike, toJS } from 'mobx';
import isNil from 'lodash/isNil';
import isPlainObject from 'lodash/isPlainObject';
import isObject from 'lodash/isObject';
import DataSet from '../data-set/DataSet';
import { DataSetSelection, FieldType } from '../data-set/enum';
import Record from '../data-set/Record';
import Field from '../data-set/Field';
import ObjectChainValue from '../_util/ObjectChainValue';
import isSameLike from '../_util/isSameLike';

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
  });
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

export function getSimpleValue(value: any, valueField: string): any {
  if (isPlainObject(value)) {
    return ObjectChainValue.get(value, valueField);
  }
  return value;
}

/**
 * 获取record 或者 obj对应的值
 * @param value
 * @param key
 */
export function getRecordOrObjValue(value: any, key: string): any {
  if (value instanceof Record) {
    return value.get(key);
  }
  if (isObject(value)) {
    return value[key];
  }
  return value;
}

export function findByValue(value: any, valueField: string, options?: DataSet, changeOnSelect?: boolean): Record | undefined {
  const findTreeItem = (options, valueItem, index) => {
    let sameItemTreeNode;
    if (valueItem.length > 0) {
      sameItemTreeNode = options.find(ele => {
        return isSameLike(getRecordOrObjValue(ele, valueField), isPlainObject(valueItem[index]) ? ObjectChainValue.get(valueItem[index], valueField) : valueItem[index]);
      });
      if (sameItemTreeNode) {
        if (sameItemTreeNode.children && !(changeOnSelect && index === (valueItem.length - 1))) {
          return findTreeItem(sameItemTreeNode.children, valueItem, ++index);
        }
        return sameItemTreeNode;
      }
    }
  };
  value = getSimpleValue(value, valueField);
  if (options && value) {
    return findTreeItem(toJS(options.treeData), toJS(value), 0);
  }
}

/**
 * 返回tree 的值的列表方法
 * @param record
 * @param textField
 * @param allArray
 */
export function treeTextToArray(record: Record, textField: string, allArray?: string[]): string[] {
  if (!allArray) {
    allArray = [];
  }
  if (record) {
    allArray = [getRecordOrObjValue(record, textField), ...allArray];
  }
  if (record.parent) {
    return treeTextToArray(record.parent, textField, allArray);
  }
  return allArray;
}

function processObjectValue(value: any, textField: string, valueField: string, options?: DataSet, changeOnSelect?: boolean): any {
  if (!isNil(value)) {
    const found = findByValue(value, valueField, options, changeOnSelect);
    if (found && isArrayLike(value)) {
      return treeTextToArray(found, textField);
    }
    if (isPlainObject(value)) {
      return ObjectChainValue.get(value, textField);
    }
  }
}

/**
 * Cascader 值渲染
 * @param value 
 * @param defaultProcessValue 
 * @param textField 
 * @param primitive 
 * @param valueField 
 * @param field 
 * @param record 
 * @param options 
 * @param changeOnSelect 
 * @returns 
 */
export function processArrayLookupValue(
  value: any,
  defaultProcessValue: (value: any) => ReactNode,
  textField: string,
  primitive: boolean,
  valueField: string,
  field?: Field,
  record?: Record,
  options?: DataSet,
  changeOnSelect?: boolean,
): ReactNode {
  const processvalue = processObjectValue(value, textField, valueField, options, changeOnSelect);
  if (isArrayLike(processvalue)) {
    return processvalue.join('/');
  }
  if (primitive && field) {
    return defaultProcessValue(field.getText(value, undefined, record));
  }
}
