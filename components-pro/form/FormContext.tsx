import React from 'react';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import { LabelAlign, LabelLayout, ShowValidation } from './enum';
import { LabelWidth } from './Form';
import { Tooltip } from '../core/enum';

export interface FormContextValue {
  dataSet?: DataSet;
  record?: Record;
  labelLayout?: LabelLayout;
  labelAlign?: LabelAlign;
  labelWidth?: LabelWidth;
  labelTooltip?: Tooltip;
  showValidation?: ShowValidation;
  useColon?: boolean;
}

export default React.createContext<FormContextValue>({});
