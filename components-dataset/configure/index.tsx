import { observable, ObservableMap, runInAction, toJS } from 'mobx';
import { AxiosError, AxiosInstance, AxiosPromise, AxiosRequestConfig, Method } from 'axios';
import { Moment, MomentInput } from 'moment';
import isObject from 'lodash/isObject';
import { LovConfig } from '../interface';
import { ExportMode, RecordStatus, FieldType } from '../data-set/enum';
import { ValidationMessages } from '../validator/Validator';
import { TransportHookProps, TransportProps } from '../data-set/Transport';
import DataSet from '../data-set/DataSet';
import defaultFeedback, { FeedBack } from '../data-set/FeedBack';
import {
  defaultValidationMessageFormatter,
  defaultValidationMessageReportFormatter,
  ValidationMessageFormatter,
  ValidationMessageReportFormatter,
} from '../validator/ValidationMessageReportFormatter';
import Record from '../data-set/Record';
import { CacheOptions } from '../cache';
import AttachmentFile, { FileLike } from '../data-set/AttachmentFile';

export type TimeZone = string | ((moment: Moment) => string);

export type Status = {
  [RecordStatus.add]: string;
  [RecordStatus.update]: string;
  [RecordStatus.delete]: string;
};

export type Formatter = {
  jsonDate: string | null;
  date: string;
  dateTime: string;
  time: string;
  year: string;
  month: string;
  week: string;
  timeZone?: TimeZone;
};

export interface AttachmentConfig {
  defaultFileKey: string;
  defaultFileSize: number;
  action?: AxiosRequestConfig | ((props: { attachment: AttachmentFile; bucketName?: string; bucketDirectory?: string; storageCode?: string; attachmentUUID: string; isPublic?: boolean }) => AxiosRequestConfig);
  batchFetchCount?: <T extends string | number | symbol>(attachmentUUIDs: T[], props: { isPublic?: boolean }) => Promise<{ [key in T]: number }>;
  fetchList?: (props: { bucketName?: string; bucketDirectory?: string; storageCode?: string; attachmentUUID: string; isPublic?: boolean; }) => Promise<FileLike[]>;
  getPreviewUrl?: (props: { attachment: AttachmentFile; bucketName?: string; bucketDirectory?: string; storageCode?: string; attachmentUUID?: string; isPublic?: boolean; }) => string | undefined;
  getDownloadUrl?: (props: { attachment: AttachmentFile; bucketName?: string; bucketDirectory?: string; storageCode?: string; attachmentUUID?: string; isPublic?: boolean; }) => string | Function | undefined;
  getDownloadAllUrl?: (props: { bucketName?: string; bucketDirectory?: string; storageCode?: string; attachmentUUID: string; isPublic?: boolean; }) => string | Function | undefined;
  getAttachmentUUID?: (props: { isPublic?: boolean; }) => Promise<string> | string;
  onUploadSuccess?: (response: any, attachment: AttachmentFile) => void;
  onUploadError?: (error: AxiosError, attachment: AttachmentFile) => void;
  onOrderChange?: (props: { attachmentUUID: string; attachments: AttachmentFile[]; bucketName?: string; bucketDirectory?: string; storageCode?: string; isPublic?: boolean; }) => Promise<void>;
  onRemove?: (props: { attachment: AttachmentFile; attachmentUUID: string; bucketName?: string; bucketDirectory?: string; storageCode?: string; isPublic?: boolean; }) => Promise<boolean>;
}

export interface Config {
  lookupCache?: CacheOptions<string, AxiosPromise>;
  lookupUrl?: string | ((code: string) => string);
  lookupAxiosMethod?: Method;
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
  axios?: AxiosInstance;
  feedback?: FeedBack;
  dataKey?: string;
  totalKey?: string;
  statusKey?: string;
  tlsKey?: string;
  status?: Status;
  exportMode?: ExportMode;
  defaultValidationMessages?: ValidationMessages;
  validationMessageFormatter?: ValidationMessageFormatter;
  validationMessageReportFormatter?: ValidationMessageReportFormatter;
  transport?: TransportProps;
  generatePageQuery?: (pageParams: {
    page?: number;
    pageSize?: number;
    sortName?: string;
    sortOrder?: string;
    sort?: string[];
  }) => object;
  formatter?: Formatter;
  attachment?: AttachmentConfig;
  numberFieldNonStrictStep?: boolean;
  confirm?: (message: any) => Promise<boolean>;
  min?: (type: FieldType) => number | MomentInput | string | null;
  max?: (type: FieldType) => number | MomentInput | string | null;
}

export type ConfigKeys = keyof Config;

const defaultLookupCache: CacheOptions<string, AxiosPromise> = { maxAge: 1000 * 60 * 10, max: 100 };
const defaultStatus: Status = { [RecordStatus.add]: 'add', [RecordStatus.update]: 'update', [RecordStatus.delete]: 'delete' };
const defaultFormatter: Formatter = {
  jsonDate: 'YYYY-MM-DD HH:mm:ss',
  date: 'YYYY-MM-DD',
  dateTime: 'YYYY-MM-DD HH:mm:ss',
  time: 'HH:mm:ss',
  year: 'YYYY',
  month: 'YYYY-MM',
  week: 'GGGG-Wo',
};
const defaultAttachment: AttachmentConfig = {
  defaultFileKey: 'file',
  defaultFileSize: 0,
  getDownloadUrl({ attachment }) {
    return attachment.url;
  },
};
const defaultConfig = {
  lookupCache: defaultLookupCache,
  lookupUrl: code => `/common/code/${code}/`,
  lookupAxiosMethod: 'post' as Method,
  lovDefineUrl: code => `/sys/lov/lov_define?code=${code}`,
  lovQueryUrl: code => `/common/lov/dataset/${code}`,
  dataKey: 'rows',
  totalKey: 'total',
  statusKey: '__status',
  tlsKey: '__tls',
  status: defaultStatus,
  feedback: defaultFeedback,
  formatter: defaultFormatter,
  attachment: defaultAttachment,
  confirm: (_) => Promise.resolve(true),
  validationMessageFormatter: defaultValidationMessageFormatter,
  validationMessageReportFormatter: defaultValidationMessageReportFormatter,
};

export type DefaultConfig = typeof defaultConfig;

const defaultGlobalConfig: ObservableMap<ConfigKeys, Config[ConfigKeys]> = observable.map<ConfigKeys,
  Config[ConfigKeys]>(defaultConfig);

const globalConfig: ObservableMap<ConfigKeys, Config[ConfigKeys]> = observable.map<ConfigKeys,
  Config[ConfigKeys]>();

const baseMergeProps: (keyof Config)[] = ['transport', 'feedback', 'formatter', 'attachment'];

export function getConfig<C extends Config, T extends keyof C, D extends DefaultConfig>(key: T): T extends keyof D ? D[T] : C[T] {
  const custom = (globalConfig as ObservableMap<keyof C, C[T]>).get(key) as T extends keyof D ? D[T] : C[T];
  const hasCustom = (globalConfig as ObservableMap<keyof C, C[T]>).has(key);
  if (!hasCustom) {
    return (defaultGlobalConfig as ObservableMap<keyof C, C[T]>).get(key) as T extends keyof D ? D[T] : C[T];
  }
  if ((baseMergeProps as T[]).includes(key)) {
    return {
      ...(defaultGlobalConfig as ObservableMap<keyof C, C[T]>).get(key),
      ...custom,
    };
  }
  return custom;
}

export function overwriteDefaultConfig<T extends Config>(config: T, mergeProps: (keyof T)[] | null = baseMergeProps) {
  runInAction(() => {
    Object.keys(config).forEach((key) => {
      const configKey = key as keyof T;
      const value = config[configKey];
      if (mergeProps && mergeProps.includes(configKey) && isObject(value)) {
        (defaultGlobalConfig as ObservableMap<keyof T, T[keyof T]>).set(configKey, {
          ...toJS<any>((defaultGlobalConfig as ObservableMap<keyof T, T[keyof T]>).get(configKey)),
          ...value,
        });
      } else {
        (defaultGlobalConfig as ObservableMap<keyof T, T[keyof T]>).set(configKey, config[configKey]);
      }
    });
  });
}

export function overwriteConfigMergeProps<T extends Config>(customMergeProps: (keyof T)[]) {
  (baseMergeProps as (keyof T)[]).push(...customMergeProps);
}

export default function configure<T extends Config>(config: T, mergeProps: (keyof T)[] | null = baseMergeProps) {
  runInAction(() => {
    Object.keys(config).forEach((key) => {
      const configKey = key as keyof T;
      const value = config[configKey];
      if (mergeProps && mergeProps.includes(configKey) && isObject(value)) {
        (globalConfig as ObservableMap<keyof T, T[keyof T]>).set(configKey, {
          ...toJS<any>((globalConfig as ObservableMap<keyof T, T[keyof T]>).get(configKey)),
          ...value,
        });
      } else {
        (globalConfig as ObservableMap<keyof T, T[keyof T]>).set(configKey, config[configKey]);
      }
    });
  });
}
