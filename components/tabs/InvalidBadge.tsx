import React, { FunctionComponent, ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import Badge from '../badge';

export interface InvalidBadgeProps {
  prefixCls?: string;
  isInvalid: () => boolean;
  children?: ReactNode;
}

const InvalidBadge: FunctionComponent<InvalidBadgeProps> = function InvalidBadge(props) {
  const { children, isInvalid, prefixCls } = props;
  const invalid = isInvalid();
  return invalid ? (
    <Badge
      className={`${prefixCls}-invalid-badge`}
      count={<i className={`${prefixCls}-invalid-badge-content`} />}
    >
      {children}
    </Badge>
  ) : <>{children}</>;
};

InvalidBadge.displayName = 'InvalidBadge';

export default observer(InvalidBadge);
