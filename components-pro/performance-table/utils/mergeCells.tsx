import * as React from 'react';
import isFunction from 'lodash/isFunction';
import groupBy from 'lodash/groupBy';
import get from 'lodash/get';
import ColumnGroup from '../ColumnGroup';
import HeaderCell, { HeaderCellProps } from '../HeaderCell';

import isNullOrUndefined from './isNullOrUndefined';

function cloneCell(Cell, props) {
  return React.cloneElement(Cell, props);
}

function mergeCells(cells, leftFixedLength: number = 0) {
  const nextCells: React.ReactElement[] = [];
  let columnGroupLeft: number = 0
  const mergeMaxCells: any = []
  let currentGroupName: string = ''
  let usedCells: string[] = [];
  let preWidth: number[] = [0];
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
      left: cellLeft,
    } = cells[i].props;

    if (usedCells.includes(cells[i].key)) {
      continue;
    }
    let groupChildrenStore: any = []
    const groupChildren: React.ReactElement<HeaderCellProps>[] = [];

    // fix(ColumnGroup): fix column cannot be sorted in ColumnGroup
    /**
     * 为列头添加分组
     */
    if (parent && isHeaderCell) {
      let nextWidth = width;
      let left = 0;
      let resizeLeft: number = 0;
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
          groupHeader: nextGroupHeader = currentGroupName,
          left: columnLeft,
          resizable,
          fixed,
          ...otherProps
        } = nextCell.props;
        if (j === 0) {
          currentGroupName = nextGroupHeader
          resizeLeft = columnLeft;
        }
        if (currentGroupName !== nextGroupHeader) {
          groupChildrenStore = [...groupChildren]
          i = i + j
          break;
        }

        if (j !== 0) {
          nextWidth += nextCellWidth;
          left += cells[i + j - 1].props.width;
          cells[i + j] = cloneCell(nextCell, { hidden: true });
        }
        let otherHeaderProps;
        if (resizable) {
          otherHeaderProps = {
            resizable,
            resizeLeft: resizeLeft,
            onColumnResizeEnd: otherProps.onColumnResizeEnd,
            onColumnResizeMove: otherProps.onColumnResizeMove,
            onColumnResizeStart: otherProps.onColumnResizeStart,
            onMouseEnterHandler: otherProps.onMouseEnterHandler,
            onMouseLeaveHandler: otherProps.onMouseLeaveHandler,
          }
        }
        groupChildren.push(
          <HeaderCell
            key={j}
            index={leftFixedLength + i + j}
            left={left}
            fixed={fixed}
            dataKey={dataKey}
            width={nextCellWidth}
            sortable={sortable}
            sortColumn={sortColumn}
            sortType={sortType}
            onSortColumn={onSortColumn}
            verticalAlign={verticalAlign}
            headerHeight={headerHeight / 2}
            {...otherHeaderProps}
          >
            {children}
          </HeaderCell>,
        );
        usedCells.push(nextCell.key)
      }
      if (groupHeader !== parent.props.header) {
        if (mergeMaxCells.length && parent.props.header !== mergeMaxCells[mergeMaxCells.length - 1].header) {
          columnGroupLeft = nextWidth
          preWidth = [0]
        } else {
          columnGroupLeft += nextWidth
        }
        mergeMaxCells.push({
          index: i,
          content: groupCount ? (
            <ColumnGroup
              left={preWidth[preWidth.length - 1]}
              width={nextWidth}
              header={groupHeader}
              verticalAlign={verticalAlign}
              headerHeight={(headerHeight / 3) * 2}
            >
              {groupChildren.map(x => React.cloneElement(x, { ...x.props, headerHeight: headerHeight / 3 }))}
            </ColumnGroup>) :
            React.cloneElement(cells[i], {
              left: preWidth[preWidth.length - 1],
              resizeLeft: cellLeft - preWidth[preWidth.length - 1],
              headerHeight: (headerHeight / 3) * 2
            }),
          ...parent.props,
          headerHeight,
          width: nextWidth,
        })
        preWidth.push(columnGroupLeft)
      } else if (groupChildrenStore.length) {
        columnGroupLeft += nextWidth
        preWidth.push(columnGroupLeft)
        groupChildrenStore.forEach((x) => {
          mergeMaxCells.push({
            index: i,
            content: React.cloneElement(x, { ...x.props, headerHeight: headerHeight * (2 / 3) }),
            ...parent.props,
            headerHeight,
            width: x.props.width,
          })
        });
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
                left={cellLeft}
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
      const { align, verticalAlign, headerHeight, header, fixed, index } = firstMerge
      nextCells.push(
        cloneCell(cells[index], {
          width,
          align,
          fixed,
          resizable: false,
          children: (
            <ColumnGroup
              width={width}
              headerHeight={headerHeight / 3 * 2}
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
