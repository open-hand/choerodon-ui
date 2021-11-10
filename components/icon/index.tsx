import React, { CSSProperties, FocusEventHandler, MouseEventHandler, useContext } from 'react';
import classNames from 'classnames';
import createFromIconfontCN from './IconFont';
import ConfigContext from '../config-provider/ConfigContext';

export interface IconProps {
  type: string;
  className?: string;
  title?: string;
  customFontName?: string;
  onClick?: MouseEventHandler<any>;
  onFocus?: FocusEventHandler<any>;
  onMouseDown?: MouseEventHandler<any>;
  onMouseUp?: MouseEventHandler<any>;
  onMouseEnter?: MouseEventHandler<any>;
  onMouseLeave?: MouseEventHandler<any>;
  style?: CSSProperties;
  tabIndex?: number;
  width?: number | string;
  height?: number | string;
  scriptUrl?: string;
}

const Icon = function Icon(props: IconProps) {
  const { getConfig } = useContext(ConfigContext);
  const iconfontPrefix = getConfig('iconfontPrefix');
  const { type, customFontName, height, width, className = '', scriptUrl, ...otherProps } = props;
  const classString = classNames(iconfontPrefix, customFontName, `${iconfontPrefix}-${type}`, className);
  if (
    scriptUrl &&
    typeof document !== 'undefined' &&
    typeof window !== 'undefined' &&
    typeof document.createElement === 'function'
  ) {
    const SvgIcon = createFromIconfontCN({ scriptUrl });
    if (SvgIcon) {
      return <SvgIcon type={type} width={width} height={height} />;
    }
  }
  return <i {...otherProps} className={classString} />;
};

Icon.displayName = 'Icon';
Icon.createFromIconfontCN = createFromIconfontCN;
Icon.__C7N_ICON = true;

export default Icon;
