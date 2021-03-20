import React, { cloneElement, FunctionComponent, ReactElement, ReactNode, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import sortBy from 'lodash/sortBy';
import { Draggable, DraggableProps, DraggableProvided, DraggableStateSnapshot, DropResult, ResponderProvided } from 'react-beautiful-dnd';
import TreeNode, { TreeNodeProps } from '../tree/TreeNode';
import SubGroup, { SubGroupProps } from './SubGroup';
import TableContext from '../../TableContext';
import Record from '../../../data-set/Record';

export interface SubGroupsProps {
  records: Record[];
  onDragEnd: (result: DropResult, provided: ResponderProvided) => void;
  treeNodeRenderer: (record: Record, provided: DraggableProvided) => ReactNode;
  treeNodeSuffix: (record: Record, index: number, records: Record[]) => ReactNode;
}

const SubGroups: FunctionComponent<SubGroupsProps> = observer<SubGroupsProps>((props) => {
  const { treeNodeRenderer, treeNodeSuffix, records, onDragEnd, ...rest } = props;
  const { tableStore: { columnDraggable } } = useContext(TableContext);
  return (
    <>
      {
        sortBy(records, [r => r.get('sort')]).map<ReactElement<SubGroupProps | TreeNodeProps | DraggableProps>>((record, index, list) => {
          const children = (
            record.children ? (
              <SubGroup
                key={record.key}
                record={record}
                childrenRecords={record.children}
                onDragEnd={onDragEnd}
                treeNodeRenderer={treeNodeRenderer}
                treeNodeSuffix={treeNodeSuffix}
                index={index}
                records={list}
                {...rest}
              />
            ) : (
              <TreeNode
                key={record.key}
                record={record}
                isLeaf
                renderer={treeNodeRenderer}
                suffix={treeNodeSuffix}
                index={index}
                records={list}
                {...rest}
              />
            )
          );
          return columnDraggable ? (
            <Draggable key={record.key} draggableId={String(record.key)} index={index}>
              {
                (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                  cloneElement<any>(children, { provided, snapshot })
                )
              }
            </Draggable>
          ) : children;
        })}
    </>
  );
});

SubGroups.displayName = 'SubGroups';

export default SubGroups;
