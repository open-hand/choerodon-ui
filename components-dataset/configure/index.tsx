import { observable, ObservableMap, runInAction, toJS } from 'mobx';
import { AxiosError, AxiosInstance, AxiosPromise, AxiosRequestConfig, Method } from 'axios';
import { Moment, MomentInput } from 'moment';
import noop from 'lodash/noop';
import isObject from 'lodash/isObject';
import { LovConfig } from '../interface';
import { ExportMode, RecordStatus, FieldType, DownloadAllMode } from '../data-set/enum';
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
import Field from '../data-set/Field';
import Record from '../data-set/Record';
import { CacheOptions } from '../cache';
import AttachmentFile, { FileLike } from '../data-set/AttachmentFile';
import AttachmentFileChunk from '../data-set/AttachmentFileChunk';

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

export type AttachmentBatchFetchCount = <T extends string | number | symbol>(attachmentUUIDs: T[], props: { isPublic?: boolean, items: AttachmentValue[] }) => Promise<{ [key in T]: number }>;

export interface AttachmentOption {
  bucketName?: string;
  bucketDirectory?: string;
  storageCode?: string;
  isPublic?: boolean;
}

export interface AttachmentValue extends AttachmentOption {
  attachmentUUID: string;
}

export interface AttachmentProps extends AttachmentOption {
  attachmentUUID?: string | undefined;
}

export interface AttachmentsProps extends AttachmentValue {
  attachments: AttachmentFile[];
}

export interface AttachmentFileProps extends AttachmentProps {
  attachment: AttachmentFile;
}

export interface AttachmentUseChunkProps extends AttachmentOption {
  useChunk?: boolean;
}

export interface AttachmentChunkProps extends AttachmentFileProps {
  chunk: AttachmentFileChunk;
}

export interface AttachmentActionProps extends AttachmentFileProps {
  chunk?: AttachmentFileChunk | undefined;
}

export type TemplateUrlType = string | Function | undefined;

export interface AttachmentConfig {
  defaultFileKey: string;
  defaultFileSize: number;
  defaultChunkSize: number;
  defaultChunkThreads: number;
  downloadAllMode?: DownloadAllMode;
  action?: AxiosRequestConfig | ((props: AttachmentActionProps) => AxiosRequestConfig);
  batchFetchCount?: AttachmentBatchFetchCount;
  fetchFileSize?: (props: AttachmentOption) => Promise<number>;
  fetchList?: (props: AttachmentValue) => Promise<FileLike[]>;
  getPreviewUrl?: (props: AttachmentFileProps) => string | (() => string | Promise<string>) | undefined;
  getDownloadUrl?: (props: AttachmentFileProps) => string | Function | undefined;
  getTemplateDownloadUrl?: (props: AttachmentValue) => TemplateUrlType | Promise<TemplateUrlType>;
  getDownloadAllUrl?: (props: AttachmentValue) => string | Function | undefined;
  getAttachmentUUID?: (props: { isPublic?: boolean; }) => Promise<string> | string;
  onBeforeUpload?: (attachment: AttachmentFile, attachments: AttachmentFile[], props: AttachmentUseChunkProps) => boolean | undefined | PromiseLike<boolean | undefined>;
  onBeforeUploadChunk?: (props: AttachmentChunkProps) => boolean | undefined | PromiseLike<boolean | undefined>;
  onUploadSuccess?: (response: any, attachment: AttachmentFile, props: AttachmentUseChunkProps) => void;
  onUploadError?: (error: AxiosError, attachment: AttachmentFile) => void;
  onOrderChange?: (props: AttachmentsProps) => Promise<void>;
  onRemove?: (props: AttachmentFileProps, multiple: boolean) => Promise<boolean>;
}

export interface Config {
  cacheRecords?: boolean;
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
  useLookupBatch?: (code: string, field?: Field) => boolean;
  lovDefineUrl?: string | ((code: string) => string);
  lovDefineAxiosConfig?: AxiosRequestConfig | ((code: string, field?: Field) => AxiosRequestConfig);
  lovDefineBatchAxiosConfig?: (codes: string[]) => AxiosRequestConfig;
  useLovDefineBatch?: (code: string, field?: Field) => boolean;
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
  autoCount?: boolean;
  dataKey?: string;
  totalKey?: string;
  countKey?: string;
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
    count?: 'Y' | 'N';
    defaultCount?: 'Y' | 'N';
    onlyCount?: 'Y' | 'N';
    totalCount?: number;
    sortName?: string;
    sortOrder?: string;
    sort?: string[];
  }) => object;
  formatter?: Formatter;
  attachment?: AttachmentConfig;
  numberFieldNonStrictStep?: boolean;
  confirm?: (message: any, dataSet?: DataSet, source?: string) => Promise<boolean>;
  min?: (type: FieldType) => number | MomentInput | string | null;
  max?: (type: FieldType) => number | MomentInput | string | null;
  xlsx?: () => Promise<any>;
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
  defaultChunkSize: 5 * 1024 * 1024,
  defaultChunkThreads: 3,
  downloadAllMode: DownloadAllMode.readOnly,
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
  countKey: 'needCountFlag',
  statusKey: '__status',
  tlsKey: '__tls',
  status: defaultStatus,
  feedback: defaultFeedback,
  formatter: defaultFormatter,
  attachment: defaultAttachment,
  confirm: (_message: any, _dataSet?: DataSet, _source?: string) => Promise.resolve(true),
  validationMessageFormatter: defaultValidationMessageFormatter,
  validationMessageReportFormatter: defaultValidationMessageReportFormatter,
  xlsx: noop,
  useLookupBatch: noop,
  useLovDefineBatch: noop,
};

export type DefaultConfig = typeof defaultConfig;

const defaultGlobalConfig: ObservableMap<ConfigKeys, Config[ConfigKeys]> = observable.map<ConfigKeys,
  Config[ConfigKeys]>(defaultConfig);

const globalConfig: ObservableMap<ConfigKeys, Config[ConfigKeys]> = observable.map<ConfigKeys,
  Config[ConfigKeys]>();

const baseMergeProps: (keyof Config)[] = ['transport', 'feedback', 'formatter', 'attachment'];

export function getConfig<C extends Config, T extends keyof C, D extends DefaultConfig>(key: T): T extends keyof D ? D[T] : C[T] {
  if (!(globalConfig as ObservableMap<keyof C, C[T]>).has(key)) {
    return (defaultGlobalConfig as ObservableMap<keyof C, C[T]>).get(key) as T extends keyof D ? D[T] : C[T];
  }
  const custom = (globalConfig as ObservableMap<keyof C, C[T]>).get(key) as T extends keyof D ? D[T] : C[T];
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
