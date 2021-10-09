import React, { Component, CSSProperties, MouseEventHandler } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import omit from 'lodash/omit';
import Icon from '../icon';
import CheckableTag from './CheckableTag';
import Animate from '../animate';
import { getPrefixCls } from '../configure';
import { PresetColorType, isPresetColor as isPresetColorUtil } from '../_util/colors';
import { LiteralUnion } from '../_util/type';

export { CheckableTagProps } from './CheckableTag';

export interface TagProps {
  prefixCls?: string;
  className?: string;
  color?: LiteralUnion<PresetColorType, string>;
  /** 标签是否可以关闭 */
  closable?: boolean;
  /** 关闭时的回调 */
  onClose?: Function;
  /** 动画关闭后的回调 */
  afterClose?: Function;
  style?: CSSProperties;
}

export interface TagState {
  closing: boolean;
  closed: boolean;
}

export default class Tag extends Component<TagProps, TagState> {
  static displayName = 'Tag';

  static CheckableTag = CheckableTag;

  static defaultProps = {
    closable: false,
  };

  state = {
    closing: false,
    closed: false,
  };

  close: MouseEventHandler<HTMLElement> = e => {
    const { onClose } = this.props;
    if (onClose) {
      onClose(e);
    }
    if (e.defaultPrevented) {
      return;
    }
    const dom = findDOMNode(this) as HTMLElement;
    dom.style.width = `${dom.getBoundingClientRect().width}px`;
    // It's Magic Code, don't know why
    dom.style.width = `${dom.getBoundingClientRect().width}px`;
    this.setState({
      closing: true,
    });
  };

  animationEnd = (_: string, existed: boolean) => {
    const { closed } = this.state;
    if (!existed && !closed) {
      this.setState({
        closed: true,
        closing: false,
      });
      const { afterClose } = this.props;

      if (afterClose) {
        afterClose();
      }
    }
  };

  render() {
    const {
      prefixCls: customizePrefixCls,
      closable,
      color,
      className,
      children,
      style,
      ...otherProps
    } = this.props;
    const prefixCls = getPrefixCls('tag', customizePrefixCls);
    const { closing, closed } = this.state;
    const closeIcon = closable ? <Icon type="close" onClick={this.close} /> : '';
    const isPresetColor = isPresetColorUtil(color);
    const classString = classNames(
      prefixCls,
      {
        [`${prefixCls}-${color}`]: isPresetColor,
        [`${prefixCls}-has-color`]: color && !isPresetColor,
        [`${prefixCls}-close`]: closing,
      },
      className,
    );
    // fix https://fb.me/react-unknown-prop
    const divProps = omit(otherProps, ['onClose', 'afterClose']);
    const tagStyle: CSSProperties = {
      ...style,
    };
    if (color && !isPresetColor) {
      tagStyle.backgroundColor = color;
    }
    const tag = closed ? null : (
      <div hidden={closing} {...divProps} className={classString} style={tagStyle}>
        {children}
        {closeIcon}
      </div>
    );
    return (
      <Animate
        component=""
        hiddenProp="hidden"
        transitionName={`${prefixCls}-zoom`}
        transitionAppear
        onEnd={this.animationEnd}
      >
        {tag}
      </Animate>
    );
  }
}
