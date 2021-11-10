import React, { CSSProperties, FunctionComponent, memo, useContext } from 'react';
import classNames from 'classnames';
import { Size } from '../_util/enum';
import ConfigContext from '../config-provider/ConfigContext';

export interface GroupProps {
  className?: string;
  size?: Size;
  children?: any;
  style?: CSSProperties;
  prefixCls?: string;
  compact?: boolean;
}

const Group: FunctionComponent<GroupProps> = function Group(props) {
  const { prefixCls: customizePrefixCls, className = '', size, compact, style, children } = props;
  const { getPrefixCls } = useContext(ConfigContext);
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

Group.displayName = 'Group';

export default memo(Group);
