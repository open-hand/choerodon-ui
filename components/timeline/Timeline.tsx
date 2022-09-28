import React, { Children, cloneElement, Component, CSSProperties, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import TimelineItem from './TimelineItem';
import Spin from '../spin';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';
import { Size } from '../_util/enum';

export interface TimelineProps {
  prefixCls?: string;
  spinPrefixCls?: string;
  className?: string;
  /** 指定最后一个幽灵节点是否存在或内容 */
  pending?: ReactNode;
  pendingDot?: ReactNode;
  style?: CSSProperties;
  reverse?: boolean;
  children?: ReactNode;
}

export default class Timeline extends Component<TimelineProps, any> {
  static displayName = 'Timeline';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static Item = TimelineItem;

  context: ConfigContextValue;

  render() {
    const {
      prefixCls: customizePrefixCls,
      spinPrefixCls,
      children,
      pending = null,
      pendingDot,
      className,
      reverse,
      ...restProps
    } = this.props;
    const { getPrefixCls } = this.context;
    const pendingNode = typeof pending === 'boolean' ? null : pending;
    const prefixCls = getPrefixCls('timeline', customizePrefixCls);
    const classString = classNames(
      prefixCls,
      {
        [`${prefixCls}-pending`]: !!pending,
        [`${prefixCls}-reverse`]: !!reverse,
      },
      className,
    );

    const pendingItem = pending ? (
      <TimelineItem
        prefixCls={prefixCls}
        pending={!!pending}
        dot={pendingDot || <Spin prefixCls={spinPrefixCls} size={Size.small} />}
      >
        {pendingNode}
      </TimelineItem>
    ) : null;

    const timeLineItems = reverse
      ? [pendingItem, ...Children.toArray(children).reverse()]
      : [...Children.toArray(children), pendingItem];

    // Remove falsy items
    const truthyItems = timeLineItems.filter(item => !!item);
    const itemsCount = Children.count(truthyItems);
    const lastCls = `${prefixCls}-item-last`;
    const items = Children.map(truthyItems, (ele: ReactElement<any>, idx) =>
      cloneElement(ele, {
        className: classNames([
          ele.props.className,
          (!reverse && !!pending)
            ? (idx === itemsCount - 2) ? lastCls : ''
            : (idx === itemsCount - 1) ? lastCls : '',
        ]),
      }),
    );

    return (
      <ul {...restProps} className={classString}>
        {items}
      </ul>
    );
  }
}
