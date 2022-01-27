import React, { Children, memo } from 'react';

const LazyRenderBox = function LazyRenderBox(props) {
  const { hiddenClassName, hidden, ...rest } = props;

  if (hiddenClassName || Children.count(rest.children) > 1) {
    if (hidden && hiddenClassName) {
      rest.className += ` ${hiddenClassName}`;
    }
    return <div {...rest} />;
  }

  return Children.only(rest.children);
};

LazyRenderBox.displayName = 'RcLazyRenderBox';

export default memo(LazyRenderBox, (props, nextProps) => !nextProps.hiddenClassName && nextProps.hidden);
