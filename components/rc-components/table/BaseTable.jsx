import React, { useContext } from 'react';
import { connect } from 'mini-store';
import ColGroup from './ColGroup';
import TableHeader from './TableHeader';
import TableFooter from './TableFooter';
import TableRow from './TableRow';
import ExpandableRow from './ExpandableRow';
import TableContext from './TableContext';

const BaseTable = function BaseTable(props) {
  const table = useContext(TableContext);
  const { components } = table;
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
  const { store, expander, tableClassName, hasHead, hasBody, hasFoot, fixed, columns, getRowKey, isAnyColumnsFixed } = props;
  const tableStyle = {};

  const handleRowHover = useContext((isHover, key) => {
    store.setState({
      currentHoverKey: isHover ? key : null,
    });
  }, [store]);

  const renderRows = (renderData, indent, ancestorKeys = []) => {
    const { columnManager } = table;

    const rows = [];

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
        leafColumns = columnManager.leafColumns();
      }

      const rowPrefixCls = `${prefixCls}-row`;

      const row = (
        <ExpandableRow
          {...expander.props}
          fixed={fixed}
          index={i}
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
              index={i}
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

  if (!fixed && scroll.x) {
    // not set width, then use content fixed width
    if (scroll.x === true) {
      tableStyle.tableLayout = 'fixed';
    } else {
      tableStyle.width = scroll.x;
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

  return (
    <Table className={tableClassName} style={tableStyle} key="table">
      <ColGroup columns={columns} fixed={fixed} />
      {hasHead && <TableHeader expander={expander} columns={columns} fixed={fixed} />}
      {body}
      {hasFoot && <TableFooter onHover={handleRowHover} columns={columns} fixed={fixed} />}
    </Table>
  );
};

BaseTable.displayName = 'RcBaseTable';

export default connect()(BaseTable);
