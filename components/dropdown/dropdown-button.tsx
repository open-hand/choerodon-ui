import React, { Component, MouseEventHandler } from 'react';
import Button from '../button';
import { ButtonGroupProps } from '../button/ButtonGroup';
import Icon from '../icon';
import Dropdown, { DropDownProps } from './dropdown';
import classNames from 'classnames';
import { getPrefixCls } from '../configure';

const ButtonGroup = Button.Group;

export interface DropdownButtonProps extends ButtonGroupProps, DropDownProps {
  type?: 'primary' | 'ghost' | 'dashed';
  disabled?: boolean;
  onClick?: MouseEventHandler<any>;
  children?: any;
}

export default class DropdownButton extends Component<DropdownButtonProps, any> {
  static displayName = 'DropdownButton';
  static defaultProps = {
    placement: 'bottomRight',
    type: 'default',
  };

  render() {
    const {
      prefixCls: customizePrefixCls,
      type,
      disabled,
      onClick,
      children,
      className,
      overlay,
      trigger,
      align,
      visible,
      onVisibleChange,
      placement,
      getPopupContainer,
      ...restProps
    } = this.props;

    const prefixCls = getPrefixCls('dropdown-button', customizePrefixCls);
    const dropdownProps = {
      align,
      overlay,
      disabled,
      trigger: disabled ? [] : trigger,
      onVisibleChange,
      placement,
      getPopupContainer,
    };
    if ('visible' in this.props) {
      (dropdownProps as any).visible = visible;
    }

    return (
      <ButtonGroup
        {...restProps}
        className={classNames(prefixCls, className)}
      >
        <Button
          type={type}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </Button>
        <Dropdown {...dropdownProps}>
          <Button type={type}>
            <Icon type="arrow_drop_down" />
          </Button>
        </Dropdown>
      </ButtonGroup>
    );
  }
}
