import React, { memo, ReactElement, ReactNode } from 'react';
import { ButtonProps } from '../../button/Button';

export interface TableButtonProps {
  prefixCls?: string;
  buttons: ReactElement<ButtonProps>[];
  children?: ReactNode;
}

export default memo(function TableButtons({ prefixCls, buttons, children }: TableButtonProps) {
  const buttonGroup = buttons.length ? (
    <span className={`${prefixCls}-toolbar-button-group`}>{buttons}</span>
  ) : null;
  if (buttonGroup || children) {
    return (
      <div className={`${prefixCls}-toolbar`}>
        {buttonGroup}
        {children}
      </div>
    );
  }

  return null;
});
