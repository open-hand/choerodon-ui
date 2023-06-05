import React, {
  CSSProperties,
  FunctionComponent,
  JSXElementConstructor,
  Key,
  MouseEvent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import noop from 'lodash/noop';
import { TabsPosition, TabsType } from './enum';
import TabPane, { TabPaneProps } from './TabPane';
import TabGroup, { TabGroupProps } from './TabGroup';
import { Size } from '../_util/enum';
import TabsWithContext from './TabsWithContext';
import ConfigContext from '../config-provider/ConfigContext';

export type Animated = { inkBar: boolean; tabPane: boolean };

export interface TabsCustomized {
  defaultActiveKey?: string;
  panes: { [key: string]: TabPaneProps };
}

export interface TabsProps {
  activeKey?: string;
  defaultActiveKey?: string;
  hideAdd?: boolean;
  hideOnlyGroup?: boolean;
  showMore?: boolean;
  onChange?: (activeKey: string) => void;
  onTabClick?: (key: string) => void;
  tabBarExtraContent?: ReactNode | null;
  tabBarStyle?: CSSProperties;
  inkBarStyle?: CSSProperties;
  tabBarGutter?: number;
  type?: TabsType;
  tabPosition?: TabsPosition;
  onEdit?: (targetKey: Key | MouseEvent<HTMLElement>, action: 'add' | 'remove') => void;
  size?: Size;
  style?: CSSProperties;
  prefixCls?: string;
  className?: string;
  animated?: boolean | Animated;
  closeShortcut?: boolean;
  keyboard?: boolean;
  destroyInactiveTabPane?: boolean;
  children?: ReactNode;
  customizable?: boolean;
  customizedCode?: string;
  tabDraggable?: boolean;
  tabTitleEditable?: boolean;
  tabCountHideable?: boolean;
  defaultChangeable?: boolean;
  rippleDisabled?: boolean;
  flex?: boolean;
}

export type GroupPanelMap = { group: TabGroupProps; panelsMap: Map<string, TabPaneProps & { type: string | JSXElementConstructor<any> }>; lastActiveKey?: string }

const Tabs: FunctionComponent<TabsProps> = function Tabs(props) {
  const { getConfig, getCustomizable } = useContext(ConfigContext);
  const {
    customizedCode, customizable = customizedCode ? getCustomizable('Tabs') : undefined,
  } = props;
  const $customizable = customizedCode ? customizable : false;
  const [loaded, setLoaded] = useState<boolean>(!$customizable);
  const [customized, setCustomized] = useState<TabsCustomized | undefined | null>();
  const loadCustomized = useCallback(async () => {
    if (customizedCode) {
      setLoaded(false);
      const customizedLoad = getConfig('customizedLoad');
      try {
        const remoteCustomized: TabsCustomized | undefined | null = await customizedLoad(customizedCode, 'Tabs');
        setCustomized({ panes: {}, ...remoteCustomized });
      } finally {
        setLoaded(true);
      }
    }
  }, [customizedCode]);

  useEffect(() => {
    if ($customizable) {
      loadCustomized();
    }
  }, [$customizable, loadCustomized]);

  return loaded ? (
    <TabsWithContext
      {...props}
      customized={customized}
      setCustomized={setCustomized}
      customizable={$customizable}
    />
  ) : null;
};

Tabs.displayName = 'Tabs';

Tabs.defaultProps = {
  defaultChangeable: true,
  tabCountHideable: true,
  tabTitleEditable: true,
  tabDraggable: true,
  hideAdd: false,
  showMore: false,
  destroyInactiveTabPane: false,
  onChange: noop,
  keyboard: true,
  tabPosition: TabsPosition.top,
  type: TabsType.line,
};
export type ForwardTabsType = typeof Tabs & { TabPane: typeof TabPane; TabGroup: typeof TabGroup }
(Tabs as ForwardTabsType).TabPane = TabPane;
(Tabs as ForwardTabsType).TabGroup = TabGroup;

export default Tabs as ForwardTabsType;
