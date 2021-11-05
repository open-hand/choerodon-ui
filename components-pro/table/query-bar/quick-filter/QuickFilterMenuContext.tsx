import { Context, createContext } from 'react';
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

export interface QuickFilterContextValue extends QuickFilterProps {
  menuDataSet: DataSet;
  filterMenuDataSet: DataSet;
  conditionDataSet: DataSet;
  optionDataSet: DataSet;
  shouldLocateData: boolean;
}

const ds = {} as DataSet;
const Store: Context<QuickFilterContextValue> = createContext<QuickFilterContextValue>({
  dataSet: ds,
  queryDataSet: ds,
  menuDataSet: ds,
  filterMenuDataSet: ds,
  conditionDataSet: ds,
  optionDataSet: ds,
  shouldLocateData: false,
});

export default Store;
