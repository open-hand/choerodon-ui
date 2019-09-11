import React, { CSSProperties, ReactNode } from 'react';
import classNames from 'classnames';
import { getPrefixCls } from '../configure';

export interface DividerProps {
  prefixCls?: string;
  type?: 'horizontal' | 'vertical';
  orientation?: 'left' | 'right' | '';
  className?: string;
  children?: ReactNode;
  dashed?: boolean;
  style?: CSSProperties;
}

export default function Divider({
  prefixCls: customizePrefixCls,
  type = 'horizontal',
  orientation = '',
  className,
  children,
  dashed,
  ...restProps
}: DividerProps) {
  const prefixCls = getPrefixCls('divider', customizePrefixCls);
  const orientationPrefix = orientation.length > 0 ? `-${orientation}` : orientation;
  const classString = classNames(className, prefixCls, `${prefixCls}-${type}`, {
    [`${prefixCls}-with-text${orientationPrefix}`]: children,
    [`${prefixCls}-dashed`]: !!dashed,
  });
  return (
    <div className={classString} {...restProps}>
      {children && <span className={`${prefixCls}-inner-text`}>{children}</span>}
    </div>
  );
}
