import { Context, createContext, ReactNode } from 'react';
import { ComboFilterBarConfig } from '../../Table';
import DataSet from '../../../data-set';
import { RecordStatus } from '../../../data-set/enum';
import { Fields } from '../../../data-set/Field';

export interface QuickFilterProps {
  prefixCls?: string;
  searchCode?: string;
  comboFilterBar?: ComboFilterBarConfig;
  dataSet: DataSet;
  queryDataSet: DataSet;
  tempQueryFields?: Fields;
  onChange?: (code: string) => void;
  initConditionFields?: Function;
  conditionStatus?: RecordStatus;
  onStatusChange?: (status: RecordStatus, data?: object) => void;
  autoQuery?: boolean;
  selectFields?: string[];
  onOriginalChange?: (fieldName?: string | string[]) => void;
  searchId?: string;
  filterCallback?: (searchId: string) => void;
  filterSaveCallback?: (any) => void;
  filerMenuAction?: ReactNode,
  customizedColumns?: string | undefined,
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
