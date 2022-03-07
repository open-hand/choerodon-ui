import React, { FunctionComponent, memo, MouseEventHandler, useContext } from 'react';
import classNames from 'classnames';
import Button, { ButtonProps } from '../button';
import { ButtonGroupProps } from '../button/ButtonGroup';
import Icon from '../icon';
import Dropdown, { DropDownProps } from './dropdown';
import ConfigContext from '../config-provider/ConfigContext';

const ButtonGroup = Button.Group;

export interface DropdownButtonProps extends ButtonGroupProps, DropDownProps {
  type?: 'primary' | 'ghost' | 'dashed';
  disabled?: boolean;
  onClick?: MouseEventHandler<any>;
  children?: any;
  buttonProps?: ButtonProps;
  buttonGroupPrefixCls?: string;
}

const DropdownButton: FunctionComponent<DropdownButtonProps> = function DropdownButton(props) {
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
    buttonProps,
    buttonGroupPrefixCls,
    overlayPlacements,
    ...restProps
  } = props;
  const { getPrefixCls } = useContext(ConfigContext);

  const prefixCls = getPrefixCls('dropdown', customizePrefixCls);
  const dropdownProps: DropDownProps = {
    prefixCls,
    align,
    overlay,
    disabled,
    trigger: disabled ? [] : trigger,
    onVisibleChange,
    placement,
    getPopupContainer,
    overlayPlacements,
  };
  if ('visible' in props) {
    dropdownProps.visible = visible;
  }

  return (
    <ButtonGroup {...restProps} prefixCls={buttonGroupPrefixCls} className={classNames(`${prefixCls}-button`, className)}>
      <Button {...buttonProps} type={type} disabled={disabled} onClick={onClick}>
        {children}
      </Button>
      <Dropdown {...dropdownProps}>
        <Button {...buttonProps} type={type}>
          <Icon type="arrow_drop_down" />
        </Button>
      </Dropdown>
    </ButtonGroup>
  );
};

DropdownButton.displayName = 'DropdownButton';

DropdownButton.defaultProps = {
  placement: 'bottomRight',
};

export default memo(DropdownButton);
