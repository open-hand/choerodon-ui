import React, { MouseEventHandler } from 'react';

export interface FilterDropdownMenuWrapperProps {
  onClick?: MouseEventHandler<any>;
  children?: any;
  className?: string;
}

export default ({ className, onClick, children }: FilterDropdownMenuWrapperProps) => (
  <div className={className} onClick={onClick}>
    {children}
  </div>
);
