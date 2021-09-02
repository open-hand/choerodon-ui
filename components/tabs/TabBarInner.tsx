import React, { DetailedHTMLProps, forwardRef, ForwardRefExoticComponent, HTMLAttributes, PropsWithoutRef, RefAttributes, useCallback } from 'react';
import noop from 'lodash/noop';

export interface TabBarInnerProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  tabKey: string;
  onTabClick?: (key: string) => void;
}

const TabBarInner: ForwardRefExoticComponent<PropsWithoutRef<TabBarInnerProps> & RefAttributes<HTMLDivElement>> = forwardRef(function TabBarInner(props, ref) {
  const { onTabClick = noop, tabKey, ...rest } = props;
  const handleClick = useCallback(() => onTabClick(tabKey), [onTabClick, tabKey]);
  return (
    <div {...rest} onClick={handleClick} ref={ref} />
  );
});

TabBarInner.displayName = 'TabBarInner';

export default TabBarInner;
