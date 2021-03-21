import React, { FunctionComponent, ReactElement, useCallback, useContext, useMemo } from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import { DragDropContext, DraggableProvided, DropResult } from 'react-beautiful-dnd';
import sortBy from 'lodash/sortBy';
import Group, { GroupProps } from './Group';
import { ColumnLock } from '../../enum';
import { $l } from '../../../locale-context';
import ItemTitle from './ItemTitle';
import TableContext from '../../TableContext';
import DataSet from '../../../data-set/DataSet';
import Record from '../../../data-set/Record';
import ItemSuffix from './ItemSuffix';

export interface ColumnGroupsProps {
  dataSet: DataSet;
}

const ColumnGroups: FunctionComponent<ColumnGroupsProps> = observer<ColumnGroupsProps>((props) => {
  const { dataSet } = props;
  const { groupedTreeRecords } = dataSet;
  const { tableStore: { columnDraggable, prefixCls } } = useContext(TableContext);
  const groups = useMemo(() => {
    const array: { value: ColumnLock | false, records: Record[] }[] = [
      { value: ColumnLock.left, records: [] },
      { value: ColumnLock.right, records: [] },
      { value: false, records: [] },
    ];
    return array.map((group) => {
      const { value } = group;
      const found = groupedTreeRecords.find((item) => item.value === value);
      if (found) {
        group.records = observable.array<Record>(sortBy(found.records, [r => r.get('sort')]));
      } else {
        group.records = observable.array<Record>();
      }
      return group;
    });
  }, [groupedTreeRecords]);
  const handleDragTree = useCallback(action((srcIndex: number, destIndex: number, srcLock: string, destLock: string) => {
    const srcGroup = groups.find((group) => String(group.value) === srcLock);
    if (srcGroup) {
      const { records } = srcGroup;
      const [removed] = records.splice(srcIndex, 1);
      if (srcLock === destLock) {
        records.splice(destIndex, 0, removed);
        records.forEach((r, index) => {
          r.set('sort', index);
        });
      } else {
        removed.set('lock', destLock === 'false' ? false : destLock);
        const destGroup = groups.find((group) => String(group.value) === destLock);
        if (destGroup) {
          const { records: destRecords } = destGroup;
          if (destRecords.length) {
            destRecords.splice(destIndex, 0, removed);
          } else {
            destRecords.push(removed);
          }
          records.forEach((r, index) => {
            r.set('sort', index);
          });
          destRecords.forEach((r, index) => {
            r.set('sort', index);
          });
        }
      }
    }
  }), [groups]);
  const handleDragTreeNode = useCallback(action((srcIndex: number, destIndex: number, parentId: string) => {
    const parent = dataSet.find(r => String(r.key) === parentId);
    if (parent) {
      const { children } = parent;
      if (children) {
        const records = sortBy(children, [r => r.get('sort')]);
        const [removed] = records.splice(srcIndex, 1);
        records.splice(destIndex, 0, removed);
        records.forEach((r, index) => {
          r.set('sort', index);
        });
      }
    }
  }), [dataSet]);
  const handleDragEnd = useCallback(({ destination, source: { droppableId: srcDroppableId, index: srcIndex } }: DropResult) => {
    if (destination) {
      const { droppableId: destDroppableId, index: destIndex } = destination;
      const dest = destDroppableId.split('__--__');
      const src = srcDroppableId.split('__--__');
      if (srcIndex !== destIndex || src[1] !== dest[1]) {
        if (dest[0] === 'tree' && src[0] === 'tree') {
          handleDragTree(srcIndex, destIndex, src[1], dest[1]);
        } else if (dest[0] === 'treenode' && src[0] === 'treenode') {
          handleDragTreeNode(srcIndex, destIndex, src[1]);
        }
      }
    }
  }, [handleDragTree, handleDragTreeNode]);
  const treeNodeRenderer = useCallback((record: Record, provided?: DraggableProvided) => (
    <ItemTitle
      record={record}
      provided={provided}
    />
  ), []);
  const treeNodeSuffix = useCallback((record: Record, index: number, records: Record[]) => (
    <ItemSuffix record={record} index={index} records={records} groups={groups} />
  ), [groups]);

  function getGroupHeader(lock: ColumnLock | boolean) {
    switch (lock) {
      case ColumnLock.left:
        return $l('Table', 'left_lock');
      case ColumnLock.right:
        return $l('Table', 'right_lock');
      default:
        return $l('Table', 'unlocked');
    }
  }

  const groupNodes = groups.map<ReactElement<GroupProps>>(({ value, records }) => (
    <Group
      key={String(value)}
      value={value}
      header={getGroupHeader(value)}
      records={records}
      onDragEnd={handleDragEnd}
      treeNodeRenderer={treeNodeRenderer}
      treeNodeSuffix={treeNodeSuffix}
    />
  ));
  return (
    <div className={`${prefixCls}-customization-panel-content`}>
      {
        columnDraggable ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            {groupNodes}
          </DragDropContext>
        ) : groupNodes
      }
    </div>
  );
});

ColumnGroups.displayName = 'ColumnGroups';

export default ColumnGroups;
