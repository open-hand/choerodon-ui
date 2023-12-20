import React, { cloneElement, FunctionComponent, ReactElement, ReactNode, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import sortBy from 'lodash/sortBy';
import { Draggable, DraggableProps, DraggableProvided, DraggableStateSnapshot, DropResult, ResponderProvided } from 'react-beautiful-dnd';
import TreeNode, { TreeNodeProps } from '../tree/TreeNode';
import SubGroup, { SubGroupProps } from './SubGroup';
import TableContext from '../../TableContext';
import Record from '../../../data-set/Record';
import Icon from '../../../icon';
import { $l } from '../../../locale-context';

export interface SubGroupsProps {
  records: Record[];
  onDragEnd: (result: DropResult, provided: ResponderProvided) => void;
  treeNodeRenderer: (record: Record, provided: DraggableProvided) => ReactNode;
  treeNodeSuffix: (record: Record, index: number, records: Record[]) => ReactNode;
}

const SubGroups: FunctionComponent<SubGroupsProps> = function SubGroups(props) {
  const { treeNodeRenderer, treeNodeSuffix, records, onDragEnd, ...rest } = props;
  const { tableStore: { columnDraggable, prefixCls } } = useContext(TableContext);
  const columnPlaceholder = React.useMemo(() => {
    return (
      <div className={`${prefixCls}-customization-tree-group-placeholder`}>
        <span className={`${prefixCls}-customization-tree-group-placeholder-description`}>{$l('Table', 'drag_lock_tip')}</span>
        <div className={`${prefixCls}-customization-tree-group-placeholder-example`}>
          <Icon type="open_with" />
          <Icon type="navigation" />
        </div>
        <div className={`${prefixCls}-customization-tree-group-placeholder-bg-image`} />
      </div>
    );
  }, []);
  return (
    <>
      {
        records.length === 0 && columnDraggable
          ? columnPlaceholder
          : sortBy(records, [r => r.get('sort')]).map<ReactElement<SubGroupProps | TreeNodeProps | DraggableProps>>((record, index, list) => {
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
            return columnDraggable && record.get('draggable') !== false && (!record.parent || list.length > 1) ? (
              <Draggable key={record.key} draggableId={String(record.key)} index={index}>
                {
                  (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                    cloneElement<any>(children, { provided, snapshot })
                  )
                }
              </Draggable>
            ) : children;
          })
      }
    </>
  );
};

SubGroups.displayName = 'SubGroups';

export default observer<SubGroupsProps>(SubGroups);
