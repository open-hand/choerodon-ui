import React, { CSSProperties, FunctionComponent, ReactNode, useContext } from 'react';
import classNames from 'classnames';
import ConfigContext from '../config-provider/ConfigContext';

export interface TimeLineItemProps {
  prefixCls?: string;
  className?: string;
  color?: string;
  dot?: ReactNode;
  pending?: boolean;
  style?: CSSProperties;
}

const TimelineItem: FunctionComponent<TimeLineItemProps> = function TimelineItem(props) {
  const {
    prefixCls: customizePrefixCls,
    className,
    color = '',
    children,
    pending,
    dot,
    ...restProps
  } = props;
  const { getPrefixCls } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('timeline', customizePrefixCls);

  const itemClassName = classNames(
    {
      [`${prefixCls}-item`]: true,
      [`${prefixCls}-item-pending`]: pending,
    },
    className,
  );

  const dotClassName = classNames({
    [`${prefixCls}-item-head`]: true,
    [`${prefixCls}-item-head-custom`]: dot,
    [`${prefixCls}-item-head-${color}`]: true,
  });

  const customColor = /blue|red|green/.test(color) ? undefined : color;

  return (
    <li {...restProps} className={itemClassName}>
      <div className={`${prefixCls}-item-tail`} />
      <div
        className={dotClassName}
        style={{ borderColor: customColor, color: customColor }}
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
  pending: false,
};

export default TimelineItem;
