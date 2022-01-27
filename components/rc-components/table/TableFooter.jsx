import React, { useContext } from 'react';
import TableFooterRow from './TableFooterRow';
import TableContext from './TableContext';

function appendExpandIconColumn(columns) {
  const expandIconCol = {
    key: 'expand-icon-placeholder',
    render: () => null,
  };
  return [expandIconCol, ...columns];
}

export default function TableFooter(props) {
  const table = useContext(TableContext);
  const { columnManager, components } = table;
  const { prefixCls, data, expandIconAsCell } = table.props;
  const { fixed, onHover } = props;

  let leafColumns;
  if (fixed === 'left') {
    leafColumns = columnManager.leftLeafColumns();
    if (expandIconAsCell) {
      leafColumns = appendExpandIconColumn(leafColumns);
    }
  } else if (fixed === 'right') {
    leafColumns = columnManager.rightLeafColumns();
  } else {
    leafColumns = columnManager.leafColumns();
    if (expandIconAsCell) {
      leafColumns = appendExpandIconColumn(leafColumns);
    }
  }

  const FooterWrapper = components.footer.wrapper;

  return (
    <FooterWrapper className={`${prefixCls}-tfoot`}>
      <TableFooterRow
        prefixCls={prefixCls}
        columns={leafColumns}
        components={components}
        fixed={fixed}
        data={data}
        onHover={columnManager.isAnyColumnsFixed() ? onHover : null}
      />
    </FooterWrapper>
  );
}

TableFooter.displayName = 'RcTableFooter';
