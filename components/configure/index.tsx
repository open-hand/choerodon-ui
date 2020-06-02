import { observable, ObservableMap, runInAction, toJS } from 'mobx';
import { AxiosInstance, AxiosPromise, AxiosRequestConfig } from 'axios';
import { ReactNode } from 'react';
import isObject from 'lodash/isObject';
import { categories } from 'choerodon-ui-font';
import { LovConfig } from 'choerodon-ui/pro/lib/lov/Lov';
import { RecordStatus } from 'choerodon-ui/pro/lib/data-set/enum';
import { $l } from 'choerodon-ui/pro/lib/locale-context';
import {
  expandIconProps,
  TablePaginationConfig,
  TableQueryBarHook,
} from 'choerodon-ui/pro/lib/table/Table';
import { ValidationMessages } from 'choerodon-ui/pro/lib/validator/Validator';
import { ButtonProps } from 'choerodon-ui/pro/lib/button/Button';
import { SpinProps } from 'choerodon-ui/lib/spin';
import { Size } from 'choerodon-ui/lib/_util/enum';
import { TableQueryBarType } from 'choerodon-ui/pro/lib/table/enum';
import { TriggerMode } from 'choerodon-ui/pro/lib/lov/enum';
import { TransportHookProps, TransportProps } from 'choerodon-ui/pro/lib/data-set/Transport';
import DataSet from 'choerodon-ui/pro/lib/data-set/DataSet';
import defaultFeedback, { FeedBack } from 'choerodon-ui/pro/lib/data-set/FeedBack';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { CacheOptions } from 'choerodon-ui/pro/lib/_util/Cache';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { defaultExcludeUseColonTag } from 'choerodon-ui/pro/lib/form/utils';

export type Status = {
  [RecordStatus.add]: string;
  [RecordStatus.update]: string;
  [RecordStatus.delete]: string;
};

export type renderEmptyHandler = (componentName?: string) => ReactNode;

export type Formatter = {
  jsonDate?: string | null;
  date?: string;
  dateTime?: string;
  time?: string;
  year?: string;
  month?: string;
  week?: string;
};

export type Config = {
  prefixCls?: string;
  proPrefixCls?: string;
  iconfontPrefix?: string;
  ripple?: boolean;
  lookupCache?: CacheOptions<string, AxiosPromise>;
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
  lookupBatchAxiosConfig?: (codes: string[]) => AxiosRequestConfig;
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
  lovTriggerMode?: TriggerMode;
  axios?: AxiosInstance;
  feedback?: FeedBack;
  dataKey?: string;
  totalKey?: string;
  statusKey?: string;
  tlsKey?: string;
  status?: Status;
  labelLayout?: LabelLayout;
  queryBar?: TableQueryBarType | TableQueryBarHook;
  tableBorder?: boolean;
  tableHighLightRow?: boolean;
  tableSelectedHighLightRow?: boolean;
  tableRowHeight?: 'auto' | number;
  tableColumnResizable?: boolean;
  tableExpandIcon?: (props: expandIconProps) => ReactNode;
  tableSpinProps?: SpinProps;
  tableButtonProps?: ButtonProps;
  tableCommandProps?: ButtonProps;
  pagination?: TablePaginationConfig | false;
  modalSectionBorder?: boolean;
  modalOkFirst?: boolean;
  modalButtonProps?: ButtonProps;
  buttonFuncType?: FuncType;
  buttonColor?: ButtonColor;
  renderEmpty?: renderEmptyHandler;
  defaultValidationMessages?: ValidationMessages;
  transport?: TransportProps;
  icons?: { [key: string]: string[]; } | string[];
  generatePageQuery?: (pageParams: {
    page?: number;
    pageSize?: number;
    sortName?: string;
    sortOrder?: string;
  }) => object;
  formatter?: Formatter;
  dropdownMatchSelectWidth?: boolean;
  useColon?: boolean;
  excludeUseColonTagList?: string[];
  tableUseMouseBatchChoose?: boolean;
};

export type ConfigKeys = keyof Config;

const defaultRenderEmpty: renderEmptyHandler = (componentName?: string): ReactNode => {
  switch (componentName) {
    case 'Table':
      return $l('Table', 'empty_data');
    case 'Select':
      return $l('Select', 'no_matching_results');
    default:
  }
};

const defaultButtonProps = { color: ButtonColor.primary, funcType: FuncType.flat };

const defaultSpinProps = { size: Size.default, wrapperClassName: '' };

const globalConfig: ObservableMap<ConfigKeys, Config[ConfigKeys]> = observable.map<
  ConfigKeys,
  Config[ConfigKeys]
>([
  ['prefixCls', 'c7n'],
  ['proPrefixCls', 'c7n-pro'],
  ['iconfontPrefix', 'icon'],
  ['ripple', true],
  ['lookupCache', { maxAge: 1000 * 60 * 10, max: 100 }],
  ['lookupUrl', code => `/common/code/${code}/`],
  ['lookupAxiosMethod', 'post'],
  // [
  //   'lookupBatchAxiosConfig',
  //   codes => ({
  //     url: '/common/batch',
  //     params: codes.reduce((obj, code) => {
  //       obj[code] = code;
  //       return obj;
  //     }, {}),
  //   }),
  // ],
  ['lovDefineUrl', code => `/sys/lov/lov_define?code=${code}`],
  ['lovQueryUrl', code => `/common/lov/dataset/${code}`],
  ['lovTriggerMode', TriggerMode.icon],
  ['dataKey', 'rows'],
  ['totalKey', 'total'],
  ['statusKey', '__status'],
  ['tlsKey', '__tls'],
  [
    'status',
    { [RecordStatus.add]: 'add', [RecordStatus.update]: 'update', [RecordStatus.delete]: 'delete' },
  ],
  ['labelLayout', LabelLayout.horizontal],
  ['queryBar', TableQueryBarType.normal],
  ['tableBorder', true],
  ['tableHighLightRow', true],
  ['tableSelectedHighLightRow', false],
  ['tableRowHeight', 30],
  ['tableColumnResizable', true],
  ['tableSpinProps', defaultSpinProps],
  ['tableButtonProps', defaultButtonProps],
  ['tableCommandProps', defaultButtonProps],
  ['modalSectionBorder', true],
  ['modalOkFirst', true],
  ['buttonColor', ButtonColor.default],
  ['buttonFuncType', FuncType.raised],
  ['feedback', defaultFeedback],
  ['renderEmpty', defaultRenderEmpty],
  ['icons', categories],
  [
    'formatter',
    {
      jsonDate: 'YYYY-MM-DD HH:mm:ss',
      date: 'YYYY-MM-DD',
      dateTime: 'YYYY-MM-DD HH:mm:ss',
      time: 'HH:mm:ss',
      year: 'YYYY',
      month: 'YYYY-MM',
      week: 'GGGG-Wo',
    },
  ],
  ['dropdownMatchSelectWidth', true],
  ['useColon', false],
  ['excludeUseColonTagList', defaultExcludeUseColonTag],
  ['tableUseMouseBatchChoose', false],
]);

export function getConfig(key: ConfigKeys): any {
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

const mergeProps = ['transport', 'feedback', 'formatter'];

export default function configure(config: Config) {
  runInAction(() => {
    Object.keys(config).forEach((key: ConfigKeys) => {
      const value = config[key];
      if (mergeProps.includes(key) && isObject(value)) {
        globalConfig.set(key, {
          ...toJS<any>(globalConfig.get(key)),
          ...value,
        });
      } else {
        globalConfig.set(key, config[key]);
      }
    });
  });
}
