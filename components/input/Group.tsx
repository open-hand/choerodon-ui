import React, { CSSProperties, FunctionComponent } from 'react';
import classNames from 'classnames';
import { Size } from '../_util/enum';
import { getPrefixCls } from '../configure';

export interface GroupProps {
  className?: string;
  size?: Size;
  children?: any;
  style?: CSSProperties;
  prefixCls?: string;
  compact?: boolean;
}

const Group: FunctionComponent<GroupProps> = props => {
  const { prefixCls: customizePrefixCls, className = '', size, compact, style, children } = props;
  const prefixCls = getPrefixCls('input-group', customizePrefixCls);
  const cls = classNames(
    prefixCls,
    {
      [`${prefixCls}-lg`]: size === Size.large,
      [`${prefixCls}-sm`]: size === Size.small,
      [`${prefixCls}-compact`]: compact,
    },
    className,
  );
  return (
    <span className={cls} style={style}>
      {children}
    </span>
  );
};

export default Group;
