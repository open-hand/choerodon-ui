import React, { Component, CSSProperties } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import shallowequal from 'shallowequal';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import getScroll from '../_util/getScroll';
import { throttleByAnimationFrameDecorator } from '../_util/throttleByAnimationFrame';
import addEventListener from '../_util/addEventListener';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

function getTargetRect(target: HTMLElement | Window | null): ClientRect {
  return target !== window
    ? (target as HTMLElement).getBoundingClientRect()
    : ({ top: 0, left: 0, bottom: 0 } as ClientRect);
}

function getOffset(element: HTMLElement, target: HTMLElement | Window | null) {
  const elemRect = element.getBoundingClientRect();
  const targetRect = getTargetRect(target);

  const scrollTop = getScroll(target, true);
  const scrollLeft = getScroll(target, false);

  const docElem = window.document.body;
  const clientTop = docElem.clientTop || 0;
  const clientLeft = docElem.clientLeft || 0;

  return {
    top: elemRect.top - targetRect.top + scrollTop - clientTop,
    left: elemRect.left - targetRect.left + scrollLeft - clientLeft,
    width: elemRect.width,
    height: elemRect.height,
  };
}

function getDefaultTarget() {
  return typeof window !== 'undefined' ? window : null;
}

// Affix
export interface AffixProps {
  /**
   * 距离窗口顶部达到指定偏移量后触发
   */
  offsetTop?: number;
  offset?: number;
  /** 距离窗口底部达到指定偏移量后触发 */
  offsetBottom?: number;
  style?: CSSProperties;
  /** 固定状态改变时触发的回调函数 */
  onChange?: (affixed?: boolean) => void;
  /** 设置 Affix 需要监听其滚动事件的元素，值为一个返回对应 DOM 元素的函数 */
  target?: () => Window | HTMLElement | null;
  prefixCls?: string;
  className?: string;
}

export interface AffixState {
  affixStyle: CSSProperties | undefined;
  placeholderStyle: CSSProperties | undefined;
}

export default class Affix extends Component<AffixProps, AffixState> {
  static displayName = 'Affix';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  context: ConfigContextValue;

  state: AffixState = {
    affixStyle: undefined,
    placeholderStyle: undefined,
  };

  private timeout: number;

  private eventHandlers: Record<string, any> = {};

  private fixedNode: HTMLElement;

  private placeholderNode: HTMLElement;

  private readonly events = [
    'resize',
    'scroll',
    'touchstart',
    'touchmove',
    'touchend',
    'pageshow',
    'load',
  ];

  setAffixStyle(e: Event, affixStyle: CSSProperties | null) {
    const { onChange = noop, target = getDefaultTarget } = this.props;
    const { affixStyle: originalAffixStyle } = this.state;
    const isWindow = target() === window;
    if (e.type === 'scroll' && originalAffixStyle && affixStyle && isWindow) {
      return;
    }
    if (shallowequal(affixStyle, originalAffixStyle)) {
      return;
    }

    this.setState({ affixStyle: affixStyle as React.CSSProperties }, () => {
      if ((affixStyle && !originalAffixStyle) || (!affixStyle && originalAffixStyle)) {
        const { state } = this;
        onChange(!!state.affixStyle);
      }
    });
  }

  setPlaceholderStyle(placeholderStyle: CSSProperties | null) {
    const { placeholderStyle: originalPlaceholderStyle } = this.state;
    if (shallowequal(placeholderStyle, originalPlaceholderStyle)) {
      return;
    }
    this.setState({ placeholderStyle: placeholderStyle as CSSProperties });
  }

  syncPlaceholderStyle(e: Event) {
    const { affixStyle } = this.state;
    if (!affixStyle) {
      return;
    }
    this.placeholderNode.style.cssText = '';
    this.setAffixStyle(e, {
      ...affixStyle,
      width: this.placeholderNode.offsetWidth,
    });
    this.setPlaceholderStyle({
      width: this.placeholderNode.offsetWidth,
    });
  }

  @throttleByAnimationFrameDecorator()
  updatePosition(e: Event) {
    const { offsetBottom, offset, target = getDefaultTarget } = this.props;
    let { offsetTop } = this.props;
    const targetNode = target();

    // Backwards support
    offsetTop = typeof offsetTop === 'undefined' ? offset : offsetTop;
    const scrollTop = getScroll(targetNode, true);
    const affixNode = findDOMNode(this) as HTMLElement;
    const elemOffset = getOffset(affixNode, targetNode);
    const elemSize = {
      width: this.fixedNode.offsetWidth,
      height: this.fixedNode.offsetHeight,
    };

    const offsetMode = {
      top: false,
      bottom: false,
    };
    // Default to `offsetTop=0`.
    if (typeof offsetTop !== 'number' && typeof offsetBottom !== 'number') {
      offsetMode.top = true;
      offsetTop = 0;
    } else {
      offsetMode.top = typeof offsetTop === 'number';
      offsetMode.bottom = typeof offsetBottom === 'number';
    }

    const targetRect = getTargetRect(targetNode);
    const targetInnerHeight =
      (targetNode as Window).innerHeight || (targetNode as HTMLElement).clientHeight;
    if (scrollTop > elemOffset.top - (offsetTop as number) && offsetMode.top) {
      // Fixed Top
      const width = elemOffset.width;
      const top = targetRect.top + (offsetTop as number);
      this.setAffixStyle(e, {
        position: 'fixed',
        top,
        left: targetRect.left + elemOffset.left,
        width,
      });
      this.setPlaceholderStyle({
        width,
        height: elemSize.height,
      });
    } else if (
      scrollTop <
        elemOffset.top + elemSize.height + (offsetBottom as number) - targetInnerHeight &&
      offsetMode.bottom
    ) {
      // Fixed Bottom
      const targetBottomOffet = targetNode === window ? 0 : window.innerHeight - targetRect.bottom;
      const width = elemOffset.width;
      this.setAffixStyle(e, {
        position: 'fixed',
        bottom: targetBottomOffet + (offsetBottom as number),
        left: targetRect.left + elemOffset.left,
        width,
      });
      this.setPlaceholderStyle({
        width,
        height: elemOffset.height,
      });
    } else {
      const { affixStyle } = this.state;
      if (
        e.type === 'resize' &&
        affixStyle &&
        affixStyle.position === 'fixed' &&
        affixNode.offsetWidth
      ) {
        this.setAffixStyle(e, { ...affixStyle, width: affixNode.offsetWidth });
      } else {
        this.setAffixStyle(e, null);
      }
      this.setPlaceholderStyle(null);
    }

    if (e.type === 'resize') {
      this.syncPlaceholderStyle(e);
    }
  }

  componentDidMount() {
    const { props } = this;
    const target = props.target || getDefaultTarget;
    // Wait for parent component ref has its value
    this.timeout = window.setTimeout(() => {
      this.setTargetEventListeners(target);
      // Mock Event object.
      this.updatePosition({} as Event);
    });
  }

  componentWillReceiveProps(nextProps: AffixProps) {
    const { offsetTop, offsetBottom, target } = this.props;
    if (target !== nextProps.target) {
      this.clearEventListeners();
      this.setTargetEventListeners(nextProps.target!);

      // Mock Event object.
      this.updatePosition({} as Event);
    }
    if (offsetTop !== nextProps.offsetTop || offsetBottom !== nextProps.offsetBottom) {
      this.updatePosition({} as Event);
    }
  }

  componentWillUnmount() {
    this.clearEventListeners();
    clearTimeout(this.timeout);
    (this.updatePosition as any).cancel();
  }

  setTargetEventListeners(getTarget: () => HTMLElement | Window | null) {
    const target = getTarget();
    if (!target) {
      return;
    }
    this.clearEventListeners();

    this.events.forEach(eventName => {
      this.eventHandlers[eventName] = addEventListener(target, eventName, this.updatePosition);
    });
  }

  clearEventListeners() {
    this.events.forEach(eventName => {
      const handler = this.eventHandlers[eventName];
      if (handler && handler.remove) {
        handler.remove();
      }
    });
  }

  saveFixedNode = (node: HTMLDivElement) => {
    this.fixedNode = node;
  };

  savePlaceholderNode = (node: HTMLDivElement) => {
    this.placeholderNode = node;
  };

  render() {
    const { prefixCls, style, children } = this.props;
    const { affixStyle, placeholderStyle } = this.state;
    const { getPrefixCls } = this.context;
    const className = classNames({
      [getPrefixCls('affix', prefixCls)]: affixStyle,
    });

    const props = omit<AffixProps, keyof AffixProps>(this.props, [
      'prefixCls',
      'offsetTop',
      'offsetBottom',
      'target',
      'onChange',
    ]);
    return (
      <div {...props} style={{ ...placeholderStyle, ...style }} ref={this.savePlaceholderNode}>
        <div className={className} ref={this.saveFixedNode} style={affixStyle}>
          {children}
        </div>
      </div>
    );
  }
}
