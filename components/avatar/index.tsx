import React, { Component, CSSProperties } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import isNumber from 'lodash/isNumber';
import Icon from '../icon';
import { Size } from '../_util/enum';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export interface AvatarProps {
  /** Shape of avatar, options:`circle`, `square` */
  shape?: 'circle' | 'square';
  /*
   * Size of avatar, options: `large`, `small`, `default`
   * or a custom number size
   * */
  size?: Size | number;
  /** Src of image avatar */
  src?: string;
  /** Type of the Icon to be used in avatar */
  icon?: string;
  style?: CSSProperties;
  prefixCls?: string;
  className?: string;
  children?: any;
  alt?: string;
  /* callback when img load error */
  /* return false to prevent Avatar show default fallback behavior, then you can do fallback by your self */
  onError?: () => boolean;
}

export interface AvatarState {
  scale: number;
  isImgExist: boolean;
}

export default class Avatar extends Component<AvatarProps, AvatarState> {
  static displayName = 'Avatar';

  static get contextType() {
    return ConfigContext;
  }

  static defaultProps = {
    shape: 'circle',
    size: Size.default,
  };

  context: ConfigContextValue;

  private avatarChildren: any;

  constructor(props: AvatarProps, context: ConfigContextValue) {
    super(props, context);
    this.state = {
      scale: 1,
      isImgExist: true,
    };
  }

  componentDidMount() {
    this.setScale();
  }

  componentDidUpdate(prevProps: AvatarProps, prevState: AvatarState) {
    const { children } = this.props;
    const { scale, isImgExist } = this.state;
    if (
      prevProps.children !== children ||
      (prevState.scale !== scale && scale === 1) ||
      prevState.isImgExist !== isImgExist
    ) {
      this.setScale();
    }
  }

  setScale = () => {
    const childrenNode = this.avatarChildren;
    if (childrenNode) {
      const childrenWidth = childrenNode.offsetWidth;
      const avatarNode = findDOMNode(this) as Element;
      const avatarWidth = avatarNode.getBoundingClientRect().width;
      // add 4px gap for each side to get better performance
      if (avatarWidth - 8 < childrenWidth) {
        this.setState({
          scale: (avatarWidth - 8) / childrenWidth,
        });
      } else {
        this.setState({
          scale: 1,
        });
      }
    }
  };

  handleImgLoadError = () => {
    const { onError } = this.props;
    const errorFlag = onError ? onError() : undefined;
    if (errorFlag !== false) {
      this.setState({ isImgExist: false });
    }
  };

  render() {
    const {
      prefixCls: customizePrefixCls,
      shape,
      size,
      src,
      icon,
      className,
      alt,
      ...others
    } = this.props;
    const { getPrefixCls } = this.context;
    const prefixCls = getPrefixCls('avatar', customizePrefixCls);

    const { isImgExist, scale } = this.state;

    const sizeCls = classNames({
      [`${prefixCls}-lg`]: size === Size.large,
      [`${prefixCls}-sm`]: size === Size.small,
    });

    const classString = classNames(prefixCls, className, sizeCls, {
      [`${prefixCls}-${shape}`]: shape,
      [`${prefixCls}-image`]: src && isImgExist,
      [`${prefixCls}-icon`]: icon,
    });

    const sizeStyle: CSSProperties = isNumber(size)
      ? {
        width: size,
        height: size,
        lineHeight: `${size}px`,
        fontSize: icon ? size / 2 : 18,
      }
      : {};

    let { children } = this.props;
    if (src && isImgExist) {
      children = <img src={src} onError={this.handleImgLoadError} alt={alt} />;
    } else if (icon) {
      children = <Icon type={icon} />;
    } else {
      const childrenNode = this.avatarChildren;
      if (childrenNode || scale !== 1) {
        const transformString = `scale(${scale}) translateX(-50%)`;
        const childrenStyle: CSSProperties = {
          msTransform: transformString,
          WebkitTransform: transformString,
          transform: transformString,
        };
        const sizeChildrenStyle: CSSProperties = isNumber(size)
          ? {
            lineHeight: `${size}px`,
          }
          : {};
        children = (
          <span
            className={`${prefixCls}-string`}
            ref={span => (this.avatarChildren = span)}
            style={{ ...sizeChildrenStyle, ...childrenStyle }}
          >
            {children}
          </span>
        );
      } else {
        children = (
          <span className={`${prefixCls}-string`} ref={span => (this.avatarChildren = span)}>
            {children}
          </span>
        );
      }
    }
    return (
      <span {...others} style={{ ...sizeStyle, ...others.style }} className={classString}>
        {children}
      </span>
    );
  }
}
