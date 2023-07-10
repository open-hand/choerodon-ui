import { JSXElementConstructor, ReactNode } from 'react';
import noop from 'lodash/noop';
import { getContext, Symbols } from 'choerodon-ui/shared';
import { observable, ObservableMap } from 'mobx';
import { GroupPanelMap, TabsCustomized } from './Tabs';
import { TabPaneProps } from './TabPane';
import { TabsPosition } from './enum';

export interface TabsContextValue {
  prefixCls?: string | undefined;
  defaultActiveKey?: string | undefined;
  actuallyDefaultActiveKey?: string | undefined;
  propActiveKey?: string | undefined;
  keyboard?: boolean | undefined;
  hideOnlyGroup?: boolean | undefined;
  tabBarPosition?: TabsPosition | undefined;
  customizable?: boolean | undefined;
  customized?: TabsCustomized | undefined | null;
  saveCustomized: (customized: TabsCustomized) => void;
  activeKey?: string | undefined;
  activeGroupKey?: string | undefined;
  changeActiveKey: (activeKey: string, byGroup?: boolean) => void;
  groupedPanelsMap: Map<string, GroupPanelMap>;
  currentPanelMap: Map<string, TabPaneProps & { type: string | JSXElementConstructor<any> }>;
  totalPanelsMap: Map<string, TabPaneProps & { type: string | JSXElementConstructor<any> }>;
  validationMap: ObservableMap<string, boolean>;
  onTabClick?: ((key: string) => void) | undefined;
  children?: ReactNode;
  tabDraggable?: boolean | undefined;
  tabTitleEditable?: boolean | undefined;
  tabCountHideable?: boolean | undefined;
  defaultChangeable?: boolean | undefined;
  rippleDisabled?: boolean | undefined;
  restoreDefault?: boolean | undefined;
}

const TabsContext = getContext<TabsContextValue>(Symbols.TabsContext, {
  changeActiveKey: noop,
  saveCustomized: noop,
  groupedPanelsMap: new Map<string, GroupPanelMap>(),
  currentPanelMap: new Map<string, TabPaneProps & { type: string | JSXElementConstructor<any> }>(),
  totalPanelsMap: new Map<string, TabPaneProps & { type: string | JSXElementConstructor<any> }>(),
  validationMap: observable.map(),
});

export default TabsContext;
