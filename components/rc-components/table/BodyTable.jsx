import React, { useContext } from 'react';
import measureScrollbar from '../../_util/measureScrollbar';
import BaseTable from './BaseTable';
import TableContext from './TableContext';

export default function BodyTable(props) {
  const table = useContext(TableContext);
  const { prefixCls, scroll } = table.props;
  const {
    columns,
    fixed,
    resizable,
    tableClassName,
    getRowKey,
    handleBodyScroll,
    handleWheel,
    expander,
    isAnyColumnsFixed,
  } = props;
  const { saveRef, columnManager } = table;
  let { useFixedHeader } = table.props;
  const bodyStyle = { ...table.props.bodyStyle };
  const innerBodyStyle = {};
  if (scroll.x || fixed || resizable) {
    bodyStyle.overflowX = bodyStyle.overflowX || 'auto';
    // Fix weired webkit render bug
    bodyStyle.WebkitTransform = 'translate3d (0, 0, 0)';
  }

  if (scroll.y) {
    // maxHeight will make fixed-Table scrolling not working
    // so we only set maxHeight to body-Table here
    if (fixed) {
      innerBodyStyle.maxHeight = bodyStyle.maxHeight || scroll.y;
      innerBodyStyle.overflowY = bodyStyle.overflowY || 'scroll';
    } else {
      bodyStyle.maxHeight = bodyStyle.maxHeight || scroll.y;
    }
    bodyStyle.overflowY = bodyStyle.overflowY || 'scroll';
    useFixedHeader = true;

    // Add negative margin bottom for scroll bar overflow bug
    const scrollbarWidth = measureScrollbar();
    if (scrollbarWidth > 0 && fixed) {
      bodyStyle.marginBottom = `-${scrollbarWidth}px`;
      bodyStyle.paddingBottom = '0px';
    }
  }

  const hasFoot = !useFixedHeader && columnManager.hasFooter();

  const baseTable = (
    <BaseTable
      tableClassName={tableClassName}
      hasHead={!useFixedHeader}
      hasBody
      hasFoot={hasFoot}
      fixed={fixed}
      columns={columns}
      expander={expander}
      getRowKey={getRowKey}
      isAnyColumnsFixed={isAnyColumnsFixed}
    />
  );

  if (fixed && columns.length) {
    let refName;
    if (columns[0].fixed === 'left' || columns[0].fixed === true) {
      refName = 'fixedColumnsBodyLeft';
    } else if (columns[0].fixed === 'right') {
      refName = 'fixedColumnsBodyRight';
    }
    delete bodyStyle.overflowX;
    delete bodyStyle.overflowY;
    return (
      <div
        key="bodyTable"
        className={`${prefixCls}-body-outer`}
        style={{ ...bodyStyle }}
      >
        <div
          className={`${prefixCls}-body-inner`}
          style={innerBodyStyle}
          ref={saveRef(refName)}
          onWheel={handleWheel}
          onScroll={handleBodyScroll}
        >
          {baseTable}
        </div>
      </div>
    );
  }

  return (
    <div
      key="bodyTable"
      className={`${prefixCls}-body`}
      style={bodyStyle}
      ref={saveRef('bodyTable')}
      onWheel={handleWheel}
      onScroll={handleBodyScroll}
    >
      {baseTable}
    </div>
  );
}
