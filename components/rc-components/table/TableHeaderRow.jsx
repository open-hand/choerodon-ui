import React from 'react';
import { connect } from 'mini-store';
import isStickySupport from '../../_util/isStickySupport';

function TableHeaderRow({ prefixCls, fixed, row, index, height, components, onHeaderRow, placeholder, rows }) {
  const HeaderRow = components.header.row;
  const HeaderCell = components.header.cell;
  const rowProps = onHeaderRow(row.map(cell => cell.column), index);
  const customStyle = rowProps ? rowProps.style : {};
  const style = { height, ...customStyle };

  return (
    <HeaderRow {...rowProps} style={style}>
      {row.map((cell, i) => {
        const { column, ...cellProps } = cell;
        const customProps = column.onHeaderCell ? column.onHeaderCell(column) : {};
        if (column.width) {
          const addStyle = {
            minWidth: column.width,
            width: column.width,
            maxWidth: column.width,
          };
          customProps.style = { ...customProps.style, ...addStyle };
        }
        if (column.align) {
          customProps.style = { ...customProps.style, textAlign: column.align };
        }
        return (
          <HeaderCell
            {...cellProps}
            {...customProps}
            style={{ ...column.style, ...customProps.style }}
            key={column.key || column.dataIndex || i}
          />
        );
      })}
      {
        placeholder && (
          <th
            className={fixed || !isStickySupport() ? undefined : `${prefixCls}-sticky-column`}
            rowSpan={rows.length}
            style={{ fontSize: 0, padding: 0, right: 0 }}
          >&nbsp;</th>
        )
      }
    </HeaderRow>
  );
}

function getRowHeight(state, props) {
  const { fixedColumnsHeadRowsHeight } = state;
  const { columns, rows, fixed } = props;
  const headerHeight = fixedColumnsHeadRowsHeight[0];

  if (!fixed) {
    return null;
  }

  if (headerHeight && columns) {
    if (headerHeight === 'auto') {
      return 'auto';
    }
    return headerHeight / rows.length;
  }
  return null;
}

export default connect((state, props) => {
  return {
    height: getRowHeight(state, props),
  };
})(TableHeaderRow);
