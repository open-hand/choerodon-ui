import { Context, createContext, ReactNode } from 'react';
import { DynamicFilterBarConfig } from '../../Table';
import DataSet from '../../../data-set';
import { RecordStatus } from '../../../data-set/enum';
import { Fields } from '../../../data-set/Field';
import TableStore from '../../TableStore';

export interface QuickFilterProps {
  prefixCls?: string;
  searchCode?: string;
  dynamicFilterBar?: DynamicFilterBarConfig;
  dataSet: DataSet;
  queryDataSet: DataSet;
  tempQueryFields?: Fields;
  onChange?: (code: string) => void;
  conditionStatus?: RecordStatus;
  onStatusChange?: (status: RecordStatus, data?: object) => void;
  autoQuery?: boolean;
  selectFields?: string[];
  onOriginalChange?: (fieldName?: string | string[]) => void;
  initSearchId?: number | null,
  setSearchId?: (searchId: string | number) => void;
  filterCallback?: (searchId: string) => void;
  filterSave?: boolean;
  filterSaveCallback?: (object) => void;
  filterOptionRenderer?: (searchId, searchIcon, text) => ReactNode;
  onReset?: () => void;
  tableStore?: TableStore;
}

export interface QuickFilterContextValue extends QuickFilterProps {
  menuDataSet: DataSet;
  filterMenuDataSet: DataSet;
  conditionDataSet: DataSet;
  optionDataSet: DataSet;
  shouldLocateData: boolean;
  refEditors?: Map<string, any>;
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
