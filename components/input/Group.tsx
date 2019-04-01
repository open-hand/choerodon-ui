import React, { CSSProperties, StatelessComponent } from 'react';
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

const Group: StatelessComponent<GroupProps> = (props) => {
  const { prefixCls: customizePrefixCls, className = '' } = props;
  const prefixCls = getPrefixCls('input-group', customizePrefixCls);
  const cls = classNames(prefixCls, {
    [`${prefixCls}-lg`]: props.size === Size.large,
    [`${prefixCls}-sm`]: props.size === Size.small,
    [`${prefixCls}-compact`]: props.compact,
  }, className);
  return (
    <span className={cls} style={props.style}>
      {props.children}
    </span>
  );
};

export default Group;
