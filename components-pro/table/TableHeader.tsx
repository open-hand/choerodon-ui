import React, {
  cloneElement, CSSProperties,
  DetailedHTMLProps,
  FunctionComponent,
  isValidElement,
  ReactElement,
  ThHTMLAttributes,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { observer } from 'mobx-react-lite';
import isObject from 'lodash/isObject';
import classNames from 'classnames';
import { ElementProps } from '../core/ViewComponent';
import TableHeaderCell, { TableHeaderCellProps } from './TableHeaderCell';
import TableVirtualHeaderCell from './TableVirtualHeaderCell';
import TableContext from './TableContext';
import { ColumnLock } from './enum';
import { getEditorByField, getTableHeaderRows, isStickySupport } from './utils';
import ColumnGroup from './ColumnGroup';
import TableHeaderRow, { TableHeaderRowProps } from './TableHeaderRow';
import ExpandIcon from './ExpandIcon';

export interface TableHeaderProps extends ElementProps {
  queryFields?: { [key: string]: ReactElement<any> };
  lock?: ColumnLock;
}

const TableHeader: FunctionComponent<TableHeaderProps> = function TableHeader(props) {
  const { lock, queryFields } = props;
  const { prefixCls, border, tableStore, dataSet, fullColumnWidth } = useContext(TableContext);
  const { columnResizable, columnResizing, columnGroups, comboBarStatus, rowHeight, isRenderRange } = tableStore;
  const { columns } = columnGroups;
  const needIntersection = tableStore.isFixedRowHeight && tableStore.virtual && tableStore.overflowX;
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

  const isExpanded = tableStore.isBodyExpanded;
  const handleExpandChange = useCallback(() => {
    tableStore.setBodyExpanded(!isExpanded);
  }, [tableStore, isExpanded]);
  const renderExpandIcon = () => {
    const record = dataSet.get(0);
    if (record) {
      const { expandIcon } = tableStore;
      if (typeof expandIcon === 'function') {
        return expandIcon({
          prefixCls,
          expanded: isExpanded,
          expandable: true,
          needIndentSpaced: false,
          onExpand: handleExpandChange,
          record,
        });
      }
      return (
        <ExpandIcon
          prefixCls={prefixCls}
          expandable
          onChange={handleExpandChange}
          expanded={isExpanded}
        />
      );
    }
  };
  const expandIconColumnIndex = tableStore.props.bodyExpandable ? (lock === ColumnLock.right ? columnGroups.leafs.filter(group => group.column.lock !== ColumnLock.right).length : 0) : -1;
  const hasExpandIcon = (columnIndex: number) => (
    expandIconColumnIndex > -1 && (columnIndex + expandIconColumnIndex) === tableStore.expandIconColumnIndex
  );

  const getTrs = (isSearchTr?: boolean): (ReactElement<TableHeaderRowProps> | undefined)[] => {
    const notRenderThKey = ['__selection-column__', '__combo-column__'];
    return headerRows.map<ReactElement<TableHeaderRowProps> | undefined>((row, rowIndex) => {
      const { length } = row;
      const rowKey = String(rowIndex);
      if (length) {
        const notLockLeft = lock !== ColumnLock.left;
        const lastColumnClassName = notLockLeft ? `${prefixCls}-cell-last` : undefined;
        const hasPlaceholder = tableStore.overflowY && rowIndex === 0 && notLockLeft;
        const useEmptyColumn = !fullColumnWidth && rowIndex === 0 && notLockLeft && !tableStore.overflowX && !tableStore.hasEmptyWidthColumn;
        const tds = row.map((col, index) => {
          if (!col.hidden) {
            const { key, rowSpan, colSpan, children } = col;
            const cellProps: TableHeaderCellProps = {
              key,
              columnGroup: col,
              getHeaderNode,
              rowIndex,
              isSearchCell: isSearchTr,
              scope: children ? 'colgroup' : 'col',
              isRenderCell: isRenderRange(index, headerRows.length > 1),
            };
            if (!useEmptyColumn && notLockLeft && !hasPlaceholder && index === length - 1 && columnGroups.lastLeaf === col.lastLeaf) {
              cellProps.className = lastColumnClassName;
            }
            if (isSearchTr) {
              cellProps.className = `${cellProps.className} ${prefixCls}-thead-inline-search`;
            }
            if (rowSpan > 1 || children) {
              cellProps.rowSpan = rowSpan;
            }
            if (colSpan > 1 || children) {
              cellProps.colSpan = colSpan;
            }
            const icon =
              !isSearchTr ?
                (rowIndex === headerRows.length - 1 && hasExpandIcon(index) ? renderExpandIcon() : undefined) :
                (!notRenderThKey.includes(String(key)) && getQueryFields({ width: '100%' }).find(field => field.key === key));
            if (needIntersection) {
              return (
                <TableVirtualHeaderCell {...cellProps}>
                  {icon}
                </TableVirtualHeaderCell>
              );
            }
            return (
              <TableHeaderCell {...cellProps}>
                {icon}
              </TableHeaderCell>
            );
          }
          return undefined;
        });
        if (useEmptyColumn) {
          tds.push(
            <th
              key="empty-column"
              className={`${prefixCls}-cell ${lastColumnClassName}`}
              rowSpan={headerRows.length}
              style={{ lineHeight: 1 }}
            />,
          );
        }
        if (hasPlaceholder) {
          const placeHolderProps: DetailedHTMLProps<ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement> & { style: CSSProperties } = {
            key: 'fixed-column',
            rowSpan: headerRows.length,
            style: {
              lineHeight: 1,
            },
          };
          const classList = [`${prefixCls}-cell`, lastColumnClassName];
          if (isStickySupport() && tableStore.overflowX) {
            if (tableStore.isAnyColumnsRightLock) {
              placeHolderProps.style.right = 0;
            }
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

  const getQueryFields = (extraStyle) => {
    const { queryDataSet } = dataSet;
    const result: ReactElement<any>[] = [];
    if (queryDataSet) {
      const { fields } = queryDataSet;
      return [...fields.entries()].reduce((list, [name, field]) => {
        if (!field.get('bind')) {
          const props: any = {
            key: name,
            name,
            dataSet: queryDataSet,
          };
          const element = queryFields![name];
          list.push(
            isValidElement(element)
              ? cloneElement(element, {
                placeholder: field.get('label'),
                ...props,
                style: { height: rowHeight },
              })
              : cloneElement(getEditorByField(field), {
                placeholder: field.get('label'),
                ...props,
                style: {
                  ...props.style || {},
                  ...extraStyle,
                  height: rowHeight,
                },
                ...(isObject(element) ? element : {}),
              }),
          );
        }
        return list;
      }, result);
    }
    return result;
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
      {comboBarStatus && getTrs(true)}
    </thead>
  );
};

TableHeader.displayName = 'TableHeader';

export default observer(TableHeader);
