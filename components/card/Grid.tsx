import React, { CSSProperties, FunctionComponent, useContext, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import ConfigContext from '../config-provider/ConfigContext';
import { Placements } from '../dropdown/enum';

export interface CardGridProps {
  prefixCls?: string;
  style?: CSSProperties;
  className?: string;
  selected?: boolean;
  cornerPlacement: keyof typeof Placements;
  onSelectChange?: (selected: boolean) => void;
}

const Grid: FunctionComponent<CardGridProps> = function Grid(props) {
  const [size, setSize] = useState<string>('xl');
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (gridRef && gridRef.current && gridRef.current.offsetHeight <= 50) {
      setSize('xs');
    }
  }, [])
  const { prefixCls: customizePrefixCls, className, selected, onSelectChange = noop, cornerPlacement, ...others } = props;
  const { getPrefixCls } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('card', customizePrefixCls);
  const classString = classNames(`${prefixCls}-grid`, className, {
    [`${prefixCls}-grid-selected`]: selected,
    [`${prefixCls}-grid-selected-${cornerPlacement}`]: selected,
    [`${prefixCls}-grid-selected-${size}`]: true,
  });
  return <div {...others} className={classString} ref={gridRef} onClick={() => onSelectChange(!selected)} />;
};

Grid.displayName = 'CardGrid';
Grid.defaultProps = {
  cornerPlacement: 'bottomRight',
}

export default Grid;
