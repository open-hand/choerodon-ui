import { observable, ObservableMap, runInAction, toJS } from 'mobx';
import { AxiosInstance, AxiosPromise, AxiosRequestConfig } from 'axios';
import React, { ReactNode } from 'react';
import noop from 'lodash/noop';
import isObject from 'lodash/isObject';
import { categories } from 'choerodon-ui-font';
import { Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import { LovConfig } from 'choerodon-ui/pro/lib/lov/Lov';
import { ExportMode, FieldType, RecordStatus } from 'choerodon-ui/pro/lib/data-set/enum';
import { $l } from 'choerodon-ui/pro/lib/locale-context';
import { Customized, expandIconProps, Suffixes, TablePaginationConfig, TableProps, TableQueryBarHook } from 'choerodon-ui/pro/lib/table/Table';
import { ValidationMessages } from 'choerodon-ui/pro/lib/validator/Validator';
import { ButtonProps } from 'choerodon-ui/pro/lib/button/Button';
import { ColumnAlign, DragColumnAlign, HighLightRowType, TableQueryBarType } from 'choerodon-ui/pro/lib/table/enum';
import { TransportHookProps, TransportProps } from 'choerodon-ui/pro/lib/data-set/Transport';
import DataSet from 'choerodon-ui/pro/lib/data-set/DataSet';
import defaultFeedback, { FeedBack } from 'choerodon-ui/pro/lib/data-set/FeedBack';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import Field from 'choerodon-ui/pro/lib/data-set/Field';
import { CacheOptions } from 'choerodon-ui/pro/lib/_util/Cache';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { defaultExcludeUseColonTag } from 'choerodon-ui/pro/lib/form/utils';
import { HighlightRenderer, Renderer } from 'choerodon-ui/pro/lib/field/FormField';
import { FormatNumberFunc, FormatNumberFuncOptions } from 'choerodon-ui/pro/lib/number-field/NumberField';
import { ModalProps } from 'choerodon-ui/pro/lib/modal/interface';
import { ColumnProps, onCellProps } from 'choerodon-ui/pro/lib/table/Column';
import { TimeZone } from 'choerodon-ui/pro/lib/date-picker/DatePicker';
import { TooltipTheme } from '../tooltip';
import { SpinProps } from '../spin';
import { PanelProps } from '../collapse';
import { Size } from '../_util/enum';
import Popover from '../popover';

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
    }
  }
}

export type PerformanceEventHook<T extends keyof PerformanceEvents> = (key: T, event: PerformanceEvents[T]) => void;

export type TooltipThemeType = 'table-cell' | 'output' | 'label' | 'button' | 'menu-item' | 'validation' | 'help';

export type TooltipThemeHook = (type?: TooltipThemeType) => TooltipTheme;

export type Formatter = {
  jsonDate?: string | null;
  date?: string;
  dateTime?: string;
  time?: string;
  year?: string;
  month?: string;
  week?: string;
  timeZone?: TimeZone;
};

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
  lovTableProps?: TableProps;
  lovModalProps?: ModalProps;
  lovTableCustomizable?: boolean;
  lovAutoSelectSingle?: boolean;
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
  tableVirtual?: boolean;
  tableVirtualCell?: boolean;
  tableBorder?: boolean;
  tableColumnEditorBorder?: boolean;
  tableHighLightRow?: boolean | HighLightRowType;
  tableParityRow?: boolean;
  tableSelectedHighLightRow?: boolean;
  tableRowHeight?: 'auto' | number;
  tableColumnTooltip?: Tooltip;
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
  tableDefaultRenderer?: Renderer;
  tableColumnOnCell?: (props: onCellProps) => object;
  tableColumnAlign?: (column: ColumnProps, field?: Field) => ColumnAlign | undefined;
  tableShowSelectionTips?: boolean;
  tableAlwaysShowRowBox?: boolean;
  tableUseMouseBatchChoose?: boolean;
  tableEditorNextKeyEnterDown?: boolean;
  tableAutoFocus?: boolean;
  tableKeyboard?: boolean;
  tableFilterAdapter?: TransportProps;
  tableFilterSuffix?: Suffixes[];
  tableFilterSearchText?: string;
  tableAutoHeightDiff?: number;
  tableCustomizable?: boolean;
  performanceTableCustomizable?: boolean;
  tableCustomizedSave?: (code: string, customized: Customized) => void;
  tableCustomizedLoad?: (code: string) => Promise<Customized | null>;
  pagination?: TablePaginationConfig | false;
  modalSectionBorder?: boolean;
  drawerSectionBorder?: boolean;
  drawerTransitionName?: string;
  modalAutoCenter?: boolean;
  modalOkFirst?: boolean;
  drawerOkFirst?: boolean;
  modalButtonProps?: ButtonProps;
  modalKeyboard?: boolean;
  modalMaskClosable?: string | boolean;
  buttonFuncType?: FuncType;
  buttonColor?: ButtonColor;
  buttonTooltip?: Tooltip;
  renderEmpty?: renderEmptyHandler;
  highlightRenderer?: HighlightRenderer;
  defaultValidationMessages?: ValidationMessages;
  transport?: TransportProps;
  icons?: { [key: string]: string[]; } | string[];
  generatePageQuery?: (pageParams: {
    page?: number;
    pageSize?: number;
    sortName?: string;
    sortOrder?: string;
    sort?: string[];
  }) => object;
  formatter?: Formatter;
  dropdownMatchSelectWidth?: boolean;
  selectOptionTooltip?: Tooltip;
  selectReverse?: boolean;
  selectPagingOptionContent?: string | ReactNode;
  selectSearchable?: boolean;
  useColon?: boolean;
  textFieldAutoComplete?: string;
  resultStatusRenderer?: object;
  numberFieldNonStrictStep?: boolean;
  numberFieldFormatter?: FormatNumberFunc;
  numberFieldFormatterOptions?: FormatNumberFuncOptions;
  currencyFormatter?: FormatNumberFunc;
  currencyFormatterOptions?: FormatNumberFuncOptions;
  labelTooltip?: Tooltip;
  outputTooltip?: Tooltip;
  /**
   * @deprecated
   */
  excludeUseColonTagList?: string[];
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
   * tooltip 主题
   */
  tooltipTheme?: TooltipTheme | TooltipThemeHook;
  /**
   * @deprecated
   * 校验提示 tooltip 主题
   */
  validationTooltipTheme?: TooltipTheme;
};

export type ConfigKeys = keyof Config;

const defaultTooltipTheme = type => type === 'validation' ? 'light' : 'dark';

const defaultRenderEmpty: renderEmptyHandler = (componentName?: string): ReactNode => {
  switch (componentName) {
    case 'Table':
      return $l('Table', 'empty_data');
    case 'Select':
      return $l('Select', 'no_matching_results');
    case 'Output':
      return '';
    default:
  }
};

const defaultFormFieldHighlightRenderer: HighlightRenderer = ({ content, ...rest }, element): ReactNode => content ? (
  <Popover {...rest} content={content}>
    {element}
  </Popover>
) : element;

const defaultButtonProps = { color: ButtonColor.primary, funcType: FuncType.flat };

const defaultSpinProps = { size: Size.default, wrapperClassName: '' };

const defaultTableColumnAlign = (_column: ColumnProps, field?: Field): ColumnAlign | undefined => {
  if (field) {
    const { type } = field;
    switch (type) {
      case FieldType.number:
      case FieldType.currency:
        return ColumnAlign.right;
      case FieldType.boolean:
        return ColumnAlign.center;
      default:
    }
  }
};

const globalConfig: ObservableMap<ConfigKeys, Config[ConfigKeys]> = observable.map<ConfigKeys,
  Config[ConfigKeys]>([
  ['prefixCls', 'c7n'],
  ['proPrefixCls', 'c7n-pro'],
  ['iconfontPrefix', 'icon'],
  ['ripple', true],
  ['collapseExpandIconPosition', 'left'],
  ['collapseTrigger', 'header'],
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
  ['lovTableProps', {}],
  ['lovModalProps', {}],
  ['lovAutoSelectSingle', false],
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
  ['tableDefaultRenderer', ''],
  ['tableColumnResizable', true],
  ['tableColumnHideable', true],
  ['performanceTableColumnHideable', true],
  ['tableRowDraggable', false],
  ['tableColumnDraggable', false],
  ['performanceTableColumnDraggable', false],
  ['tableColumnAlign', defaultTableColumnAlign],
  ['tableSpinProps', defaultSpinProps],
  ['tableButtonProps', defaultButtonProps],
  ['tableCommandProps', defaultButtonProps],
  ['tableAlwaysShowRowBox', false],
  ['tableUseMouseBatchChoose', false],
  ['tableEditorNextKeyEnterDown', true],
  ['tableAutoFocus', false],
  ['tableKeyboard', false],
  ['tableFilterSearchText', 'params'],
  ['tableAutoHeightDiff', 80],
  ['tableCustomizedSave', (code, customized) => localStorage.setItem(`table.customized.${code}`, JSON.stringify(customized))],
  ['tableCustomizedLoad', (code) => Promise.resolve(JSON.parse(localStorage.getItem(`table.customized.${code}`) || 'null'))],
  ['modalSectionBorder', true],
  ['drawerSectionBorder', true],
  ['drawerTransitionName', 'slide-right'],
  ['modalOkFirst', true],
  ['modalAutoCenter', false],
  ['drawerOkFirst', undefined],
  ['modalKeyboard', true],
  ['modalMaskClosable', false],
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
  ['selectReverse', true],
  ['selectPagingOptionContent', '···'],
  ['selectSearchable', false],
  ['useColon', false],
  ['excludeUseColonTagList', defaultExcludeUseColonTag],
  ['textFieldAutoComplete', undefined],
  ['numberFieldNonStrictStep', false],
  ['numberFieldFormatter', undefined],
  ['numberFieldFormatterOptions', undefined],
  ['currencyFormatter', undefined],
  ['currencyFormatterOptions', undefined],
  ['showInvalidDate', true],
  ['highlightRenderer', defaultFormFieldHighlightRenderer],
  ['onPerformance', noop],
  ['performanceEnabled', { Table: false }],
  ['tooltipTheme', defaultTooltipTheme],
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

const mergeProps = ['transport', 'feedback', 'formatter', 'tableFilterAdapter'];

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
