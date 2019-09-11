import React, { Component, CSSProperties, FormEventHandler } from 'react';
import classNames from 'classnames';
import RcInputNumber from '../rc-components/input-number';
import { AbstractInputProps } from '../input/Input';
import { Size } from '../_util/enum';
import { getPrefixCls } from '../configure';

export interface InputNumberProps extends AbstractInputProps {
  prefixCls?: string;
  min?: number;
  max?: number;
  value?: number;
  step?: number | string;
  defaultValue?: number;
  tabIndex?: number;
  onKeyDown?: FormEventHandler<any>;
  onChange?: (value: number | string | undefined) => void;
  disabled?: boolean;
  size?: Size;
  formatter?: (value: number | string | undefined) => string;
  parser?: (displayValue: string | undefined) => number;
  placeholder?: string;
  style?: CSSProperties;
  className?: string;
  name?: string;
  id?: string;
  precision?: number;
}

export default class InputNumber extends Component<InputNumberProps, any> {
  static displayName = 'InputNumber';

  static defaultProps = {
    step: 1,
  };

  private inputNumberRef: any;

  render() {
    const { className, size, prefixCls: customizePrefixCls, ...others } = this.props;
    const prefixCls = getPrefixCls('input-number', customizePrefixCls);
    const inputNumberClass = classNames(
      {
        [`${prefixCls}-lg`]: size === Size.large,
        [`${prefixCls}-sm`]: size === Size.small,
      },
      className,
    );

    return (
      <RcInputNumber
        ref={(c: any) => (this.inputNumberRef = c)}
        className={inputNumberClass}
        prefixCls={prefixCls}
        {...others}
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
