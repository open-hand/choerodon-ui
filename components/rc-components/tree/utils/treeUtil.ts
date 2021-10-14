import React, { Children, ReactNode } from 'react';
import warning from '../../../_util/warning';
import { DataEntity, DataNode, EventDataNode, FlattenNode, GetKey, Key, NodeElement } from '../interface';
import { getPosition, isTreeNode } from '../util';
import { TreeNodeProps } from '../TreeNode';

export function toArray(children: ReactNode): ReactNode[] {
  const ret: ReactNode[] = [];

  Children.forEach(children, (c) => ret.push(c));

  return ret;
}

export function getKey(key: Key | null | undefined, pos: string): Key {
  if (key !== null && key !== undefined) {
    return key;
  }
  return pos;
}

/**
 * Warning if TreeNode do not provides key
 */
export function warningWithoutKey(treeData: DataNode[] = []): void {
  const keys: Map<string, boolean> = new Map();

  function dig(list: DataNode[] | undefined, path = ''): void {
    (list || []).forEach(treeNode => {
      const { key, children } = treeNode;
      warning(
        key !== null && key !== undefined,
        `Tree node must have a certain key: [${path}${key}]`,
      );

      const recordKey = String(key);
      warning(
        !keys.has(recordKey) || key === null || key === undefined,
        `Same 'key' exist in the Tree: ${recordKey}`,
      );
      keys.set(recordKey, true);

      dig(children, `${path}${recordKey} > `);
    });
  }

  dig(treeData);
}

/**
 * Convert `children` of Tree into `treeData` structure.
 */
export function convertTreeToData(rootNodes: React.ReactNode): DataNode[] {
  function dig(node: React.ReactNode): DataNode[] {
    const treeNodes = toArray(node) as NodeElement[];
    return treeNodes
      .reduce<DataNode[]>((array, treeNode) => {
        // Filter invalidate node
        if (!isTreeNode(treeNode)) {
          warning(!treeNode, 'Tree/TreeNode can only accept TreeNode as children.');
        } else {

          const { key } = treeNode;
          const { children, ...rest } = treeNode.props;

          const dataNode: DataNode = {
            key,
            ...rest,
          } as DataNode;

          const parsedChildren = dig(children);
          if (parsedChildren.length) {
            dataNode.children = parsedChildren;
          }
          array.push(dataNode);
        }

        return array;
      }, []);
  }

  return dig(rootNodes);
}

/**
 * Flat nest tree data into flatten list. This is used for virtual list render.
 * @param treeNodeList Origin data node list
 * @param expandedKeys
 * need expanded keys, provides `true` means all expanded (used in `rc-tree-select`).
 */
export function flattenTreeData(
  treeNodeList: DataNode[] = [],
  expandedKeys: Key[] | true = [],
): FlattenNode[] {
  const expandedKeySet = new Set(expandedKeys === true ? [] : expandedKeys);
  const flattenList: FlattenNode[] = [];

  function dig(list: DataNode[], parent: FlattenNode | null = null): FlattenNode[] {
    return list.map((treeNode, index) => {
      const pos: string = getPosition(parent ? parent.pos : '0', index);
      const mergedKey = getKey(treeNode.key, pos);

      // Add FlattenDataNode into list
      const flattenNode: FlattenNode = {
        ...treeNode,
        parent,
        pos,
        children: null,
        data: treeNode,
        isStart: [...(parent ? parent.isStart : []), index === 0],
        isEnd: [...(parent ? parent.isEnd : []), index === list.length - 1],
      } as FlattenNode;

      flattenList.push(flattenNode);

      // Loop treeNode children
      if (expandedKeys === true || expandedKeySet.has(mergedKey)) {
        flattenNode.children = dig(treeNode.children || [], flattenNode);
      } else {
        flattenNode.children = [];
      }

      return flattenNode;
    });
  }

  dig(treeNodeList);

  return flattenList;
}

type ExternalGetKey = GetKey<DataNode> | string;

interface TraverseDataNodesConfig {
  childrenPropName?: string;
  externalGetKey?: ExternalGetKey;
}

export type CallbackData = {
  node: DataNode;
  index: number;
  pos: string;
  key: Key;
  parentPos: string | number;
  level: number;
};

/**
 * Traverse all the data by `treeData`.
 * Please not use it out of the `rc-tree` since we may refactor this code.
 */
export function traverseDataNodes(
  dataNodes: DataNode[],
  callback: (data: CallbackData) => void,
  // To avoid too many params, let use config instead of origin param
  config?: TraverseDataNodesConfig | ExternalGetKey,
): void {
  // Init config
  let externalGetKey: ExternalGetKey | undefined | null = null;
  let childrenPropName: string | undefined;

  const configType = typeof config;

  if (configType === 'function' || configType === 'string') {
    // Legacy getKey param
    externalGetKey = config as ExternalGetKey;
  } else if (config && configType === 'object') {
    ({ childrenPropName, externalGetKey } = config as TraverseDataNodesConfig);
  }

  // Get keys
  let syntheticGetKey: (node: DataNode, pos?: string) => Key;
  if (externalGetKey) {
    if (typeof externalGetKey === 'string') {
      syntheticGetKey = (node: DataNode): Key => node[externalGetKey as string];
    } else if (typeof externalGetKey === 'function') {
      syntheticGetKey = (node: DataNode): Key => (externalGetKey as GetKey<DataNode>)(node);
    }
  } else {
    syntheticGetKey = (node: DataNode, pos: string): Key => getKey(node.key, pos);
  }

  // Process
  function processNode(
    node: DataNode | null,
    index?: number,
    parent?: { node: DataNode | null; pos: string; level: number },
  ): void {
    const children = node ? node[childrenPropName || 'children'] : dataNodes;
    const pos = node && parent ? getPosition(parent.pos, index) : '0';

    // Process node if is not root
    if (node && parent) {
      const key: Key = syntheticGetKey(node, pos);
      const data: CallbackData = {
        node,
        index,
        pos,
        key,
        parentPos: parent.node ? parent.pos : null,
        level: parent.level + 1,
      } as CallbackData;

      callback(data);
    }

    // Process children node
    if (children) {
      children.forEach((subNode, subIndex) => {
        processNode(subNode, subIndex, {
          node,
          pos,
          level: parent ? parent.level + 1 : -1,
        });
      });
    }
  }

  processNode(null);
}

interface Wrapper {
  posEntities: Record<string, DataEntity>;
  keyEntities: Record<Key, DataEntity>;
}

/**
 * Convert `treeData` into entity records.
 */
export function convertDataToEntities(
  dataNodes: DataNode[],
  {
    initWrapper,
    processEntity,
    onProcessFinished,
    externalGetKey,
    childrenPropName,
  }: {
    initWrapper?: (wrapper: Wrapper) => Wrapper;
    processEntity?: (entity: DataEntity, wrapper: Wrapper) => void;
    onProcessFinished?: (wrapper: Wrapper) => void;
    externalGetKey?: ExternalGetKey;
    childrenPropName?: string;
  } = {},
  /** @deprecated Use `config.externalGetKey` instead */
  legacyExternalGetKey?: ExternalGetKey,
): Wrapper {
  // Init config
  const mergedExternalGetKey = externalGetKey || legacyExternalGetKey;

  const posEntities = {};
  const keyEntities = {};
  let wrapper = {
    posEntities,
    keyEntities,
  };

  if (initWrapper) {
    wrapper = initWrapper(wrapper) || wrapper;
  }

  traverseDataNodes(
    dataNodes,
    item => {
      const { node, index, pos, key, parentPos, level } = item;
      const entity: DataEntity = { node, index, key, pos, level };

      const mergedKey = getKey(key, pos);

      posEntities[pos] = entity;
      keyEntities[mergedKey] = entity;

      // Fill children
      entity.parent = posEntities[parentPos];
      if (entity.parent) {
        entity.parent.children = entity.parent.children || [];
        entity.parent.children.push(entity);
      }

      if (processEntity) {
        processEntity(entity, wrapper);
      }
    },
    { externalGetKey: mergedExternalGetKey, childrenPropName },
  );

  if (onProcessFinished) {
    onProcessFinished(wrapper);
  }

  return wrapper;
}

export interface TreeNodeRequiredProps {
  expandedKeys: Key[];
  selectedKeys: Key[];
  loadedKeys: Key[];
  loadingKeys: Key[];
  checkedKeys: Key[];
  halfCheckedKeys: Key[];
  dragOverNodeKey: Key;
  dropPosition: number;
  keyEntities: Record<Key, DataEntity>;
}

/**
 * Get TreeNode props with Tree props.
 */
export function getTreeNodeProps(
  key: Key,
  {
    expandedKeys,
    selectedKeys,
    loadedKeys,
    loadingKeys,
    checkedKeys,
    halfCheckedKeys,
    dragOverNodeKey,
    dropPosition,
    keyEntities,
  }: TreeNodeRequiredProps,
): TreeNodeProps {
  const entity = keyEntities[key];

  const treeNodeProps = {
    eventKey: key,
    expanded: expandedKeys.indexOf(key) !== -1,
    selected: selectedKeys.indexOf(key) !== -1,
    loaded: loadedKeys.indexOf(key) !== -1,
    loading: loadingKeys.indexOf(key) !== -1,
    checked: checkedKeys.indexOf(key) !== -1,
    halfChecked: halfCheckedKeys.indexOf(key) !== -1,
    pos: String(entity ? entity.pos : ''),

    // [Legacy] Drag props
    // Since the interaction of drag is changed, the semantic of the props are
    // not accuracy, I think it should be finally removed
    dragOver: dragOverNodeKey === key && dropPosition === 0,
    dragOverGapTop: dragOverNodeKey === key && dropPosition === -1,
    dragOverGapBottom: dragOverNodeKey === key && dropPosition === 1,
  };

  return treeNodeProps;
}

export function convertNodePropsToEventData(props: TreeNodeProps): EventDataNode {
  const {
    data,
    expanded,
    selected,
    checked,
    loaded,
    loading,
    halfChecked,
    dragOver,
    dragOverGapTop,
    dragOverGapBottom,
    pos,
    active,
  } = props;

  const eventData: EventDataNode = {
    ...data,
    expanded,
    selected,
    checked,
    loaded,
    loading,
    halfChecked,
    dragOver,
    dragOverGapTop,
    dragOverGapBottom,
    pos,
    active,
  } as EventDataNode;

  if (!('props' in eventData)) {
    Object.defineProperty(eventData, 'props', {
      get() {
        warning(
          false,
          'Second param return from event is node data instead of TreeNode instance. Please read value directly instead of reading from `props`.',
        );
        return props;
      },
    });
  }

  return eventData;
}
