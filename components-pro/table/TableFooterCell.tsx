import React, { CSSProperties, FunctionComponent, ReactElement, ReactNode, useContext, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import omit from 'lodash/omit';
import classNames from 'classnames';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import TableContext from './TableContext';
import { ElementProps } from '../core/ViewComponent';
import { getColumnLock, isStickySupport } from './utils';
import { ColumnAlign, ColumnLock } from './enum';
import ColumnGroup from './ColumnGroup';
import { FooterHookOptions } from './Column';
import TableCellInner from './TableCellInner';
import { AggregationTreeProps, groupedAggregationTree } from './AggregationTree';

export interface TableFooterCellProps extends ElementProps {
  columnGroup: ColumnGroup;
  colSpan?: number;
  right: number;
}

const TableFooterCell: FunctionComponent<TableFooterCellProps> = function TableFooterCell(props) {
  const { columnGroup, style, className, colSpan, right } = props;
  const { rowHeight, dataSet, prefixCls, tableStore } = useContext(TableContext);
  const { column } = columnGroup;
  const { autoFootHeight, footerRowHeight, aggregation } = tableStore;
  const { footer, footerClassName, footerStyle = {}, align, name, command, lock } = column;
  const columnLock = isStickySupport() && tableStore.overflowX && getColumnLock(lock);
  const classString = classNames(`${prefixCls}-cell`, {
    [`${prefixCls}-cell-fix-${columnLock}`]: columnLock,
    [`${prefixCls}-cell-no-transition`]: !tableStore.tableColumnResizeTransition,
  }, className, footerClassName);
  const innerClassNames = [`${prefixCls}-cell-inner`];
  const innerProps: any = {};
  if (!autoFootHeight) {
    const $rowHeight = footerRowHeight === undefined ? rowHeight : footerRowHeight;
    if ($rowHeight !== 'auto') {
      innerProps.style = {
        height: pxToRem($rowHeight),
      };
      innerClassNames.push(`${prefixCls}-cell-inner-row-height-fixed`);
    }
  }
  const cellStyle: CSSProperties = {
    textAlign: align || (command ? ColumnAlign.center : tableStore.getConfig('tableColumnAlign')(column, dataSet.getField(name))),
    ...footerStyle,
    ...style,
  };
  const aggregationTree = useMemo((): ReactElement<AggregationTreeProps>[] | undefined => {
    if (aggregation) {
      const { column: $column, headerGroup } = columnGroup;
      if (headerGroup) {
        const { tableGroup } = columnGroup;
        if (tableGroup) {
          const { columnProps } = tableGroup;
          const { totalRecords } = headerGroup;
          if (columnProps && totalRecords.length) {
            const { children } = columnProps;
            if (children && children.length) {
              const renderer = ({ colGroup, style }) => {
                return (
                  <TableCellInner
                    record={totalRecords[0]}
                    column={colGroup.column}
                    style={style}
                    inAggregation
                  />
                );
              };
              return groupedAggregationTree({
                columns: children,
                headerGroup,
                column: { ...$column, ...columnProps },
                renderer,
              });
            }
          }
        }
      }
    }
  }, [columnGroup, aggregation]);

  if (columnLock) {
    if (columnLock === ColumnLock.left) {
      cellStyle.left = pxToRem(columnGroup.left, true)!;
    } else if (columnLock === ColumnLock.right) {
      cellStyle.right = pxToRem(colSpan && colSpan > 1 ? right : columnGroup.right + right, true)!;
    }
  }
  const getFooter = (): ReactNode => {
    switch (typeof footer) {
      case 'function': {
        const footerHookOptions: FooterHookOptions = {
          dataSet,
          name,
          aggregationTree,
        };
        try {
          return footer(footerHookOptions);
        } catch (e) {
          return footer(dataSet, name);
        }
      }
      case 'string':
        return <span>{footer}</span>;
      default:
        return footer;
    }
  };
  return (
    <th className={classString} style={omit(cellStyle, ['width', 'height'])} colSpan={colSpan} scope="col">
      <div {...innerProps} className={innerClassNames.join(' ')}>{getFooter()}</div>
    </th>
  );
};

TableFooterCell.displayName = 'TableFooterCell';

export default observer(TableFooterCell);
