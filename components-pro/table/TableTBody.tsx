import React, {
  cloneElement,
  CSSProperties,
  FunctionComponent,
  Key,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
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
import TableRow, { TableRowProps } from './TableRow';
import Record from '../data-set/Record';
import { ColumnLock, DragColumnAlign, GroupType } from './enum';
import ExpandedRow from './ExpandedRow';
import { DataSetStatus } from '../data-set/enum';
import { DragRender, DragTableRowProps, instance } from './Table';
import { getHeader, isDraggingStyle, isStickySupport } from './utils';
import ColumnGroups from './ColumnGroups';
import TableRowGroup, { ROW_GROUP_HEIGHT } from './TableRowGroup';
import { $l } from '../locale-context';
import Button from '../button/Button';
import { Size } from '../core/enum';
import { ButtonColor, FuncType } from '../button/enum';
import { defaultAggregationRenderer } from './Column';
import VirtualVerticalContainer from './VirtualVerticalContainer';
import TableStore from './TableStore';
import useComputed from '../use-computed';
import VirtualRowMetaData from './VirtualRowMetaData';

export interface TableTBodyProps extends ElementProps {
  lock?: ColumnLock | undefined;
  columnGroups: ColumnGroups;
}

type Statistics = {
  count: number;
  rowGroups: number[];
  rowMetaData?: VirtualRowMetaData[];
  lastRowMetaData?: VirtualRowMetaData;
}

interface GenerateSimpleRowsProps {
  tableStore: TableStore;
  columnGroups: ColumnGroups;
  lock?: ColumnLock | undefined;
}

interface GenerateRowGroupProps extends GenerateSimpleRowsProps {
  key: Key;
  statistics?: Statistics | undefined;
  children?: ReactNode;
  rowGroupLevel?: { count: number };
}

interface GenerateRowsProps extends GenerateSimpleRowsProps {
  rowDragRender?: DragRender | undefined;
  expandIconColumnIndex?: number | undefined;
}

export interface RowsProps extends GenerateRowsProps {
  onClearCache: () => void;
}

export interface GenerateRowProps extends GenerateRowsProps {
  record: Record;
  groupPath?: [Group, boolean][];
  parentExpanded?: boolean | undefined;
  index: { count: number };
  statistics?: Statistics | undefined;
  headerGroup?: { count: number };
  children?: ReactNode;
}

function generateRowGroup(props: GenerateRowGroupProps): ReactNode {
  const { tableStore, columnGroups, lock, children, statistics, key, rowGroupLevel } = props;
  if (statistics) {
    statistics.rowGroups.push(statistics.count++);
    const { rowMetaData } = statistics;
    if (rowMetaData) {
      const currentRowMetaData = new VirtualRowMetaData(tableStore, statistics.lastRowMetaData, ROW_GROUP_HEIGHT);
      rowMetaData.push(currentRowMetaData);
      statistics.lastRowMetaData = currentRowMetaData;
    }
  }
  const group = (
    <TableRowGroup key={key} columnGroups={columnGroups} lock={lock} level={rowGroupLevel ? rowGroupLevel.count : 0}>
      {children}
    </TableRowGroup>
  );
  return statistics ? [
    group,
    true,
  ] : group;
}

function generateRow(props: GenerateRowProps): ReactElement {
  const { tableStore, record, parentExpanded, lock, columnGroups, groupPath, index, statistics, expandIconColumnIndex, children, headerGroup } = props;
  const tableRowProps: TableRowProps = {
    columnGroups,
    record,
    index: index.count,
    key: record.key,
    hidden: !parentExpanded,
    lock,
    expandIconColumnIndex,
    groupPath,
    children,
  };
  if (statistics) {
    const { rowMetaData } = statistics;
    tableRowProps.virtualIndex = statistics.count;
    statistics.count++;
    if (rowMetaData) {
      const currentRowMetaData = new VirtualRowMetaData(tableStore, statistics.lastRowMetaData, undefined, record);
      rowMetaData.push(currentRowMetaData);
      statistics.lastRowMetaData = currentRowMetaData;
      tableRowProps.metaData = currentRowMetaData;
    }
  }
  index.count++;
  if (headerGroup) {
    tableRowProps.headerGroupIndex = headerGroup.count;
    headerGroup.count++;
  }
  return (
    <TableRow {...tableRowProps} />
  );
}

function renderExpandedRows(
  rowProps: GenerateRowProps,
): ReactNode[] {
  const index = { count: 0 };
  const rows: ReactNode[] = [];
  const { record: parent } = rowProps;
  (parent.children || []).forEach((record) => generateRowAndChildRows(rows, {
    ...rowProps,
    record,
    index,
  }));
  return rows;
}

function generateDraggableRow(props: GenerateRowProps): ReactElement {
  const { tableStore, record, lock, index, rowDragRender, statistics } = props;
  const children = tableStore.isTree && !tableStore.virtual && (
    <ExpandedRow {...props} renderExpandedRows={renderExpandedRows} />
  );
  const draggableIndex = tableStore.rowDraggable && tableStore.isTree && statistics ? statistics.count : index.count;
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
          index={draggableIndex}
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
  props: GenerateSimpleRowsProps,
  handleClearCache: () => void,
  statistics?: Statistics | undefined,
): ReactNode[] {
  const { cachedData: records } = props.tableStore;
  if (records.length) {
    const index = { count: 0 };
    const rows: ReactNode[] = [
      generateRowGroup({
        ...props,
        key: '$$group-cached-rows',
        statistics,
        children: (
          <>
            <span>{$l('Table', 'cached_records')}</span>
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              icon="delete"
              size={Size.small}
              onClick={handleClearCache}
            />
          </>
        ),
      }),
    ];
    records.forEach(record => rows.push(generateRow({
      ...props,
      record,
      index,
      statistics,
      parentExpanded: true,
    })));
    return rows;
  }
  return [];
}

function generateNormalRows(
  rows: ReactNode[],
  records: Record[],
  props: GenerateRowsProps,
  statistics?: Statistics | undefined,
  index = { count: 0 },
): ReactNode[] {
  records.forEach((record) => generateRowAndChildRows(rows, {
    ...props,
    record,
    index,
    statistics,
    parentExpanded: true,
  }));
  return rows;
}

function generateGroupRows(
  rows: ReactNode[],
  groups: Group[],
  props: GenerateRowsProps,
  hasCached: boolean,
  statistics?: Statistics | undefined,
  groupPath: [Group, boolean][] = [],
  index = { count: 0 },
  isParentLast?: boolean,
): ReactNode[] {
  const { columnGroups, lock, tableStore } = props;
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
        generateRowGroup({
          key: `$group-${path.map(([g]) => g.value).join('-')}`,
          columnGroups,
          lock,
          tableStore,
          statistics,
          children: (
            <>
              {header}
              {header && <span className={`${prefixCls}-row-group-divider`} />}
              {renderer({ text: group.value, rowGroup: group, name: groupName, dataSet, record: group.totalRecords[0] })}
            </>
          ),
          rowGroupLevel: { count: path.length - (hasCached ? 0 : 1) },
        }),
      );
    }
    if (subHGroups) {
      const $index = { count: 0 };
      subHGroups.forEach((group) => {
        group.records.slice($index.count).forEach((record) => {
          generateRowAndChildRows(rows, {
            ...props,
            record,
            index,
            statistics,
            headerGroup: $index,
            groupPath: path,
            parentExpanded: true,
          });
        });
      });
    } else {
      if (subGroups && subGroups.length) {
        generateGroupRows(rows, subGroups, props, hasCached, statistics, path, index, isLast);
      }
      records.forEach((record) => {
        generateRowAndChildRows(rows, {
          ...props,
          record,
          index,
          statistics,
          groupPath: path,
          parentExpanded: true,
        });
      });
    }
  });
  return rows;
}

function generateRows(
  props: GenerateRowsProps,
  hasCached: boolean,
  statistics?: Statistics | undefined,
): ReactNode[] {
  const { tableStore } = props;
  const { currentData, groupedData } = tableStore;
  const rows: ReactNode[] = [];
  if (hasCached && currentData.length) {
    const { columnGroups, lock } = props;
    rows.push(
      generateRowGroup({
        key: '$$group-rows',
        columnGroups,
        lock,
        tableStore,
        statistics,
        children: $l('Table', 'current_page_records'),
      }),
    );
  }
  if (groupedData.length) {
    generateGroupRows(rows, groupedData, props, hasCached, statistics);
  } else if (currentData.length) {
    generateNormalRows(rows, currentData, props, statistics);
  }
  return rows;
}

function getEmptyRow(props: GenerateSimpleRowsProps): ReactElement {
  const { tableStore, columnGroups, lock } = props;
  const { emptyText, width, prefixCls, dataSet } = tableStore;
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
}

const VirtualRows: FunctionComponent<RowsProps> = function VirtualRows(props) {
  const { lock, columnGroups, onClearCache, expandIconColumnIndex, tableStore, rowDragRender } = props;
  const [totalRows, statistics]: [ReactNode[], Statistics] = useComputed(() => {
    const $statistics: Statistics = { count: 0, rowGroups: [] };
    if (!tableStore.isFixedRowHeight || (tableStore.isTree && tableStore.rowDraggable)) {
      $statistics.rowMetaData = [];
    }
    const cachedRows = generateCachedRows({ tableStore, columnGroups, lock }, onClearCache, $statistics);
    const rows = generateRows({
      tableStore,
      columnGroups,
      expandIconColumnIndex,
      lock,
      rowDragRender,
    }, cachedRows.length > 0, $statistics);
    return [cachedRows.concat(rows), $statistics];
  }, [tableStore, columnGroups, expandIconColumnIndex, lock, rowDragRender, onClearCache]);
  const renderGroup = useCallback((startIndex) => {
    const groups: ReactNode[] = [];
    let preGroup: ReactNode | undefined;
    totalRows.slice(0, startIndex).reverse().some((row) => {
      if (isArrayLike(row) && row[1] === true) {
        groups.push(row);
        preGroup = row;
      } else if (preGroup) {
        return true;
      }
      return false;
    });
    return groups;
  }, [totalRows]);
  const renderRow = useCallback(rIndex => totalRows[rIndex], [totalRows]);

  useEffect(action(() => {
    tableStore.lastMeasuredIndex = 0;
    tableStore.rowMetaData = statistics.rowMetaData;
    if (tableStore.isFixedRowHeight) {
      const actualRows = totalRows.length;
      if (tableStore.actualRows !== actualRows) {
        tableStore.actualRows = actualRows;
      }
    }
    const actualGroupRows = statistics.rowGroups.length;
    if (tableStore.actualGroupRows !== actualGroupRows) {
      tableStore.actualGroupRows = actualGroupRows;
    }
  }), [totalRows, statistics, tableStore]);

  return totalRows.length ? (
    <VirtualVerticalContainer renderBefore={renderGroup}>
      {renderRow}
    </VirtualVerticalContainer>
  ) : getEmptyRow({ tableStore, lock, columnGroups });
};
VirtualRows.displayName = 'VirtualRows';

const Rows: FunctionComponent<RowsProps> = function Rows(props) {
  const { lock, columnGroups, onClearCache, expandIconColumnIndex, tableStore, rowDragRender } = props;
  const { cachedData, currentData, groupedData } = tableStore;
  const cachedRows: ReactNode[] = useComputed(() => (
    generateCachedRows({ tableStore, columnGroups, lock }, onClearCache)
  ), [cachedData, tableStore, columnGroups, onClearCache, lock]);
  const hasCache = cachedRows.length > 0;
  const rows: ReactNode[] = useComputed(() => (
    generateRows({ tableStore, columnGroups, expandIconColumnIndex, lock, rowDragRender }, hasCache)
  ), [currentData, groupedData, tableStore, columnGroups, hasCache, expandIconColumnIndex, lock, rowDragRender]);
  useEffect(action(() => {
    if (tableStore.actualRows !== undefined) {
      tableStore.actualRows = undefined;
    }
    if (tableStore.rowMetaData) {
      tableStore.rowMetaData = undefined;
    }
    if (tableStore.actualGroupRows) {
      tableStore.actualGroupRows = 0;
    }
  }), [tableStore]);
  return cachedRows.length || rows.length ? (
    <>
      {cachedRows}
      {rows}
    </>
  ) : getEmptyRow({ tableStore, lock, columnGroups });
};
Rows.displayName = 'Rows';

const ObserverVirtualRows = observer(VirtualRows);
const ObserverRows = observer(Rows);

const TableTBody: FunctionComponent<TableTBodyProps> = function TableTBody(props) {
  const { lock, columnGroups, ...rest } = props;
  const { prefixCls, tableStore, rowDragRender, dataSet, expandRowByClick, expandedRowRenderer } = useContext(TableContext);
  const { rowDraggable } = tableStore;
  const expandIconColumnIndex = !expandRowByClick && (expandedRowRenderer || tableStore.isTree) ?
    (lock === ColumnLock.right ? columnGroups.leafs.filter(group => group.column.lock !== ColumnLock.right).length : 0) : -1;
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

  const body = tableStore.propVirtual ? (
    <ObserverVirtualRows
      onClearCache={handleClearCache}
      expandIconColumnIndex={expandIconColumnIndex}
      columnGroups={columnGroups}
      tableStore={tableStore}
      rowDragRender={rowDragRender}
      lock={lock}
    />
  ) : (
    <ObserverRows
      onClearCache={handleClearCache}
      expandIconColumnIndex={expandIconColumnIndex}
      columnGroups={columnGroups}
      tableStore={tableStore}
      rowDragRender={rowDragRender}
      lock={lock}
    />
  );
  const tbody = rowDraggable ? (
    <Droppable
      droppableId="table"
      key="table"
      isCombineEnabled={tableStore.isTree}
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
        const record = dataSet.find(record => String(record.key) === rubric.draggableId);
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
              className="dragging-row"
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
          className={`${prefixCls}-tbody`}
          {...rest}
        >
          {body}
          {droppableProvided.placeholder}
        </tbody>
      )}
    </Droppable>
  ) : (
    <tbody className={`${prefixCls}-tbody`} {...rest}>
      {body}
    </tbody>
  );
  return lock ? tbody : (
    <ReactResizeObserver onResize={handleResize} resizeProp="height" immediately>
      {tbody}
    </ReactResizeObserver>
  );
};

TableTBody.displayName = 'TableTBody';

export default observer(TableTBody);
