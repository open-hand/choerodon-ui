import * as React from 'react';
import classNames from 'classnames';
import Input, { InputProps } from './Input';
import Button from '../button';

export interface SearchProps extends InputProps {
  inputPrefixCls?: string;
  onSearch?: (value: string) => any;
  enterButton?: boolean | React.ReactNode;
}

export default class Search extends React.Component<SearchProps, any> {
  static defaultProps = {
    inputPrefixCls: 'ant-input',
    prefixCls: 'ant-input-search',
    enterButton: false,
    size: 'small',
  };

  private input: Input;

  onSearch = () => {
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch(this.input.input.value);
    }
    this.input.focus();
  }

  focus() {
    this.input.focus();
  }

  blur() {
    this.input.blur();
  }

  saveInput = (node: Input) => {
    this.input = node;
  }

  getButtonOrIcon() {
    const { enterButton, prefixCls, size } = this.props;
    if (!enterButton) {
      return (<Button
        type="primary"
        size={size}
        shape="circle"
        icon="search"
      />)
    }
    const enterButtonAsElement = enterButton as React.ReactElement<any>;
    if (enterButtonAsElement.type === Button || enterButtonAsElement.type === 'button') {
      return React.cloneElement(enterButtonAsElement, enterButtonAsElement.type === Button ? {
        className: `${prefixCls}-button`,
        size,
        onClick: this.onSearch,
      } : {
        onClick: this.onSearch,
      });
    }
    if (enterButton === true) {
      return (
        <Button
          type="primary"
          size={size}
          shape="circle"
          onClick={this.onSearch}
          icon="search"
        />
      )
    } else {
      return (
        <Button
          type="primary"
          size={size}
          onClick={this.onSearch}
          key="enterButton"
        >
          {enterButton}
        </Button>
      );
    }
  }

  render() {
    const { className, prefixCls, inputPrefixCls, size, suffix,  enterButton, ...others } = this.props;
    delete (others as any).onSearch;
    const buttonOrIcon = this.getButtonOrIcon();
    const searchSuffix = suffix ? [suffix, buttonOrIcon] : buttonOrIcon;
    const inputClassName = classNames(prefixCls, className, {
      [`${prefixCls}-enter-button`]: !!enterButton,
      [`${prefixCls}-${size}`]: !!size,
    });
    return (
      <Input
        onPressEnter={this.onSearch}
        {...others}
        size={size}
        className={inputClassName}
        prefixCls={inputPrefixCls}
        suffix={searchSuffix}
        ref={this.saveInput}
      />
    );
  }
}
