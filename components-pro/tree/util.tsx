import React, { ReactNode } from 'react';
import { TreeNode } from 'choerodon-ui/lib/tree';
import Record from '../data-set/Record';
import DataSet from '../data-set/DataSet';

export type NodeRenderer = (props: {
  record?: Record | null;
  dataSet?: DataSet | null;
  text?: string;
}) => ReactNode;

export function getKey(record, idField) {
  return String(idField ? record.get(idField) : record.id);
}

function getTreeNode(record, children, idField, text) {
  const key = getKey(record, idField);
  return (
    <TreeNode
      title={text}
      key={key}
      eventKey={key}
      // @ts-ignore
      hasChildren={!!record.children}
      selectable={record.selectable}
    >
      {children}
    </TreeNode>
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
  });
}
