import React, { Component, CSSProperties, FormEventHandler, ReactElement } from 'react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import BigNumber from 'bignumber.js';
import RcInputNumber from '../rc-components/input-number';
import Input, { AbstractInputProps } from '../input/Input';
import { Size } from '../_util/enum';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

// omitting this attrs because they conflicts with the ones defined in InputNumberProps
export type OmitAttrs = 'defaultValue' | 'onChange' | 'size' | 'value' | 'min' | 'max' | 'step';

export interface InputNumberProps extends Omit<AbstractInputProps<HTMLInputElement>, OmitAttrs> {
  prefixCls?: string;
  min?: BigNumber.Value;
  max?: BigNumber.Value;
  value?: BigNumber.Value;
  step?: BigNumber.Value;
  defaultValue?: BigNumber.Value;
  tabIndex?: number;
  onKeyDown?: FormEventHandler<any>;
  onChange?: (value: BigNumber.Value | undefined) => void;
  disabled?: boolean;
  size?: Size;
  formatter?: (value: BigNumber.Value | undefined) => string;
  parser?: (displayValue: string | undefined) => BigNumber.Value;
  placeholder?: string;
  style?: CSSProperties;
  className?: string;
  name?: string;
  id?: string;
  precision?: number;
  allowThousandth?: boolean;
  renderInput?: <T extends object>(props: T) => ReactElement<T>;
  renderHandler?: (handler: ReactElement) => ReactElement;
  upHandler?: ReactElement;
  downHandler?: ReactElement;
}

export function formatNumber(value: BigNumber.Value | undefined) {
  const vs = String(value).split('.');
  const v = vs[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return vs.length > 1 ? `${v}.${vs[1]}` : v;
}

export function parseNumber(value: string) {
  if (value.indexOf(',') !== -1) {
    return value.replace(/,/g, '');
  }
  return value;
}

function renderInput(props) {
  return <Input {...props} />;
}

export default class InputNumber extends Component<InputNumberProps, any> {
  static displayName = 'InputNumber';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static defaultProps = {
    step: 1,
  };

  context: ConfigContextValue;

  private inputNumberRef: any;

  numberFormatter = (value: BigNumber.Value | undefined): any => {
    const { formatter } = this.props;
    const v = formatNumber(value);
    return formatter ? formatter(v) : v;
  };

  numberParser = (value: string): BigNumber.Value => {
    const { parser } = this.props;
    const v = parseNumber(value);
    return parser ? parser(v) : v;
  };

  render() {
    const { allowThousandth = false, className, size, prefixCls: customizePrefixCls, ...others } = this.props;
    const { getPrefixCls } = this.context;
    const prefixCls = getPrefixCls('input-number', customizePrefixCls);
    const inputNumberClass = classNames(
      {
        [`${prefixCls}-lg`]: size === Size.large,
        [`${prefixCls}-sm`]: size === Size.small,
      },
      className,
    );

    let otherProp = others;
    if (allowThousandth) {
      otherProp = {
        ...otherProp,
        formatter: this.numberFormatter,
        parser: this.numberParser,
      };
    }

    return (
      <RcInputNumber
        ref={(c: any) => (this.inputNumberRef = c)}
        className={inputNumberClass}
        prefixCls={prefixCls}
        renderInput={renderInput}
        {...omit(otherProp, ['form'])}
      />
    );
  }

  focus() {
    this.inputNumberRef.focus();
  }

  blur() {
    this.inputNumberRef.blur();
  }
}
