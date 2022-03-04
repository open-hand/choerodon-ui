import React, { cloneElement, Component, KeyboardEvent, MouseEvent, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import Input, { InputProps } from './Input';
import Button, { ButtonProps } from '../button';
import { Size } from '../_util/enum';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';
import Icon from '../icon';

export type SearchEvent = MouseEvent<HTMLElement> | KeyboardEvent<HTMLInputElement>;

export interface SearchProps extends InputProps {
  inputPrefixCls?: string;
  onSearch?: (value: string, event?: SearchEvent) => any;
  enterButton?: boolean | ReactNode;
  buttonProps?: ButtonProps;
}

export default class Search extends Component<SearchProps, any> {
  static displayName = 'Search';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static defaultProps = {
    enterButton: true,
    size: Size.small,
  };

  context: ConfigContextValue;

  private input: Input;

  onSearch = (e: SearchEvent) => {
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch(this.input.input.value, e);
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

  getButtonOrIcon(prefixCls?: string) {
    const { enterButton, size, disabled, buttonProps } = this.props;
    if (!enterButton) {
      return <Icon className={`${prefixCls}-icon`} type="search" key="searchIcon" onClick={this.onSearch} />;
    }
    const enterButtonAsElement = enterButton as ReactElement<any>;
    const isButton = enterButtonAsElement.type && (
      (enterButtonAsElement.type as any).__C7N_BUTTON === true || (enterButtonAsElement.type as any).__PRO_BUTTON === true || (enterButtonAsElement.type as any).__ANT_BUTTON === true
    );
    if (isButton || enterButtonAsElement.type === 'button') {
      return cloneElement(enterButtonAsElement, isButton ? {
        className: `${prefixCls}-button`,
        size,
        onClick: (e: MouseEvent<HTMLElement>) => {
          if (enterButtonAsElement) {
            const { props } = enterButtonAsElement;
            if (props && props.onClick) {
              props.onClick(e);
            }
          }
          this.onSearch(e);
        },
      } : {
        onClick: this.onSearch,
      });
    }
    return (
      <Button
        {...buttonProps}
        className={`${prefixCls}-button`}
        type="primary"
        size={size}
        disabled={disabled}
        key="enterButton"
        icon={enterButton === true || !enterButton ? 'search' : undefined}
        onClick={this.onSearch}
      >
        {enterButton === true ? undefined : enterButton}
      </Button>
    );
  }

  render() {
    const { className, inputPrefixCls, size, suffix, enterButton, ...others } = this.props;
    const { getPrefixCls } = this.context;
    const prefixCls = this.getPrefixCls();
    delete (others as any).onSearch;
    delete (others as any).prefixCls;
    const buttonOrIcon = this.getButtonOrIcon(prefixCls);
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
