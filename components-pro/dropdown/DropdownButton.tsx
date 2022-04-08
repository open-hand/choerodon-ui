import React, { MouseEventHandler, useContext } from 'react';
import classNames from 'classnames';
import ButtonGroup, { ButtonGroupProps } from 'choerodon-ui/lib/button/ButtonGroup';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import Dropdown, { DropDownProps } from './Dropdown';
import { ButtonProps } from '../button/Button';
import { ButtonType, FuncType } from '../button/interface';
import Button from '../button';
import Icon from '../icon';
import { Placements } from './enum';

export interface DropdownButtonProps extends ButtonGroupProps, DropDownProps {
  type?: ButtonType;
  disabled?: boolean;
  onClick?: MouseEventHandler<any>;
  children?: any;
  buttonProps?: ButtonProps;
  buttonGroupPrefixCls?: string;
}

interface DropdownButtonInterface extends React.FC<DropdownButtonProps> {
  __PRO_DROPDOWN_BUTTON: boolean;
}

const DropdownButton: DropdownButtonInterface = function DropdownButton(props) {
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
    ...restProps
  } = props;
  const { getProPrefixCls } = useContext(ConfigContext);

  const prefixCls = getProPrefixCls('dropdown', customizePrefixCls);
  const dropdownProps: DropDownProps = {
    prefixCls,
    align,
    overlay,
    disabled,
    trigger: disabled ? [] : trigger,
    onVisibleChange,
    placement,
    getPopupContainer,
  };
  if ('visible' in props) {
    dropdownProps.visible = visible;
  }

  return (
    <ButtonGroup {...restProps} prefixCls={buttonGroupPrefixCls} className={classNames(`${prefixCls}-button`, className)}>
      <Button  funcType={FuncType.flat} {...buttonProps} type={type} disabled={disabled} onClick={onClick}>
        {children}
      </Button>
      <Dropdown {...dropdownProps}>
        <Button funcType={FuncType.flat} icon="arrow_drop_down" {...buttonProps} type={type} />
      </Dropdown>
    </ButtonGroup>
  );
};

DropdownButton.__PRO_DROPDOWN_BUTTON = true;

DropdownButton.displayName = 'DropdownButton';

DropdownButton.defaultProps = {
  placement: Placements.bottomRight,
};

export default DropdownButton;
