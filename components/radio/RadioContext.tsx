import React, { FunctionComponent, memo, ReactNode, useMemo } from 'react';
import { getContext, Symbols } from 'choerodon-ui/shared';
import { getPrefixCls } from '../configure/utils';
import { RadioChangeEvent } from './interface';

export interface RadioGroupContext {
  radioGroup?: {
    onChange: (e: RadioChangeEvent) => void;
    value: any;
    disabled?: boolean;
    name?: string;
  };

  getPrefixCls(suffixCls: string, customizePrefixCls?: string): string;
}

export interface RadioContextProviderProps extends RadioGroupContext {
  children?: ReactNode;
}

const RadioContext = getContext<RadioGroupContext>(Symbols.RadioContext, { getPrefixCls });

const BaseRadioContextProvider: FunctionComponent<RadioContextProviderProps> = function RadioContextProvider(props) {
  const { children, radioGroup, getPrefixCls: getGlobalPrefixCls } = props;
  const value = useMemo(() => ({
    radioGroup,
    getPrefixCls: getGlobalPrefixCls,
  }), [getGlobalPrefixCls, radioGroup]);
  return (
    <RadioContext.Provider value={value}>
      {children}
    </RadioContext.Provider>
  );
};

BaseRadioContextProvider.displayName = 'RadioContextProvider';

export const RadioContextProvider = memo(BaseRadioContextProvider);

export default RadioContext;
