import React, { FunctionComponent, ReactNode } from 'react';
import { observer } from 'mobx-react';
import Badge from '../badge';

export interface InvalidBadgeProps {
  prefixCls?: string;
  isInvalid: () => boolean;
  children?: ReactNode;
}

const InvalidBadge: FunctionComponent<InvalidBadgeProps> = function InvalidBadge(props) {
  const { children, isInvalid, prefixCls } = props;
  const invalid = isInvalid();
  return (
    <Badge
      className={`${prefixCls}-invalid-badge`}
      count={invalid ? <i className={`${prefixCls}-invalid-badge-content`} /> : undefined}
    >
      {children}
    </Badge>
  );
};

InvalidBadge.displayName = 'InvalidBadge';

export default observer(InvalidBadge);
