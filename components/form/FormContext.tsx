import React, { FunctionComponent, memo, ReactNode, useMemo } from 'react';
import { getContext, Symbols } from 'choerodon-ui/shared';
import { getPrefixCls } from '../configure/utils';

export interface FormContextValue {
  vertical?: boolean;

  getPrefixCls(suffixCls: string, customizePrefixCls?: string): string;
}

export interface FormContextProviderProps extends FormContextValue {
  children?: ReactNode;
}

const FormContext = getContext<FormContextValue>(Symbols.FormContext, { getPrefixCls });

const BaseFormContextProvider: FunctionComponent<FormContextProviderProps> = function FormContextProvider(props) {
  const { children, vertical, getPrefixCls: getGlobalPrefixCls } = props;
  const value = useMemo(() => ({
    vertical,
    getPrefixCls: getGlobalPrefixCls,
  }), [getGlobalPrefixCls, vertical]);
  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
};

BaseFormContextProvider.displayName = 'FormContextProvider';

export const FormContextProvider = memo(BaseFormContextProvider);

export default FormContext;
