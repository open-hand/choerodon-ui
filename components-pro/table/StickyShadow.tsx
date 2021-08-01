import React, { CSSProperties, FunctionComponent, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import TableContext from './TableContext';
import { onlyCustomizedColumn } from './utils';

export interface StickyShadowProps {
  position: 'left' | 'right'
}

const StickyShadow: FunctionComponent<StickyShadowProps> = observer(function StickyShadow(props) {
  const { position } = props;
  const { tableStore, prefixCls } = useContext(TableContext);
  const disabled = (position === 'left' && tableStore.leftLeafColumns.length === 0) ||
    (position === 'right' && onlyCustomizedColumn(tableStore));
  if (disabled) {
    return null;
  }
  const classString = classNames(`${prefixCls}-sticky-shadow`, {
    [`${prefixCls}-sticky-left`]: position === 'left' && tableStore.stickyLeft,
    [`${prefixCls}-sticky-right`]: position === 'right' && tableStore.stickyRight,
  });
  const style: CSSProperties = {};
  const scrollBarWidth = measureScrollbar();
  if (position === 'left') {
    style.left = pxToRem(tableStore.leftLeafColumnsWidth - 1)!;
  } else if (position === 'right') {
    style.right = pxToRem(tableStore.rightLeafColumnsWidth + 1 + (tableStore.overflowY ? scrollBarWidth : 0))!;
  }
  style.bottom = pxToRem(scrollBarWidth)!;
  return (
    <div className={classString} style={style} />
  );
});

StickyShadow.displayName = 'StickyShadow';

export default StickyShadow;
