import React, { FunctionComponent, memo, ReactNode, useMemo } from 'react';
import { getContext, Symbols } from 'choerodon-ui/shared';

export interface MenuContextValue {
  inlineCollapsed?: boolean;
  menuTheme?: string;
}

export interface MenuContextProviderProps extends MenuContextValue {
  children?: ReactNode;
}

const MenuContext = getContext<MenuContextValue>(Symbols.MenuContext, {});

const BaseMenuContextProvider: FunctionComponent<MenuContextProviderProps> = function MenuContextProvider(props) {
  const { children, inlineCollapsed, menuTheme } = props;
  const value = useMemo(() => ({
    inlineCollapsed,
    menuTheme,
  }), [inlineCollapsed, menuTheme]);
  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};

BaseMenuContextProvider.displayName = 'MenuContextProvider';

export const MenuContextProvider = memo(BaseMenuContextProvider);

export default MenuContext;
