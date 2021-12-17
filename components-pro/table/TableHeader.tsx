import React, { DetailedHTMLProps, FunctionComponent, ReactElement, ThHTMLAttributes, useCallback, useContext, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { ElementProps } from '../core/ViewComponent';
import TableHeaderCell, { TableHeaderCellProps } from './TableHeaderCell';
import TableContext from './TableContext';
import { ColumnLock } from './enum';
import { getTableHeaderRows, isStickySupport } from './utils';
import ColumnGroup from './ColumnGroup';
import TableHeaderRow, { TableHeaderRowProps } from './TableHeaderRow';

export interface TableHeaderProps extends ElementProps {
  lock?: ColumnLock;
}

const TableHeader: FunctionComponent<TableHeaderProps> = function TableHeader(props) {
  const { lock } = props;
  const {
    prefixCls, border, tableStore,
  } = useContext(TableContext);
  const { columnResizable, columnResizing, columnGroups } = tableStore;
  const { columns } = columnGroups;

  const headerRows: ColumnGroup[][] = getTableHeaderRows(lock ? columns.filter((group) => group.lock === lock) : columns);
  const [isHeaderHover, setIsHeaderHover] = useState<boolean | undefined>();
  const nodeRef = useRef<HTMLTableSectionElement | null>(null);

  const getHeaderNode = useCallback(() => {
    return nodeRef.current;
  }, [nodeRef]);

  const handleTheadMouseEnter = useCallback(() => {
    setIsHeaderHover(true);
  }, []);

  const handleTheadMouseLeave = useCallback(() => {
    setIsHeaderHover(false);
  }, []);

  const getTrs = (): (ReactElement<TableHeaderRowProps> | undefined)[] => {
    return headerRows.map<ReactElement<TableHeaderRowProps> | undefined>((row, rowIndex) => {
      const { length } = row;
      const rowKey = String(rowIndex);
      if (length) {
        const notLockLeft = lock !== ColumnLock.left;
        const lastColumnClassName = notLockLeft ? `${prefixCls}-cell-last` : undefined;
        const hasPlaceholder = tableStore.overflowY && rowIndex === 0 && notLockLeft;
        const tds = row.map((col, index) => {
          if (!col.hidden) {
            const { key, rowSpan, colSpan, children } = col;
            const cellProps: TableHeaderCellProps = {
              key,
              columnGroup: col,
              getHeaderNode,
              rowIndex,
            };
            if (notLockLeft && !hasPlaceholder && index === length - 1 && columnGroups.lastLeaf === col.lastLeaf) {
              cellProps.className = lastColumnClassName;
            }
            if (rowSpan > 1 || children) {
              cellProps.rowSpan = rowSpan;
            }
            if (colSpan > 1 || children) {
              cellProps.colSpan = colSpan;
            }
            return (
              <TableHeaderCell {...cellProps} scope={children ? 'colgroup' : 'col'} />
            );
          }
          return undefined;
        });
        if (hasPlaceholder) {
          const placeHolderProps: DetailedHTMLProps<ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement> = {
            key: 'fixed-column',
            rowSpan: headerRows.length,
          };
          const classList = [`${prefixCls}-cell`, lastColumnClassName];
          if (isStickySupport() && tableStore.overflowX) {
            placeHolderProps.style = tableStore.isAnyColumnsRightLock ? { right: 0 } : {};
            classList.push(`${prefixCls}-cell-fix-right`);
          }
          placeHolderProps.className = classList.join(' ');
          tds.push(
            <th
              {...placeHolderProps}
            >
              &nbsp;
            </th>,
          );
        }
        return (
          <TableHeaderRow
            key={rowKey}
            rowIndex={rowIndex}
            rows={headerRows}
            lock={lock}
          >
            {tds}
          </TableHeaderRow>
        );
      }
      return <tr key={rowKey} />;
    });
  };
  const theadProps: DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement> = {
    ref: nodeRef,
    className: classNames(`${prefixCls}-thead`, {
      [`${prefixCls}-column-resizing`]: columnResizing,
      [`${prefixCls}-column-resizable`]: columnResizable,
      [`${prefixCls}-thead-hover`]: isHeaderHover || columnResizing,
    }),
  };
  if (!isStickySupport() && !border && tableStore.overflowX) {
    theadProps.onMouseEnter = handleTheadMouseEnter;
    theadProps.onMouseLeave = handleTheadMouseLeave;
  }
  return (
    <thead {...theadProps}>
      {getTrs()}
    </thead>
  );
};

TableHeader.displayName = 'TableHeader';

export default observer(TableHeader);
