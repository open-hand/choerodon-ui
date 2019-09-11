import React, { FC, isValidElement } from 'react';
import classNames from 'classnames';
import Icon from '../icon';
import { $l } from '../locale-context';

export interface KeyValuePair {
  key: string;
  value: any;
}

export interface KeyValueBarProps {
  prefixCls?: string;
  items: KeyValuePair[];
  onCloseBtnClick?: (key: string) => void;
}

const KeyValueBar: FC<KeyValueBarProps> = props => {
  const { items, prefixCls, onCloseBtnClick } = props;
  const classString = classNames({
    [`${prefixCls}-advanced-query-bar-key-value-bar`]: !!prefixCls,
  });

  function handleCloseBtnClick(key: string) {
    if (onCloseBtnClick) {
      onCloseBtnClick(key);
    }
  }

  function renderItem(item) {
    const { key, value } = item;
    const isReactNode =
      isValidElement(value) || typeof value === 'string' || typeof value === 'number'; // FIXME: 暂时没想到更好的方法去判断value能否渲染

    return (
      <div key={key} className="pair-container">
        <div className="d-flex">
          <span>
            {key}: {isReactNode ? value : '不支持的值'}
          </span>
          <Icon type="close" onClick={() => handleCloseBtnClick(key)} />
        </div>
      </div>
    );
  }

  return (
    <div className={classString}>
      <span>{$l('Table', 'advanced_query_conditions')}: </span>
      {items.map(renderItem)}
    </div>
  );
};

export default KeyValueBar;
