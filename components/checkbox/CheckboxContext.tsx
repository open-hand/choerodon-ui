import React, { FunctionComponent, memo, ReactNode, useMemo } from 'react';
import { getContext, Symbols } from 'choerodon-ui/shared';
import { getPrefixCls } from '../configure/utils';
import { CheckboxGroupContext } from './Group';

export interface CheckboxContextProviderProps extends CheckboxGroupContext {
  children?: ReactNode;
}

const CheckboxContext = getContext<CheckboxGroupContext>(Symbols.CheckboxContext, { getPrefixCls });

const BaseCheckboxContextProvider: FunctionComponent<CheckboxContextProviderProps> = function CheckboxContextProvider(props) {
  const { children, checkboxGroup, getPrefixCls: getGlobalPrefixCls } = props;
  const value = useMemo(() => ({
    checkboxGroup,
    getPrefixCls: getGlobalPrefixCls,
  }), [getGlobalPrefixCls, checkboxGroup]);
  return (
    <CheckboxContext.Provider value={value}>
      {children}
    </CheckboxContext.Provider>
  );
};

BaseCheckboxContextProvider.displayName = 'CheckboxContextProvider';

export const CheckboxContextProvider = memo(BaseCheckboxContextProvider);

export default CheckboxContext;
