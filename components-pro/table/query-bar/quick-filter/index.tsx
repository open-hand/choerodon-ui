import React, { FunctionComponent } from 'react';
import { StoreProvider } from './QuickFilterDataSet';
import QuickFilterMenu from './QuickFilterMenu';
import { DynamicFilterBarConfig } from '../../Table';
import DataSet from '../../../data-set';
import { RecordStatus } from '../../../data-set/enum';

export interface QuickFilterProps {
  prefixCls?: string;
  searchCode?: string;
  expand?: boolean;
  dynamicFilterBar?: DynamicFilterBarConfig;
  dataSet: DataSet;
  queryDataSet: DataSet;
  onChange?: (code: string) => void;
  conditionStatus?: RecordStatus;
  onStatusChange?: (status: RecordStatus, data?: object) => void;
  autoQuery?: boolean;
  selectFields?: string[];
  onOriginalChange?: (fieldName?: string) => void;
}

const QuickFilter: FunctionComponent<QuickFilterProps> = (props) => (
  <StoreProvider {...props}>
    <QuickFilterMenu />
  </StoreProvider>
);

export default QuickFilter;
