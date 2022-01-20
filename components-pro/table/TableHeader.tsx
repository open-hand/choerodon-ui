import React, { cloneElement, DetailedHTMLProps, FunctionComponent, isValidElement, ReactElement, ThHTMLAttributes, useCallback, useContext, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import isObject from 'lodash/isObject';
import classNames from 'classnames';
import { ElementProps } from '../core/ViewComponent';
import TableHeaderCell, { TableHeaderCellProps } from './TableHeaderCell';
import TableContext from './TableContext';
import { ColumnLock } from './enum';
import { getEditorByField, getTableHeaderRows, isStickySupport } from './utils';
import ColumnGroup from './ColumnGroup';
import TableHeaderRow, { TableHeaderRowProps } from './TableHeaderRow';
import ExpandIcon from './ExpandIcon';

export interface TableHeaderProps extends ElementProps {
  lock?: ColumnLock;
}

const TableHeader: FunctionComponent<TableHeaderProps> = function TableHeader(props) {
  const { lock } = props;
  const { prefixCls, border, tableStore, dataSet } = useContext(TableContext);
  const { columnResizable, columnResizing, columnGroups, comboBarStatus } = tableStore;
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
              <TableHeaderCell {...cellProps} scope={children ? 'colgroup' : 'col'}>
                {rowIndex === headerRows.length - 1 && hasExpandIcon(index) ? renderExpandIcon() : undefined}
              </TableHeaderCell>
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

  const getQueryFields = (extraStyle) => {
    const { queryFields } = dataSet.props
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
              })
              : cloneElement(getEditorByField(field), {
                placeholder: field.get('label'),
                ...props,
                style: {
                  ...props.style || {},
                  ...extraStyle,
                },
                ...(isObject(element) ? element : {}),
              }),
          );
        }
        return list;
      }, result);
    }
    return result;
  }

  const getInlineSearchTr = () => {
    const notRenderThKey = ['__selection-column__', '__combo-column__'];
    const fieldsComponent = getQueryFields({ width: 'calc(100% - 1px)' });
    const lastthCls = classNames(`${prefixCls}-thead-inline-search`, `${prefixCls}-thead-inline-search-last`)
    const notLockLeft = lock !== ColumnLock.left;

    return headerRows.map<ReactElement<TableHeaderRowProps> | undefined>((row, rowIndex) => {
      const { length } = row;
      const rowKey = String(rowIndex);
      const hasPlaceholder = tableStore.overflowY && rowIndex === 0 && notLockLeft;
      if (length) {
        const tds = row.map((col) => {
          if (!col.hidden) {
            const { key } = col;
            return (
              <th key={key} className={`${prefixCls}-thead-inline-search`}>
                {!notRenderThKey.includes(String(key)) && fieldsComponent.find(field => field.key === key)}
              </th>
            )
          }
          return undefined;
        })
        if (hasPlaceholder) {
          tds.push(<th className={lastthCls}>&nbsp;</th>)
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
  }
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
      {comboBarStatus && getInlineSearchTr()}
    </thead>
  );
};

TableHeader.displayName = 'TableHeader';

export default observer(TableHeader);
