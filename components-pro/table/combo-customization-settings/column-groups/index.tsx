import React, { FunctionComponent, useCallback, useContext } from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import { DragDropContext, DraggableProvided, DropResult } from 'react-beautiful-dnd';
import sortBy from 'lodash/sortBy';
import Group from './Group';
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
  const { treeRecords } = dataSet;
  const { tableStore: { columnDraggable }, prefixCls } = useContext(TableContext);
  const handleDragTree = useCallback(action((srcIndex: number, destIndex: number) => {
    const destRecord = treeRecords[destIndex];
    const [removed] = treeRecords.splice(srcIndex, 1);
    const destRecordLock = destRecord.get('lock');
    if (destRecordLock) {
      removed.set('lock', true);
    } else {
      removed.set('lock', false);
    }
    treeRecords.splice(destIndex + treeRecords.reduce((sum, r) => sum + (r.get('draggable') === false ? 1 : 0), 0), 0, removed);
    treeRecords.forEach((r, index) => {
      r.init('sort', undefined);
      r.set('sort', index);
    });
  }), [treeRecords]);
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
          handleDragTree(srcIndex, destIndex);
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
  const treeNodeSuffix = useCallback((record: Record) => (
    <ItemSuffix records={treeRecords} record={record} />
  ), [treeRecords]);

  return (
    <div className={`${prefixCls}-combo-customization-panel-content`}>
      {
        columnDraggable ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Group
              key={String(false)}
              value='false'
              records={treeRecords}
              onDragEnd={handleDragEnd}
              treeNodeRenderer={treeNodeRenderer}
              treeNodeSuffix={treeNodeSuffix}
            />
          </DragDropContext>
        ) : (
          <Group
            key={String(false)}
            value='false'
            records={treeRecords}
            onDragEnd={handleDragEnd}
            treeNodeRenderer={treeNodeRenderer}
            treeNodeSuffix={treeNodeSuffix}
          />
        )
      }
    </div>
  );
});

ColumnGroups.displayName = 'ColumnGroups';

export default ColumnGroups;
