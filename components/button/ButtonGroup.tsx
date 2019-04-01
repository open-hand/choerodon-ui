import React, { CSSProperties, SFC } from 'react';
import classNames from 'classnames';
import { Size } from '../_util/enum';
import { getPrefixCls } from '../configure';

export interface ButtonGroupProps {
  size?: Size;
  style?: CSSProperties;
  className?: string;
  prefixCls?: string;
}

const ButtonGroup: SFC<ButtonGroupProps> = (props) => {
  const { prefixCls: customizePrefixCls, size, className, ...others } = props;
  const prefixCls = getPrefixCls('btn-group', customizePrefixCls);

  // large => lg
  // small => sm
  let sizeCls = '';
  switch (size) {
    case Size.large:
      sizeCls = 'lg';
      break;
    case Size.small:
      sizeCls = 'sm';
    default:
      break;
  }

  const classes = classNames(prefixCls, {
    [`${prefixCls}-${sizeCls}`]: sizeCls,
  }, className);

  return <div {...others} className={classes} />;
};

ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;
