import React, { CSSProperties, FocusEventHandler, MouseEventHandler } from 'react';
import classNames from 'classnames';
import { getConfig } from '../configure';

export interface IconProps {
  type: string;
  className?: string;
  title?: string;
  customFontName?: string;
  onClick?: MouseEventHandler<any>;
  onFocus?: FocusEventHandler<any>;
  onMouseDown?: MouseEventHandler<any>;
  onMouseUp?: MouseEventHandler<any>;
  onMouseLeave?: MouseEventHandler<any>;
  style?: CSSProperties;
  tabIndex?: number; 
}

const Icon = function Icon(props: IconProps) {
  const iconfontPrefix = getConfig('iconfontPrefix');
  const { type, customFontName, className = '', ...otherProps } = props;
  const classString = classNames(iconfontPrefix, customFontName, `${iconfontPrefix}-${type}`, className);
  return <i {...otherProps} className={classString} />;
};

Icon.displayName = 'Icon';

export default Icon;
