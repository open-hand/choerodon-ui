import React, { Component, CSSProperties, ReactNode } from 'react';
import PropTypes from 'prop-types';
import Icon from '../icon';
import RcRate from '../rc-components/rate';
import { getPrefixCls } from '../configure';

export interface RateProps {
  prefixCls?: string;
  count?: number;
  value?: number;
  defaultValue?: number;
  allowHalf?: boolean;
  allowClear?: boolean;
  disabled?: boolean;
  onChange?: (value: number) => any;
  onHoverChange?: (value: number) => any;
  character?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export default class Rate extends Component<RateProps, any> {
  static displayName = 'Rate';
  static propTypes = {
    prefixCls: PropTypes.string,
    character: PropTypes.node,
  };

  static defaultProps = {
    character: <Icon type="star" />,
  };

  private rcRate: any;

  focus() {
    this.rcRate.focus();
  }

  blur() {
    this.rcRate.blur();
  }

  saveRate = (node: any) => {
    this.rcRate = node;
  };

  render() {
    return <RcRate ref={this.saveRate} prefixCls={getPrefixCls('rate')} {...this.props} />;
  }
}
