import React, { memo, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { ButtonProps } from '../../button/Button';

export interface TableButtonProps {
  prefixCls?: string;
  buttons: ReactElement<ButtonProps>[];
  children?: ReactNode;
  className?: string;
}

export default memo(function TableButtons({ prefixCls, buttons, children, className }: TableButtonProps) {
  const buttonGroup = buttons.length ? (
    <span className={`${prefixCls}-toolbar-button-group`}>{buttons}</span>
  ) : null;
  if (buttonGroup || children) {
    return (
      <div className={classNames(`${prefixCls}-toolbar`, className)}>
        {buttonGroup}
        {children}
      </div>
    );
  }

  return null;
});
