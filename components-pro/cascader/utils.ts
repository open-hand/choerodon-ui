import DataSet from '../data-set/DataSet';
import { DataSetSelection, FieldType } from '../data-set/enum';
import Record from '../data-set/Record';

export type Tree = object[] | Object | undefined;
export type List = object[] | Object | undefined;
export type Stack = {
    key: string;
    value: number;
}

/**
 * transform tree to stack
 *
 * @param {Array|Object} tree Tree.
 */
function _transformStack(tree, parentValue, parentField) {
    const stack: Partial<Stack>[] = [];

    if (Array.isArray(tree)) { // array tree
        for (let index = 0; index < tree.length; index++) {
            const node = tree[index];
            node[parentField] = parentValue;
            stack.push({
                value: node,
            });
        }
    } else if (Object.prototype.toString.call(tree) === '[object Object]') { // object tree
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

function treeToList(tree, valueField = 'value', parentField = "parentValue", key = 'children'): object[] | undefined {
    let list: List = [];

    if (Array.isArray(tree)) { // array tree
        list = [];
    } else if (Object.prototype.toString.call(tree) === '[object Object]') { // object tree
        list = {};
    } else { // invalid tree
        // @ts-ignore
        return list;
    }
    let parentValue: undefined | any;
    let stack = _transformStack(tree, parentValue, parentField)
    while (stack.length) {
        const curStack: Partial<Stack> | any = stack.shift();

        const { key: nodeKey, value: node } = curStack;
        if (!node) continue; // invalid node

        const item = (nodeKey ? list[nodeKey] : {}) || {};
        Object.keys(node).forEach((prop) => {
            if (Object.prototype.hasOwnProperty.call(node, prop)
                && prop !== key) {
                item[prop] = node[prop];
            }
        })

        if (nodeKey) { // object
            list[nodeKey] = item;
        } else { // array
            // @ts-ignore
            list.push(item);
        }

        const subTree = node[key] || [];
        parentValue = node[valueField]
        stack = _transformStack(subTree, parentValue, parentField).concat(stack);
    }
    // @ts-ignore
    return list;
}


export default function normalizeOptions({
    data,
    textField,
    valueField,
    disabledField,
    multiple,
    parentField,
    idField,
}) {
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


export function expandTreeRecords(records, isAllleaf = true) {
    const mapRecords = new Map();
    const expandRecords: Record[] = []
    const TreeToArray = (PRecords: Record[]) => {
        PRecords.forEach((record: Record) => {
            if (record.children && record.children.length > 0) {
                TreeToArray(record.children)
            } else if (!mapRecords.has(records.id)) {
                mapRecords.set(record.id, record);
            }
        })
    }
    const parentRecords = records.filter(item => !!item.children)
    // 先优先获取根节点再对子节点进行拆分
    records.filter(item => {
        return !item.children
    }).forEach((record) => {
        if (!mapRecords.has(records.id)) {
            mapRecords.set(record.id, record)
        }
    })
    TreeToArray(parentRecords)
    // Map去重

    mapRecords.forEach(record => {
        expandRecords.push(record);
    })
    // 如果不全为子集的设置加上父亲节点
    if (!isAllleaf) {
        return parentRecords.concat(expandRecords)
    }
    return expandRecords
}

