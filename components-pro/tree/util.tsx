import React, { ReactNode } from 'react';
import { TreeNodeProps } from 'choerodon-ui/lib/tree';
import Record from '../data-set/Record';
import DataSet from '../data-set/DataSet';

export type IconType = React.ReactNode | ((props: TreeNodeProps) => React.ReactNode);
export interface DataNode {
  children?: DataNode[];
  isLeaf?: boolean;
  key: string | number;
  title?: React.ReactNode;
  selectable?: boolean;
  eventKey: string | number;

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

export function getKey(record, idField) {
  return String(idField ? record.get(idField) : record.id);
}

function getTreeNode(record, children, idField, text):DataNode {
  const key = getKey(record, idField);
  return (
    {
      title:text,
      key,
      isLeaf:!record.children,
      eventKey:key,
      selectable:!!(record.dataSet.selection?record.selectable:false),
      children,
    }
  );
}

export function getTreeNodes(
  dataSet: DataSet,
  records: Record[] = [],
  forceRenderKeys: string[],
  renderer: NodeRenderer,
  titleField?: string,
) {
  const { idField } = dataSet.props;
  return records.map(record => {
    if(record.status !== 'delete'){
        const children =
        forceRenderKeys.indexOf(getKey(record, idField)) !== -1
          ? getTreeNodes(dataSet, record.children, forceRenderKeys, renderer)
          : null;
      return getTreeNode(
        record,
        children,
        idField,
        renderer({ dataSet, record, text: record.get(titleField) }),
      );
    }
    return null
  });
}
