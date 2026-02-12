import { AxiosRequestConfig } from 'axios';
import { CSSProperties, ReactNode } from 'react';
import DataSet from 'choerodon-ui/dataset/data-set';
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
  TableFilterBarButtonIcon,
} from 'choerodon-ui/pro/lib/table/Table';
import { SelectionProps } from 'choerodon-ui/pro/lib/lov/Lov';
import {
  AddNewOptionPromptRenderProps,
  AddNewOptionPromptResultProps,
} from 'choerodon-ui/pro/lib/select/Select';
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
import Field, { FieldProps } from 'choerodon-ui/pro/lib/data-set/Field';
import { LabelLayout, ShowValidation, LabelAlign, RequiredMarkAlign } from 'choerodon-ui/pro/lib/form/enum';
import { SeparateSpacing, LabelWidth, FormProps } from 'choerodon-ui/pro/lib/form/interface';
import { ShowHelp } from 'choerodon-ui/pro/lib/field/enum';
import { ValueChangeAction } from 'choerodon-ui/pro/lib/text-field/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { HighlightRenderer } from 'choerodon-ui/pro/lib/field/FormField';
import { SpinProps } from 'choerodon-ui/pro/lib/spin';
import { FormatNumberFunc, FormatNumberFuncOptions } from 'choerodon-ui/pro/lib/number-field/NumberField';
import { ModalButtonTrigger, ModalCustomized, ModalProps, ModalOkAndCancelIcon, ModalChildrenProps } from 'choerodon-ui/pro/lib/modal/interface';
import { ColumnProps, FilterPopoverProps, onCellProps } from 'choerodon-ui/pro/lib/table/Column';
import { AttachmentListType } from 'choerodon-ui/pro/lib/attachment/Attachment';
import AttachmentFile from 'choerodon-ui/pro/lib/data-set/AttachmentFile';
import { BoardCustomized } from 'choerodon-ui/pro/lib/board/interface';
import { Action } from '../trigger/enum';
import { Size } from '../_util/enum';
import { TooltipPlacement, TooltipTheme } from '../tooltip';
import { PanelProps } from '../collapse';
import { TabsCustomized } from '../tabs/Tabs';
import defaults from './default';
import { UploadListReUploadIconFunc } from '../upload/interface';
import { InputSuffixCompName } from './interface';

overwriteConfigMergeProps<Config>(['pagination']);
overwriteDefaultConfig<Config>(defaults);

export { InputSuffixCompName };

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

export type TooltipTarget = 'table-cell' | 'output' | 'label' | 'button' | 'select-option' | 'table-validation'  |
  'validation' | 'help' | 'text-field-disabled' | 'text-field' | 'text-field-placeholder';

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
  Board?: boolean;
}

export interface Customized {
  Table?: TableCustomized;
  PerformanceTable?: PerformanceTableCustomized;
  Tabs?: TabsCustomized;
  Modal?: ModalCustomized;
  Board?: BoardCustomized | BoardCustomized[] | any;
}

export type CustomizedRendererOtherInfo<T extends keyof Customized> = {
  /**
   * 加载个性化到表格中, 例如切换、删除个性化后, 需要重新加载
   * @param props 要加载的个性化信息。参数为空时, 会走 customizedLoad 查询个性化
   */
  loadCustomized?: (props?: Customized[T]) => Promise<void>;
  /**
   * 获取当前被修改的个性化信息
   */
  getTempCustomized?: () => Customized[T];
  /**
   * modal 弹窗实例, 可用于 update 弹窗按钮
   */
  modal?: ModalChildrenProps;
  /**
   * 个性化保存方法
   * @param props params 为自定义参数, 传递数据状态: 是否为新增、是否默认、模板名称等, 会传到 CustomizedSave 的 otherInfo.params 中
   */
  handleOk?: (props?: { params?: any }) => void;
  /**
   * 个性化取消修改方法
   */
  handleCancel?: () => void;
}

export type CustomizedSave = <T extends keyof Customized>(code: string, customized: Customized[T], component?: T, otherInfo?: { columnDataSet?: DataSet, params?: any }) => Promise<void> | void;
export type CustomizedLoad = <T extends keyof Customized>(code: string, component: T, params?: any) => Promise<Customized[T] | null>;

export type CustomizedRenderer = <T extends keyof Customized>(code: string, customized: Customized[T], component?: T, otherInfo?: CustomizedRendererOtherInfo<T>) => {
  /**
   * 个性化保存前回调
   * @param tempCustomized 将要保存的个性化配置
   * @returns object 类型中的 params 为自定义参数, 传递数据状态: 是否为新增、是否默认、模板名称等, 会传到 CustomizedSave 的 otherInfo.params 中; 返回 false 则不保存
   */
  onCustomizedSaveBefore?: (tempCustomized: Customized[T]) => Promise<{ params?: any } | false | undefined>;
  /**
   * 个性化取消修改前回调
   */
  onCancelBefore?: () => Promise<void>;
  /**
   * 自定义渲染元素, 例如个性化模板列表等等
   */
  customRenderNode?: ReactNode;
};

export interface AttachmentConfig extends DataSetAttachmentConfig {
  renderIcon?: (attachment: AttachmentFile, listType: AttachmentListType, defaultIcon: ReactNode) => ReactNode;
  renderHistory?: (props: { attachment: AttachmentFile; bucketName?: string; bucketDirectory?: string; storageCode?: string; attachmentUUID: string }) => ReactNode;
}

export type TreeCheckboxPosition = undefined | 'default' | 'left';

export type AddNewOptionPromptRenderType = (props: AddNewOptionPromptRenderProps & AddNewOptionPromptResultProps) => ReactNode;

export type InputLengthExceedWarningHook = (props: { dataSet?: DataSet, field?: Field, name?: string, record?: Record, maxLength: number }) => void;

export interface Config extends DataSetConfig {
  prefixCls?: string;
  proPrefixCls?: string;
  iconfontPrefix?: string;
  ripple?: boolean;
  collapseExpandIconPosition?: string;
  collapseExpandIcon?: ((panelProps: PanelProps) => ReactNode) | 'text';
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
  /**
   * form 标签文字对齐方式
   * 可选值： 'left' | 'center' | 'right'
   * @default right;
   */
  labelAlign?: LabelAlign;
  separateSpacing?: number | [number, number] | SeparateSpacing;
  labelWidth?: LabelWidth | ((lang: string, columns: number) => LabelWidth);
  labelWordBreak?: boolean;
  queryBar?: TableQueryBarType | TableQueryBarHook;
  queryBarProps?: Partial<TableQueryBarHookCustomProps>;
  tableVirtual?: boolean | ((rows: number, columns: number) => boolean);
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
   /**
   * 可调整列宽，如果表格横向有缩放样式，需要传入 { xZoom: [缩放倍数] } 矫正缩放引起的计算误差
   */
  tableColumnResizable?: boolean | { xZoom: number };
  tableColumnHideable?: boolean;
  performanceTableColumnHideable?: boolean;
  tableColumnTitleEditable?: boolean;
  tableHeightChangeable?: boolean;
  tablePageSizeChangeable?: boolean;
  performanceTableColumnTitleEditable?: boolean;
  performanceTableUseMouseBatchChoose?: boolean;
  tableDragColumnAlign?: DragColumnAlign;
  tableColumnDraggable?: boolean;
  tableColumnResizeTransition?: boolean;
  performanceTableColumnDraggable?: boolean;
  tableRowDraggable?: boolean | 'multiDrag';
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
  tableFilterBarButtonIcon?: TableFilterBarButtonIcon;
  tableSize?: Size;
  /**
   * Table 专业搜索条隐藏的查询字段中有值时, 是否默认展开全部字段
   */
  tableProfBarHasValueDefaultExpanded?: boolean;
  pagination?: TablePaginationConfig | false;
  modalSectionBorder?: boolean;
  drawerSectionBorder?: boolean;
  drawerTransitionName?: string;
  modalMovable?: boolean;
  modalAutoCenter?: boolean;
  modalAutoFocus?: boolean;
  modalOkFirst?: boolean;
  drawerOkFirst?: boolean;
  drawerHeaderFooterCombined?: boolean;
  modalButtonProps?: ButtonProps;
  modalButtonTrigger?: ModalButtonTrigger;
  modalKeyboard?: boolean;
  modalMaskClosable?: boolean | 'click' | 'dblclick';
  modalResizable?: boolean;
  modalClosable?: boolean;
  modalOkAndCancelIcon?: ModalOkAndCancelIcon;
  buttonFuncType?: FuncType;
  buttonColor?: ButtonColor;
  autoInsertSpaceInButton?: boolean;
  renderEmpty?: renderEmptyHandler;
  highlightRenderer?: HighlightRenderer;
  icons?: { [key: string]: string[] } | string[];
  dropdownMatchSelectWidth?: boolean;
  defaultActiveFirstOption?: boolean;
  selectReverse?: boolean;
  selectOptionsFilter?:  (record: Record, index: number, records: Record[]) => boolean;
  selectPagingOptionContent?: string | ReactNode;
  selectSearchable?: boolean;
  selectBoxSearchable?: boolean;
  selectReserveParam?: boolean;
  selectTrigger?: Action[];
  selectScrollLoad?: boolean;
  selectShowInputPrompt?: boolean | ReactNode | (({ searchable, combo }) => boolean | ReactNode);
  /** Select Lov 新增选项功能渲染函数 */
  addNewOptionPromptRender?: AddNewOptionPromptRenderType;
  secretFieldEnable?: () => boolean;
  secretFieldTypes?: () => object[];
  secretFieldFetchVerifyCode?: (type: string) => Promise<object>;
  secretFieldQueryData?: (params: object) => Promise<object | string>;
  secretFieldSaveData?: (params: object) => Promise<object | string>;
  useColon?: boolean;
  requiredMarkAlign?: RequiredMarkAlign;
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
  showLengthInfo?: boolean | 'auto';
  /**
   * moment非法时显示Invalid date
   */
  showInvalidDate?: boolean;
  /**
   * 只有在空值时显示必填背景色和边框色
   */
  showRequiredColorsOnlyEmpty?: boolean;
  /**
   * 对应值集内值不存在显示值时是否显示 value
   */
  showValueIfNotFound?: boolean;
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
   * tooltip 自动选择最佳方向弹出：top、bottom、left、right
   */
  tooltipAutoPlacement?: boolean;
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
   * 显示提示信息的方式
   */
  valueChangeAction?: ValueChangeAction;
  /**
   * Tabs 墨条样式
   */
  tabsInkBarStyle?: CSSProperties;
  /**
   * Tabs 个性化是否开启默认可配置
   */
  tabsDefaultChangeable?: boolean;
  /**
   * Tabs 是否开启 DataSet 校验
   */
  tabsShowInvalidTips?: boolean;
  /**
   * 个性化开关
   */
  customizable?: boolean | Customizable;
  customizedSave?: CustomizedSave;
  customizedLoad?: CustomizedLoad;
  customizedRenderer?: CustomizedRenderer;
  /**
   * NumberField 是否启用UP DOWN键盘事件
   */
  numberFieldKeyboard?: boolean;
  /**
   * NumberField 和 Currency 组件的值是否在输入和显示时开启根据 precision 补零，真实值不受影响
   */
  useZeroFilledDecimal?: boolean;
  inputDecimalSeparatorFollowLang?: boolean;
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
   * 是否开启上传密级配置
   */
  uploadSecretLevelFlag?: boolean;
  /**
   * 上传密级配置项
   */
  uploadSecretLevelOptions?: { fields: FieldProps[], formProps?: FormProps, modalProps?: ModalProps };
  pictureCardShowName?: boolean;
  /**
   * 输入框 range 分隔符
   */
  rangeSeparator?: string;
  /**
   * DatePicker 组件 range 模式，选择弹窗组合显示
   */
  datePickerComboRangeMode?: boolean;
  /**
   * DatePicker 选择弹窗头部年份是否显示在前
   */
    datePickerYearFirst?: boolean;
  /**
   * Tree checkbox 显示位置
   */
  treeCheckboxPosition?: TreeCheckboxPosition;
  /**
   * Tree 是否显示连接线
   */
  treeShowLine?: boolean | { showLeafIcon: boolean };
  /**
   * 输入组件禁用时, 是否显示后缀
   */
  inputDisabledShowSuffix?: boolean | ((compName: InputSuffixCompName) => boolean | undefined);
  /**
   * 粘贴内容超过最大长度时的警告提示
   */
  textFieldPasteMaxLengthWarning?: boolean | InputLengthExceedWarningHook;
  /** 输入框文本超过 maxLength 进行提示 */
  inputLengthExceedWarning?: boolean | InputLengthExceedWarningHook;
  /**
   * Tag 组件 hover 时是否显示小手样式
   */
  tagHoverShowPointer?: boolean;
  /**
   * 禁止时间组件循环滚动
   */
  disabledTimeLoopRoll?: boolean;
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
  /**
   * RichText 组件工具栏字体列表配置。example: [{ name: '宋体', family: 'SimSun' }, { name: '仿宋', family: 'FangSong' }]
   * @param name: 显示的字体名
   * @param family: 实际的字体值
   */
  richTextFontFamilies?: ({ name: string; family: string })[];
}

export type ConfigKeys = keyof Config;

export type DefaultConfig = DataSetDefaultConfig & (typeof defaults);

export { getConfig, getPrefixCls, getProPrefixCls, getCustomizable, isCustomizable } from './utils';

export default function configure(config: Config, merge = true) {
  configureDataSet<Config>(config, merge ? undefined : null);
}
