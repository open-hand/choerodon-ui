import React, { ReactNode } from 'react';
import { categories } from 'choerodon-ui-font';
import noop from 'lodash/noop';
import { LabelLayout, ShowValidation, LabelAlign, RequiredMarkAlign } from 'choerodon-ui/pro/lib/form/enum';
import { ColumnAlign, TableQueryBarType, TableColumnResizeTriggerType } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { $l } from 'choerodon-ui/pro/lib/locale-context';
import { HighlightRenderer } from 'choerodon-ui/pro/lib/field/FormField';
import { ButtonProps } from 'choerodon-ui/pro/lib/button/Button';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { defaultExcludeUseColonTag, defaultLabelWidth } from 'choerodon-ui/pro/lib/form/utils';
import Field from 'choerodon-ui/pro/lib/data-set/Field';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { ShowHelp } from 'choerodon-ui/pro/lib/field/enum';
import getReactNodeText from 'choerodon-ui/pro/lib/_util/getReactNodeText';
import formatReactTemplate from 'choerodon-ui/pro/lib/formatter/formatReactTemplate';
import defaultFeedback from 'choerodon-ui/pro/lib/data-set/FeedBack';
import confirm from 'choerodon-ui/pro/lib/modal/confirm';
import { FieldFocusMode, Tooltip } from 'choerodon-ui/pro/lib/core/enum';
import { ModalButtonTrigger } from 'choerodon-ui/pro/lib/modal/interface';
import { Size } from '../_util/enum';
import { CustomizedLoad, CustomizedSave, renderEmptyHandler, TooltipThemeHook, LovShowSelectedInViewHook, TooltipHook } from './index';
import { Action } from '../trigger/enum';
import Popover from '../popover';

const defaultTooltip: TooltipHook = target => {
  switch(target) {
    case 'output':
      return Tooltip.overflow;
    default:
      break;
  }
};

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
      case FieldType.bigNumber:
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
    case 'Modal':
      return 'modal';
    default:
      return 'table';
  }
}

const defaultCustomizedSave: CustomizedSave = (code, customized, component) => localStorage.setItem(`${getComponentKey(component)}.customized.${code}`, JSON.stringify(customized));
const defaultCustomizedLoad: CustomizedLoad = (code, component) => Promise.resolve(JSON.parse(localStorage.getItem(`${getComponentKey(component)}.customized.${code}`) || 'null'));

const defaultLovShowSelectedInView: LovShowSelectedInViewHook = (viewMode) => viewMode === 'drawer';

const defaults = {
  prefixCls: 'c7n',
  proPrefixCls: 'c7n-pro',
  iconfontPrefix: 'icon',
  ripple: true,
  collapseExpandIconPosition: 'left',
  collapseTrigger: 'header',
  lovTableProps: {},
  lovModalProps: {},
  lovAutoSelectSingle: false,
  lovShowSelectedInView: defaultLovShowSelectedInView,
  labelLayout: LabelLayout.horizontal,
  labelAlign: LabelAlign.right,
  labelWidth: defaultLabelWidth,
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
  tableHeightChangeable: true,
  tablePageSizeChangeable: false,
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
  performanceTableAutoHeight: false,
  tableColumnDefaultWidth: 100,
  tableColumnDefaultMinWidth: 50,
  tableColumnResizeTrigger: TableColumnResizeTriggerType.mouseDown,
  tableAggregationColumnDefaultWidth: 250,
  tableAggregationColumnDefaultMinWidth: 50,
  customizedSave: defaultCustomizedSave,
  customizedLoad: defaultCustomizedLoad,
  tableShowRemovedRow: true,
  modalSectionBorder: true,
  drawerHeaderFooterCombined: false,
  drawerSectionBorder: true,
  drawerTransitionName: 'slide-right',
  modalOkFirst: true,
  modalAutoCenter: false,
  modalAutoFocus: true,
  modalKeyboard: true,
  modalMaskClosable: false,
  modalMovable: true,
  modalClosable: false,
  modalButtonTrigger: ModalButtonTrigger.CLICK,
  buttonColor: ButtonColor.default,
  buttonFuncType: FuncType.raised,
  autoInsertSpaceInButton: false,
  renderEmpty: defaultRenderEmpty,
  icons: categories,
  dropdownMatchSelectWidth: true,
  defaultActiveFirstOption: true,
  selectReverse: true,
  selectPagingOptionContent: '···',
  selectSearchable: false,
  selectBoxSearchable: false,
  selectReserveParam: true,
  selectTrigger: [Action.focus, Action.click],
  useColon: false,
  requiredMarkAlign: RequiredMarkAlign.left,
  excludeUseColonTagList: defaultExcludeUseColonTag,
  numberFieldNonStrictStep: false,
  showInvalidDate: true,
  highlightRenderer: defaultFormFieldHighlightRenderer,
  onPerformance: noop,
  performanceEnabled: { Table: false },
  tooltip: defaultTooltip,
  tooltipTheme: defaultTooltipTheme,
  showValidation: ShowValidation.tooltip,
  showHelp: ShowHelp.newLine,
  numberFieldKeyboard: true,
  colorPreset: false,
  feedback: defaultFeedback,
  confirm: async (message) => (await confirm(message)) !== 'cancel',
  validationMessageReportFormatter: (message) => getReactNodeText(<span>{message}</span>),
  validationMessageFormatter: (message, injectOptions) => message && injectOptions ? formatReactTemplate(message, injectOptions) : message,
  modalResizable: false,
  tableColumnResizeTransition: true,
  fieldFocusMode: FieldFocusMode.checked,
  formAutoFocus: false,
  tabsDefaultChangeable: true,
  rangeSeparator: '~',
};

export default defaults;
