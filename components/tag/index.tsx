import React, { Component, CSSProperties, HTMLAttributes } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import omit from 'lodash/omit';
import isNil from 'lodash/isNil';
import Icon from '../icon';
import CheckableTag from './CheckableTag';
import Animate from '../animate';
import { isPresetColor as isPresetColorUtil, PresetColorType } from '../_util/colors';
import { LiteralUnion } from '../_util/type';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export { CheckableTagProps } from './CheckableTag';

export interface TagProps extends HTMLAttributes<HTMLDivElement> {
  prefixCls?: string;
  className?: string;
  color?: LiteralUnion<PresetColorType, string>;
  /** 标签是否可以关闭 */
  closable?: boolean;
  visible?: boolean;
  /** 关闭时的回调 */
  onClose?: Function;
  /** 动画关闭后的回调 */
  afterClose?: Function;
  style?: CSSProperties;
  hoverShowPointer?: boolean;
}

export interface TagState {
  closing: boolean;
  closed: boolean;
  visible: boolean;
}

export default class Tag extends Component<TagProps, TagState> {
  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static displayName = 'Tag';

  static CheckableTag = CheckableTag;

  static defaultProps = {
    closable: false,
  };

  static getDerivedStateFromProps(nextProps: TagProps) {
    return ('visible' in nextProps) ? { visible: nextProps.visible } : null;
  }

  context: ConfigContextValue;

  state = {
    closing: false,
    closed: false,
    visible: true,
  };

  get hoverShowPointer(): boolean | undefined {
    const { hoverShowPointer } = this.props;
    const { getConfig } = this.context;
    if (!isNil(hoverShowPointer)) {
      return hoverShowPointer;
    }
    return getConfig('tagHoverShowPointer');
  }

  componentDidUpdate(_prevProps: TagProps, prevState: TagState) {
    const { visible } = this.state;
    if (prevState.visible && !visible) {
      this.close();
    } else if (!prevState.visible && visible) {
      this.show();
    }
  }

  handleIconClick = (e: React.MouseEvent<HTMLElement>) => {
    const { onClose } = this.props;
    if (onClose) {
      onClose(e);
    }
    if (e.defaultPrevented || 'visible' in this.props) {
      return;
    }
    this.setState({ visible: false });
  };

  close = () => {
    const { closing, closed } = this.state;
    if (closing || closed) {
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

  show = () => {
    this.setState({
      closed: false,
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
    } else {
      this.setState({
        closed: false,
      });
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
    const { getPrefixCls } = this.context;
    const prefixCls = getPrefixCls('tag', customizePrefixCls);
    const { closing, closed } = this.state;
    const closeIcon = closable ? <Icon type="close" onClick={this.handleIconClick} /> : '';
    const isPresetColor = isPresetColorUtil(color);
    const classString = classNames(
      prefixCls,
      {
        [`${prefixCls}-${color}`]: isPresetColor,
        [`${prefixCls}-has-color`]: color && !isPresetColor,
        [`${prefixCls}-close`]: closing,
        [`${prefixCls}-hover-show-pointer`]: this.hoverShowPointer,
      },
      className,
    );
    // fix https://fb.me/react-unknown-prop
    const divProps = omit(otherProps, [
      'onClose',
      'afterClose',
      'visible',
    ]);
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
