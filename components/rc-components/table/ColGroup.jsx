import React, { useContext } from 'react';
import measureScrollbar from '../../_util/measureScrollbar';
import TableContext from './TableContext';

export default function ColGroup(props) {
  const table = useContext(TableContext);
  const { prefixCls, expandIconAsCell } = table.props;
  const { fixed, placeholder } = props;

  const expandCol = expandIconAsCell && fixed !== 'right' ? (
    <col
      className={`${prefixCls}-expand-icon-col`}
      key="rc-table-expand-icon-col"
    />
  ) : null;

  let leafColumns;

  if (fixed === 'left') {
    leafColumns = table.columnManager.leftLeafColumns();
  } else if (fixed === 'right') {
    leafColumns = table.columnManager.rightLeafColumns();
  } else {
    leafColumns = table.columnManager.leafColumns();
  }
  const cols = leafColumns.map(c => {
    return (
      <col
        key={c.key || c.dataIndex}
        style={{ width: c.width, minWidth: c.minWidth || c.width }}
      />
    );
  });

  return (
    <colgroup>
      {expandCol}
      {cols}
      {placeholder && <col style={{ width: measureScrollbar() }} />}
    </colgroup>
  );
}
