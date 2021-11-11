import React, { CSSProperties, FunctionComponent, memo, ReactNode, useContext } from 'react';
import classNames from 'classnames';
import { Size } from '../_util/enum';
import ConfigContext from '../config-provider/ConfigContext';

export interface ButtonGroupProps {
  size?: Size;
  style?: CSSProperties;
  className?: string;
  prefixCls?: string;
  children?: ReactNode;
}

const ButtonGroup: FunctionComponent<ButtonGroupProps> = function ButtonGroup(props) {
  const { prefixCls: customizePrefixCls, size, className, ...others } = props;
  const { getPrefixCls } = useContext(ConfigContext);
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
      break;
    default:
  }

  const classes = classNames(
    prefixCls,
    {
      [`${prefixCls}-${sizeCls}`]: sizeCls,
    },
    className,
  );

  return <div {...others} className={classes} />;
};

ButtonGroup.displayName = 'ButtonGroup';

export default memo(ButtonGroup);
