import React, { cloneElement, Component, CSSProperties, isValidElement, ReactElement } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import omit from 'lodash/omit';
import isCssAnimationSupported from '../_util/isCssAnimationSupported';
import Animate from '../animate';
import Progress from '../progress/progress';
import { Size } from '../_util/enum';
import { ProgressType } from '../progress/enum';
import { getPrefixCls } from '../configure';

export type SpinIndicator = ReactElement<any>;

export interface SpinProps {
  prefixCls?: string;
  className?: string;
  spinning?: boolean;
  style?: CSSProperties;
  size?: Size;
  tip?: string;
  delay?: number;
  wrapperClassName?: string;
  indicator?: SpinIndicator;
}

export interface SpinState {
  spinning?: boolean;
  notCssAnimationSupported?: boolean;
}

export default class Spin extends Component<SpinProps, SpinState> {
  static displayName = 'Spin';

  static defaultProps = {
    spinning: true,
    size: Size.default,
    wrapperClassName: '',
  };

  static propTypes = {
    prefixCls: PropTypes.string,
    className: PropTypes.string,
    spinning: PropTypes.bool,
    size: PropTypes.oneOf([Size.small, Size.default, Size.large]),
    wrapperClassName: PropTypes.string,
    indicator: PropTypes.node,
  };

  debounceTimeout: number;

  delayTimeout: number;

  constructor(props: SpinProps) {
    super(props);
    const spinning = props.spinning;
    this.state = {
      spinning,
    };
  }

  componentDidMount() {
    if (!isCssAnimationSupported()) {
      // Show text in IE9
      this.setState({
        notCssAnimationSupported: true,
      });
    }
  }

  componentWillUnmount() {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    if (this.delayTimeout) {
      clearTimeout(this.delayTimeout);
    }
  }

  componentWillReceiveProps(nextProps: SpinProps) {
    const { spinning: currentSpinning } = this.props;
    const spinning = nextProps.spinning;
    const { delay } = this.props;

    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    if (currentSpinning && !spinning) {
      this.debounceTimeout = window.setTimeout(() => this.setState({ spinning }), 200);
      if (this.delayTimeout) {
        clearTimeout(this.delayTimeout);
      }
    } else if (spinning && delay && !isNaN(Number(delay))) {
      if (this.delayTimeout) {
        clearTimeout(this.delayTimeout);
      }
      this.delayTimeout = window.setTimeout(() => this.setState({ spinning }), delay);
    } else {
      this.setState({ spinning });
    }
  }

  renderIndicator(prefixCls) {
    const { indicator, size } = this.props;
    const dotClassName = `${prefixCls}-dot`;
    if (isValidElement(indicator)) {
      return cloneElement(indicator as SpinIndicator, {
        className: classNames((indicator as SpinIndicator).props.className, dotClassName),
      });
    }
    return (
      <Progress
        size={size}
        className={dotClassName}
        type={ProgressType.loading}
      />
    );
  }

  render() {
    const {
      className,
      size,
      prefixCls: customizePrefixCls,
      tip,
      wrapperClassName,
      children,
      style,
      ...restProps
    } = this.props;
    const { spinning, notCssAnimationSupported } = this.state;
    const prefixCls = getPrefixCls('spin', customizePrefixCls);

    const spinClassName = classNames(
      prefixCls,
      {
        [`${prefixCls}-sm`]: size === Size.small,
        [`${prefixCls}-lg`]: size === Size.large,
        [`${prefixCls}-spinning`]: spinning,
        [`${prefixCls}-show-text`]: !!tip || notCssAnimationSupported,
      },
      className,
    );

    // fix https://fb.me/react-unknown-prop
    const divProps = omit(restProps, ['spinning', 'delay', 'indicator']);

    const spinElement = (
      <div {...divProps} className={spinClassName} style={style} key="loading">
        {this.renderIndicator(prefixCls)}
        {tip ? <div className={`${prefixCls}-text`}>{tip}</div> : null}
      </div>
    );
    if (children) {
      let animateClassName = `${prefixCls}-nested-loading`;
      if (wrapperClassName) {
        animateClassName += ` ${wrapperClassName}`;
      }
      const containerClassName = classNames({
        [`${prefixCls}-container`]: true,
        [`${prefixCls}-blur`]: spinning,
      });
      return (
        <Animate {...divProps} component="div" className={animateClassName} transitionName="fade">
          {spinning && spinElement}
          <div className={containerClassName} key="container">
            {children}
          </div>
        </Animate>
      );
    }
    return spinElement;
  }
}
