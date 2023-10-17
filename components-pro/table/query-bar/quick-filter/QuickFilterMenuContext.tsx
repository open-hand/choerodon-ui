import { Context, createContext } from 'react';
import { DynamicFilterBarConfig } from '../../Table';
import DataSet from '../../../data-set';
import { RecordStatus } from '../../../data-set/enum';
import { Fields } from '../../../data-set/Field';

export interface QuickFilterProps {
  prefixCls?: string;
  searchCode?: string;
  searchText?: string;
  expand?: boolean;
  dynamicFilterBar?: DynamicFilterBarConfig;
  dataSet: DataSet;
  queryDataSet: DataSet;
  tempQueryFields?: Fields;
  onChange?: (code: string) => void;
  onReset?: () => void;
  initConditionFields?: Function;
  conditionStatus?: RecordStatus;
  onStatusChange?: (status: RecordStatus, data?: object) => void;
  autoQuery?: boolean;
  selectFields?: string[];
  onOriginalChange?: (fieldName?: string | string[]) => void;
  loadConditionData?: ({ conditionDataSet, newFilterDataSet, menuRecord, dataSet, searchText }: { conditionDataSet: any; newFilterDataSet: any; menuRecord: any; dataSet: any; searchText: any; }) => void;
}

export interface QuickFilterContextValue extends QuickFilterProps {
  menuDataSet: DataSet;
  filterMenuDataSet: DataSet;
  conditionDataSet: DataSet;
  optionDataSet: DataSet;
  newFilterDataSet: DataSet;
  shouldLocateData: boolean;
  refEditors?: Map<string, any>;
  defaultActiveKey?: string;
}

const ds = {} as DataSet;
const Store: Context<QuickFilterContextValue> = createContext<QuickFilterContextValue>({
  dataSet: ds,
  queryDataSet: ds,
  menuDataSet: ds,
  filterMenuDataSet: ds,
  conditionDataSet: ds,
  optionDataSet: ds,
  newFilterDataSet: ds,
  shouldLocateData: false,
  searchText: 'params',
});

export default Store;
