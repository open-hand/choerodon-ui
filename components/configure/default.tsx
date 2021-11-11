import React, { ReactNode } from 'react';
import { categories } from 'choerodon-ui-font';
import noop from 'lodash/noop';
import { LabelLayout, ShowValidation } from 'choerodon-ui/pro/lib/form/enum';
import { ColumnAlign, TableQueryBarType } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { $l } from 'choerodon-ui/pro/lib/locale-context';
import { HighlightRenderer } from 'choerodon-ui/pro/lib/field/FormField';
import { ButtonProps } from 'choerodon-ui/pro/lib/button/Button';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { defaultExcludeUseColonTag } from 'choerodon-ui/pro/lib/form/utils';
import Field from 'choerodon-ui/pro/lib/data-set/Field';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import getReactNodeText from 'choerodon-ui/pro/lib/_util/getReactNodeText';
import formatReactTemplate from 'choerodon-ui/pro/lib/formatter/formatReactTemplate';
import defaultFeedback from 'choerodon-ui/pro/lib/data-set/FeedBack';
import confirm from 'choerodon-ui/pro/lib/modal/confirm';
import { Size } from '../_util/enum';
import { CustomizedLoad, CustomizedSave, renderEmptyHandler, TooltipThemeHook } from './index';
import { Action } from '../trigger/enum';
import Popover from '../popover';

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

const defaultCustomizedSave: CustomizedSave = (code, customized, component) => localStorage.setItem(`${getComponentKey(component)}.customized.${code}`, JSON.stringify(customized));
const defaultCustomizedLoad: CustomizedLoad = (code, component) => Promise.resolve(JSON.parse(localStorage.getItem(`${getComponentKey(component)}.customized.${code}`) || 'null'));

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
  renderEmpty: defaultRenderEmpty,
  icons: categories,
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
  numberFieldKeyboard: true,
  feedback: defaultFeedback,
  confirm: async (message) => (await confirm(message)) !== 'cancel',
  validationMessageReportFormatter: (message) => getReactNodeText(<span>{message}</span>),
  validationMessageFormatter: (message, injectOptions) => message && injectOptions ? formatReactTemplate(message, injectOptions) : message,
};

export default defaults;
