import { createContext, MouseEventHandler, ReactNode } from 'react';
import noop from 'lodash/noop';
import { GroupPanelMap, TabsCustomized } from './Tabs';
import { TabPaneProps } from './TabPane';
import { TabsPosition } from './enum';

export interface TabsContextValue {
  prefixCls?: string | undefined;
  defaultActiveKey?: string | undefined;
  actuallyDefaultActiveKey?: string | undefined;
  propActiveKey?: string | undefined;
  keyboard?: boolean | undefined;
  tabBarPosition?: TabsPosition | undefined;
  customizable?: boolean | undefined;
  customized?: TabsCustomized | undefined | null;
  saveCustomized: (customized: TabsCustomized) => void;
  activeKey?: string | undefined;
  activeGroupKey?: string | undefined;
  changeActiveKey: (activeKey: string, byGroup?: boolean) => void;
  groupedPanelsMap: Map<string, GroupPanelMap>;
  currentPanelMap: Map<string, TabPaneProps>;
  totalPanelsMap: Map<string, TabPaneProps>;
  onTabClick?: ((key: string) => void) | undefined;
  onPrevClick?: MouseEventHandler<HTMLSpanElement> | undefined;
  onNextClick?: MouseEventHandler<HTMLSpanElement> | undefined;
  children?: ReactNode;
}

const TabsContext = createContext<TabsContextValue>({
  changeActiveKey: noop,
  saveCustomized: noop,
  groupedPanelsMap: new Map<string, GroupPanelMap>(),
  currentPanelMap: new Map<string, TabPaneProps>(),
  totalPanelsMap: new Map<string, TabPaneProps>(),
});

export default TabsContext;
