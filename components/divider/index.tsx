import React, { CSSProperties, FunctionComponent, memo, ReactNode, useContext } from 'react';
import classNames from 'classnames';
import ConfigContext from '../config-provider/ConfigContext';

export interface DividerProps {
  prefixCls?: string;
  type?: 'horizontal' | 'vertical';
  orientation?: 'left' | 'right' | '';
  className?: string;
  children?: ReactNode;
  dashed?: boolean;
  style?: CSSProperties;
}

const Divider: FunctionComponent<DividerProps> = function Divider({
  prefixCls: customizePrefixCls,
  type = 'horizontal',
  orientation = '',
  className,
  children,
  dashed,
  ...restProps
}) {
  const { getPrefixCls } = useContext(ConfigContext);
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
};

Divider.displayName = 'Divider';

export default memo(Divider);
