import React from 'react';
import { RenderTabBar } from './Tabs';
import TabBar, { TabBarProps } from './TabBar';

export interface TabBarWrapperProps extends TabBarProps {
  renderTabBar?: RenderTabBar;
}

const TabBarWrapper: React.FunctionComponent<TabBarWrapperProps> = ({ renderTabBar, ...restProps }) => {
  if (typeof renderTabBar === 'function') {
    return renderTabBar(restProps, TabBar);
  }

  return <TabBar {...restProps} />;
};

TabBarWrapper.displayName = 'TabBarWrapper';

export default TabBarWrapper;
