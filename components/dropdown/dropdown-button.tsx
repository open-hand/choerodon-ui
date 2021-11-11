import React, { FunctionComponent, memo, MouseEventHandler, useContext } from 'react';
import classNames from 'classnames';
import Button from '../button';
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
    ...restProps
  } = props;
  const { getPrefixCls } = useContext(ConfigContext);

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
  if ('visible' in props) {
    (dropdownProps as any).visible = visible;
  }

  return (
    <ButtonGroup {...restProps} className={classNames(prefixCls, className)}>
      <Button type={type} disabled={disabled} onClick={onClick}>
        {children}
      </Button>
      <Dropdown {...dropdownProps}>
        <Button type={type}>
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
