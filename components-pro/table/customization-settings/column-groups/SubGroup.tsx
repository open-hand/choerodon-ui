import React, { FunctionComponent, ReactNode, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { DragDropContext, DraggableProvided, DropResult, ResponderProvided } from 'react-beautiful-dnd';
import SubGroups from './SubGroups';
import TreeNode from '../tree/TreeNode';
import TableContext from '../../TableContext';
import Record from '../../../data-set/Record';

export interface SubGroupProps {
  record: Record;
  childrenRecords: Record[];
  records: Record[];
  index: number;
  onDragEnd: (result: DropResult, provided: ResponderProvided) => void;
  treeNodeRenderer: (record: Record, provided: DraggableProvided) => ReactNode;
  treeNodeSuffix: (record: Record, index: number, records: Record[]) => ReactNode;
}

const SubGroup: FunctionComponent<SubGroupProps> = observer((props) => {
  const { treeNodeRenderer, treeNodeSuffix, childrenRecords, onDragEnd, ...rest } = props;
  const { tableStore } = useContext(TableContext);
  const treeNode = (
    <TreeNode
      {...rest}
      isLeaf={false}
      renderer={treeNodeRenderer}
      suffix={treeNodeSuffix}
    >
      <SubGroups
        records={childrenRecords}
        onDragEnd={onDragEnd}
        treeNodeRenderer={treeNodeRenderer}
        treeNodeSuffix={treeNodeSuffix}
      />
    </TreeNode>
  );
  return tableStore.columnDraggable ? (
    <DragDropContext onDragEnd={onDragEnd}>
      {treeNode}
    </DragDropContext>
  ) : treeNode;
});

SubGroup.displayName = 'SubGroup';

export default SubGroup;
