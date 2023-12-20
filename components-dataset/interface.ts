import { ColumnAlign, LovFieldType } from './enum';
import { FieldType } from './data-set/enum';
import { FieldProps } from './data-set/Field';
import { DataSetProps } from './data-set/DataSet';

export type TimeStep = {
  hour?: number;
  minute?: number;
  second?: number;
}

export interface Form {
  getFields();

  getField(name: string);
}

export interface LovConfigItem {
  display?: string;
  conditionField?: string;
  conditionFieldLovCode?: string;
  conditionFieldType?: FieldType | LovFieldType;
  conditionFieldName?: string;
  conditionFieldSelectCode?: string;
  conditionFieldSelectUrl?: string;
  conditionFieldSelectTf?: string;
  conditionFieldSelectVf?: string;
  conditionFieldSequence: number;
  conditionFieldRequired?: boolean;
  gridField?: string;
  gridFieldType: FieldType | 'href' | 'picture' | 'percent';
  gridFieldName?: string;
  gridFieldWidth?: number;
  gridFieldAlign?: ColumnAlign;
  gridFieldSequence: number;
  fieldProps?: Partial<FieldProps>;
}

export interface LovConfig {
  title?: string;
  width?: number;
  height?: number;
  customUrl?: string;
  lovPageSize?: string;
  lovItems: LovConfigItem[] | null;
  treeFlag?: 'Y' | 'N';
  delayLoad?: 'Y' | 'N';
  parentIdField?: string;
  idField?: string;
  textField?: string;
  valueField?: string;
  placeholder?: string;
  editableFlag?: 'Y' | 'N';
  queryColumns?: number;
  dataSetProps?: DataSetProps | ((p: DataSetProps) => DataSetProps);
  transformSelectedData?: (value: object) => object;
}
