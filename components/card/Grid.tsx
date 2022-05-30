import React, { CSSProperties, FunctionComponent, useContext } from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import ConfigContext from '../config-provider/ConfigContext';

export interface CardGridProps {
  prefixCls?: string;
  style?: CSSProperties;
  className?: string;
  selected?: boolean;
  onSelectChange?: (selected: boolean) => void;
}

const Grid: FunctionComponent<CardGridProps> = function Grid(props) {
  const { prefixCls: customizePrefixCls, className, selected, onSelectChange = noop, ...others } = props;
  const { getPrefixCls } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('card', customizePrefixCls);
  const classString = classNames(`${prefixCls}-grid`, className, {
    [`${prefixCls}-grid-selected`]: selected,
  });
  return <div {...others} className={classString} onClick={() => onSelectChange(!selected)} />;
};

Grid.displayName = 'CardGrid';

export default Grid;
