import React, {
  CSSProperties,
  FunctionComponent,
  JSXElementConstructor,
  Key,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { getConfig, getCustomizable } from '../configure';
import { TabsPosition, TabsType } from './enum';
import TabPane, { TabPaneProps } from './TabPane';
import TabGroup, { TabGroupProps } from './TabGroup';
import { Size } from '../_util/enum';
import TabsWithContext from './TabsWithContext';

export type Animated = { inkBar: boolean; tabPane: boolean };

export interface TabsCustomized {
  defaultActiveKey?: string;
  panes: { [key: string]: TabPaneProps };
}

export interface TabsProps<T = string> {
  activeKey?: string;
  defaultActiveKey?: string;
  hideAdd?: boolean;
  hideOnlyGroup?: boolean;
  showMore?: boolean;
  onChange?: (activeKey: T) => void;
  onTabClick?: (key: string) => void;
  onPrevClick?: MouseEventHandler<any>;
  onNextClick?: MouseEventHandler<any>;
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
}

export type GroupPanelMap = { group: TabGroupProps; panelsMap: Map<string, TabPaneProps & { type: string | JSXElementConstructor<any> }>; lastActiveKey?: string }

const Tabs: FunctionComponent<TabsProps> = function Tabs(props) {
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
    <TabsWithContext {...props} customized={customized} setCustomized={setCustomized} customizable={$customizable} />
  ) : null;
};

Tabs.displayName = 'Tabs';

Tabs.propTypes = {
  destroyInactiveTabPane: PropTypes.bool,
  showMore: PropTypes.bool,
  onChange: PropTypes.func,
  children: PropTypes.any,
  prefixCls: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  activeKey: PropTypes.string,
  defaultActiveKey: PropTypes.string,
  keyboard: PropTypes.bool,
  hideAdd: PropTypes.bool,
  tabPosition: PropTypes.oneOf<TabsPosition>([TabsPosition.top, TabsPosition.right, TabsPosition.bottom, TabsPosition.left]),
  type: PropTypes.oneOf<TabsType>([TabsType.card, TabsType.line, TabsType['editable-card']]),
};

Tabs.defaultProps = {
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
