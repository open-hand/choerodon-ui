import React, { memo } from 'react';

const ExpandIcon = function ExpandIcon(props) {
  const { expandable, prefixCls, onExpand, needIndentSpaced, expanded, record } = props;
  if (expandable) {
    const expandClassName = expanded ? 'expanded' : 'collapsed';
    return (
      <span
        className={`${prefixCls}-expand-icon ${prefixCls}-${expandClassName}`}
        onClick={(e) => onExpand(record, e)}
      />
    );
  }
  if (needIndentSpaced) {
    return <span className={`${prefixCls}-expand-icon ${prefixCls}-spaced`} />;
  }
  return null;
};

ExpandIcon.displayName = 'RcExpandIcon';

export default memo(ExpandIcon);
