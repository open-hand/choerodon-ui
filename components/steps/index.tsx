import React, { Component, CSSProperties } from 'react';
import PropTypes from 'prop-types';
import RcSteps from '../rc-components/steps';
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
}

export default class Steps extends Component<StepsProps, any> {
  static displayName = 'Steps';
  static Step = RcSteps.Step;

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
    return (
      <RcSteps {...this.props} prefixCls={getPrefixCls('steps', this.props.prefixCls)} />
    );
  }
}
