import React, { ReactNode } from 'react';
import { TreeNodeProps,EventDataNode } from 'choerodon-ui/lib/tree';
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
}) => TreeNodeRendererProps ) | (((props:{record?: Record | null;
  dataSet?: DataSet | null;}) => {})) | (() => ({}))

export function getKey(record, idField) {
  return String(idField ? record.get(idField) : record.id);
}

function getTreeNode(record, children, idField, text,treeNodeRendererProps,loadData):DataNode {
  const key = getKey(record, idField);
  return (
    {
      title:text,
      isLeaf:!loadData && !record.children,
      children,
      ...treeNodeRendererProps,
      selectable:!!(record.dataSet.selection?record.selectable:false),
      eventKey:key,
      key,
    }
  );
}

export function getTreeNodes(
  dataSet: DataSet,
  records: Record[] = [],
  forceRenderKeys: string[],
  renderer: NodeRenderer,
  treeNodeRenderer:TreeNodeRenderer,
  loadData?:(treeNode: EventDataNode) => Promise<void>,
  titleField?: string,
) {
  const { idField } = dataSet.props;
  return records.map(record => {
    if(record.status !== 'delete'){
        const children =
        forceRenderKeys.indexOf(getKey(record, idField)) !== -1
          ? getTreeNodes(dataSet, record.children, forceRenderKeys, renderer,treeNodeRenderer,loadData)
          : null;
      return getTreeNode(
        record,
        children,
        idField,
        renderer({ dataSet, record, text: record.get(titleField) }),
        treeNodeRenderer({ dataSet, record}),
        loadData,
      );
    }
    return null
  });
}
