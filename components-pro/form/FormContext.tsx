import React from 'react';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import { LabelAlign, LabelLayout } from './enum';
import { LabelWidth } from './Form';
import { Tooltip } from '../core/enum';

export interface FormContextValue {
  dataSet?: DataSet;
  record?: Record;
  labelLayout?: LabelLayout;
  labelAlign?: LabelAlign;
  labelWidth?: LabelWidth;
  labelTooltip?: Tooltip;
  useColon?: boolean;
}

export default React.createContext<FormContextValue>({});
