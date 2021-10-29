import React, { FunctionComponent, memo, useCallback } from 'react';
import classNames from 'classnames';
import Icon from '../icon';
import { ElementProps } from '../core/ViewComponent';

export interface ExpandIconProps extends ElementProps {
  expandable?: boolean;
  expanded?: boolean;
  onChange: (e) => void;
}

const ExpandIcon: FunctionComponent<ExpandIconProps> = function ExpandIcon(props) {
  const { prefixCls, expanded, expandable, onChange } = props;
  const iconPrefixCls = `${prefixCls}-expand-icon`;
  const classString = classNames(iconPrefixCls, {
    [`${iconPrefixCls}-expanded`]: expanded,
    [`${iconPrefixCls}-spaced`]: !expandable,
  });
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onChange(e);
  }, [onChange]);
  return (
    <Icon
      type="baseline-arrow_right"
      className={classString}
      onClick={expandable ? handleClick : undefined}
      tabIndex={expandable ? 0 : -1}
    />
  );
};

ExpandIcon.displayName = 'ExpandIcon';

export default memo(ExpandIcon);
