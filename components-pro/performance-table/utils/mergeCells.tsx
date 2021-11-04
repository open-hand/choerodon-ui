import * as React from 'react';
import isFunction from 'lodash/isFunction';
import groupBy from 'lodash/groupBy'
import get from 'lodash/get';
import ColumnGroup from '../ColumnGroup';
import HeaderCell from '../HeaderCell';
import { HeaderCellProps } from '../HeaderCell.d';

import isNullOrUndefined from './isNullOrUndefined';

function cloneCell(Cell, props) {
  return React.cloneElement(Cell, props);
}

function mergeCells(cells) {
  const nextCells: React.ReactElement[] = [];
  let columnGroupLeft: number = 0
  const mergeMaxCells: any = []
  let currentGroupName: string = ''
  for (let i = 0; i < cells.length; i += 1) {
    const {
      width,
      colSpan,
      groupCount,
      groupHeader,
      isHeaderCell,
      headerHeight,
      verticalAlign,
      parent,
    } = cells[i].props;

    const groupChildren: React.ReactElement<HeaderCellProps>[] = [];

    // fix(ColumnGroup): fix column cannot be sorted in ColumnGroup
    /**
     * 为列头添加分组
     */
    if (groupCount && isHeaderCell) {
      let nextWidth = width;
      let left = 0;
      for (let j = 0; j < groupCount; j += 1) {
        const nextCell = cells[i + j];
        const {
          width: nextCellWidth,
          sortable,
          children,
          dataKey,
          onSortColumn,
          sortColumn,
          sortType,
          headerHeight,
        } = nextCell.props;

        if (j !== 0) {
          nextWidth += nextCellWidth;
          left += cells[i + j - 1].props.width;
          cells[i + j] = cloneCell(nextCell, { hidden: true });
        }
        groupChildren.push(
          <HeaderCell
            key={j}
            left={left}
            dataKey={dataKey}
            width={nextCellWidth}
            sortable={sortable}
            sortColumn={sortColumn}
            sortType={sortType}
            onSortColumn={onSortColumn}
            headerHeight={headerHeight}
          >
            {children}
          </HeaderCell>,
        );
      }
      if (parent) {
        const isSomeGroup = currentGroupName === parent.props.header
        mergeMaxCells.push({
          index: i,
          content: (<ColumnGroup
            left={!isSomeGroup ? 0 : columnGroupLeft}
            width={nextWidth}
            header={groupHeader}
            verticalAlign={verticalAlign}
          >
            {groupChildren}
          </ColumnGroup>),
          ...parent.props,
          headerHeight: ((headerHeight / 3) * 2),
          width: nextWidth,
        })
        // 区分不同的组名
        if (!isSomeGroup) {
          columnGroupLeft = nextWidth
          currentGroupName = parent.props.header
        } else {
          columnGroupLeft += nextWidth
        }
      } else {
        nextCells.push(
          cloneCell(cells[i], {
            width: nextWidth,
            children: (
              <ColumnGroup
                width={nextWidth}
                headerHeight={headerHeight}
                header={groupHeader}
                verticalAlign={verticalAlign}
              >
                {groupChildren}
              </ColumnGroup>
            ),
          }),
        );
      }

      continue;
    } else if (colSpan) {
      /**
       * 如果存在 colSpan 属性，就去找它的下一个 Cell,
       * 看看值是否是 isNullOrUndefined，，如果为空这可以合并这个单元格
       */
      let nextWidth = width;
      for (let j = 0; j < colSpan; j += 1) {
        const nextCell = cells[i + j];
        if (nextCell) {
          const {
            rowData,
            rowIndex,
            children,
            width: colSpanWidth,
            isHeaderCell,
            dataKey,
          } = nextCell.props;

          const cellText = isFunction(children)
            ? children(rowData, rowIndex)
            : get(rowData, dataKey);

          if (
            (rowData && isNullOrUndefined(cellText)) ||
            (isHeaderCell && isNullOrUndefined(children))
          ) {
            nextWidth += colSpanWidth;
            cells[i + j] = cloneCell(nextCell, {
              hidden: true,
            });
          }
        }
      }

      nextCells.push(
        cloneCell(cells[i], {
          width: nextWidth,
          //  Fix this use of the variablecolSpan always evaluates to true
          'aria-colspan': nextWidth > width ? colSpan : undefined,
        }),
      );
      continue;
    }
    nextCells.push(cells[i]);
  }

  if (mergeMaxCells.length) {
    const groupByHeader = groupBy(mergeMaxCells, 'header')
    for (let key in groupByHeader) {
      const mapGroup = groupByHeader[key]
      const firstMerge = mapGroup[0]
      const width = mapGroup.reduce((total, col) => total += col.width, 0)
      const { align, verticalAlign, headerHeight, header, fixed } = firstMerge
      nextCells.push(
        cloneCell(cells[firstMerge.index], {
          width,
          align,
          fixed,
          children: (
            <ColumnGroup
              width={width}
              headerHeight={headerHeight}
              header={header}
              verticalAlign={verticalAlign}
            >
              {mapGroup.map(x => x.content)}
            </ColumnGroup>
          ),
        }),
      );
    }

  }
  return nextCells;
}

export default mergeCells;
