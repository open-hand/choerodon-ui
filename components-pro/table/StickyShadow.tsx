import React, { CSSProperties, FunctionComponent, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import measureScrollbar from 'choerodon-ui/lib/_util/measureScrollbar';
import useComputed from '../use-computed';
import TableContext from './TableContext';
import { onlyCustomizedColumn } from './utils';

export interface StickyShadowProps {
  position: 'left' | 'right'
}

const StickyShadow: FunctionComponent<StickyShadowProps> = observer((props) => {
  const { position } = props;
  const { tableStore } = useContext(TableContext);
  const { prefixCls } = tableStore;
  const disabled = (position === 'left' && tableStore.leftLeafColumns.length === 0) ||
    (position === 'right' && onlyCustomizedColumn(tableStore));
  const computedStyle = useComputed(() => {
    if (!disabled) {
      const style: CSSProperties = {};
      const scrollBarWidth = measureScrollbar();
      if (position === 'left') {
        style.left = pxToRem(tableStore.leftLeafColumnsWidth)!;
      } else if (position === 'right') {
        style.right = pxToRem(tableStore.rightLeafColumnsWidth + (tableStore.overflowY ? scrollBarWidth : 0))!;
      }
      style.bottom = pxToRem(scrollBarWidth)!;
      return style;
    }
  }, [disabled, position, tableStore]);
  if (disabled) {
    return null;
  }
  const classString = classNames(`${prefixCls}-sticky-shadow`, {
    [`${prefixCls}-sticky-left`]: position === 'left' && tableStore.stickyLeft,
    [`${prefixCls}-sticky-right`]: position === 'right' && tableStore.stickyRight,
  });
  return (
    <div className={classString} style={computedStyle} />
  );
});

StickyShadow.displayName = 'StickyShadow';

export default StickyShadow;
