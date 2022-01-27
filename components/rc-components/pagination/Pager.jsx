import React from 'react';

const Pager = function Pager(props) {
  const prefixCls = `${props.rootPrefixCls}-item`;
  let cls = `${prefixCls} ${prefixCls}-${props.page}`;

  if (props.active) {
    cls = `${cls} ${prefixCls}-active`;
  }

  if (props.className) {
    cls = `${cls} ${props.className}`;
  }

  const handleClick = () => {
    props.onClick(props.page);
  };

  const handleKeyPress = e => {
    props.onKeyPress(e, props.onClick, props.page);
  };

  return (
    <li
      title={props.showTitle ? props.page : null}
      className={cls}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex="0"
    >
      {props.itemRender(props.page, 'page', <a>{props.page}</a>, props.size)}
    </li>
  );
};

Pager.displayName = 'RcPager';

export default Pager;
