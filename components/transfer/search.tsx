import React, { ChangeEvent, Component, FormEvent, MouseEventHandler } from 'react';
import Icon from '../icon';
import Input, { InputProps } from '../input';

export interface TransferSearchProps {
  prefixCls?: string;
  placeholder?: string;
  onChange?: (e: FormEvent<any>) => void;
  handleClear?: MouseEventHandler<any>;
  value?: any;
  inputProps?: InputProps;
}

export default class Search extends Component<TransferSearchProps, any> {
  static displayName = 'TransferSearch';

  static defaultProps = {
    placeholder: '',
  };

  handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(e);
    }
  };

  handleClear: MouseEventHandler<HTMLAnchorElement> = e => {
    e.preventDefault();

    const { handleClear } = this.props;
    if (handleClear) {
      handleClear(e);
    }
  };

  render() {
    const { placeholder, value, prefixCls, inputProps } = this.props;
    const icon =
      value && value.length > 0 ? (
        <a href="#" className={`${prefixCls}-action`} onClick={this.handleClear}>
          <Icon type="cross-circle" />
        </a>
      ) : (
        <span className={`${prefixCls}-action`}>
          <Icon type="search" />
        </span>
      );

    return (
      <div>
        <Input
          {...inputProps}
          placeholder={placeholder}
          className={prefixCls}
          value={value}
          onChange={this.handleChange}
        />
        {icon}
      </div>
    );
  }
}
