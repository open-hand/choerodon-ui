import React, { Component, CSSProperties, MouseEventHandler } from 'react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import getScroll from '../_util/getScroll';
import getRequestAnimationFrame from '../_util/getRequestAnimationFrame';
import Animate from '../animate';
import addEventListener from '../_util/addEventListener';
import { getPrefixCls } from '../configure';

const reqAnimFrame = getRequestAnimationFrame();

const easeInOutCubic = (t: number, b: number, c: number, d: number) => {
  const cc = c - b;
  t /= d / 2;
  if (t < 1) {
    return cc / 2 * t * t * t + b;
  } else {
    return cc / 2 * ((t -= 2) * t * t + 2) + b;
  }
};

function getDefaultTarget() {
  return window;
}

export interface BackTopProps {
  visibilityHeight?: number;
  onClick?: MouseEventHandler<any>;
  target?: () => HTMLElement | Window;
  prefixCls?: string;
  className?: string;
  style?: CSSProperties;
}

export default class BackTop extends Component<BackTopProps, any> {
  static displayName = 'BackTop';

  static defaultProps = {
    visibilityHeight: 400,
  };

  scrollEvent: any;

  state = {
    visible: false,
  };

  getCurrentScrollTop = () => {
    const getTarget = this.props.target || getDefaultTarget;
    const targetNode = getTarget();
    if (targetNode === window) {
      return window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
    }
    return (targetNode as HTMLElement).scrollTop;
  };

  scrollToTop = (e: React.MouseEvent<HTMLDivElement>) => {
    const scrollTop = this.getCurrentScrollTop();
    const startTime = Date.now();
    const frameFunc = () => {
      const timestamp = Date.now();
      const time = timestamp - startTime;
      this.setScrollTop(easeInOutCubic(time, scrollTop, 0, 450));
      if (time < 450) {
        reqAnimFrame(frameFunc);
      }
    };
    reqAnimFrame(frameFunc);
    (this.props.onClick || noop)(e);
  };

  setScrollTop(value: number) {
    const getTarget = this.props.target || getDefaultTarget;
    const targetNode = getTarget();
    if (targetNode === window) {
      document.body.scrollTop = value;
      document.documentElement.scrollTop = value;
    } else {
      (targetNode as HTMLElement).scrollTop = value;
    }
  }

  handleScroll = () => {
    const { visibilityHeight, target = getDefaultTarget } = this.props;
    const scrollTop = getScroll(target(), true);
    this.setState({
      visible: scrollTop > (visibilityHeight as number),
    });
  };

  componentDidMount() {
    const getTarget = this.props.target || getDefaultTarget;
    this.scrollEvent = addEventListener(getTarget(), 'scroll', this.handleScroll);
    this.handleScroll();
  }

  componentWillUnmount() {
    if (this.scrollEvent) {
      this.scrollEvent.remove();
    }
  }

  render() {
    const { prefixCls: customizePrefixCls, className = '', children } = this.props;
    const prefixCls = getPrefixCls('back-top', customizePrefixCls);
    const classString = classNames(prefixCls, className);

    const defaultElement = (
      <div className={`${prefixCls}-content`}>
        <div className={`${prefixCls}-icon`} />
      </div>
    );

    // fix https://fb.me/react-unknown-prop
    const divProps = omit(this.props, [
      'prefixCls',
      'className',
      'children',
      'visibilityHeight',
      'target',
    ]);

    const backTopBtn = this.state.visible ? (
      <div {...divProps} className={classString} onClick={this.scrollToTop}>
        {children || defaultElement}
      </div>
    ) : null;

    return (
      <Animate component="" transitionName="fade">
        {backTopBtn}
      </Animate>
    );
  }
}
