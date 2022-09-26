import { CSSProperties, FunctionComponent, isValidElement, ReactElement, ReactNode } from 'react';

export interface TabGroupProps {
  /** 选项卡头显示文字 */
  tab?: ReactNode | string;
  style?: CSSProperties;
  className?: string;
  rootPrefixCls?: string;
  disabled?: boolean;
  dot?: boolean;
  children?: ReactNode;
  defaultActiveKey?: string;
  hidden?: boolean;
}

const TabGroup: FunctionComponent<TabGroupProps> = function TabGroup() {
  return null;
};

TabGroup.displayName = 'TabGroup';

export type TabGroupType = typeof TabGroup & { __IS_TAB_GROUP: boolean };

(TabGroup as TabGroupType).__IS_TAB_GROUP = true;

export function isTabGroup(el: ReactNode): el is ReactElement<TabGroupProps> {
  return isValidElement(el) && (el.type as TabGroupType).__IS_TAB_GROUP;
}

export default TabGroup as TabGroupType;
