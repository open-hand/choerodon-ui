import React, {
  cloneElement,
  CSSProperties,
  FunctionComponent,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
} from 'react';
import { observer } from 'mobx-react';
import { action, isArrayLike } from 'mobx';
import { Draggable, DraggableProvided, DraggableRubric, DraggableStateSnapshot, Droppable, DroppableProvided } from 'react-beautiful-dnd';
import Group from 'choerodon-ui/dataset/data-set/Group';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import ReactResizeObserver from 'choerodon-ui/lib/_util/resizeObserver';
import isFunction from 'lodash/isFunction';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import TableRow from './TableRow';
import Record from '../data-set/Record';
import { ColumnLock, DragColumnAlign, GroupType } from './enum';
import ExpandedRow from './ExpandedRow';
import { DataSetStatus } from '../data-set/enum';
import { DragRender, DragTableRowProps, instance } from './Table';
import { getHeader, isDraggingStyle, isStickySupport } from './utils';
import ColumnGroups from './ColumnGroups';
import TableRowGroup from './TableRowGroup';
import { $l } from '../locale-context';
import Button from '../button/Button';
import { Size } from '../core/enum';
import { ButtonColor, FuncType } from '../button/enum';
import { defaultAggregationRenderer } from './Column';
import VirtualRows from './VirtualRows';
import TableStore from './TableStore';
import useComputed from '../use-computed';

export interface TableTBodyProps extends ElementProps {
  lock?: ColumnLock;
  columnGroups: ColumnGroups;
}

interface GenerateRowProps {
  tableStore: TableStore;
  columnGroups: ColumnGroups;
  record: Record;
  groupPath?: [Group, boolean][];
  parentExpanded?: boolean | undefined;
  lock?: ColumnLock | undefined;
  index: { count: number };
  headerGroup?: { count: number };
  rowDragRender?: DragRender | undefined;
  children?: ReactNode;
}

function generateRow(props: GenerateRowProps): ReactElement {
  const { record, parentExpanded, lock, columnGroups, groupPath, index, children, headerGroup } = props;
  const { count } = index;
  index.count++;
  const headerGroupIndex = headerGroup && headerGroup.count;
  if (headerGroup) {
    headerGroup.count++;
  }
  return (
    <TableRow
      key={record.key}
      hidden={!parentExpanded}
      lock={lock}
      columnGroups={columnGroups}
      record={record}
      index={count}
      headerGroupIndex={headerGroupIndex}
      groupPath={groupPath}
    >{children}
    </TableRow>
  );
}

function renderExpandedRows(
  tableStore: TableStore,
  columnGroups: ColumnGroups,
  parent: Record,
  isExpanded?: boolean,
) {
  const index = { count: 0 };
  const rows: ReactNode[] = [];
  (parent.children || []).forEach((record) => generateRowAndChildRows(rows, {
    tableStore,
    columnGroups,
    record,
    index,
    parentExpanded: isExpanded,
  }));
  return rows;
}

function generateDraggableRow(props: GenerateRowProps): ReactElement {
  const { tableStore, columnGroups, record, lock, index, rowDragRender } = props;
  const children = tableStore.isTree && !tableStore.virtual && (
    <ExpandedRow tableStore={tableStore} record={record} columnGroups={columnGroups}>
      {renderExpandedRows}
    </ExpandedRow>
  );
  const { count } = index;
  const row = generateRow({ ...props, children });
  if (tableStore.rowDraggable) {
    const { dragColumnAlign } = tableStore;
    if (
      !dragColumnAlign ||
      (dragColumnAlign === DragColumnAlign.right && lock !== ColumnLock.left) ||
      (dragColumnAlign === DragColumnAlign.left && lock !== ColumnLock.right)
    ) {
      const { key } = record;
      return (
        <Draggable
          draggableId={String(key)}
          index={count}
          key={key}
        >
          {
            (
              provided: DraggableProvided,
              snapshot: DraggableStateSnapshot,
            ) => (
              cloneElement<any>(row, { provided, snapshot, ...(rowDragRender && rowDragRender.draggableProps) })
            )
          }
        </Draggable>
      );
    }
  }
  return row;
}

function generateRowAndChildRows(rows: ReactNode[], props: GenerateRowProps): ReactNode[] {
  const { tableStore, record } = props;
  rows.push(
    generateDraggableRow(props),
  );
  if (tableStore.isTree && tableStore.virtual && tableStore.isRowExpanded(record)) {
    (record.children || []).forEach(record => {
      generateRowAndChildRows(rows, {
        ...props,
        index: { count: 0 },
        record,
      });
    });
  }
  return rows;
}

function generateCachedRows(
  records: Record[],
  tableStore: TableStore,
  columnGroups: ColumnGroups,
  handleClearCache: () => void,
  lock?: ColumnLock | undefined,
  index = { count: 0 },
): ReactNode[] {
  if (records.length) {
    const rows: ReactNode[] = [
      [
        <TableRowGroup key="$$group-cached-rows" columnGroups={columnGroups} lock={lock}>
          <span>{$l('Table', 'cached_records')}</span>
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            icon="delete"
            size={Size.small}
            onClick={handleClearCache}
          />
        </TableRowGroup>,
        true,
      ],
    ];
    records.forEach(record => rows.push(generateRow({
      tableStore,
      columnGroups,
      record,
      index,
      lock,
      parentExpanded: true,
    })));
    return rows;
  }
  return [];
}

function generateNormalRows(
  rows: ReactNode[],
  records: Record[],
  tableStore: TableStore,
  columnGroups: ColumnGroups,
  lock?: ColumnLock | undefined,
  rowDragRender?: DragRender,
  index = { count: 0 },
): ReactNode[] {
  records.forEach((record) => generateRowAndChildRows(rows, {
    tableStore,
    columnGroups,
    record,
    rowDragRender,
    index,
    lock,
    parentExpanded: true,
  }));
  return rows;
}

function generateGroupRows(
  rows: ReactNode[],
  groups: Group[],
  tableStore: TableStore,
  columnGroups: ColumnGroups,
  lock?: ColumnLock | undefined,
  rowDragRender?: DragRender,
  groupPath: [Group, boolean][] = [],
  index = { count: 0 },
  isParentLast?: boolean,
): ReactNode[] {
  const { groups: tableGroups, dataSet, prefixCls } = tableStore;
  const { length } = groups;
  groups.forEach((group, i) => {
    const isLast = i === length - 1 && isParentLast !== false;
    const { subGroups, records, name, subHGroups } = group;
    const path: [Group, boolean][] = [...groupPath, [group, isLast]];
    const tableGroup = tableGroups && tableGroups.find(g => g.name === name);
    if (tableGroup && tableGroup.type === GroupType.row) {
      const { columnProps } = tableGroup;
      const { renderer = defaultAggregationRenderer } = columnProps || {};
      const groupName = tableGroup.name;
      const header = getHeader({ ...columnProps, name: groupName, dataSet, group });
      rows.push(
        [
          <TableRowGroup key={`$group-${group.value}`} columnGroups={columnGroups} lock={lock}>
            {header}
            {header && <span className={`${prefixCls}-row-group-divider`} />}
            {renderer({ text: group.value, rowGroup: group, name: groupName, dataSet, record: group.totalRecords[0] })}
          </TableRowGroup>,
          true,
        ],
      );
    }
    if (subHGroups) {
      const $index = { count: 0 };
      subHGroups.forEach((group) => {
        group.records.slice($index.count).forEach((record) => {
          generateRowAndChildRows(rows, {
            tableStore,
            columnGroups,
            record,
            lock,
            index,
            headerGroup: $index,
            groupPath: path,
            parentExpanded: true,
          });
        });
      });
    } else {
      if (subGroups && subGroups.length) {
        generateGroupRows(rows, subGroups, tableStore, columnGroups, lock, rowDragRender, path, index, isLast);
      }
      records.forEach((record) => {
        generateRowAndChildRows(rows, {
          tableStore,
          columnGroups,
          record,
          lock,
          index,
          groupPath: path,
          parentExpanded: true,
        });
      });
    }
  });
  return rows;
}

function generateRows(
  records: Record[],
  groups: Group[],
  tableStore: TableStore,
  columnGroups: ColumnGroups,
  hasCached: boolean,
  lock?: ColumnLock | undefined,
  rowDragRender?: DragRender,
): ReactNode[] {
  const rows: ReactNode[] = [];
  if (groups.length) {
    generateGroupRows(rows, groups, tableStore, columnGroups, lock, rowDragRender);
  } else if (records.length) {
    generateNormalRows(rows, records, tableStore, columnGroups, lock, rowDragRender);
  }
  if (hasCached && rows.length) {
    rows.unshift(
      [
        <TableRowGroup key="$$group-rows" columnGroups={columnGroups} lock={lock}>
          {$l('Table', 'current_page_records')}
        </TableRowGroup>,
        true,
      ],
    );
  }
  return rows;
}

const TableTBody: FunctionComponent<TableTBodyProps> = function TableTBody(props) {
  const { lock, columnGroups } = props;
  const { prefixCls, tableStore, rowDragRender, dataSet } = useContext(TableContext);
  const {
    cachedData, currentData, groupedData, virtual, rowDraggable,
  } = tableStore;
  const handleResize = useCallback(action((_width: number, height: number) => {
    if (!tableStore.hidden) {
      if (tableStore.overflowY && height === tableStore.height) {
        height += 1;
      }
      tableStore.calcBodyHeight = height;
    }
  }), [tableStore]);

  const handleClearCache = useCallback(action(() => {
    dataSet.clearCachedRecords();
    tableStore.showCachedSelection = false;
  }), [dataSet, tableStore]);

  useLayoutEffect(() => {
    if (!lock) {
      const { node } = tableStore;
      if (
        node.isFocus &&
        !node.wrapper.contains(document.activeElement)
      ) {
        node.focus();
      }
    }
  }, [lock, tableStore]);

  const getEmptyRow = (): ReactNode => {
    const { emptyText, width } = tableStore;
    const styles: CSSProperties = width ? {
      position: isStickySupport() ? 'sticky' : 'relative',
      left: pxToRem(width / 2)!,
    } : {
      transform: 'none',
      display: 'inline-block',
    };
    const tdStyle: CSSProperties | undefined = width ? undefined : { textAlign: 'center' };
    return (
      <tr className={`${prefixCls}-empty-row`}>
        <td colSpan={columnGroups.leafs.length} style={tdStyle}>
          <div style={styles}>{!lock && dataSet.status === DataSetStatus.ready && emptyText}</div>
        </td>
      </tr>
    );
  };
  const hasCache = cachedData.length > 0;
  const cachedRows: ReactNode[] = useComputed(() => (
    generateCachedRows(cachedData, tableStore, columnGroups, handleClearCache, lock)
  ), [cachedData, tableStore, columnGroups, handleClearCache, lock]);
  const rows: ReactNode[] = useComputed(() => (
    generateRows(currentData, groupedData, tableStore, columnGroups, hasCache, lock, rowDragRender)
  ), [currentData, groupedData, tableStore, columnGroups, hasCache, lock, rowDragRender]);
  const totalRows = useMemo(() => [...cachedRows, ...rows], [cachedRows, rows]);
  const renderGroup = useCallback((startIndex) => (
    totalRows.slice(0, startIndex).reverse().find(row => isArrayLike(row) && row[1] === true)
  ), [totalRows]);
  const renderRow = useCallback(rIndex => totalRows[rIndex], [totalRows]);
  const actualRows = cachedRows.length + rows.length;
  useEffect(action(() => {
    if (actualRows && tableStore.actualRows !== actualRows) {
      if (tableStore.virtual) {
        tableStore.actualRows = actualRows;
      } else {
        tableStore.actualRows = undefined;
      }
    }
  }), [actualRows, tableStore]);
  const body = actualRows ? virtual ? (
    <VirtualRows renderBefore={renderGroup}>
      {renderRow}
    </VirtualRows>
  ) : (
    <>
      {cachedRows}
      {rows}
    </>
  ) : getEmptyRow();
  const tbody = rowDraggable ? (
    <Droppable
      droppableId="table"
      key="table"
      renderClone={(
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
        const record = dataSet.get(rubric.source.index);
        if (record) {
          const leafColumnsBody = lock ? tableStore.columnGroups : columnGroups;
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
              columnGroups={leafColumnsBody}
              record={record}
              index={id}
            />
          );
        }
        return <span />;
      }}
      getContainerForClone={() => instance(tableStore.node.getClassName(), prefixCls).tbody as React.ReactElement<HTMLElement>}
      {...(rowDragRender && rowDragRender.droppableProps)}
    >
      {(droppableProvided: DroppableProvided) => (
        <tbody
          ref={droppableProvided.innerRef}
          {...droppableProvided.droppableProps}
          className={`${prefixCls}-tbody`}>
          {body}
          {droppableProvided.placeholder}
        </tbody>
      )}
    </Droppable>
  ) : (
    <tbody className={`${prefixCls}-tbody`}>
      {body}
    </tbody>
  );
  return lock || virtual ? (
    tbody
  ) : (
    <ReactResizeObserver onResize={handleResize} resizeProp="height" immediately>
      {tbody}
    </ReactResizeObserver>
  );
};

TableTBody.displayName = 'TableTBody';

export default observer(TableTBody);
