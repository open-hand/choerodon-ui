import React from 'react';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import { LabelAlign, LabelLayout } from './enum';
import { LabelWidth } from './Form';

export interface FormContextValue {
  dataSet?: DataSet;
  record?: Record;
  labelLayout?: LabelLayout;
  labelAlign?: LabelAlign;
  labelWidth?: LabelWidth;
  useColon?: boolean;
}

export default React.createContext<FormContextValue>({});
