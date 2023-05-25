import React, { CSSProperties, FunctionComponent, ReactElement, ReactNode, useCallback, useContext, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import defaultTo from 'lodash/defaultTo';
import omit from 'lodash/omit';
import Tree, { TreeNodeProps } from 'choerodon-ui/lib/tree';
import Record from '../data-set/Record';
import AggregationButton from './AggregationButton';
import { ColumnProps } from './Column';
import TableContext from './TableContext';
import ColumnGroups from './ColumnGroups';
import ColumnGroup from './ColumnGroup';
import { getColumnKey, getHeader } from './utils';
import { Group } from '../data-set/DataSet';
import { EXPAND_KEY } from './TableStore';

export interface AggregationTreeProps {
  groups?: ColumnGroup[];
  columns?: ColumnProps[];
  record?: Record;
  rowGroup?: Group;
  headerGroup?: Group;
  column: ColumnProps;
  renderer: (props: { colGroup: ColumnGroup; style?: CSSProperties }) => ReactNode;
  index?: number;
}

const AggregationTree: FunctionComponent<AggregationTreeProps> = function AggregationTree(props) {
  const { columns, groups, record, rowGroup, headerGroup, column, renderer, index = 0 } = props;
  const { tableStore, prefixCls, dataSet, aggregation: tableAggregation } = useContext(TableContext);
  const cellPrefix = `${prefixCls}-cell`;
  const columnGroups: ColumnGroup[] = useMemo(() => {
    if (groups) {
      return groups;
    }
    if (columns) {
      return new ColumnGroups(columns, tableStore).columns;
    }
    return [];
  }, [columns, groups]);
  const tableColumnOnCell = tableStore.getConfig('tableColumnOnCell');
  const getColumnsInnerNode = useCallback((columns: ColumnGroup[]) => {
    return columns.map((colGroup) => {
      const { hidden, column: col } = colGroup;
      const { hiddenInAggregation } = col;
      if (!hidden && !(typeof hiddenInAggregation === 'function' ? record ? hiddenInAggregation(record) : false : hiddenInAggregation)) {
        const { key: columnKey } = colGroup;
        const isBuiltInColumn = tableStore.isBuiltInColumn(col);
        const columnOnCell = !isBuiltInColumn && (col.onCell || tableColumnOnCell);
        const cellExternalProps: Partial<TreeNodeProps> =
          typeof columnOnCell === 'function' && record
            ? columnOnCell({
              dataSet,
              record,
              column: col,
            })
            : {};
        const header = getHeader({ ...col, dataSet, aggregation: tableAggregation, group: colGroup.headerGroup, groups: colGroup.headerGroups });
        const childColumns = colGroup.children;
        if (childColumns) {
          const { columns: colGroups } = childColumns;
          if (colGroups.length) {
            return (
              <Tree.TreeNode
                {...cellExternalProps}
                key={columnKey}
                title={header}
              >
                {getColumnsInnerNode(colGroups)}
              </Tree.TreeNode>
            );
          }
        }
        // 只有全局属性时候的样式可以继承给下级满足对td的样式能够一致表现
        const style = !isBuiltInColumn && tableColumnOnCell === columnOnCell && typeof tableColumnOnCell === 'function' ? omit(cellExternalProps.style, ['width', 'height']) : undefined;

        const innerNode = renderer({
          colGroup,
          style,
        });
        return (
          <Tree.TreeNode
            {...cellExternalProps}
            key={columnKey}
            title={
              <>
                <span className={`${cellPrefix}-label`}>{header}</span>
                {innerNode}
              </>
            }
          />
        );
      }
      return undefined;
    });
  }, [tableStore, record, dataSet, cellPrefix, renderer, tableColumnOnCell, tableAggregation]);
  const aggregationExpandKey = getColumnKey(column);
  const visibleChildren: ColumnGroup[] = columnGroups.filter(child => !child.hidden);
  const { length } = visibleChildren;
  if (length > 0) {
    const { aggregationLimit, aggregationDefaultExpandedKeys, aggregationDefaultExpandAll, aggregationLimitDefaultExpanded } = column;
    const hasExpand = index === 0 && length > aggregationLimit!;
    const expanded: boolean = hasExpand ? defaultTo(
      record ? tableStore.isAggregationCellExpanded(record, aggregationExpandKey) : headerGroup && headerGroup.getState(EXPAND_KEY),
      typeof aggregationLimitDefaultExpanded === 'function' ? record ? aggregationLimitDefaultExpanded(record) : false : aggregationLimitDefaultExpanded,
    ) || false : false;
    const nodes = hasExpand && !expanded ? visibleChildren.slice(0, aggregationLimit! - 1) : visibleChildren;
    return (
      <Tree
        prefixCls={`${cellPrefix}-tree`}
        virtual={false}
        focusable={false}
        selectable={false}
        defaultExpandedKeys={aggregationDefaultExpandedKeys}
        defaultExpandAll={aggregationDefaultExpandAll}
      >
        {
          getColumnsInnerNode(nodes)
        }
        {
          hasExpand && (
            <Tree.TreeNode
              key='expand-treenode'
              title={
                <AggregationButton
                  expanded={expanded}
                  record={record}
                  rowGroup={rowGroup}
                  headerGroup={headerGroup}
                  isColumnGroup={!(headerGroup || !column.__tableGroup)}
                  aggregationExpandKey={aggregationExpandKey}
                />
              }
            />
          )
        }
      </Tree>
    );
  }
  return null;
};

AggregationTree.displayName = 'AggregationTree';

const ObserverAggregationTree = observer(AggregationTree);

export default ObserverAggregationTree;

export function groupedAggregationTree(props: AggregationTreeProps): ReactElement<AggregationTreeProps>[] {
  const { groups, columns } = props;
  if (groups) {
    const treeGroups: ColumnGroup[][] = [];
    groups.forEach(group => {
      const { column: { aggregationTreeIndex = 0 } } = group;
      let treeGroup = treeGroups[aggregationTreeIndex];
      if (!treeGroup) {
        treeGroup = [];
        treeGroups[aggregationTreeIndex] = treeGroup;
      }
      treeGroup.push(group);
    });
    return treeGroups.reduce<ReactElement<AggregationTreeProps>[]>((trees, treeGroup, index) => treeGroup ? trees.concat(
      <ObserverAggregationTree
        key={String(index)}
        {...props}
        groups={treeGroup}
      />,
    ) : trees, []);
  }
  if (columns) {
    const treeColumns: ColumnProps[][] = [];
    columns.forEach(column => {
      const { aggregationTreeIndex = 0 } = column;
      let treeColumn = treeColumns[aggregationTreeIndex];
      if (!treeColumn) {
        treeColumn = [];
        treeColumns[aggregationTreeIndex] = treeColumn;
      }
      treeColumn.push(column);
    });
    return treeColumns.reduce<ReactElement<AggregationTreeProps>[]>((trees, treeColumn, index) => treeColumn ? trees.concat(
      <ObserverAggregationTree
        key={String(index)}
        {...props}
        columns={treeColumn}
        index={index}
      />,
    ) : trees, []);
  }
  return [];
}
