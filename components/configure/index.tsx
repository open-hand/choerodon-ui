import { observable, ObservableMap, runInAction } from 'mobx';
import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ReactNode } from 'react';
import { categories } from 'choerodon-ui-font';
import { LovConfig } from 'choerodon-ui/pro/lib/lov/Lov';
import { RecordStatus } from 'choerodon-ui/pro/lib/data-set/enum';
import exception from 'choerodon-ui/pro/lib/_util/exception';
import { $l } from 'choerodon-ui/pro/lib/locale-context';
import { TablePaginationConfig, TableQueryBarHook } from 'choerodon-ui/pro/lib/table/Table';
import { ValidationMessages } from 'choerodon-ui/pro/lib/validator/Validator';
import { ButtonProps } from 'choerodon-ui/pro/lib/button/Button';
import { TableQueryBarType } from 'choerodon-ui/pro/lib/table/enum';
import { TransportHookProps, TransportProps } from 'choerodon-ui/pro/lib/data-set/Transport';
import DataSet from 'choerodon-ui/pro/lib/data-set/DataSet';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import message from '../message';

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
  iconfontPrefix?: string;
  ripple?: boolean;
  lookupUrl?: string | ((code: string) => string);
  lookupAxiosMethod?: string;
  lookupAxiosConfig?:
    | AxiosRequestConfig
    | ((props: {
        params?: any;
        dataSet?: DataSet;
        record?: Record;
        lookupCode?: string;
      }) => AxiosRequestConfig);
  lovDefineUrl?: string | ((code: string) => string);
  lovDefineAxiosConfig?: AxiosRequestConfig | ((code: string) => AxiosRequestConfig);
  lovQueryUrl?:
    | string
    | ((code: string, lovConfig: LovConfig | undefined, props: TransportHookProps) => string);
  lovQueryAxiosConfig?:
    | AxiosRequestConfig
    | ((
        code: string,
        lovConfig: LovConfig | undefined,
        props: TransportHookProps,
      ) => AxiosRequestConfig);
  axios?: AxiosInstance;
  feedback?: FeedBack;
  dataKey?: string;
  totalKey?: string;
  statusKey?: string;
  tlsKey?: string;
  status?: Status;
  labelLayout?: string;
  queryBar?: TableQueryBarType | TableQueryBarHook;
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
  transport?: TransportProps;
  icons?: { [key: string]: string[] } | string[];
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
  ['iconfontPrefix', 'icon'],
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
  ['queryBar', TableQueryBarType.normal],
  ['tableBorder', true],
  ['tableHighLightRow', true],
  ['tableRowHeight', 30],
  ['tableColumnResizable', true],
  ['modalSectionBorder', true],
  ['modalOkFirst', true],
  ['feedback', defaultFeedback],
  ['renderEmpty', defaultRenderEmpty],
  ['icons', categories],
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
