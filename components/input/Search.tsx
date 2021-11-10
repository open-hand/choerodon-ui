import React, { cloneElement, Component, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import Input, { InputProps } from './Input';
import Button from '../button';
import { Size } from '../_util/enum';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export interface SearchProps extends InputProps {
  inputPrefixCls?: string;
  onSearch?: (value: string) => any;
  enterButton?: boolean | ReactNode;
}

export default class Search extends Component<SearchProps, any> {
  static displayName = 'Search';

  static get contextType() {
    return ConfigContext;
  }

  static defaultProps = {
    enterButton: false,
    size: Size.small,
  };

  context: ConfigContextValue;

  private input: Input;

  onSearch = () => {
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch(this.input.input.value);
    }
    this.input.focus();
  };

  focus() {
    this.input.focus();
  }

  blur() {
    this.input.blur();
  }

  saveInput = (node: Input) => {
    this.input = node;
  };

  getPrefixCls() {
    const { prefixCls } = this.props;
    const { getPrefixCls } = this.context;
    return getPrefixCls('input-search', prefixCls);
  }

  getButtonOrIcon() {
    const { enterButton, size } = this.props;
    if (!enterButton) {
      return <Button type="primary" size={size} shape="circle" icon="search" />;
    }
    const enterButtonAsElement = enterButton as ReactElement<any>;
    if (enterButtonAsElement.type === Button || enterButtonAsElement.type === 'button') {
      return cloneElement(
        enterButtonAsElement,
        enterButtonAsElement.type === Button
          ? {
            className: `${this.getPrefixCls()}-button`,
            size,
            onClick: this.onSearch,
          }
          : {
            onClick: this.onSearch,
          },
      );
    }
    if (enterButton === true) {
      return (
        <Button type="primary" size={size} shape="circle" onClick={this.onSearch} icon="search" />
      );
    }
    return (
      <Button type="primary" size={size} onClick={this.onSearch} key="enterButton">
        {enterButton}
      </Button>
    );
  }

  render() {
    const { className, inputPrefixCls, size, suffix, enterButton, ...others } = this.props;
    const { getPrefixCls } = this.context;
    const prefixCls = this.getPrefixCls();
    delete (others as any).onSearch;
    delete (others as any).prefixCls;
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
        prefixCls={getPrefixCls('input', inputPrefixCls)}
        suffix={searchSuffix}
        ref={this.saveInput}
      />
    );
  }
}
