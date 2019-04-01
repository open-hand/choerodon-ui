import React from 'react';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import { LabelWidth } from './Form';
import { LabelAlign, LabelLayout } from './enum';

export type FormContextValue = {
  dataSet?: DataSet;
  record?: Record;
  dataIndex?: number;
  columns?: number;
  labelWidth?: LabelWidth;
  labelAlign?: LabelAlign;
  labelLayout?: LabelLayout;
}

export default React.createContext({});
