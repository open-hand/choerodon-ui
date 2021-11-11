import React, { CSSProperties, FunctionComponent, useContext } from 'react';
import classNames from 'classnames';
import ConfigContext from '../config-provider/ConfigContext';

export interface CardGridProps {
  prefixCls?: string;
  style?: CSSProperties;
  className?: string;
}

const Grid: FunctionComponent<CardGridProps> = function Grid(props) {
  const { prefixCls: customizePrefixCls, className, ...others } = props;
  const { getPrefixCls } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('card', customizePrefixCls);
  const classString = classNames(`${prefixCls}-grid`, className);
  return <div {...others} className={classString} />;
};

Grid.displayName = 'CardGrid';

export default Grid;
