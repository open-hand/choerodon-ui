import React, { useContext } from 'react';
import measureScrollbar from '../../_util/measureScrollbar';
import BaseTable from './BaseTable';
import TableContext from './TableContext';

export default function HeadTable(props) {
  const table = useContext(TableContext);
  const { prefixCls, scroll, showHeader } = table.props;
  const { columns, fixed, tableClassName, handleBodyScrollLeft, expander } = props;
  const { saveRef } = table;
  let { useFixedHeader } = table.props;
  const headStyle = {};

  if (scroll.y) {
    useFixedHeader = true;
    // Add negative margin bottom for scroll bar overflow bug
    // const scrollbarWidth = measureScrollbar('horizontal');
    // if (scrollbarWidth > 0 && !fixed) {
    if (!fixed) {
      headStyle.marginBottom = 0;
      headStyle.paddingBottom = 0;
      headStyle.overflow = 'hidden';
    }
  }

  if (!useFixedHeader || !showHeader) {
    return null;
  }

  return (
    <div
      key="headTable"
      ref={fixed ? null : saveRef('headTable')}
      className={`${prefixCls}-header`}
      style={headStyle}
      onScroll={handleBodyScrollLeft}
    >
      <BaseTable
        tableClassName={tableClassName}
        hasHead
        hasBody={false}
        hasFoot={false}
        fixed={fixed}
        columns={columns}
        expander={expander}
      />
    </div>
  );
}

HeadTable.displayName = 'RcHeadTable';
