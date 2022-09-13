import React, { useCallback, useContext } from 'react';
import { connect } from 'mini-store';
import classNames from 'classnames';
import isNumber from 'lodash/isNumber';
import ColGroup from './ColGroup';
import TableHeader from './TableHeader';
import TableFooter from './TableFooter';
import TableRow from './TableRow';
import ExpandableRow from './ExpandableRow';
import TableContext from './TableContext';
import measureScrollbar from '../../_util/measureScrollbar';
import isStickySupport from '../../_util/isStickySupport';
import { columnWidth } from './utils';

const BaseTable = function BaseTable(props) {
  const table = useContext(TableContext);
  const { columnManager, components } = table;
  const {
    prefixCls,
    scroll,
    data,
    getBodyWrapper,
    childrenColumnName,
    rowClassName,
    rowRef,
    onRowClick,
    onRowDoubleClick,
    onRowContextMenu,
    onRowMouseEnter,
    onRowMouseLeave,
    onRow,
  } = table.props;
  const { store, expander, tableClassName, hasHead, hasBody, hasFoot, fixed, getRowKey, isAnyColumnsFixed } = props;
  const tableStyle = {};

  const getColumns = (cols = props.columns || [], isBody) => {
    const sticky = {
      stickyLeft: 0,
      stickyRight: !isBody && scroll && scroll.y ? measureScrollbar() : 0,
    };
    if (isStickySupport()) {
      sticky.stickyRight = cols.reduce((right, col) => {
        if (col.fixed === 'right') {
          return right + columnWidth(col);
        }
        return right;
      }, sticky.stickyRight);
    }
    return cols.map(column => {
      const newColumn = {
        ...column,
        className:
          !!column.fixed && !fixed
            ? classNames(isStickySupport() ? `${prefixCls}-sticky-column` : `${prefixCls}-fixed-columns-in-body`, column.className)
            : column.className,
      };
      if (isStickySupport()) {
        if (column.fixed === 'right') {
          sticky.stickyRight -= columnWidth(column);
          newColumn.style = {
            ...newColumn.style,
            right: sticky.stickyRight,
          };
        } else if (column.fixed) {
          newColumn.style = {
            ...newColumn.style,
            left: sticky.stickyLeft,
          };
          sticky.stickyLeft += columnWidth(column);
        }
      }
      return newColumn;
    });
  };

  const handleRowHover = useCallback((isHover, key) => {
    store.setState({
      currentHoverKey: isHover ? key : null,
    });
  }, [store]);

  const renderRows = (renderData, indent, rows = [], ancestorKeys = []) => {
    for (let i = 0; i < renderData.length; i++) {
      const record = renderData[i];
      const key = getRowKey(record, i);
      const className = typeof rowClassName === 'string'
        ? rowClassName
        : rowClassName(record, i, indent);

      const onHoverProps = {};
      if (columnManager.isAnyColumnsFixed()) {
        onHoverProps.onHover = handleRowHover;
      }

      let leafColumns;
      if (fixed === 'left') {
        leafColumns = columnManager.leftLeafColumns();
      } else if (fixed === 'right') {
        leafColumns = columnManager.rightLeafColumns();
      } else {
        leafColumns = getColumns(columnManager.leafColumns(), true);
      }

      const rowPrefixCls = `${prefixCls}-row`;
      const rowIndex = rows.filter(row => !row.props.expandedRow).length;

      const row = (
        <ExpandableRow
          {...expander.props}
          fixed={fixed}
          index={rowIndex}
          prefixCls={rowPrefixCls}
          record={record}
          key={key}
          rowKey={key}
          onRowClick={onRowClick}
          needIndentSpaced={expander.needIndentSpaced}
          onExpandedChange={expander.handleExpandChange}
        >
          {(expandableRow) => ( // eslint-disable-line
            <TableRow
              fixed={fixed}
              indent={indent}
              className={className}
              record={record}
              index={rowIndex}
              prefixCls={rowPrefixCls}
              childrenColumnName={childrenColumnName}
              columns={leafColumns}
              onRow={onRow}
              onRowDoubleClick={onRowDoubleClick}
              onRowContextMenu={onRowContextMenu}
              onRowMouseEnter={onRowMouseEnter}
              onRowMouseLeave={onRowMouseLeave}
              {...onHoverProps}
              rowKey={key}
              ancestorKeys={ancestorKeys}
              ref={rowRef(record, i, indent)}
              components={components}
              isAnyColumnsFixed={isAnyColumnsFixed}
              {...expandableRow}
            />
          )}
        </ExpandableRow>
      );

      rows.push(row);

      expander.renderRows(
        renderRows,
        rows,
        record,
        i,
        indent,
        fixed,
        key,
        ancestorKeys,
      );
    }
    return rows;
  };
  const placeholder = hasHead && !hasBody && scroll.y && fixed !== 'left';
  if (!fixed && scroll.x) {
    // not set width, then use content fixed width
    if (scroll.x === true) {
      tableStyle.tableLayout = 'fixed';
    } else {
      if (placeholder && isNumber(scroll.x)) {
        tableStyle.width = scroll.x + measureScrollbar() + 1;
      } else {
        tableStyle.width = scroll.x;
      }
    }
  }

  const Table = hasBody ? components.table : 'table';
  const BodyWrapper = components.body.wrapper;

  let body;
  if (hasBody) {
    body = (
      <BodyWrapper className={`${prefixCls}-tbody`}>
        {renderRows(data, 0)}
      </BodyWrapper>
    );
    if (getBodyWrapper) {
      body = getBodyWrapper(body);
    }
  }

  const columns = getColumns();
  return (
    <Table className={tableClassName} style={tableStyle} key="table">
      <ColGroup columns={columns} fixed={fixed} placeholder={placeholder} />
      {hasHead && <TableHeader expander={expander} columns={columns} fixed={fixed} placeholder={placeholder} />}
      {body}
      {hasFoot && <TableFooter onHover={handleRowHover} columns={columns} fixed={fixed} />}
    </Table>
  );
};

export default connect()(BaseTable);
