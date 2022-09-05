import React from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import measureScrollbar from '../../_util/measureScrollbar';
import { columnWidth } from './utils';


const StickyShadow = function StickyShadow(props) {
  const { position, children, columns, prefixCls, scroll } = props;
  if (!children && columns.length === 0) {
    return null;
  }
  const classString = classNames({
    [`${prefixCls}-sticky-shadow`]: !children,
    [`${prefixCls}-fixed-left`]: children && position === 'left',
    [`${prefixCls}-fixed-right`]: children && position === 'right',
    [`${prefixCls}-sticky-left`]: position === 'left',
    [`${prefixCls}-sticky-right`]: position === 'right',
  });
  const style = {};
  if (!children) {
    const scrollBarWidth = measureScrollbar();
    if (position === 'left') {
      style.left = columns.reduce((sum, column) => sum + columnWidth(column), 0);
    } else if (position === 'right') {
      style.right = columns.reduce((sum, column) => sum + columnWidth(column), 0) + (scroll && scroll.y ? scrollBarWidth : 0);
    }
    style.bottom = scrollBarWidth;
  }
  return (
    <div className={classString} style={style}>
      {children}
    </div>
  );
};

StickyShadow.displayName = 'StickyShadow';

export default observer(StickyShadow);
