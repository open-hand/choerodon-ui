import { observable, ObservableMap, runInAction } from 'mobx';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ReactNode } from 'react';
import { LovConfig } from 'choerodon-ui/pro/lib/lov/Lov';
import { RecordStatus } from 'choerodon-ui/pro/lib/data-set/enum';
import message from 'choerodon-ui/pro/lib/message';
import exception from 'choerodon-ui/pro/lib/_util/exception';
import { $l } from 'choerodon-ui/pro/lib/locale-context';
import { TablePaginationConfig } from 'choerodon-ui/pro/lib/table/Table';
import { ValidationMessages } from 'choerodon-ui/pro/lib/validator/Validator';
import { ButtonProps } from 'choerodon-ui/pro/lib/button/Button';

export type Status = {
  [RecordStatus.add]: string;
  [RecordStatus.update]: string;
  [RecordStatus.delete]: string;
};

export type renderEmptyHandler = (componentName?: string) => ReactNode;

export interface FeedBack {
  loadSuccess(result: any);

  loadFailed(error: Error);

  submitSuccess(result: any[]);

  submitFailed(error: Error);
}

export type Config = {
  prefixCls?: string;
  proPrefixCls?: string;
  ripple?: boolean;
  lookupUrl?: string | ((code: string) => string);
  lookupAxiosMethod?: string;
  lovDefineUrl?: string | ((code: string) => string);
  lovDefineAxiosConfig?: (code: string) => AxiosRequestConfig;
  lovQueryUrl?: string | ((code: string, lovConfig?: LovConfig) => string);
  lovQueryAxiosConfig?: (code: string, lovConfig?: LovConfig) => AxiosRequestConfig;
  axios?: AxiosInstance;
  feedback?: FeedBack;
  dataKey?: string;
  totalKey?: string;
  statusKey?: string;
  tlsKey?: string;
  status?: Status;
  labelLayout?: string;
  queryBar?: string;
  tableBorder?: boolean;
  tableHighLightRow?: boolean;
  tableRowHeight?: 'auto' | number;
  tableColumnResizable?: boolean;
  pagination?: TablePaginationConfig | false;
  modalSectionBorder?: boolean;
  modalOkFirst?: boolean;
  modalButtonProps?: ButtonProps;
  buttonFuncType?: string;
  renderEmpty?: renderEmptyHandler;
  defaultValidationMessages?: ValidationMessages;
  generatePageQuery?: (pageParams: {
    page?: number;
    pageSize?: number;
    sortName?: string;
    sortOrder?: string;
  }) => object;
};

export type ConfigKeys = keyof Config;

const defaultFeedback: FeedBack = {
  loadSuccess() {},
  loadFailed(error) {
    message.error(exception(error, $l('DataSet', 'query_failure')));
  },
  submitSuccess() {
    message.success($l('DataSet', 'submit_success'));
  },
  submitFailed(error) {
    message.error(exception(error, $l('DataSet', 'submit_failure')));
  },
};

const defaultRenderEmpty: renderEmptyHandler = (componentName?: string): ReactNode => {
  switch (componentName) {
    case 'Table':
      return $l('Table', 'empty_data');
    case 'Select':
      return $l('Select', 'no_matching_results');
    default:
  }
};

const globalConfig: ObservableMap<ConfigKeys, Config[ConfigKeys]> = observable.map<
  ConfigKeys,
  Config[ConfigKeys]
>([
  ['prefixCls', 'c7n'],
  ['proPrefixCls', 'c7n-pro'],
  ['ripple', true],
  ['lookupUrl', code => `/common/code/${code}/`],
  ['lookupAxiosMethod', 'post'],
  ['lovDefineUrl', code => `/sys/lov/lov_define?code=${code}`],
  ['lovQueryUrl', code => `/common/lov/dataset/${code}`],
  ['dataKey', 'rows'],
  ['totalKey', 'total'],
  ['statusKey', '__status'],
  ['tlsKey', '__tls'],
  [
    'status',
    { [RecordStatus.add]: 'add', [RecordStatus.update]: 'update', [RecordStatus.delete]: 'delete' },
  ],
  ['labelLayout', 'horizontal'],
  ['queryBar', 'normal'],
  ['tableBorder', true],
  ['tableHighLightRow', true],
  ['tableRowHeight', 30],
  ['tableColumnResizable', true],
  ['modalSectionBorder', true],
  ['modalOkFirst', true],
  ['feedback', defaultFeedback],
  ['renderEmpty', defaultRenderEmpty],
]);

export function getConfig<T extends ConfigKeys>(key: T): any {
  // FIXME: observable.map把构建map时传入的key类型和value类型分别做了union，
  // 丢失了一一对应的映射关系，导致函数调用者无法使用union后的返回值类型，因此需要指定本函数返回值为any
  return globalConfig.get(key);
}

export function getPrefixCls(suffixCls: string, customizePrefixCls?: string): string {
  if (customizePrefixCls) {
    return customizePrefixCls;
  }
  return `${getConfig('prefixCls')}-${suffixCls}`;
}

export function getProPrefixCls(suffixCls: string, customizePrefixCls?: string): string {
  if (customizePrefixCls) {
    return customizePrefixCls;
  }
  return `${getConfig('proPrefixCls')}-${suffixCls}`;
}

export default function configure(config: Config) {
  runInAction(() => {
    Object.keys(config).forEach((key: keyof Config) => globalConfig.set(key, config[key]));
  });
}
