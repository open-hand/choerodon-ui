import React, { FC, isValidElement } from 'react';
import Icon from '../icon';
import classNames from 'classnames';

export interface KeyValuePair {
  key: string,
  value: any,
}

export interface KeyValueBarProps {
  prefixCls?: string;
  items: KeyValuePair[];
  onCloseBtnClick?: (key: string) => void;
}

const KeyValueBar: FC<KeyValueBarProps> = (props) => {

  const handleCloseBtnClick = (key: string) => {
    const { onCloseBtnClick } = props;
    if (onCloseBtnClick) {
      onCloseBtnClick(key);
    }
  }

  function renderItems(items: KeyValuePair[]) {
    if (items.length === 0) {
      return null;
    }
    return items.map(item => {
      let isReactNode = false;
      const { key, value } = item;
      if (isValidElement(item.value) || typeof value === 'string' || typeof value === 'number') {
        isReactNode = true; // FIXME: 暂时没想到更好的方法去判断value能否渲染
      }

      return (
        <div key={key} className="pair-container">
          <div className="d-flex">
            <span>{key}: {isReactNode ? value : '不支持的值'}</span>
            <Icon type="close" onClick={() => handleCloseBtnClick(key)} />
          </div>
        </div>
      )
    });
  }

  function getClassName() {
    const { prefixCls } = props;
    return classNames({
      [`${prefixCls}-advanced-query-bar-key-value-bar`]: !!prefixCls,
    });
  }

  return (
    <div className={getClassName()}>
      <span>高级查询条件: </span>
      {renderItems(props.items)}
    </div>
  );
};

export default KeyValueBar;
