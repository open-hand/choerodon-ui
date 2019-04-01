import React, { MouseEventHandler } from 'react';

export interface FilterDropdownMenuWrapperProps {
  onClick?: MouseEventHandler<any>;
  children?: any;
  className?: string;
}

export default (props: FilterDropdownMenuWrapperProps) => (
  <div className={props.className} onClick={props.onClick}>
    {props.children}
  </div>
);
