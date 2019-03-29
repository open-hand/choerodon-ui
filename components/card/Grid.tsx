import React, { CSSProperties, SFC } from 'react';
import classNames from 'classnames';
import { getPrefixCls } from '../configure';

export interface CardGridProps {
  prefixCls?: string;
  style?: CSSProperties;
  className?: string;
}

const Grid: SFC<CardGridProps> = (props) => {
  const { prefixCls: customizePrefixCls, className, ...others } = props;
  const prefixCls = getPrefixCls('card', customizePrefixCls);
  const classString = classNames(`${prefixCls}-grid`, className);
  return <div {...others} className={classString} />;
};

Grid.displayName = 'CardGrid';

export default Grid;
