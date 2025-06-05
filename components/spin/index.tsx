import React, { cloneElement, Component, CSSProperties, isValidElement, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import debounce from 'lodash/debounce';
import { global } from 'choerodon-ui/shared';
import Animate from '../animate';
import { AnimateProps } from '../animate/Animate';
import Progress from '../progress/progress';
import { Size } from '../_util/enum';
import { ProgressType } from '../progress/enum';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

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
  children?: ReactNode;
  animateProps?: AnimateProps;
}

export interface SpinState {
  spinning?: boolean;
  notCssAnimationSupported?: boolean;
}

function renderIndicator(props: SpinProps, prefixCls?: string): ReactNode {
  const { indicator, size } = props;
  const dotClassName = `${prefixCls}-dot`;
  if (isValidElement(indicator)) {
    return cloneElement((indicator as SpinIndicator), {
      className: classNames((indicator as SpinIndicator).props.className, dotClassName),
    });
  }
  const defaultIndicator = global.DEFAULT_SPIN_INDICATOR;
  if (isValidElement(defaultIndicator)) {
    return cloneElement((defaultIndicator as SpinIndicator), {
      className: classNames((defaultIndicator as SpinIndicator).props.className, dotClassName),
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

function shouldDelay(spinning?: boolean, delay?: number): boolean {
  return !!spinning && !!delay && !isNaN(Number(delay));
}

export default class Spin extends Component<SpinProps, SpinState> {
  static displayName = 'Spin';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static defaultProps = {
    spinning: true,
    size: Size.default,
    wrapperClassName: '',
  };

  static setDefaultIndicator = (indicator: ReactNode) => {
    global.DEFAULT_SPIN_INDICATOR = indicator;
  }

  context: ConfigContextValue;

  debounceTimeout: number;

  delayTimeout: number;

  originalUpdateSpinning: () => void;

  constructor(props: SpinProps, context: ConfigContextValue) {
    super(props, context);
    const { spinning, delay } = props;
    const shouldBeDelayed = shouldDelay(spinning, delay);
    this.state = {
      spinning: spinning && !shouldBeDelayed,
    };
    this.originalUpdateSpinning = this.updateSpinning;
    this.debouncifyUpdateSpinning(props);
  }

  componentDidMount() {
    this.updateSpinning();
  }

  componentDidUpdate() {
    this.debouncifyUpdateSpinning();
    this.updateSpinning();
  }

  componentWillUnmount() {
    this.cancelExistingSpin();
  }

  debouncifyUpdateSpinning = (props?: SpinProps) => {
    const { delay } = props || this.props;
    if (delay) {
      this.cancelExistingSpin();
      this.updateSpinning = debounce(this.originalUpdateSpinning, delay);
    }
  };

  updateSpinning = () => {
    const { spinning } = this.props;
    const { spinning: currentSpinning } = this.state;
    if (currentSpinning !== spinning) {
      this.setState({ spinning });
    }
  };

  cancelExistingSpin() {
    const { updateSpinning } = this;
    if (updateSpinning && (updateSpinning as any).cancel) {
      (updateSpinning as any).cancel();
    }
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
      animateProps,
      ...restProps
    } = this.props;
    const { spinning } = this.state;
    const { getPrefixCls } = this.context;
    const prefixCls = getPrefixCls('spin', customizePrefixCls);

    const spinClassName = classNames(
      prefixCls,
      {
        [`${prefixCls}-sm`]: size === Size.small,
        [`${prefixCls}-lg`]: size === Size.large,
        [`${prefixCls}-spinning`]: spinning,
        [`${prefixCls}-show-text`]: !!tip,
      },
      className,
    );

    // fix https://fb.me/react-unknown-prop
    const divProps = omit(restProps, ['spinning', 'delay', 'indicator']);

    const spinElement = (
      <div {...divProps} className={spinClassName} style={style} key="loading">
        {renderIndicator(this.props, prefixCls)}
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
        <Animate {...animateProps} {...divProps} component="div" className={animateClassName} transitionName="fade">
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
