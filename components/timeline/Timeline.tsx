import React, {
  Children,
  cloneElement,
  Component,
  CSSProperties,
  ReactElement,
  ReactNode,
} from 'react';
import classNames from 'classnames';
import TimelineItem from './TimelineItem';
import Icon from '../icon';
import { getPrefixCls } from '../configure';

export interface TimelineProps {
  prefixCls?: string;
  className?: string;
  /** 指定最后一个幽灵节点是否存在或内容 */
  pending?: ReactNode;
  pendingDot?: ReactNode;
  style?: CSSProperties;
}

export default class Timeline extends Component<TimelineProps, any> {
  static displayName = 'Timeline';

  static Item = TimelineItem;

  render() {
    const {
      prefixCls: customizePrefixCls,
      children,
      pending,
      pendingDot,
      className,
      ...restProps
    } = this.props;
    const pendingNode = typeof pending === 'boolean' ? null : pending;
    const prefixCls = getPrefixCls('timeline', customizePrefixCls);
    const classString = classNames(
      prefixCls,
      {
        [`${prefixCls}-pending`]: !!pending,
      },
      className,
    );
    // Remove falsy items
    const falsylessItems = Children.toArray(children).filter(item => !!item);
    const items = Children.map(falsylessItems, (ele: ReactElement<any>, idx) =>
      cloneElement(ele, {
        last: idx === Children.count(falsylessItems) - 1,
      }),
    );
    const pendingItem = pending ? (
      <TimelineItem pending={!!pending} dot={pendingDot || <Icon type="loading" />}>
        {pendingNode}
      </TimelineItem>
    ) : null;
    return (
      <ul {...restProps} className={classString}>
        {items}
        {pendingItem}
      </ul>
    );
  }
}
