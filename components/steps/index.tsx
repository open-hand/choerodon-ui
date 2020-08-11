import React, { Component, CSSProperties } from 'react';
import PropTypes from 'prop-types';
import RcSteps, { Step, StepGroup } from '../rc-components/steps';
import { Size } from '../_util/enum';
import { getPrefixCls } from '../configure';

export interface StepsProps {
  prefixCls?: string;
  iconPrefix?: string;
  current?: number;
  status?: 'wait' | 'process' | 'finish' | 'error';
  size?: Size;
  direction?: 'horizontal' | 'vertical';
  progressDot?: boolean | Function;
  style?: CSSProperties;
  headerRender?: () => React.ReactElement<any>;
  headerIcon?:string;
  headerText?:string;
}

export interface StepProps {
  className?: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
  status?: 'wait' | 'process' | 'finish' | 'error';
  disabled?: boolean;
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  style?: React.CSSProperties;
}

export default class Steps extends Component<StepsProps, any> {
  static displayName = 'Steps';

  static Step = Step as React.ClassicComponentClass<StepProps>;

  static StepGroup = StepGroup as React.ClassicComponentClass<StepsProps>;

  static defaultProps = {
    iconPrefix: 'icon',
    current: 0,
  };

  static propTypes = {
    prefixCls: PropTypes.string,
    iconPrefix: PropTypes.string,
    current: PropTypes.number,
  };

  render() {
    const { props } = this;
    return <RcSteps {...props} prefixCls={getPrefixCls('steps', props.prefixCls)} />;
  }
}
