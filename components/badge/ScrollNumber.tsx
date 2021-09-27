import React, { Component, createElement, CSSProperties, ReactElement } from 'react';
import omit from 'lodash/omit';
import classNames from 'classnames';
import { getPrefixCls } from '../configure';

function getNumberArray(num: string | number | undefined) {
  return num
    ? num
      .toString()
      .split('')
      .reverse()
      .map(i => Number(i))
    : [];
}

export interface ScrollNumberProps {
  prefixCls?: string;
  className?: string;
  count?: string | number;
  component?: string;
  onAnimated?: Function;
  style?: CSSProperties;
  title?: string | number;
  hidden?: boolean;
}

export interface ScrollNumberState {
  animateStarted?: boolean;
  count?: string | number;
}

export default class ScrollNumber extends Component<ScrollNumberProps, ScrollNumberState> {
  static displayName = 'ScrollNumber';

  static defaultProps = {
    count: null,
    onAnimated(): void {
      // noop
    },
  };

  lastCount: any;

  constructor(props: ScrollNumberProps) {
    super(props);
    this.state = {
      animateStarted: true,
      count: props.count,
    };
  }

  getPositionByNum(num: number, i: number) {
    const { animateStarted, count } = this.state;
    if (animateStarted) {
      return 10 + num;
    }
    const currentDigit = getNumberArray(count)[i];
    const lastDigit = getNumberArray(this.lastCount)[i];
    // 同方向则在同一侧切换数字
    if (count! > this.lastCount) {
      if (currentDigit >= lastDigit) {
        return 10 + num;
      }
      return 20 + num;
    }
    if (currentDigit <= lastDigit) {
      return 10 + num;
    }
    return num;
  }

  componentWillReceiveProps(nextProps: ScrollNumberProps) {
    if ('count' in nextProps) {
      const { count } = this.state;
      if (count === nextProps.count) {
        return;
      }
      this.lastCount = count;
      // 复原数字初始位置
      this.setState(
        {
          animateStarted: true,
        },
        () => {
          // 等待数字位置复原完毕
          // 开始设置完整的数字
          setTimeout(() => {
            this.setState(
              {
                animateStarted: false,
                count: nextProps.count,
              },
              () => {
                const { onAnimated } = this.props;
                if (onAnimated) {
                  onAnimated();
                }
              },
            );
          }, 5);
        },
      );
    }
  }

  getPrefixCls() {
    const { prefixCls } = this.props;
    return getPrefixCls('scroll-number', prefixCls);
  }

  renderNumberList(position: number) {
    const childrenToReturn: ReactElement<any>[] = [];
    for (let i = 0; i < 30; i++) {
      const currentClassName = position === i ? 'current' : '';
      childrenToReturn.push(
        <p key={i.toString()} className={currentClassName}>
          {i % 10}
        </p>,
      );
    }
    return childrenToReturn;
  }

  renderCurrentNumber = (num: number, i: number) => {
    const position = this.getPositionByNum(num, i);
    const { animateStarted } = this.state;
    const removeTransition = animateStarted || getNumberArray(this.lastCount)[i] === undefined;
    return createElement(
      'span',
      {
        className: `${this.getPrefixCls()}-only`,
        style: {
          transition: removeTransition && 'none',
          msTransform: `translateY(${-position * 100}%)`,
          WebkitTransform: `translateY(${-position * 100}%)`,
          transform: `translateY(${-position * 100}%)`,
        },
        key: i,
      },
      this.renderNumberList(position),
    );
  };

  renderNumberElement() {
    const state = this.state;
    if (!state.count || isNaN(state.count as number)) {
      return state.count;
    }
    return getNumberArray(state.count)
      .map(this.renderCurrentNumber)
      .reverse();
  }

  render() {
    const { className, style, component = 'sup' } = this.props;
    const restProps = omit<ScrollNumberProps, 'count' | 'onAnimated' | 'component' | 'prefixCls'>(
      this.props,
      ['count', 'onAnimated', 'component', 'prefixCls'],
    );
    const newProps = {
      ...restProps,
      className: classNames(this.getPrefixCls(), className),
    };
    if (style && style.borderColor) {
      newProps.style!.boxShadow = `0 0 0 1px ${style.borderColor} inset`;
    }
    return createElement(component as any, newProps, this.renderNumberElement());
  }
}
