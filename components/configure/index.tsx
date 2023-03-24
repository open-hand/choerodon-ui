import { AxiosRequestConfig } from 'axios';
import { CSSProperties, ReactNode } from 'react';
import { configure as configureDataSet, overwriteConfigMergeProps, overwriteDefaultConfig } from 'choerodon-ui/dataset';
import {
  AttachmentConfig as DataSetAttachmentConfig,
  Config as DataSetConfig,
  DefaultConfig as DataSetDefaultConfig,
  Formatter,
  Status,
} from 'choerodon-ui/dataset/configure';
import { Tooltip, FieldFocusMode } from 'choerodon-ui/pro/lib/core/enum';
import {
  expandIconProps,
  Suffixes,
  TableCustomized,
  TablePaginationConfig,
  TableProps,
  TableQueryBarHook,
  TableQueryBarHookCustomProps,
} from 'choerodon-ui/pro/lib/table/Table';
import { SelectionProps } from 'choerodon-ui/pro/lib/lov/Lov';
import { PerformanceTableCustomized } from 'choerodon-ui/pro/lib/performance-table/Table';
import { ButtonProps } from 'choerodon-ui/pro/lib/button/Button';
import {
  ColumnAlign,
  DragColumnAlign,
  HighLightRowType,
  TableAutoHeightType,
  TableColumnResizeTriggerType,
  TableQueryBarType,
} from 'choerodon-ui/pro/lib/table/enum';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import Field from 'choerodon-ui/pro/lib/data-set/Field';
import { LabelLayout, ShowValidation } from 'choerodon-ui/pro/lib/form/enum';
import { ShowHelp } from 'choerodon-ui/pro/lib/field/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { HighlightRenderer } from 'choerodon-ui/pro/lib/field/FormField';
import { SpinProps } from 'choerodon-ui/pro/lib/spin';
import { FormatNumberFunc, FormatNumberFuncOptions } from 'choerodon-ui/pro/lib/number-field/NumberField';
import { ModalCustomized, ModalProps } from 'choerodon-ui/pro/lib/modal/interface';
import { ColumnProps, FilterPopoverProps, onCellProps } from 'choerodon-ui/pro/lib/table/Column';
import { AttachmentListType } from 'choerodon-ui/pro/lib/attachment/Attachment';
import AttachmentFile from 'choerodon-ui/pro/lib/data-set/AttachmentFile';
import { Action } from '../trigger/enum';
import { Size } from '../_util/enum';
import { TooltipPlacement, TooltipTheme } from '../tooltip';
import { PanelProps } from '../collapse';
import { TabsCustomized } from '../tabs/Tabs';
import defaults from './default';
import { UploadListReUploadIconFunc } from '../upload/interface';

overwriteConfigMergeProps<Config>(['pagination']);
overwriteDefaultConfig<Config>(defaults);

export { Status, Formatter };

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

export type TooltipTarget = 'table-cell' | 'output' | 'label' | 'button' | 'select-option' | 'validation' | 'help' | 'text-field-disabled';

export type TooltipHook = (target?: TooltipTarget) => Tooltip | undefined;

export type TooltipThemeHook = (target?: TooltipTarget) => TooltipTheme;

export type TooltipPlacementHook = (target?: TooltipTarget) => TooltipPlacement;

export type LovTablePropsHook = (multiple?: boolean) => Partial<TableProps>;

export type LovViewTarget = 'modal' | 'drawer';

/**
 * @deprecated
 */
export type FormatBigNumberFunc = (value: string, lang: string, options: Intl.NumberFormatOptions, bigNumberTarget: 'currency' | 'number-field') => string;

export type LovShowSelectedInViewHook = (viewMode?: LovViewTarget) => boolean;

export type TableFilterAdapterProps = ({ type, config, searchCode, queryDataSet }) => AxiosRequestConfig;

export type Customizable = {
  Table?: boolean;
  PerformanceTable?: boolean;
  Tabs?: boolean;
  Modal?: boolean;
}

export interface Customized {
  Table?: TableCustomized;
  PerformanceTable?: PerformanceTableCustomized;
  Tabs?: TabsCustomized;
  Modal?: ModalCustomized;
}

export type CustomizedSave = <T extends keyof Customized>(code: string, customized: Customized[T], component: T) => void;
export type CustomizedLoad = <T extends keyof Customized>(code: string, component: T) => Promise<Customized[T] | null>;

export interface AttachmentConfig extends DataSetAttachmentConfig {
  renderIcon?: (attachment: AttachmentFile, listType: AttachmentListType, defaultIcon: ReactNode) => ReactNode;
  renderHistory?: (props: { attachment: AttachmentFile; bucketName?: string; bucketDirectory?: string; storageCode?: string; attachmentUUID: string }) => ReactNode;
}

export interface Config extends DataSetConfig {
  prefixCls?: string;
  proPrefixCls?: string;
  iconfontPrefix?: string;
  ripple?: boolean;
  collapseExpandIconPosition?: string;
  collapseExpandIcon?: (panelProps: PanelProps) => ReactNode | 'text';
  collapseTrigger?: string;
  lovQueryCachedSelected?: (code: string, cachedSelected: Map<string, Record>) => Promise<object[]>;
  lovTableProps?: Partial<TableProps> | LovTablePropsHook;
  lovModalProps?: Partial<ModalProps>;
  lovAutoSelectSingle?: boolean;
  lovQueryBar?: TableQueryBarType | TableQueryBarHook;
  lovQueryBarProps?: Partial<TableQueryBarHookCustomProps>;
  lovShowSelectedInView?: boolean | LovShowSelectedInViewHook;
  lovSelectionProps?: SelectionProps;
  lovNoCache?: boolean;
  labelLayout?: LabelLayout;
  queryBar?: TableQueryBarType | TableQueryBarHook;
  queryBarProps?: Partial<TableQueryBarHookCustomProps>;
  tableVirtual?: boolean;
  tableVirtualCell?: boolean;
  tableVirtualBuffer?: { columnBuffer?: number; columnThreshold?: number; };
  tableBorder?: boolean;
  tableColumnEditorBorder?: boolean;
  tableHighLightRow?: boolean | HighLightRowType;
  tableParityRow?: boolean;
  tableSelectedHighLightRow?: boolean;
  tableRowHeight?: 'auto' | number | ((props: { size: Size }) => 'auto' | number);
  tableHeaderRowHeight?: 'auto' | number | ((props: { size: Size }) => 'auto' | number);
  tableFooterRowHeight?: 'auto' | number | ((props: { size: Size }) => 'auto' | number);
  tableColumnResizable?: boolean;
  tableColumnHideable?: boolean;
  performanceTableColumnHideable?: boolean;
  tableColumnTitleEditable?: boolean;
  tableHeightChangeable?: boolean;
  performanceTableColumnTitleEditable?: boolean;
  tableDragColumnAlign?: DragColumnAlign;
  tableColumnDraggable?: boolean;
  tableColumnResizeTransition?: boolean;
  performanceTableColumnDraggable?: boolean;
  tableRowDraggable?: boolean;
  tableExpandIcon?: (props: expandIconProps) => ReactNode;
  tableSpinProps?: SpinProps;
  tableButtonProps?: ButtonProps;
  tableCommandProps?: ButtonProps;
  tableColumnOnCell?: (props: onCellProps) => object;
  tableColumnAlign?: (column: ColumnProps, field?: Field, record?: Record) => ColumnAlign | undefined;
  tableColumnDefaultWidth?: number;
  tableColumnDefaultMinWidth?: number;
  tableColumnResizeTrigger?: TableColumnResizeTriggerType;
  tableColumnFilterPopover?: (props: FilterPopoverProps) => ReactNode;
  tableAggregationColumnDefaultWidth?: number;
  tableAggregationColumnDefaultMinWidth?: number;
  tableShowCachedTips?: boolean;
  tableShowSelectionTips?: boolean;
  tableShowSortIcon?: boolean;
  tableAlwaysShowRowBox?: boolean;
  tableUseMouseBatchChoose?: boolean;
  tableEditorNextKeyEnterDown?: boolean;
  tableAutoFocus?: boolean;
  tableKeyboard?: boolean;
  tableFilterAdapter?: TableFilterAdapterProps;
  tableFilterSuffix?: Suffixes[];
  tableFilterSearchText?: string;
  tableAutoHeightDiff?: number;
  performanceTableAutoHeight?: boolean | { type: TableAutoHeightType, diff: number };
  tableShowRemovedRow?: boolean;
  tableButtonsLimit?: number;
  pagination?: TablePaginationConfig | false;
  modalSectionBorder?: boolean;
  drawerSectionBorder?: boolean;
  drawerTransitionName?: string;
  modalMovable?: boolean;
  modalAutoCenter?: boolean;
  modalOkFirst?: boolean;
  drawerOkFirst?: boolean;
  drawerHeaderFooterCombined?: boolean;
  modalButtonProps?: ButtonProps;
  modalKeyboard?: boolean;
  modalMaskClosable?: boolean | 'click' | 'dblclick';
  modalResizable?: boolean;
  modalClosable?: boolean;
  buttonFuncType?: FuncType;
  buttonColor?: ButtonColor;
  autoInsertSpaceInButton?: boolean;
  renderEmpty?: renderEmptyHandler;
  highlightRenderer?: HighlightRenderer;
  icons?: { [key: string]: string[] } | string[];
  dropdownMatchSelectWidth?: boolean;
  defaultActiveFirstOption?: boolean;
  selectReverse?: boolean;
  selectPagingOptionContent?: string | ReactNode;
  selectSearchable?: boolean;
  selectBoxSearchable?: boolean;
  selectReserveParam?: boolean;
  selectTrigger?: Action[];
  secretFieldEnable?: () => boolean;
  secretFieldTypes?: () => object[];
  secretFieldFetchVerifyCode?: (type: string) => Promise<object>;
  secretFieldQueryData?: (params: object) => Promise<object | string>;
  secretFieldSaveData?: (params: object) => Promise<object | string>;
  useColon?: boolean;
  textFieldAutoComplete?: string;
  resultStatusRenderer?: object;
  numberFieldFormatter?: FormatNumberFunc;
  numberFieldFormatterOptions?: FormatNumberFuncOptions;
  currencyFormatter?: FormatNumberFunc;
  currencyFormatterOptions?: FormatNumberFuncOptions;
  /**
   * 聚焦类型：checked 默认聚焦选中文本，focus 聚焦显示光标
   */
  fieldFocusMode?: FieldFocusMode;
  /**
   * 是否聚焦到 Form 可编辑的第一个表单组件上
   */
  formAutoFocus?: boolean;
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
  onTabsChange?: (props: { activeKey: string, title: string, activeGroupKey?: string, groupTitle?: string, code?: string }) => void;
  onButtonClick?: (props: { title: string, icon?: string }) => void;
  onComponentValidationReport?: (props: { showInvalid: boolean; component: any; }) => void;
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
   * tooltip 位置
   */
  tooltipPlacement?: TooltipPlacement | TooltipPlacementHook;
  /**
   * 附件相关配置
   */
  attachment?: AttachmentConfig;
  /**
   * 表单校验提示方式
   */
  showValidation?: ShowValidation;
  /**
   * 显示提示信息的方式
   */
  showHelp?: ShowHelp;
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
   * NumberField 是否启用UP DOWN键盘事件
   */
  numberFieldKeyboard?: boolean;
  /**
   * 日期时间控件是否显示确定按钮
   */
  dateTimePickerOkButton?: boolean;
  fieldMaxTagPlaceholder?: ReactNode | ((omittedValues: any[]) => ReactNode);
  fieldMaxTagCount?: number;
  /**
   * 是否开启备选色板
   */
  colorPreset?: boolean;
  /**
   * Upload 组件文件上传失败后是否显示重新上传按钮。
   * 当 listType 为 picture-card: true 为 icon, text 为文字形式; 其他 listType 都为文字形式
   */
  uploadShowReUploadIcon?: boolean | 'text' | UploadListReUploadIconFunc;
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
  /**
   * @deprecated
   */
  bigNumberFormatter?: FormatBigNumberFunc;
}

export type ConfigKeys = keyof Config;

export type DefaultConfig = DataSetDefaultConfig & (typeof defaults);

export { getConfig, getPrefixCls, getProPrefixCls, getCustomizable, isCustomizable } from './utils';

export default function configure(config: Config, merge = true) {
  configureDataSet<Config>(config, merge ? undefined : null);
}
