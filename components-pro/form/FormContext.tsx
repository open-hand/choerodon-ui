import React, { FunctionComponent, memo, ReactNode, useContext, useMemo } from 'react';
import { getContext, Symbols } from 'choerodon-ui/shared';
import ConfigContext, { ConfigContextValue } from 'choerodon-ui/lib/config-provider/ConfigContext';
import { getConfig, getCustomizable, getPrefixCls, getProPrefixCls } from 'choerodon-ui/lib/configure/utils';
import { getTooltip, getTooltipTheme } from 'choerodon-ui/lib/_util/TooltipUtils';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import { LabelAlign, LabelLayout, ShowValidation } from './enum';
import Form, { LabelWidth } from './Form';
import { Tooltip } from '../core/enum';

export interface FormContextValue extends ConfigContextValue {
  dataSet?: DataSet | undefined;
  dataIndex?: number | undefined;
  record?: Record | undefined;
  pristine?: boolean | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  fieldHighlightRenderer?: boolean | undefined;
  labelLayout?: LabelLayout | undefined;
  labelAlign?: LabelAlign | undefined;
  labelWidth?: LabelWidth | undefined;
  labelTooltip?: Tooltip | undefined;
  showValidation?: ShowValidation | undefined;
  useColon?: boolean | undefined;
  formNode?: Form | undefined;
}

export interface FormProviderProps {
  children?: ReactNode;
  value?: FormContextValue;
}

const FormContext = getContext<FormContextValue>(Symbols.ProFormContext, {
  getConfig,
  getPrefixCls,
  getProPrefixCls,
  getCustomizable,
  getTooltip,
  getTooltipTheme,
});

const BaseFormProvider: FunctionComponent<FormProviderProps> = function FormProvider(props) {
  const { children, value } = props;
  const {
    getConfig: getGlobalConfig,
    getPrefixCls: getGlobalPrefixCls,
    getProPrefixCls: getGlobalProPrefixCls,
    getCustomizable: getGlobalCustomizable,
    getTooltip: getGlobalTooltip,
    getTooltipTheme: getGlobalTooltipTheme,
  } = useContext(ConfigContext);
  const newValue = useMemo(() => ({
    ...value,
    getConfig: getGlobalConfig,
    getPrefixCls: getGlobalPrefixCls,
    getProPrefixCls: getGlobalProPrefixCls,
    getCustomizable: getGlobalCustomizable,
    getTooltip: getGlobalTooltip,
    getTooltipTheme: getGlobalTooltipTheme,
  }), [value, getGlobalConfig, getGlobalPrefixCls, getGlobalProPrefixCls, getGlobalCustomizable, getGlobalTooltip, getGlobalTooltipTheme]);
  return (
    <FormContext.Provider value={newValue}>
      {children}
    </FormContext.Provider>
  );
};

BaseFormProvider.displayName = 'FormProvider';

export const FormProvider = memo(BaseFormProvider);

export default FormContext;
