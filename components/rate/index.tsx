import React, { Component, CSSProperties, ReactNode } from 'react';
import Icon from '../icon';
import RcRate from '../rc-components/rate';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

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
  checkedColor?: string;
  unCheckedColor?: string;
}

export default class Rate extends Component<RateProps, any> {
  static displayName = 'Rate';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static defaultProps = {
    character: <Icon type="star" />,
  };

  context: ConfigContextValue;

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
    const { getPrefixCls } = this.context;
    return <RcRate ref={this.saveRate} prefixCls={getPrefixCls('rate')} {...this.props} />;
  }
}
