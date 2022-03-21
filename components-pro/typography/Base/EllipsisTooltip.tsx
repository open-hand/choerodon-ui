import React, { ReactElement, ReactNode } from 'react';
import Tooltip from '../../tooltip';

export interface EllipsisTooltipProps {
  title?: ReactNode;
  enabledEllipsis: boolean;
  isEllipsis?: boolean;
  children: ReactElement;
}

const EllipsisTooltip = ({
  title,
  enabledEllipsis,
  children,
}: EllipsisTooltipProps) => {
  if (!title || !enabledEllipsis) {
    return children;
  }

  return (
    <Tooltip title={title}>
      {children}
    </Tooltip>
  );
};

EllipsisTooltip.displayName = 'EllipsisTooltip';

export default EllipsisTooltip;
