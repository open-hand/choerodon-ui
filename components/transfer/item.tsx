import React, { Component } from 'react';
import classNames from 'classnames';
import Lazyload from 'react-lazy-load';
import Checkbox from '../checkbox';
import PureRenderMixin from '../rc-components/util/PureRenderMixin';

export default class Item extends Component<any, any> {
  shouldComponentUpdate(...args: any[]) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }

  render() {
    const {
      renderedText,
      renderedEl,
      item,
      lazy,
      checked,
      isHighlight,
      prefixCls,
      onClick,
      checkboxPrefixCls,
    } = this.props;

    const className = classNames({
      [`${prefixCls}-content-item`]: true,
      [`${prefixCls}-content-item-disabled`]: item.disabled,
      [`${prefixCls}-content-item-highlight`]: isHighlight,
    });

    const listItem = (
      <li
        className={className}
        title={renderedText}
        onClick={item.disabled ? undefined : () => onClick(item)}
      >
        <Checkbox prefixCls={checkboxPrefixCls} checked={checked} disabled={item.disabled} />
        <span>{renderedEl}</span>
      </li>
    );
    let children: JSX.Element | null = null;
    if (lazy) {
      const lazyProps = {
        height: '0.32rem',
        offset: 500,
        throttle: 0,
        debounce: false,
        ...lazy,
      };
      children = <Lazyload {...lazyProps}>{listItem}</Lazyload>;
    } else {
      children = listItem;
    }

    return children;
  }
}
