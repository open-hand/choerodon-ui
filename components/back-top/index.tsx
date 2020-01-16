import React, { Component, CSSProperties } from 'react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import Animate from '../animate';
import addEventListener from '../_util/addEventListener';
import { getPrefixCls } from '../configure';
import getScroll from '../_util/getScroll';
import scrollTo from '../_util/scrollTo';

function getDefaultTarget() {
  return window;
}

export interface BackTopProps {
  visibilityHeight?: number;
  onClick?: React.MouseEventHandler<HTMLElement>;
  target?: () => HTMLElement | Window;
  prefixCls?: string;
  className?: string;
  style?: CSSProperties;
  visible?: boolean; // Only for test. Don't use it.
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

  componentDidMount() {
    const { target = getDefaultTarget } = this.props;
    this.scrollEvent = addEventListener(target(), 'scroll', this.handleScroll);
    this.handleScroll();
  }

  componentWillUnmount() {
    if (this.scrollEvent) {
      this.scrollEvent.remove();
    }
  }

  scrollToTop = (e: React.MouseEvent<HTMLDivElement>) => {
    const { target = getDefaultTarget, onClick } = this.props;
    scrollTo(0, {
      getContainer: target,
    });
    if (typeof onClick === 'function') {
      onClick(e);
    }
  };

  handleScroll = () => {
    const { visibilityHeight, target = getDefaultTarget } = this.props;
    const scrollTop = getScroll(target(), true);
    this.setState({
      visible: scrollTop > (visibilityHeight as number),
    });
  };

  render() {
    const {
      prefixCls: customizePrefixCls,
      className = '',
      visible: propsVisible,
      children,
    } = this.props;
    const { visible: stateVisible } = this.state;
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
      'visible',
    ]);

    const visible = 'visible' in this.props ? propsVisible : stateVisible;

    const backTopBtn = visible ? (
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
