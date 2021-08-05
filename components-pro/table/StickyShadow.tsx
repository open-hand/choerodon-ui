import React, { CSSProperties, FunctionComponent, ReactNode, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import TableContext from './TableContext';
import { onlyCustomizedColumn } from './utils';

export interface StickyShadowProps {
  position: 'left' | 'right';
  children?: ReactNode;
}

const StickyShadow: FunctionComponent<StickyShadowProps> = observer(function StickyShadow(props) {
  const { position, children } = props;
  const { tableStore, prefixCls } = useContext(TableContext);
  const { columnGroups } = tableStore;
  const disabled = !children && ((position === 'left' && columnGroups.leftLeafs.length === 0) ||
    (position === 'right' && onlyCustomizedColumn(tableStore)));
  if (disabled) {
    return null;
  }
  const classString = classNames({
    [`${prefixCls}-sticky-shadow`]: !children,
    [`${prefixCls}-fixed-left`]: children && position === 'left',
    [`${prefixCls}-fixed-right`]: children && position === 'right',
    [`${prefixCls}-sticky-left`]: position === 'left' && tableStore.stickyLeft,
    [`${prefixCls}-sticky-right`]: position === 'right' && tableStore.stickyRight,
  });
  const style: CSSProperties = {};
  if (!children) {
    const scrollBarWidth = measureScrollbar();
    if (position === 'left') {
      style.left = pxToRem(columnGroups.leftLeafColumnsWidth - 1)!;
    } else if (position === 'right') {
      style.right = pxToRem(columnGroups.rightLeafColumnsWidth + (tableStore.overflowY ? scrollBarWidth : 0))!;
    }
    style.bottom = pxToRem(scrollBarWidth)!;
  }
  return (
    <div className={classString} style={style}>
      {children}
    </div>
  );
});

StickyShadow.displayName = 'StickyShadow';

export default StickyShadow;
