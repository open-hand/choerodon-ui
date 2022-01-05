import React, { useCallback, useContext } from 'react';
import { DraggableProvided, DraggableRubric, DraggableStateSnapshot } from 'react-beautiful-dnd';
import isFunction from 'lodash/isFunction';
import ColumnGroups from './ColumnGroups';
import TableContext from './TableContext';
import { DragColumnAlign } from './enum';
import { DragTableRowProps } from './Table';
import TableRow from './TableRow';
import { isDraggingStyle, isStickySupport } from './utils';

export function useRenderClone(columnGroups?: ColumnGroups) {
  const { tableStore, dataSet, rowDragRender, prefixCls } = useContext(TableContext);
  return useCallback((
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot,
    rubric: DraggableRubric,
  ) => {
    if (!isStickySupport() && snapshot.isDragging && tableStore.overflowX && tableStore.dragColumnAlign === DragColumnAlign.right) {
      const { style } = provided.draggableProps;
      if (isDraggingStyle(style)) {
        const { left, width } = style;
        style.left = left - Math.max(tableStore.columnGroups.leafColumnsWidth - tableStore.columnGroups.rightLeafColumnsWidth, width);
      }
    }
    const record = dataSet.find(record => String(record.key) === rubric.draggableId);
    if (record) {
      const leafColumnsBody = columnGroups || tableStore.columnGroups;
      const renderClone = rowDragRender && rowDragRender.renderClone;
      const { id } = record;
      if (renderClone && isFunction(renderClone)) {
        return renderClone({
          provided,
          snapshot,
          rubric,
          key: id,
          hidden: false,
          lock: false,
          prefixCls,
          columns: leafColumnsBody.leafs.map(({ column }) => column),
          columnGroups: leafColumnsBody,
          record,
          index: 0,
        } as DragTableRowProps);
      }
      return (
        <TableRow
          provided={provided}
          snapshot={snapshot}
          key={id}
          hidden={false}
          lock={false}
          columnGroups={leafColumnsBody}
          record={record}
          index={id}
          className="dragging-row"
        />
      );
    }
    return <span />;
  }, [tableStore, dataSet, rowDragRender, columnGroups]);
}
