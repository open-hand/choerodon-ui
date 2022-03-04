import React, { useContext } from 'react';
import measureScrollbar from '../../_util/measureScrollbar';
import BaseTable from './BaseTable';
import TableContext from './TableContext';

export default function FootTable(props) {
  const table = useContext(TableContext);
  const { prefixCls, scroll, showHeader } = table.props;
  const { columns, fixed, tableClassName, handleBodyScrollLeft, expander } = props;
  const { saveRef, columnManager } = table;
  let { useFixedHeader } = table.props;
  const footStyle = {};

  if (scroll.y) {
    useFixedHeader = true;
    // Add negative margin bottom for scroll bar overflow bug
    const scrollbarWidth = measureScrollbar('horizontal');
    if (scrollbarWidth > 0 && !fixed) {
      footStyle.marginBottom = `-${scrollbarWidth}px`;
      footStyle.paddingBottom = '0px';
    }
  }

  if (!useFixedHeader || !showHeader || !columnManager.hasFooter()) {
    return null;
  }

  return (
    <div
      key="footTable"
      ref={fixed ? null : saveRef('footTable')}
      className={`${prefixCls}-column-footer`}
      style={footStyle}
      onScroll={handleBodyScrollLeft}
    >
      <BaseTable
        tableClassName={tableClassName}
        hasHead={false}
        hasBody={false}
        hasFoot
        fixed={fixed}
        columns={columns}
        expander={expander}
      />
    </div>
  );
}
