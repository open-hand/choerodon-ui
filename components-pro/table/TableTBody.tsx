import React, { CSSProperties, FunctionComponent, ReactNode, useCallback, useContext } from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Draggable, DraggableProvided, DraggableRubric, DraggableStateSnapshot, Droppable, DroppableProvided } from 'react-beautiful-dnd';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import ReactResizeObserver from 'choerodon-ui/lib/_util/resizeObserver';
import isFunction from 'lodash/isFunction';
import { ColumnProps } from './Column';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import TableRow from './TableRow';
import Record from '../data-set/Record';
import { ColumnLock, DragColumnAlign } from './enum';
import ExpandedRow from './ExpandedRow';
import { DataSetStatus } from '../data-set/enum';
import { DragTableRowProps, instance } from './Table';
import { isDraggingStyle, isStickySupport } from './utils';
import useComputed from '../use-computed';

export interface TableTBodyProps extends ElementProps {
  lock?: ColumnLock | boolean;
}

const TableTBody: FunctionComponent<TableTBodyProps> = observer(function TableTBody(props) {
  const { lock } = props;
  const { prefixCls, tableStore, dataSet, rowDragRender, isTree } = useContext(TableContext);

  const leafColumnsBody: ColumnProps[] = useComputed(() => tableStore.leafColumns.filter(({ hidden }) => !hidden), [tableStore]);
  const leafColumns: ColumnProps[] = useComputed(() => {
    if (lock === ColumnLock.right) {
      return tableStore.rightLeafColumns.filter(({ hidden }) => !hidden);
    }
    if (lock) {
      return tableStore.leftLeafColumns.filter(({ hidden }) => !hidden);
    }
    return [];
  }, [tableStore, lock]);
  const columns = lock ? leafColumns : leafColumnsBody;

  const handleResize = useCallback(action<(width: number, height: number) => void>((_width, height) => {
    if (!tableStore.hidden) {
      tableStore.bodyHeight = height;
    }
  }), [tableStore]);

  const renderExpandedRows = (
    record: Record,
    isExpanded?: boolean,
  ): ReactNode => {
    // eslint-disable-next-line
    return getRows(record.children || [], isExpanded);
  };

  const getRow = (
    record: Record,
    index: number,
    expanded?: boolean,
  ): ReactNode => {
    const { key } = record;
    const children = isTree && (
      <ExpandedRow record={record}>
        {renderExpandedRows}
      </ExpandedRow>
    );
    if (tableStore.rowDraggable) {
      const { dragColumnAlign } = tableStore;
      if (!dragColumnAlign || (dragColumnAlign === DragColumnAlign.right && lock !== ColumnLock.left) || (dragColumnAlign === DragColumnAlign.left && lock !== ColumnLock.right)) {
        return (
          <Draggable
            draggableId={String(key)}
            index={index}
            key={record.key}
          >
            {(
              provided: DraggableProvided,
              snapshot: DraggableStateSnapshot,
            ) => (
              <TableRow
                provided={provided}
                snapshot={snapshot}
                key={record.key}
                hidden={!expanded}
                lock={lock}
                columns={columns}
                record={record}
                index={index}
                {...(rowDragRender && rowDragRender.draggableProps)}
              >
                {children}
              </TableRow>
            )}
          </Draggable>
        );
      }
    }
    return (
      <TableRow
        key={key}
        hidden={!expanded}
        lock={lock}
        columns={columns}
        record={record}
        index={index}
      >
        {children}
      </TableRow>
    );
  };

  const getRows = (
    records: Record[],
    expanded?: boolean,
    virtual?: boolean,
  ): ReactNode => {
    return records.map((record, index) => getRow(record, virtual ? record.index : index, expanded));
  };

  const getEmptyRow = (): ReactNode | undefined => {
    const { emptyText, width } = tableStore;
    const styles: CSSProperties = width ? {
      position: isStickySupport() ? 'sticky' : 'absolute',
      left: pxToRem(width / 2),
    } : {
      transform: 'none',
      display: 'inline-block',
    };
    const tdStyle: CSSProperties | undefined = width ? undefined : { textAlign: 'center' };
    return (
      <tr className={`${prefixCls}-empty-row`}>
        <td colSpan={columns.length} style={tdStyle}>
          <div style={styles}>{!lock && dataSet.status === DataSetStatus.ready && emptyText}</div>
        </td>
      </tr>
    );
  };

  const { data, virtual, rowDraggable } = tableStore;
  const virtualData = virtual ? data.slice(tableStore.virtualStartIndex, tableStore.virtualEndIndex) : data;
  const rows = virtualData.length
    ? getRows(virtualData, true, virtual)
    : getEmptyRow();
  const body = rowDraggable ? (
    <Droppable
      droppableId="table"
      key="table"
      renderClone={(
        provided: DraggableProvided,
        snapshot: DraggableStateSnapshot,
        rubric: DraggableRubric,
      ) => {
        if (snapshot.isDragging && tableStore.overflowX && tableStore.dragColumnAlign === DragColumnAlign.right) {
          const { style } = provided.draggableProps;
          if (isDraggingStyle(style)) {
            const { left, width } = style;
            style.left = left - Math.max(tableStore.totalLeafColumnsWidth - 50, width);
          }
        }
        const record = dataSet.get(rubric.source.index);
        if (record) {
          const renderClone = rowDragRender && rowDragRender.renderClone;
          const { id } = record;
          if (renderClone && isFunction(renderClone)) {
            return renderClone({
              provided,
              snapshot,
              rubric,
              key: id,
              hidden: false,
              lock,
              prefixCls,
              columns: leafColumnsBody,
              record,
              index: id,
            } as DragTableRowProps);
          }
          return (
            <TableRow
              provided={provided}
              snapshot={snapshot}
              key={id}
              hidden={false}
              lock={false}
              columns={leafColumnsBody}
              record={record}
              index={id}
            />
          );
        }
        return <span />;
      }}
      getContainerForClone={() => instance(tableStore.node.getClassName(), prefixCls).tbody}
      {...(rowDragRender && rowDragRender.droppableProps)}
    >
      {(droppableProvided: DroppableProvided) => (
        <tbody
          ref={droppableProvided.innerRef}
          {...droppableProvided.droppableProps}
          className={`${prefixCls}-tbody`}>
          {rows}
          {droppableProvided.placeholder}
        </tbody>
      )}
    </Droppable>
  ) : (
    <tbody className={`${prefixCls}-tbody`}>
      {rows}
    </tbody>
  );
  return lock ? (
    body
  ) : (
    <ReactResizeObserver onResize={handleResize} resizeProp="height" immediately>
      {body}
    </ReactResizeObserver>
  );
});

TableTBody.displayName = 'TableTBody';

export default TableTBody;
