import React, { ReactNode, useContext } from 'react';
import classNames from 'classnames';
import ButtonGroup, { ButtonGroupProps } from 'choerodon-ui/lib/button/ButtonGroup';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import Dropdown, { DropDownProps } from './Dropdown';
import { ButtonProps } from '../button/Button';
import { FuncType } from '../button/interface';
import Button from '../button';
import { Placements } from './enum';

export interface DropdownButtonProps extends ButtonGroupProps, DropDownProps, Omit<ButtonProps, 'icon'> {
  icon?: ReactNode;
  buttonProps?: ButtonProps;
  buttonGroupPrefixCls?: string;
}

interface DropdownButtonInterface extends React.FC<DropdownButtonProps> {
  __PRO_DROPDOWN_BUTTON: boolean;
}

const DropdownButton: DropdownButtonInterface = function DropdownButton(props) {
  const {
    trigger,
    overlay,
    onHiddenChange,
    onHiddenBeforeChange,
    onVisibleChange,
    onOverlayClick,
    hidden,
    visible,
    defaultHidden,
    defaultVisible,
    disabled,
    loading,
    getPopupContainer,
    suffixCls: customizeSuffixCls,
    prefixCls: customizePrefixCls,
    className,
    placement,
    popupClassName,
    block,
    style,
    icon,
    size,
    color,
    funcType,
    children,
    buttonProps,
    buttonGroupPrefixCls,
    ...restProps
  } = props;
  const {
    color: btnPropsColor,
    funcType: btnPropsFuncType,
    size: btnPropsSize,
    disabled: btnPropsDisabled,
    loading: btnPropsLoading,
    ...restButtonProps
  } = buttonProps || {};
  const { getProPrefixCls } = useContext(ConfigContext);
  const prefixCls = getProPrefixCls('dropdown', customizePrefixCls);
  const dropdownProps: DropDownProps = {
    trigger: disabled ? [] : trigger,
    overlay,
    onHiddenChange,
    onHiddenBeforeChange,
    onVisibleChange,
    onOverlayClick,
    hidden,
    visible,
    defaultHidden,
    defaultVisible,
    disabled: disabled || loading || btnPropsLoading,
    getPopupContainer,
    suffixCls: customizeSuffixCls,
    prefixCls,
    placement,
    popupClassName,
  };

  return (
    <ButtonGroup
      size={size}
      style={style}
      prefixCls={buttonGroupPrefixCls}
      className={
        classNames(
          `${prefixCls}-button`,
          className,
          {
            [`${prefixCls}-button-raised`]: !funcType || funcType === FuncType.raised,
            [`${prefixCls}-button-flat`]: funcType === FuncType.flat,
            [`${prefixCls}-button-link`]: funcType === FuncType.link,
            [`${prefixCls}-button-block`]: block,
          },
        )
      }
    >
      <Button
        {...restProps}
        {...restButtonProps}
        disabled={disabled || btnPropsDisabled}
        loading={loading || btnPropsLoading}
        color={color || btnPropsColor}
        funcType={funcType || btnPropsFuncType}
        size={size || btnPropsSize}
      >
        {children}
      </Button>
      <Dropdown {...dropdownProps}>
        {
          icon ? (
            <Button
              color={color || btnPropsColor}
              funcType={funcType || btnPropsFuncType}
              size={size || btnPropsSize}
              disabled={dropdownProps.disabled}
            >{icon}</Button>
          ) : (
            <Button
              color={color || btnPropsColor}
              funcType={funcType || btnPropsFuncType}
              size={size || btnPropsSize}
              disabled={dropdownProps.disabled}
              icon="arrow_drop_down"
            />
          )
        }
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
