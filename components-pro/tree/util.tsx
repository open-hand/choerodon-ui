import React, { Key, ReactNode } from 'react';
import { TreeNodeProps } from 'choerodon-ui/lib/tree';
import Record from '../data-set/Record';
import DataSet from '../data-set/DataSet';

export type IconType = React.ReactNode | ((props: TreeNodeProps) => React.ReactNode);

export interface DataNode {
  children?: DataNode[];
  key: string | number;
  eventKey: string | number;
  title?: React.ReactNode;
  selectable?: boolean;
  isLeaf?: boolean;
  switcherIcon?: IconType;
  checkable?: boolean;
  disabled?: boolean;
  icon?: IconType;
  disableCheckbox?: boolean;

  /** Set style of TreeNode. This is not recommend if you don't have any force requirement */
  className?: string;
  style?: React.CSSProperties;
}

export interface TreeNodeRendererProps {
  children?: TreeNodeRendererProps[];
  title?: React.ReactNode;
  isLeaf?: boolean;
  switcherIcon?: IconType;
  checkable?: boolean;
  disabled?: boolean;
  icon?: IconType;
  disableCheckbox?: boolean;
  /** Set style of TreeNode. This is not recommend if you don't have any force requirement */
  className?: string;
  style?: React.CSSProperties;
}


export type NodeRenderer = (props: {
  record?: Record | null;
  dataSet?: DataSet | null;
  text?: string;
}) => ReactNode;

export type TreeNodeRenderer = ((props: {
  record?: Record | null;
  dataSet?: DataSet | null;
}) => TreeNodeRendererProps) | (((props: {
  record?: Record | null;
  dataSet?: DataSet | null;
}) => {})) | (() => ({}))

export function getKey(record, idField) {
  return String(idField ? record.get(idField) : record.key);
}

function getTreeNode(record, children, idField, text, treeNodeProps, async, filterText): DataNode {
  const key = getKey(record, idField);
  return (
    {
      title: text,
      isLeaf: async ? undefined : (filterText ? (!children || !children.length) : !record.children || !record.children.length),
      children,
      record,
      ...record.get('__treeNodeProps'),
      ...treeNodeProps,
      selectable: record.dataSet.selection ? record.selectable : false,
      eventKey: key,
      key,
    }
  );
}

export function getTreeNodes(
  dataSet: DataSet,
  records: Record[] | undefined,
  forceRenderKeys: Key[],
  renderer: NodeRenderer,
  onTreeNode: TreeNodeRenderer,
  async?: boolean,
  titleField?: string,
  defaultExpandAll?: boolean,
  optionsFilter?: (record: Record, index: number, array: Record[]) => boolean,
  searchMatcher?: (record: Record, text?: string) => boolean,
  filterText?: string,
) {
  const { idField } = dataSet.props;
  if (records) {
    return records.reduce<DataNode[]>((array, record, index) => {
      if (record.status !== 'delete') {
        const children =
          defaultExpandAll || forceRenderKeys.indexOf(getKey(record, idField)) !== -1 || filterText
            ? getTreeNodes(dataSet, record.children, forceRenderKeys, renderer, onTreeNode, async, titleField, defaultExpandAll, optionsFilter, searchMatcher, filterText)
            : null;
        if (!searchMatcher || !filterText || (children && children.length) || searchMatcher(record, filterText)) {
          if ((!optionsFilter || optionsFilter(record, index, records))) {
            const node = getTreeNode(
              record,
              children,
              idField,
              renderer({ dataSet, record, text: record.get(titleField) }),
              onTreeNode({ dataSet, record }),
              async,
              filterText,
            );
            if (node) {
              array.push(node);
            }
          } else if (children) {
            array.push(...children);
          }
        }
      }
      return array;
    }, []);
  }
  return null;
}
