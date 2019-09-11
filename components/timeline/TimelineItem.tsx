import React, { CSSProperties, FunctionComponent, ReactNode } from 'react';
import classNames from 'classnames';
import { getPrefixCls } from '../configure';

export interface TimeLineItemProps {
  prefixCls?: string;
  className?: string;
  color?: string;
  dot?: ReactNode;
  pending?: boolean;
  last?: boolean;
  style?: CSSProperties;
}

const TimelineItem: FunctionComponent<TimeLineItemProps> = props => {
  const {
    prefixCls: customizePrefixCls,
    className,
    color = '',
    last,
    children,
    pending,
    dot,
    ...restProps
  } = props;
  const prefixCls = getPrefixCls('timeline', customizePrefixCls);

  const itemClassName = classNames(
    {
      [`${prefixCls}-item`]: true,
      [`${prefixCls}-item-last`]: last,
      [`${prefixCls}-item-pending`]: pending,
    },
    className,
  );

  const dotClassName = classNames({
    [`${prefixCls}-item-head`]: true,
    [`${prefixCls}-item-head-custom`]: dot,
    [`${prefixCls}-item-head-${color}`]: true,
  });

  return (
    <li {...restProps} className={itemClassName}>
      <div className={`${prefixCls}-item-tail`} />
      <div
        className={dotClassName}
        style={{ borderColor: /blue|red|green/.test(color) ? undefined : color }}
      >
        {dot}
      </div>
      <div className={`${prefixCls}-item-content`}>{children}</div>
    </li>
  );
};

TimelineItem.displayName = 'TimelineItem';

TimelineItem.defaultProps = {
  color: 'blue',
  last: false,
  pending: false,
};

export default TimelineItem;
