import React, { FunctionComponent, memo, useCallback } from 'react';
import classNames from 'classnames';
import Icon from '../icon';

export interface IconItemProps {
  prefixCls?: string;
  type: string;
  active: boolean;
  onSelect: (type: string) => void;
  customFontName?: string;
}

const IconItem: FunctionComponent<IconItemProps> = function IconItem(props) {
  const { prefixCls, type, onSelect, active, customFontName } = props;
  const handleClick = useCallback(() => {
    onSelect(type);
  }, [type, onSelect]);

  return (
    <li className={classNames({ [`${prefixCls}-item-selected`]: active })}>
      <div onClick={handleClick}>
        <Icon customFontName={customFontName} type={type} />
        <p>{type}</p>
      </div>
    </li>
  );
};

IconItem.displayName = 'IconItem';

export default memo(IconItem);
