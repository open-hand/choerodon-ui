import { observable, ObservableMap, runInAction, toJS } from 'mobx';
import { AxiosError, AxiosInstance, AxiosPromise, AxiosRequestConfig, Method } from 'axios';
import React, { CSSProperties, ReactNode } from 'react';
import noop from 'lodash/noop';
import isObject from 'lodash/isObject';
import isBoolean from 'lodash/isBoolean';
import { categories } from 'choerodon-ui-font';
import { Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import { LovConfig } from 'choerodon-ui/pro/lib/lov/Lov';
import { ExportMode, FieldType, RecordStatus } from 'choerodon-ui/pro/lib/data-set/enum';
import { $l } from 'choerodon-ui/pro/lib/locale-context';
import { expandIconProps, Suffixes, TableCustomized, TablePaginationConfig, TableProps, TableQueryBarHook } from 'choerodon-ui/pro/lib/table/Table';
import { PerformanceTableCustomized } from 'choerodon-ui/pro/lib/performance-table/Table.d.ts';
import { ValidationMessages } from 'choerodon-ui/pro/lib/validator/Validator';
import { ButtonProps } from 'choerodon-ui/pro/lib/button/Button';
import { ColumnAlign, DragColumnAlign, HighLightRowType, TableQueryBarType } from 'choerodon-ui/pro/lib/table/enum';
import { TransportHookProps, TransportProps } from 'choerodon-ui/pro/lib/data-set/Transport';
import DataSet from 'choerodon-ui/pro/lib/data-set/DataSet';
import defaultFeedback, { FeedBack } from 'choerodon-ui/pro/lib/data-set/FeedBack';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import Field from 'choerodon-ui/pro/lib/data-set/Field';
import { CacheOptions } from 'choerodon-ui/pro/lib/_util/Cache';
import { LabelLayout, ShowValidation } from 'choerodon-ui/pro/lib/form/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { defaultExcludeUseColonTag } from 'choerodon-ui/pro/lib/form/utils';
import { HighlightRenderer } from 'choerodon-ui/pro/lib/field/FormField';
import { FormatNumberFunc, FormatNumberFuncOptions } from 'choerodon-ui/pro/lib/number-field/NumberField';
import { ModalProps } from 'choerodon-ui/pro/lib/modal/interface';
import { ColumnProps, onCellProps } from 'choerodon-ui/pro/lib/table/Column';
import { TimeZone } from 'choerodon-ui/pro/lib/date-picker/DatePicker';
import { AttachmentListType } from 'choerodon-ui/pro/lib/attachment/Attachment';
import AttachmentFile, { FileLike } from 'choerodon-ui/pro/lib/data-set/AttachmentFile';
import { Action } from '../trigger/enum';
import { TooltipTheme } from '../tooltip';
import { SpinProps } from '../spin';
import { PanelProps } from '../collapse';
import { Size } from '../_util/enum';
import Popover from '../popover';
import { TabsCustomized } from '../tabs/Tabs';

export type Status = {
  [RecordStatus.add]: string;
  [RecordStatus.update]: string;
  [RecordStatus.delete]: string;
};

export type renderEmptyHandler = (componentName?: string) => ReactNode;

export type PerformanceEvents = {
  Table: {
    name: string;
    url: string | undefined;
    size: number;
    timing: {
      fetchStart: number;
      fetchEnd: number;
      loadStart: number;
      loadEnd: number;
      renderStart: number;
      renderEnd: number;
    };
  };
}

export type PerformanceEventHook<T extends keyof PerformanceEvents> = (key: T, event: PerformanceEvents[T]) => void;

export type TooltipTarget = 'table-cell' | 'output' | 'label' | 'button' | 'select-option' | 'validation' | 'help';

export type TooltipHook = (target?: TooltipTarget) => Tooltip | undefined;

export type TooltipThemeHook = (target?: TooltipTarget) => TooltipTheme;

export type LovTablePropsHook = (multiple?: boolean) => Partial<TableProps>;

export type TableFilterAdapterProps = ({ type, config, searchCode, queryDataSet }) => AxiosRequestConfig;

export type Customizable = {
  Table?: boolean;
  PerformanceTable?: boolean;
  Tabs?: boolean;
}

function isCustomizable(target: boolean | Customizable | undefined): target is Customizable {
  return isObject(target);
}

export interface Customized {
  Table?: TableCustomized;
  PerformanceTable?: PerformanceTableCustomized;
  Tabs?: TabsCustomized;
}

export type CustomizedSave = <T extends keyof Customized>(code: string, customized: Customized[T], component: T) => void;
export type CustomizedLoad = <T extends keyof Customized>(code: string, component: T) => Promise<Customized[T] | null>;

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

export type AttachmentConfig = {
  defaultFileKey: string;
  defaultFileSize: number;
  action?: AxiosRequestConfig | ((props: { attachment: AttachmentFile; bucketName?: string; bucketDirectory?: string; storageCode?: string; attachmentUUID: string }) => AxiosRequestConfig);
  batchFetchCount?: <T extends string | number | symbol>(attachmentUUIDs: T[]) => Promise<{ [key in T]: number }>;
  fetchList?: (props: { bucketName?: string; bucketDirectory?: string; storageCode?: string; attachmentUUID: string }) => Promise<FileLike[]>;
  getPreviewUrl?: (props: { attachment: AttachmentFile; bucketName?: string; bucketDirectory?: string; storageCode?: string; attachmentUUID: string }) => string | undefined;
  getDownloadUrl?: (props: { attachment: AttachmentFile; bucketName?: string; bucketDirectory?: string; storageCode?: string; attachmentUUID: string }) => string | undefined;
  getDownloadAllUrl?: (props: { bucketName?: string; bucketDirectory?: string; storageCode?: string; attachmentUUID: string }) => string | undefined;
  getAttachmentUUID?: () => Promise<string> | string;
  renderIcon?: (attachment: AttachmentFile, listType: AttachmentListType, defaultIcon: ReactNode) => ReactNode;
  renderHistory?: (props: { attachment: AttachmentFile; bucketName?: string; bucketDirectory?: string; storageCode?: string; attachmentUUID: string }) => ReactNode;
  onUploadSuccess?: (response: any, attachment: AttachmentFile) => void;
  onUploadError?: (error: AxiosError, attachment: AttachmentFile) => void;
  onOrderChange?: (props: { attachmentUUID: string; attachments: AttachmentFile[]; bucketName?: string; bucketDirectory?: string; storageCode?: string }) => Promise<void>;
  onRemove?: (props: { attachment: AttachmentFile; attachmentUUID: string; bucketName?: string; bucketDirectory?: string; storageCode?: string }) => Promise<boolean>;
}

export type Config = {
  prefixCls?: string;
  proPrefixCls?: string;
  iconfontPrefix?: string;
  ripple?: boolean;
  collapseExpandIconPosition?: string;
  collapseExpandIcon?: (panelProps: PanelProps) => ReactNode | 'text';
  collapseTrigger?: string;
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
  lovQueryCachedSelected?: (code: string, cachedSelected: Map<string, Record>) => Promise<object[]>;
  lovTableProps?: Partial<TableProps> | LovTablePropsHook;
  lovModalProps?: Partial<ModalProps>;
  lovAutoSelectSingle?: boolean;
  lovQueryBar?: TableQueryBarType | TableQueryBarHook;
  lovQueryBarProps?: object;
  axios?: AxiosInstance;
  feedback?: FeedBack;
  dataKey?: string;
  totalKey?: string;
  statusKey?: string;
  tlsKey?: string;
  status?: Status;
  exportMode?: ExportMode;
  labelLayout?: LabelLayout;
  queryBar?: TableQueryBarType | TableQueryBarHook;
  queryBarProps?: object;
  tableVirtual?: boolean;
  tableVirtualCell?: boolean;
  tableBorder?: boolean;
  tableColumnEditorBorder?: boolean;
  tableHighLightRow?: boolean | HighLightRowType;
  tableParityRow?: boolean;
  tableSelectedHighLightRow?: boolean;
  tableRowHeight?: 'auto' | number;
  tableColumnResizable?: boolean;
  tableColumnHideable?: boolean;
  performanceTableColumnHideable?: boolean;
  tableColumnTitleEditable?: boolean;
  performanceTableColumnTitleEditable?: boolean;
  tableDragColumnAlign?: DragColumnAlign;
  tableColumnDraggable?: boolean;
  performanceTableColumnDraggable?: boolean;
  tableRowDraggable?: boolean;
  tableExpandIcon?: (props: expandIconProps) => ReactNode;
  tableSpinProps?: SpinProps;
  tableButtonProps?: ButtonProps;
  tableCommandProps?: ButtonProps;
  tableColumnOnCell?: (props: onCellProps) => object;
  tableColumnAlign?: (column: ColumnProps, field?: Field, record?: Record) => ColumnAlign | undefined;
  tableShowSelectionTips?: boolean;
  tableAlwaysShowRowBox?: boolean;
  tableUseMouseBatchChoose?: boolean;
  tableEditorNextKeyEnterDown?: boolean;
  tableAutoFocus?: boolean;
  tableKeyboard?: boolean;
  tableFilterAdapter?: TableFilterAdapterProps;
  tableFilterSuffix?: Suffixes[];
  tableFilterSearchText?: string;
  tableAutoHeightDiff?: number;
  tableShowRemovedRow?: boolean;
  tableButtonsLimit?: number;
  pagination?: TablePaginationConfig | false;
  modalSectionBorder?: boolean;
  drawerSectionBorder?: boolean;
  drawerTransitionName?: string;
  modalAutoCenter?: boolean;
  modalOkFirst?: boolean;
  drawerOkFirst?: boolean;
  modalButtonProps?: ButtonProps;
  modalKeyboard?: boolean;
  modalMaskClosable?: boolean | 'click' | 'dblclick';
  buttonFuncType?: FuncType;
  buttonColor?: ButtonColor;
  renderEmpty?: renderEmptyHandler;
  highlightRenderer?: HighlightRenderer;
  defaultValidationMessages?: ValidationMessages;
  transport?: TransportProps;
  icons?: { [key: string]: string[] } | string[];
  generatePageQuery?: (pageParams: {
    page?: number;
    pageSize?: number;
    sortName?: string;
    sortOrder?: string;
    sort?: string[];
  }) => object;
  formatter?: Formatter;
  dropdownMatchSelectWidth?: boolean;
  defaultActiveFirstOption?: boolean;
  selectReverse?: boolean;
  selectPagingOptionContent?: string | ReactNode;
  selectSearchable?: boolean;
  selectTrigger?: Action[];
  useColon?: boolean;
  textFieldAutoComplete?: string;
  resultStatusRenderer?: object;
  numberFieldNonStrictStep?: boolean;
  numberFieldFormatter?: FormatNumberFunc;
  numberFieldFormatterOptions?: FormatNumberFuncOptions;
  currencyFormatter?: FormatNumberFunc;
  currencyFormatterOptions?: FormatNumberFuncOptions;
  /**
   * 是否显示长度信息
   */
  showLengthInfo?: boolean;
  /**
   * moment非法时显示Invalid date
   */
  showInvalidDate?: boolean;
  /**
   * 只有在空值时显示必填背景色和边框色
   */
  showRequiredColorsOnlyEmpty?: boolean;
  /**
   * 性能监控钩子
   */
  onPerformance?: PerformanceEventHook<keyof PerformanceEvents>;
  /**
   * 开启性能监控
   */
  performanceEnabled?: { [key in keyof PerformanceEvents]: boolean };
  /**
   * tooltip
   */
  tooltip?: Tooltip | TooltipHook;
  /**
   * tooltip 主题
   */
  tooltipTheme?: TooltipTheme | TooltipThemeHook;
  /**
   * 附件相关配置
   */
  attachment?: AttachmentConfig;
  /**
   * 表单校验提示方式
   */
  showValidation?: ShowValidation;
  /**
   * Tabs 墨条样式
   */
  tabsInkBarStyle?: CSSProperties;
  /**
   * 个性化开关
   */
  customizable?: boolean | Customizable;
  customizedSave?: CustomizedSave;
  customizedLoad?: CustomizedLoad;
  /**
   * @deprecated
   */
  validationTooltipTheme?: TooltipTheme;
  /**
   * @deprecated
   */
  tableColumnTooltip?: Tooltip;
  /**
   * @deprecated
   */
  buttonTooltip?: Tooltip;
  /**
   * @deprecated
   */
  selectOptionTooltip?: Tooltip;
  /**
   * @deprecated
   */
  labelTooltip?: Tooltip;
  /**
   * @deprecated
   */
  excludeUseColonTagList?: string[];
  /**
   * @deprecated
   */
  tableDefaultRenderer?: ReactNode;
  /**
   * @deprecated
   * 同 tableColumnDraggable
   */
  tableDragColumn?: boolean;
  /**
   * @deprecated
   * 同 tableRowDraggable
   */
  tableDragRow?: boolean;
  /**
   * @deprecated
   */
  lovTableCustomizable?: boolean;
  /**
   * @deprecated
   */
  tableCustomizable?: boolean;
  /**
   * @deprecated
   */
  performanceTableCustomizable?: boolean;
  /**
   * @deprecated
   */
  tableCustomizedSave?: CustomizedSave;
  /**
   * @deprecated
   */
  tableCustomizedLoad?: CustomizedLoad;
};

export type ConfigKeys = keyof Config;

const defaultTooltipTheme: TooltipThemeHook = target => target === 'validation' ? 'light' : 'dark';

const defaultRenderEmpty: renderEmptyHandler = (componentName?: string): ReactNode => {
  switch (componentName) {
    case 'Attachment':
      return $l('Attachment', 'no_attachments');
    case 'Table':
      return $l('Table', 'empty_data');
    case 'Select':
      return $l('Select', 'no_matching_results');
    case 'Output':
      return '';
    default:
  }
};

const defaultFormFieldHighlightRenderer: HighlightRenderer = ({ content, hidden, ...rest }, element): ReactNode => content ? (
  <Popover {...(hidden ? { ...rest, visible: false } : rest)} content={content}>
    {element}
  </Popover>
) : element;

const defaultButtonProps: ButtonProps = { color: ButtonColor.primary, funcType: FuncType.flat };

const defaultSpinProps = { size: Size.default, wrapperClassName: '' };

const defaultTableColumnAlign = (_column: ColumnProps, field?: Field, record?: Record): ColumnAlign | undefined => {
  if (field) {
    switch (field.get('type', record)) {
      case FieldType.number:
      case FieldType.currency:
        return ColumnAlign.right;
      case FieldType.boolean:
        return ColumnAlign.center;
      default:
    }
  }
};

function getComponentKey(component) {
  switch (component) {
    case 'Tabs':
      return 'tabs';
    default:
      return 'table';
  }
}

const defaultLookupCache: CacheOptions<string, AxiosPromise> = { maxAge: 1000 * 60 * 10, max: 100 };
const defaultStatus: Status = { [RecordStatus.add]: 'add', [RecordStatus.update]: 'update', [RecordStatus.delete]: 'delete' };
const defaultCustomizedSave: CustomizedSave = (code, customized, component) => localStorage.setItem(`${getComponentKey(component)}.customized.${code}`, JSON.stringify(customized));
const defaultCustomizedLoad: CustomizedLoad = (code, component) => Promise.resolve(JSON.parse(localStorage.getItem(`${getComponentKey(component)}.customized.${code}`) || 'null'));
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
  prefixCls: 'c7n',
  proPrefixCls: 'c7n-pro',
  iconfontPrefix: 'icon',
  ripple: true,
  collapseExpandIconPosition: 'left',
  collapseTrigger: 'header',
  lookupCache: defaultLookupCache,
  lookupUrl: code => `/common/code/${code}/`,
  lookupAxiosMethod: 'post' as Method,
  // lookupBatchAxiosConfig:
  //   codes => ({
  //     url: '/common/batch',
  //     params: codes.reduce((obj, code) => {
  //       obj[code] = code;
  //       return obj;
  //     }, {}),
  //   }),
  lovDefineUrl: code => `/sys/lov/lov_define?code=${code}`,
  lovQueryUrl: code => `/common/lov/dataset/${code}`,
  lovTableProps: {},
  lovModalProps: {},
  lovAutoSelectSingle: false,
  dataKey: 'rows',
  totalKey: 'total',
  statusKey: '__status',
  tlsKey: '__tls',
  status: defaultStatus,
  labelLayout: LabelLayout.horizontal,
  queryBar: TableQueryBarType.normal,
  tableBorder: true,
  tableHighLightRow: true,
  tableSelectedHighLightRow: false,
  tableRowHeight: 30,
  tableDefaultRenderer: '',
  tableColumnResizable: true,
  tableColumnHideable: true,
  performanceTableColumnHideable: true,
  tableRowDraggable: false,
  tableColumnDraggable: false,
  performanceTableColumnDraggable: false,
  tableColumnAlign: defaultTableColumnAlign,
  tableSpinProps: defaultSpinProps,
  tableButtonProps: defaultButtonProps,
  tableCommandProps: defaultButtonProps,
  tableAlwaysShowRowBox: false,
  tableUseMouseBatchChoose: false,
  tableEditorNextKeyEnterDown: true,
  tableAutoFocus: false,
  tableKeyboard: false,
  tableFilterSearchText: 'params',
  tableAutoHeightDiff: 80,
  customizedSave: defaultCustomizedSave,
  customizedLoad: defaultCustomizedLoad,
  tableShowRemovedRow: true,
  modalSectionBorder: true,
  drawerSectionBorder: true,
  drawerTransitionName: 'slide-right',
  modalOkFirst: true,
  modalAutoCenter: false,
  modalKeyboard: true,
  modalMaskClosable: false,
  buttonColor: ButtonColor.default,
  buttonFuncType: FuncType.raised,
  feedback: defaultFeedback,
  renderEmpty: defaultRenderEmpty,
  icons: categories,
  formatter: defaultFormatter,
  dropdownMatchSelectWidth: true,
  defaultActiveFirstOption: true,
  selectReverse: true,
  selectPagingOptionContent: '···',
  selectSearchable: false,
  selectTrigger: [Action.focus, Action.click],
  useColon: false,
  excludeUseColonTagList: defaultExcludeUseColonTag,
  numberFieldNonStrictStep: false,
  showInvalidDate: true,
  highlightRenderer: defaultFormFieldHighlightRenderer,
  onPerformance: noop,
  performanceEnabled: { Table: false },
  tooltipTheme: defaultTooltipTheme,
  showValidation: ShowValidation.tooltip,
  attachment: defaultAttachment,
};

export type DefaultConfig = typeof defaultConfig;

const globalConfig: ObservableMap<ConfigKeys, Config[ConfigKeys]> = observable.map<ConfigKeys,
  Config[ConfigKeys]>(defaultConfig);

export function getConfig<T extends ConfigKeys>(key: T): T extends keyof DefaultConfig ? DefaultConfig[T] : Config[T] {
  return globalConfig.get(key) as T extends keyof DefaultConfig ? DefaultConfig[T] : Config[T];
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

export function getCustomizable<T extends keyof Customizable>(component: T): boolean | undefined {
  const customizable = getConfig('customizable');
  if (isBoolean(customizable)) {
    return customizable;
  }
  if (isCustomizable(customizable)) {
    return customizable[component];
  }
}

const mergeProps: ConfigKeys[] = ['transport', 'feedback', 'formatter', 'attachment', 'pagination'];

export default function configure(config: Config, merge = true) {
  runInAction(() => {
    Object.keys(config).forEach((key: ConfigKeys) => {
      const value = config[key];
      if (merge && mergeProps.includes(key) && isObject(value)) {
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
