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
import { observer } from 'mobx-react-lite';
import { action } from 'mobx';
import { Draggable, DraggableProvided, DraggableStateSnapshot, Droppable, DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd';
import classNames from 'classnames';
import isFunction from 'lodash/isFunction';
import Group from 'choerodon-ui/dataset/data-set/Group';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import ReactResizeObserver from 'choerodon-ui/lib/_util/resizeObserver';
import ObserverCheckBox from '../check-box/CheckBox';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import TableRow, { TableRowProps } from './TableRow';
import Record from '../data-set/Record';
import { ColumnLock, DragColumnAlign, GroupType } from './enum';
import ExpandedRow from './ExpandedRow';
import { DataSetStatus, RecordCachedType } from '../data-set/enum';
import { DragRender, instance } from './Table';
import { getHeader, isStickySupport } from './utils';
import ColumnGroups from './ColumnGroups';
import TableRowGroup from './TableRowGroup';
import { $l } from '../locale-context';
import Button from '../button/Button';
import { Size } from '../core/enum';
import { ButtonColor, FuncType } from '../button/enum';
import { defaultAggregationRenderer } from './Column';
import VirtualVerticalContainer from './VirtualVerticalContainer';
import TableStore from './TableStore';
import useComputed from '../use-computed';
import VirtualRowMetaData from './VirtualRowMetaData';
import { toTransformValue } from '../_util/transform';
import { useRenderClone } from './hooks';
import TableVirtualRow from './TableVirtualRow';
import { cachedTypeIntlMap } from './SelectionTips';

export interface TableTBodyProps extends ElementProps {
  lock?: ColumnLock | undefined;
  columnGroups: ColumnGroups;
  snapshot?: DroppableStateSnapshot | undefined;
  dragRowHeight?: number | undefined;
}

type Statistics = {
  count: number;
  rowMetaData: VirtualRowMetaData[];
  lastRowMetaData?: VirtualRowMetaData;
  dragTargetFound?: boolean;
}

interface GenerateSimpleRowsProps {
  tableStore: TableStore;
  columnGroups: ColumnGroups;
  lock?: ColumnLock | undefined;
  isTree?: boolean | undefined;
  virtual?: boolean | undefined;
  rowDraggable?: boolean | undefined;
  draggableId?: string | undefined;
  dragRowHeight?: number | undefined;
  isFixedRowHeight?: boolean | undefined;
  virtualCell?: boolean | undefined;
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
  onClearCache: (type?: RecordCachedType) => void;
  snapshot?: DroppableStateSnapshot;
  dragRowHeight?: number;
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

function generateRowGroup(props: GenerateRowGroupProps): ReactElement {
  const { tableStore, columnGroups, lock, children, statistics, key, rowGroupLevel } = props;
  const level = rowGroupLevel ? rowGroupLevel.count : 0;
  const node = (
    <TableRowGroup key={key} columnGroups={columnGroups} lock={lock} level={level}>
      {children}
    </TableRowGroup>
  );
  if (statistics) {
    const { rowMetaData, lastRowMetaData } = statistics;
    const currentRowMetaData = new VirtualRowMetaData(tableStore, 'group', lastRowMetaData);
    if (lastRowMetaData) {
      lastRowMetaData.next = currentRowMetaData;
    }
    currentRowMetaData.groupLevel = level;
    currentRowMetaData.node = node;
    rowMetaData.push(currentRowMetaData);
    statistics.lastRowMetaData = currentRowMetaData;
  }
  return node;
}

function generateRow(props: GenerateRowProps): ReactElement {
  const {
    tableStore, record, parentExpanded, lock, columnGroups, groupPath, index, isFixedRowHeight,
    statistics, expandIconColumnIndex, children, headerGroup, draggableId, dragRowHeight, virtualCell,
  } = props;
  const { key } = record;
  const hidden = !parentExpanded;
  const tableRowProps: TableRowProps = {
    columnGroups,
    record,
    index: index.count,
    key,
    hidden,
    lock,
    expandIconColumnIndex,
    groupPath,
    children,
    isFixedRowHeight,
    virtualCell,
  };
  if (statistics) {
    const { rowMetaData, lastRowMetaData } = statistics;
    tableRowProps.virtualIndex = statistics.count;
    statistics.count++;
    const currentRowMetaData = new VirtualRowMetaData(tableStore, 'row', lastRowMetaData, record);
    if (lastRowMetaData) {
      lastRowMetaData.next = currentRowMetaData;
    }
    rowMetaData.push(currentRowMetaData);
    statistics.lastRowMetaData = currentRowMetaData;
    tableRowProps.metaData = currentRowMetaData;
  }
  index.count++;
  if (headerGroup) {
    tableRowProps.headerGroupIndex = headerGroup.count;
    headerGroup.count++;
  }
  if (dragRowHeight && statistics && !statistics.dragTargetFound) {
    if (draggableId && String(key) === String(draggableId)) {
      statistics.dragTargetFound = true;
    } else {
      tableRowProps.style = {
        transform: toTransformValue({
          translateY: pxToRem(-dragRowHeight, true),
        }),
      };
    }
  }
  if (isFixedRowHeight && virtualCell && !hidden) {
    return (
      <TableVirtualRow {...tableRowProps} />
    );
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
  const { record: parent, tableStore: { treeFilter } } = rowProps;
  (parent.children || []).forEach((record) => {
    if (typeof treeFilter === 'function' && !treeFilter(record)) {
      return;
    }
    generateRowAndChildRows(rows, {
      ...rowProps,
      record,
      index,
    });
  });
  return rows;
}

function generateDraggableRow(props: GenerateRowProps): ReactElement {
  const { tableStore, record, lock, index, rowDragRender, statistics, isTree, virtual, rowDraggable } = props;
  const { prefixCls } = tableStore;
  const children = isTree && !virtual && (
    <ExpandedRow {...props} renderExpandedRows={renderExpandedRows} />
  );
  const draggableIndex = rowDraggable && isTree && statistics ? statistics.count : index.count;
  const row = generateRow({ ...props, children });
  if (rowDraggable) {
    const { dragColumnAlign } = tableStore;
    if (
      !dragColumnAlign ||
      (dragColumnAlign === DragColumnAlign.right && lock !== ColumnLock.left) ||
      (dragColumnAlign === DragColumnAlign.left && lock !== ColumnLock.right)
    ) {
      const { key } = record;
      let dragDisabled: boolean | undefined;
      if (rowDragRender && rowDragRender.draggableProps && rowDragRender.draggableProps.isDragDisabled) {
        const { draggableProps: { isDragDisabled } } = rowDragRender;
        dragDisabled = isFunction(isDragDisabled) ? isDragDisabled(record) : isDragDisabled;
      }
      return (
        <Draggable
          draggableId={String(key)}
          index={draggableIndex}
          isDragDisabled={dragDisabled}
          key={key}
        >
          {
            (
              provided: DraggableProvided,
              snapshot: DraggableStateSnapshot,
            ) => {
              return (
                cloneElement<any>(
                  row,
                  {
                    provided,
                    snapshot,
                    ...(rowDragRender && rowDragRender.draggableProps),
                    className: classNames({ [`${prefixCls}-row-drag-disabled`]: dragDisabled }),
                  },
                )
              )
            }
          }
        </Draggable>
      );
    }
  }
  return row;
}

function generateRowAndChildRows(rows: ReactNode[], props: GenerateRowProps): ReactNode[] {
  const { tableStore, record, isTree, virtual } = props;
  const { treeFilter, showRemovedRow } = tableStore;
  if (showRemovedRow || !record.isRemoved) {
    rows.push(
      generateDraggableRow(props),
    );
  }
  if (isTree && virtual && tableStore.isRowExpanded(record)) {
    (record.children || []).forEach(record => {
      if (typeof treeFilter === 'function' && !treeFilter(record)) {
        return;
      }
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
  handleClearCache: (type?: RecordCachedType) => void,
  statistics?: Statistics | undefined,
): ReactNode[] {
  const { tableStore } = props;
  const { showCachedTips, computedRecordCachedType = showCachedTips ? RecordCachedType.selected : undefined } = tableStore;
  const records = showCachedTips ? tableStore.cachedDataInType : tableStore.cachedData;
  if (records.length) {
    const index = { count: 0 };
    const rows: ReactNode[] = [
      generateRowGroup({
        ...props,
        key: '$$group-cached-rows',
        statistics,
        children: (
          <>
            {
              showCachedTips && (
                <ObserverCheckBox
                  className={`${tableStore.prefixCls}-cached-group-check`}
                  checked={tableStore.allCachedChecked}
                  indeterminate={tableStore.cachedIndeterminate}
                  onChange={() => {
                    if (tableStore.allCachedChecked) {
                      tableStore.unCheckAllCached();
                    } else {
                      tableStore.checkAllCached();
                    }
                  }}
                />
              )
            }
            <span>{$l('Table', computedRecordCachedType ? cachedTypeIntlMap[computedRecordCachedType] : 'cached_records')}</span>
            {
              !showCachedTips && (
                <Button
                  funcType={FuncType.link}
                  color={ButtonColor.primary}
                  icon="delete"
                  size={Size.small}
                  onClick={() => handleClearCache(computedRecordCachedType)}
                />
              )
            }
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
    const { subGroups, records, name, subHGroups, children } = group;
    const hasChildren = children && tableStore.isGroupExpanded(group);
    const isLastInTreeNode = i === length - 1 && isParentLast !== false;
    const isLast = isLastInTreeNode && !hasChildren;
    const path: [Group, boolean][] = [...groupPath, [group, isLast]];
    const tableGroup = tableGroups && tableGroups.find(g => g.name === name);
    if (tableGroup && tableGroup.type === GroupType.row) {
      const { columnProps } = tableGroup;
      const { renderer = defaultAggregationRenderer } = columnProps || {};
      const groupName = tableGroup.name;
      const header = getHeader({ ...columnProps, name: groupName, dataSet, group, groups });
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
    if (hasChildren) {
      generateGroupRows(rows, children!, props, hasCached, statistics, groupPath, undefined, isLastInTreeNode);
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
  const { currentData, groupedData, showCachedTips } = tableStore;
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
        children: (
          <>
            {
              showCachedTips && (
                <ObserverCheckBox
                  className={`${tableStore.prefixCls}-cached-group-check`}
                  checked={tableStore.allCurrentChecked}
                  indeterminate={tableStore.currentIndeterminate}
                  onChange={() => {
                    if (tableStore.allCurrentChecked) {
                      tableStore.unCheckAllCurrent();
                    } else {
                      tableStore.checkAllCurrent();
                    }
                  }}
                />
              )
            }
            {
              $l('Table', showCachedTips ? 'current_page' : 'current_page_records')
            }
          </>
        ),
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
    left: pxToRem(width / 2, true)!,
  } : {
    transform: 'none',
    display: 'inline-block',
  };
  const tdStyle: CSSProperties | undefined = width ? undefined : { textAlign: 'center' };
  return (
    <tr className={`${prefixCls}-empty-row`}>
      <td colSpan={columnGroups.leafs.length} style={tdStyle}>
        <div
          className={`${prefixCls}-empty-text-wrapper`}
          style={styles}
        >
          {!lock && dataSet.status === DataSetStatus.ready && emptyText}
        </div>
      </td>
    </tr>
  );
}

function findRowMeta(rowMetaData: VirtualRowMetaData[], count: { index: number }): VirtualRowMetaData | undefined {
  let { index } = count;
  let meta = rowMetaData[index];
  while (meta) {
    if (meta.type === 'row') {
      return meta;
    }
    index += 1;
    count.index = index;
    meta = rowMetaData[index];
  }
}

const VirtualRows: FunctionComponent<RowsProps> = function VirtualRows(props) {
  const {
    lock, columnGroups, onClearCache, expandIconColumnIndex, tableStore, rowDragRender,
    isTree, rowDraggable, snapshot, dragRowHeight, isFixedRowHeight, virtualCell,
  } = props;
  const draggableId = snapshot && snapshot.draggingFromThisWith;
  const [totalRows, statistics]: [ReactNode[], Statistics] = useComputed(() => {
    const $statistics: Statistics = { count: 0, rowMetaData: [] };
    const cachedRows = generateCachedRows({
      tableStore,
      columnGroups,
      lock,
      isTree,
      rowDraggable,
      virtual: true,
      isFixedRowHeight,
      virtualCell,
    }, onClearCache, $statistics);
    const rows = generateRows({
      tableStore,
      columnGroups,
      expandIconColumnIndex,
      lock,
      rowDragRender,
      isTree,
      rowDraggable,
      draggableId,
      dragRowHeight,
      virtual: true,
      isFixedRowHeight,
      virtualCell,
    }, cachedRows.length > 0, $statistics);
    return [cachedRows.concat(rows), $statistics];
  }, [
    tableStore, columnGroups, expandIconColumnIndex, lock, isTree, rowDraggable,
    rowDragRender, onClearCache, draggableId, dragRowHeight, isFixedRowHeight, virtualCell,
  ]);
  const renderGroup = useCallback((startIndex) => {
    const groups: ReactNode[] = [];
    const { rowMetaData } = statistics;
    const first = rowMetaData[startIndex];
    if (first && first.type === 'group' && first.groupLevel === 0) {
      return groups;
    }
    let level;
    rowMetaData.slice(0, startIndex).reverse().some((metaData) => {
      if (metaData.type === 'group') {
        const { groupLevel = 0 } = metaData;
        if (level === undefined || groupLevel < level) {
          level = groupLevel;
          groups.unshift(metaData.node);
        }
        return groupLevel === 0;
      }
      return false;
    });
    return groups;
  }, [statistics]);
  const renderRow = useCallback(rIndex => totalRows[rIndex], [totalRows]);

  useEffect(action(() => {
    const { rowMetaData: oldRowMetaData, aggregation: tableAggregation } = tableStore;
    const { rowMetaData } = statistics;
    if (oldRowMetaData) {
      const count = { index: -1 };
      oldRowMetaData.every(({ actualHeight, type, aggregation }) => {
        if (type === 'group') {
          return true;
        }
        count.index += 1;
        if (actualHeight !== undefined && aggregation === tableAggregation) {
          const newMeta = findRowMeta(rowMetaData, count);
          if (newMeta) {
            newMeta.setHeight(actualHeight);
            return true;
          }
        }
        tableStore.lastMeasuredIndex = Math.max(count.index - 1, 0);
        return false;
      });
    } else {
      tableStore.lastMeasuredIndex = 0;
    }
    tableStore.rowMetaData = rowMetaData;
  }), [statistics, tableStore]);

  return totalRows.length ? (
    <VirtualVerticalContainer renderBefore={tableStore.hasRowGroups ? renderGroup : undefined}>
      {renderRow}
    </VirtualVerticalContainer>
  ) : getEmptyRow({ tableStore, lock, columnGroups });
};
VirtualRows.displayName = 'VirtualRows';

const Rows: FunctionComponent<RowsProps> = function Rows(props) {
  const {
    lock, columnGroups, onClearCache, expandIconColumnIndex, tableStore,
    rowDragRender, isTree, rowDraggable, isFixedRowHeight, virtualCell,
  } = props;
  const cachedRows: ReactNode[] = useComputed(() => (
    generateCachedRows({ tableStore, columnGroups, lock, isTree, rowDraggable, virtual: false, isFixedRowHeight, virtualCell }, onClearCache)
  ), [tableStore, columnGroups, onClearCache, lock, isTree, rowDraggable, isFixedRowHeight, virtualCell]);
  const hasCache = cachedRows.length > 0;
  const rows: ReactNode[] = useComputed(() => (
    generateRows({
      tableStore,
      columnGroups,
      expandIconColumnIndex,
      lock,
      rowDragRender,
      isTree,
      rowDraggable,
      virtual: false,
      isFixedRowHeight,
      virtualCell,
    }, hasCache)
  ), [
    tableStore, columnGroups, hasCache, expandIconColumnIndex,
    lock, isTree, rowDraggable, rowDragRender, isFixedRowHeight, virtualCell,
  ]);
  useEffect(action(() => {
    if (tableStore.actualRows !== undefined) {
      tableStore.actualRows = undefined;
    }
    if (tableStore.rowMetaData) {
      tableStore.rowMetaData = undefined;
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
  const { lock, columnGroups, snapshot, dragRowHeight, ...rest } = props;
  const { prefixCls, tableStore, rowDragRender, dataSet, expandedRowRenderer, isTree } = useContext(TableContext);
  const { rowDraggable, virtualCell, isFixedRowHeight } = tableStore;
  const expandIconColumnIndex = (expandedRowRenderer || isTree) ?
    (lock === ColumnLock.right ? columnGroups.leafs.filter(group => group.column.lock !== ColumnLock.right).length : 0) : -1;
  const handleResize = useCallback(action((_width: number, height: number, target: HTMLTableSectionElement) => {
    // why target is undefined ?
    if (target && target.offsetParent && height) {
      tableStore.calcBodyHeight = height;
    }
  }), [tableStore]);

  const handleClearCache = useCallback(action((type?: RecordCachedType) => {
    switch (type) {
      case RecordCachedType.selected:
        dataSet.setCachedSelected([]);
        break;
      case RecordCachedType.add:
        dataSet.setCachedCreated([]);
        break;
      case RecordCachedType.update:
        dataSet.setCachedUpdated([]);
        break;
      case RecordCachedType.delete:
        dataSet.setCachedDestroyed([]);
        break;
      default:
        dataSet.clearCachedRecords();
    }
    tableStore.recordCachedType = undefined;
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

  const renderClone = useRenderClone(lock ? undefined : columnGroups);

  const body = tableStore.propVirtual ? (
    <ObserverVirtualRows
      onClearCache={handleClearCache}
      expandIconColumnIndex={expandIconColumnIndex}
      columnGroups={columnGroups}
      tableStore={tableStore}
      rowDragRender={rowDragRender}
      lock={lock}
      isTree={isTree}
      rowDraggable={rowDraggable}
      snapshot={snapshot}
      dragRowHeight={dragRowHeight}
      isFixedRowHeight={isFixedRowHeight}
      virtualCell={virtualCell}
    />
  ) : (
    <ObserverRows
      onClearCache={handleClearCache}
      expandIconColumnIndex={expandIconColumnIndex}
      columnGroups={columnGroups}
      tableStore={tableStore}
      rowDragRender={rowDragRender}
      lock={lock}
      isTree={isTree}
      rowDraggable={rowDraggable}
      isFixedRowHeight={isFixedRowHeight}
      virtualCell={virtualCell}
    />
  );
  const tbody = rowDraggable && !tableStore.virtual ? (
    <Droppable
      droppableId={tableStore.node.props.id || "table"}
      key="table"
      isCombineEnabled={isTree}
      mode="standard"
      renderClone={renderClone}
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
