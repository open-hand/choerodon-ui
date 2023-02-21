import React, { ReactElement, ReactNode } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import isString from 'lodash/isString';
import defaultTo from 'lodash/defaultTo';
import noop from 'lodash/noop';
import isFunction from 'lodash/isFunction';
import { action, computed, isArrayLike, observable, runInAction, toJS } from 'mobx';
import { pxToRem, scaleSize } from 'choerodon-ui/lib/_util/UnitConvertor';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { Size } from 'choerodon-ui/lib/_util/enum';
import { LovConfig as DataSetLovConfig, LovConfigItem } from 'choerodon-ui/dataset/interface';
import { LovViewTarget } from 'choerodon-ui/lib/configure';
import Icon from '../icon';
import LovView, { LovViewProps } from './LovView';
import Modal, { ModalProps } from '../modal/Modal';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Spin from '../spin';
import lovStore from '../stores/LovCodeStore';
import autobind from '../_util/autobind';
import { stopEvent } from '../_util/EventManager';
import ObserverSelect, {
  isSearchTextEmpty,
  SearchMatcher,
  Select,
  SelectProps,
} from '../select/Select';
import Option from '../option/Option';
import { TableQueryBarType } from '../table/enum';
import { CheckedStrategy, DataSetStatus, RecordStatus } from '../data-set/enum';
import { PopupSearchMode, SearchAction, ViewMode } from './enum';
import Button, { ButtonProps } from '../button/Button';
import { ButtonColor, FuncType } from '../button/enum';
import { $l } from '../locale-context';
import { getLovPara } from '../stores/utils';
import { TableProps, TableQueryBarHook, TableQueryBarHookProps } from '../table/Table';
import isIE from '../_util/isIE';
import { TextFieldProps } from '../text-field/TextField';
import { ModalChildrenProps, ModalProxy } from '../modal/interface';
import { TriggerViewMode } from '../trigger-field/TriggerField';
import mergeProps from '../_util/mergeProps';

export type Events = { [key: string]: Function };

export type ViewRenderer = ({
  dataSet,
  lovConfig,
  textField,
  valueField,
  multiple,
  modal,
}: {
  dataSet: DataSet;
  lovConfig: LovConfig | undefined;
  textField: string | undefined;
  valueField: string | undefined;
  multiple: boolean;
  modal?: ModalChildrenProps;
}) => ReactNode;

export type NodeRenderer = (record: Record) => ReactNode;

export { LovConfigItem };

export interface SelectionProps {
  nodeRenderer?: NodeRenderer;
  placeholder?: string | ReactNode;
}

export interface LovConfig extends DataSetLovConfig {
  queryBar?: TableQueryBarType | TableQueryBarHook;
  tableProps?: Partial<TableProps>;
}

export interface LovProps extends SelectProps, ButtonProps {
  modalProps?: ModalProps;
  tableProps?: Partial<TableProps>;
  noCache?: boolean;
  mode?: ViewMode;
  viewMode?: TriggerViewMode;
  /**
   * @deprecated
   */
  lovEvents?: Events;
  /**
   * 触发查询变更的动作， default: input
   */
  searchAction?: SearchAction;
  /**
   * 触发查询获取记录有重复时弹出选择窗口
   * SearchAction blur 生效
   * default: false
   */
  fetchSingle?: boolean;
  /**
   * 点击查询仅存在一条数据时自动选中
   */
  autoSelectSingle?: boolean;
  showCheckedStrategy?: CheckedStrategy;
  onBeforeSelect?: (records: Record | Record[]) => boolean | Promise<boolean | undefined> | undefined;
  onSearchMatcherChange?: (searchMatcher?: string) => void;
  viewRenderer?: ViewRenderer;
  nodeRenderer?: NodeRenderer;
  showSelectedInView?: boolean;
  selectionProps?: SelectionProps;
  popupSearchMode?: PopupSearchMode;
}

@observer
export default class Lov extends Select<LovProps> {
  static displayName = 'Lov';

  static defaultProps = {
    ...Select.defaultProps,
    clearButton: true,
    checkValueOnOptionsChange: false,
    dropdownMatchSelectWidth: false,
    searchAction: SearchAction.input,
    fetchSingle: false,
    viewMode: TriggerViewMode.modal,
    popupSearchMode: PopupSearchMode.multiple,
  };

  @observable modal: ModalProxy | undefined;

  fetched?: boolean;

  searching?: boolean;

  @computed
  get searchMatcher(): SearchMatcher {
    const { searchMatcher } = this.observableProps;
    if (isString(searchMatcher)) {
      return searchMatcher;
    }
    const { viewMode } = this.observableProps;
    const { textField } = this;
    if (viewMode === TriggerViewMode.popup) {
      const { options: { queryDataSet } } = this;
      if (queryDataSet) {
        const queryFields = Array.from(queryDataSet.fields.keys());
        if (queryFields.length && !queryFields.includes(textField)) {
          return queryFields[0];
        }
      }
    }
    return textField;
  }

  @computed
  get searchable(): boolean {
    const { searchable } = this.observableProps;
    if (searchable === false) {
      return searchable;
    }
    const config = this.getConfig();
    if (config) {
      return config.editableFlag === 'Y';
    }
    return true;
  }

  @computed
  get lovCode(): string | undefined {
    const { field } = this;
    if (field) {
      return field.get('lovCode', this.record);
    }
    return undefined;
  }

  get popup(): boolean {
    const { popupSearchMode } = this.props;
    const { viewMode } = this.observableProps;
    if (viewMode === TriggerViewMode.popup && popupSearchMode === PopupSearchMode.single) {
      return this.modal || (this.isSearchFieldInPopup() && !this.searchText) ? false : this.statePopup;
    }
    return this.modal || (!this.isSearchFieldInPopup() && !this.searchText) ? false : this.statePopup;
  }

  /**
   * 点击查询仅存在一条数据时自动选中, Button 模式禁用
   */
  get autoSelectSingle(): boolean | undefined {
    const { viewMode } = this.observableProps;
    const { mode } = this.props;
    if (viewMode === TriggerViewMode.popup || mode === ViewMode.button) {
      return false;
    }
    if ('autoSelectSingle' in this.props) {
      return this.props.autoSelectSingle;
    }
    const autoSelectSingle = this.getContextConfig('lovAutoSelectSingle');
    if (typeof autoSelectSingle !== 'undefined') {
      return autoSelectSingle;
    }
    return false;
  }

  @computed
  get options(): DataSet {
    const { field, lovCode, record } = this;
    if (field) {
      const options = field.getOptions(record);
      if (options) {
        return options;
      }
    }
    if (lovCode) {
      const lovDataSet = lovStore.getLovDataSet(lovCode, field, field && field.get('optionsProps', record), record);
      if (lovDataSet) {
        return lovDataSet;
      }
    }
    return new DataSet(undefined, { getConfig: this.getContextConfig as any });
  }

  get showSelectedInView(): boolean {
    if ('showSelectedInView' in this.props) {
      return this.props.showSelectedInView!;
    }
    const lovShowSelectedInView = this.getContextConfig('lovShowSelectedInView');
    if (isFunction(lovShowSelectedInView)) {
      return lovShowSelectedInView(this.props.viewMode as LovViewTarget);
    }
    return lovShowSelectedInView;
  }

  getSearchFieldProps(): TextFieldProps {
    const searchFieldProps = super.getSearchFieldProps();
    const { viewMode } = this.observableProps;
    if (viewMode === TriggerViewMode.popup) {
      return {
        multiple: true,
        ...searchFieldProps,
      };
    }
    return searchFieldProps;
  }

  isSearchFieldInPopup(): boolean | undefined {
    const searchFieldInPopup = super.isSearchFieldInPopup();
    if (searchFieldInPopup === undefined) {
      const { viewMode } = this.observableProps;
      if (viewMode === TriggerViewMode.popup) {
        const { popupSearchMode } = this.props;
        return popupSearchMode !== PopupSearchMode.single;
      }
    }
    return searchFieldInPopup;
  }

  popupEditable(): boolean {
    return !super.disabled && !super.readOnly && this.searchable;
  }

  isEditable(): boolean {
    const { viewMode } = this.observableProps;
    const { popupSearchMode } = this.props;
    if (viewMode === TriggerViewMode.popup) {
      return popupSearchMode === PopupSearchMode.single && this.popupEditable();
    }
    return super.isEditable()
  }

  @autobind
  @action
  handleSearchMatcherChange(searchMatcher) {
    this.observableProps.searchMatcher = searchMatcher;
    this.searchText = undefined;
    const { onSearchMatcherChange = noop } = this.props;
    onSearchMatcherChange(searchMatcher);
  }

  @autobind
  renderSearchFieldPrefix(props?: TableQueryBarHookProps): ReactNode {
    if (props) {
      const { queryDataSet } = props;
      if (queryDataSet) {
        const { fields } = queryDataSet;
        if (fields.size > 0) {
          const options: ReactElement[] = [];
          const { searchMatcher } = this;
          fields.forEach((field, name) => {
            options.push(
              <Option key={String(name)} value={name}>{field.get('label')}</Option>,
            );
          });
          const { prefixCls } = this;
          return (
            <>
              <ObserverSelect
                value={searchMatcher}
                onChange={this.handleSearchMatcherChange}
                border={false}
                clearButton={false}
                className={`${prefixCls}-lov-search-option`}
                getPopupContainer={this.getPopupWrapper}
                isFlat
              >
                {options}
              </ObserverSelect>
              <div className={`${prefixCls}-lov-search-option-divide`} />
            </>
          );
        }
      }
    }
  }

  getPopupLovView() {
    const config = this.getConfig();
    this.autoCreate();
    const { options } = this;
    if (config && options) {
      let lovViewProps;
      if (!this.popup) delete this.fetched;
      if (this.popup && !this.fetched) {
        runInAction(() => {
          lovViewProps = this.beforeOpen(options);
          this.afterOpen(options);
          this.fetched = true;
        });
      }
      const tableProps = this.getTableProps(lovViewProps && lovViewProps.tableProps);
      const { popupSearchMode } = this.props;
      const mergedTableProps: Partial<TableProps> | undefined = mergeProps<Partial<TableProps>>(tableProps, {
        style: {
          maxHeight: 250,
        },
        pagination: { showSizeChanger: false },
        queryBar: popupSearchMode === PopupSearchMode.single ? TableQueryBarType.none : this.renderSearchField,
        border: false,
        size: Size.small,
      });
      const { onBeforeSelect, viewMode } = this.props;
      return (
        <LovView
          {...lovViewProps}
          viewMode={viewMode}
          dataSet={options}
          config={config}
          context={this.context}
          tableProps={mergedTableProps}
          onSelect={this.handleLovViewSelect}
          onBeforeSelect={onBeforeSelect}
          multiple={this.multiple}
          values={this.getValues()}
          popupHidden={!this.popup}
        />
      );
    }
  }

  @autobind
  getPopupContent(): ReactNode {
    const { searchAction } = this.props;
    const { viewMode } = this.observableProps;
    if (viewMode === TriggerViewMode.popup) {
      return this.getPopupLovView();
    }
    if (searchAction === SearchAction.input) {
      return super.getPopupContent();
    }
    return null;
  }

  syncOptionsSelectedAfterValueRemove(values: any[]) {
    const { viewMode } = this.props;
    if (viewMode === TriggerViewMode.popup) {
      const { options, valueField, primitive } = this;
      if (options) {
        const { selected } = options;
        values.forEach(value => {
          const primitiveValue = primitive ? value : value[valueField];
          const oldSelected = selected.find(r => r.get(valueField) === primitiveValue);
          if (oldSelected) {
            options.unSelect(oldSelected);
          }
        });
      }
    }
  }

  @action
  removeValues(values: any[], index?: number) {
    super.removeValues(values, index);
    this.syncOptionsSelectedAfterValueRemove(values);
  }

  removeLastValue(): any {
    const value = super.removeLastValue();
    if (value) {
      this.syncOptionsSelectedAfterValueRemove([value]);
    }
    return value;
  }

  clear() {
    super.clear();
    const { viewMode } = this.props;
    if (viewMode === TriggerViewMode.popup) {
      const { options } = this;
      if (options) {
        options.unSelectAll();
        options.clearCachedSelected();
      }
    }
  }

  @action
  beforeOpen(options: DataSet): Partial<LovViewProps> | undefined {
    const { multiple, primitive, valueField } = this;
    if (multiple) {
      options.selectionStrategy = this.getProp('showCheckedStrategy') || CheckedStrategy.SHOW_ALL;
    }
    const { viewMode, viewRenderer } = this.props;
    const { selected } = options;
    if (viewMode === TriggerViewMode.modal || viewMode === TriggerViewMode.drawer) {
      options.unSelectAll();
      // TODO：lovEvents deprecated
      const { lovEvents } = this.props;
      if (lovEvents) {
        Object.keys(lovEvents).forEach(event => options.addEventListener(event, lovEvents[event]));
      }
    }
    if (multiple) {
      const needToFetch = new Map();
      options.setCachedSelected(
        this.getValues().map(value => {
          const primitiveValue = primitive ? value : value[valueField];
          const oldSelected = selected.find(r => r.get(valueField) === primitiveValue);
          if (oldSelected) {
            oldSelected.isSelected = true;
            return oldSelected;
          }
          const newSelected = new Record(primitive ? { [valueField]: value } : toJS(value), options, RecordStatus.sync);
          newSelected.isSelected = true;
          newSelected.isCached = true;
          needToFetch.set(primitiveValue, newSelected);
          return newSelected;
        }),
      );
      const { lovCode } = this;
      if (lovCode) {
        const lovQueryCachedSelected = this.getContextConfig('lovQueryCachedSelected');
        if (lovQueryCachedSelected) {
          const fetchCachedSelected = () => {
            if (needToFetch.size) {
              lovQueryCachedSelected(lovCode, needToFetch).then(action((results: object[]) => {
                results.forEach((data) => {
                  const record = needToFetch.get(data[valueField]);
                  if (record) {
                    record.init(data);
                  }
                });
                needToFetch.clear();
              }));
            }
          };
          if (viewMode === TriggerViewMode.popup) {
            fetchCachedSelected();
          } else if (viewMode === TriggerViewMode.drawer && viewRenderer !== undefined) {
            return {};
          } else {
            return {
              tableProps: {
                onShowCachedSelectionChange: (visible: boolean) => {
                  if (visible) {
                    fetchCachedSelected();
                  }
                },
                pagination: {
                  onChange() {
                    fetchCachedSelected();
                  },
                },
              },
            };
          }
        }
      }
    }
  }

  @action
  afterOpen(options: DataSet, fetchSingle?: boolean) {
    if (this.autoSelectSingle) {
      if (this.multiple) options.releaseCachedSelected();
    } else {
      const noCache = defaultTo(this.getProp('noCache'), this.getContextConfig('lovNoCache'));
      if (this.resetOptions(noCache) && fetchSingle !== true && !this.multiple) {
        options.query(1, undefined, true);
      } else if (this.multiple) {
        if (this.resetOptions(noCache)) {
          options.query(1, undefined, true);
        }
        options.releaseCachedSelected();
      }
    }
  }

  @autobind
  private getSelectionProps() {
    const { nodeRenderer, selectionProps } = this.props;
    const lovSelectionProps = this.getContextConfig('lovSelectionProps');
    const props: SelectionProps = {
      ...lovSelectionProps,
    };
    if (nodeRenderer) {
      props.nodeRenderer = nodeRenderer;
    }
    return {
      ...props,
      ...selectionProps,
    };
  }

  @action
  private openModal(fetchSingle?: boolean) {
    this.collapse();
    const { viewMode } = this.observableProps;
    const { onBeforeSelect, viewRenderer } = this.props;
    const drawer = viewMode === TriggerViewMode.drawer;
    if (viewMode === TriggerViewMode.modal || drawer) {
      const config = this.getConfig();
      this.autoCreate();
      const { options } = this;
      if (config && options) {
        const { modal } = this;
        if (modal) {
          modal.open();
        } else {
          const { width, title } = config;
          const lovViewProps = this.beforeOpen(options);
          const modalProps = this.getModalProps();
          const tableProps = this.getTableProps(lovViewProps && lovViewProps.tableProps);
          const valueField = this.getProp('valueField');
          const textField = this.getProp('textField');
          this.modal = Modal.open(mergeProps<ModalProps>({
            title: title || this.getLabel(),
            children: (
              <LovView
                {...lovViewProps}
                viewMode={viewMode}
                dataSet={options}
                config={config}
                context={this.context}
                tableProps={tableProps}
                onSelect={this.handleLovViewSelect}
                onBeforeSelect={onBeforeSelect}
                multiple={this.multiple}
                values={this.getValues()}
                valueField={valueField}
                textField={textField}
                viewRenderer={viewRenderer}
                showSelectedInView={this.showSelectedInView}
                getSelectionProps={this.getSelectionProps}
              />
            ),
            onClose: this.handleLovViewClose,
            destroyOnClose: true,
            closable: true,
            autoFocus: false,
            className: this.getModalClassName(),
            bodyStyle: {
              minHeight: isIE() ? pxToRem(Math.min(scaleSize(350), window.innerHeight), true) : 'min(3.5rem, 100vh)',
            },
            drawer,
            drawerBorder: !drawer,
            style: {
              width: pxToRem(width),
            },
            afterClose: this.handleLovViewAfterClose,
          }, modalProps) || {});
          this.afterOpen(options, fetchSingle);
        }
      }
    }
  }

  getModalClassName(): string {
    const { viewMode } = this.props;
    return classNames({
      [`${this.prefixCls}-lov-selection-wrapper`]: viewMode === TriggerViewMode.modal && this.showSelectedInView,
      [`${this.prefixCls}-lov-custom-drawer`]: viewMode === TriggerViewMode.drawer && this.multiple && this.showSelectedInView,
      [`${this.prefixCls}-lov-modal`]: viewMode === TriggerViewMode.modal,
      [`${this.prefixCls}-lov-modal-drawer`]: viewMode === TriggerViewMode.drawer,
      [`${this.prefixCls}-lov-popup`]: viewMode === TriggerViewMode.popup,
    });
  }

  @action
  setText(text?: string): void {
    this.searching = true;
    super.setText(text);
  }

  /**
   * 处理 Lov input 查询参数
   * @param text
   */
  @action
  searchRemote(text?: string | string[] | undefined) {
    const { options, searchMatcher, observableProps: { viewMode } } = this;
    if (isString(searchMatcher) && (viewMode === TriggerViewMode.popup || !isSearchTextEmpty(text))) {
      this.resetOptions(true);
      const searchPara = this.getSearchPara(searchMatcher, text);
      Object.keys(searchPara).forEach(key => {
        const value = searchPara[key];
        options.setQueryParameter(key, value === '' ? undefined : value);
      });
      if (this.isSearchFieldInPopup() || this.props.searchAction === SearchAction.input) {
        options.query(1, undefined, true).then(() => delete this.searching);
      }
    }
  }

  @autobind
  handlePopupHiddenChange(hidden: boolean) {
    super.handlePopupHiddenChange(hidden);
    if (hidden) {
      delete this.fetched;
    }
  }

  @autobind
  handleLovViewClose() {
    this.focus();
  }

  /**
   * 关闭弹窗移除时间监听 后续废弃
   */
  @autobind
  @action
  handleLovViewAfterClose() {
    // TODO：lovEvents deprecated
    const { options, props: { lovEvents } } = this;
    if (lovEvents) {
      Object.keys(lovEvents).forEach(event => options.removeEventListener(event, lovEvents[event]));
    }
    this.setPopup(false);
    this.modal = undefined;
    this.focus();
  }

  @autobind
  handleLovViewSelect(records: Record | Record[]) {
    const { viewMode } = this.observableProps;
    if (viewMode === TriggerViewMode.popup && !this.multiple) {
      this.collapse();
    }
    if (isArrayLike(records)) {
      this.setValue(records.map(record => this.processRecordToObject(record)));
    } else {
      this.setValue(records && this.processRecordToObject(records) || this.emptyValue);
    }
  }

  processRecordToObject(record: Record) {
    const config = this.getConfig();
    if (config) {
      const { transformSelectedData } = config;
      if (transformSelectedData) {
        const data = transformSelectedData(record.toData());
        return this.primitive ? this.restrictInput(data[this.valueField]) : data;
      }
    }
    return super.processRecordToObject(record);
  }

  resetOptions(noCache = false): boolean {
    const { field, record, options } = this;
    const { queryDataSet, props: { pageSize } } = options;
    let dirty = noCache;
    if (noCache) {
      options.pageSize = pageSize || 10;
    }
    if (queryDataSet && noCache) {
      const { current } = queryDataSet;
      if (current && current.dirty) {
        dirty = true;
        current.reset();
      }
    }
    if (field) {
      const lovPara = getLovPara(field, record);
      if (!isEqual(lovPara, options.queryParameter)) {
        options.queryParameter = lovPara;
        return true;
      }
      options.first();
      if (!options.length) {
        return true;
      }
    }
    return dirty;
  }

  @autobind
  handleKeyDown(e) {
    if (!this.popup && e.keyCode === KeyCode.DOWN) {
      stopEvent(e);
      this.handleOpenModal();
    }
    if (e.keyCode === KeyCode.ENTER && this.props.searchAction === SearchAction.blur) {
      stopEvent(e);
      this.blur();
    }
    if (!(e.keyCode === KeyCode.ENTER && this.searching)) {
      super.handleKeyDown(e);
    }
  }

  @autobind
  handleBlur(e) {
    if (this.modal) {
      e.preventDefault();
    }
    if (this.props.popupSearchMode !== PopupSearchMode.single) {
      super.handleBlur(e);
    }
  }

  getWrapperProps() {
    return super.getWrapperProps({
      onDoubleClick: (this.disabled || this.readOnly) ? undefined : this.handleOpenModal,
      // Support ued to distinguish between select and lov
      className: this.getWrapperClassNames(`${this.prefixCls}-lov`),
    });
  }

  getPopupClassName(defaultClassName: string | undefined): string | undefined {
    const { viewMode } = this.observableProps;
    return classNames(defaultClassName, { [`${this.prefixCls}-lov-popup`]: viewMode === TriggerViewMode.popup });
  }

  syncValueOnBlur(value) {
    const { textField } = this;
    const { mode, searchAction, fetchSingle } = this.props;
    if (mode !== ViewMode.button) {
      let hasRecord = false;
      if (this.getValue()) {
        hasRecord = this.getValue()[textField] === value;
      }
      if (searchAction === SearchAction.blur && value && !hasRecord) {
        const { options } = this;
        options.query(1, undefined, true).then(() => {
          const { length } = options;
          if ((length > 1 && !fetchSingle) || length === 1) {
            this.choose(options.get(0));
          } else if (length && fetchSingle) {
            this.openModal(fetchSingle);
          }
        });
      } else if (!this.multiple) {
        super.syncValueOnBlur(value);
      }
    }
  }

  getConfig() {
    const { lovCode } = this;
    if (lovCode) {
      return lovStore.getConfig(lovCode);
    }
  }

  getPlaceholders(): string[] {
    const placeholder = super.getPlaceholders();
    if (placeholder.length) {
      return placeholder;
    }
    const config = this.getConfig();
    if (config) {
      const { placeholder: holder } = config;
      const holders: string[] = [];
      return holder ? holders.concat(holder) : holders;
    }
    return [];
  }

  getModalProps(): ModalProps {
    const { modalProps } = this.props;
    return { ...this.getContextConfig('lovModalProps'), ...modalProps };
  }

  getTableProps(localTableProps?: Partial<TableProps>): Partial<TableProps> {
    const { tableProps } = this.props;
    const lovTablePropsConfig = this.getContextConfig('lovTableProps');
    return typeof lovTablePropsConfig === 'function' ? { ...lovTablePropsConfig(this.multiple), ...mergeProps<Partial<TableProps>>(localTableProps, tableProps) } : { ...lovTablePropsConfig, ...mergeProps<Partial<TableProps>>(localTableProps, tableProps) };
  }

  @autobind
  @action
  async selectSingle() {
    const { options } = this;
    this.resetOptions(options.length === 1);
    await options.query(1, undefined, true);
    if (options.length === 1) {
      this.choose(options.get(0));
    } else {
      this.openModal();
    }
  }

  @autobind
  handleOpenModal() {
    if (!this.disabled && !this.readOnly) {
      return this.autoSelectSingle ? this.selectSingle() : this.openModal();
    }
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'modalProps',
      'noCache',
      'tableProps',
      'lovEvents',
      'searchAction',
      'fetchSingle',
      'autoSelectSingle',
      'showCheckedStrategy',
      'onBeforeSelect',
      'onSearchMatcherChange',
      'viewRenderer',
      'nodeRenderer',
      'showSelectedInView',
      'selectionProps',
      'popupSearchMode',
    ]);
  }

  getButtonProps() {
    const { className, type } = this.props;
    const { options } = this;
    const props: ButtonProps = {
      ...Button.defaultProps,
      ...omit(this.getOtherProps(), ['name']),
      dataSet: options,
      className: classNames(className, `${this.prefixCls}-lov`),
      type,
    };
    if (!this.valid) {
      props.color = ButtonColor.red;
    }

    return props;
  }

  @computed
  get loading(): boolean {
    const { options } = this;
    return options.status === DataSetStatus.loading;
  }

  getSuffix(): ReactNode {
    const { viewMode } = this.observableProps;
    const { suffix } = this.props;
    if (viewMode === TriggerViewMode.popup) {
      return super.getSuffix();
    }
    const icon = this.loading && !this.modal ? <Spin className={`${this.prefixCls}-lov-spin`} /> : <Icon type="search" />;
    return this.wrapperSuffix(suffix || icon, {
      onClick: (this.disabled || this.readOnly || this.loading) ? undefined : this.handleOpenModal,
    });
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    if (this.modal) {
      this.modal.close();
    }
  }

  select() {
    const { mode } = this.props;
    if (mode !== ViewMode.button) {
      super.select();
    }
  }

  @autobind
  handleButtonClick(e) {
    const { onClick = noop } = this.props;
    onClick(e);
    if (!e.isDefaultPrevented()) {
      return this.handleOpenModal();
    }
  }

  getTextByValue(value: any): ReactNode {
    const { mode } = this.props;
    return mode === ViewMode.button ? this.processRenderer(value) : super.getTextByValue(value);
  }

  renderWrapper(): ReactNode {
    const { mode, children, clearButton } = this.props;
    if (mode === ViewMode.button) {
      const elements = [
        <Button
          key="lov_button"
          {...this.getButtonProps()}
          disabled={this.disabled}
          onClick={this.handleButtonClick}
        >
          {children || this.getTextNode() || this.getPlaceholders()[0] || $l('Lov', 'choose')}
        </Button>,
      ];
      if (clearButton) {
        elements.push(
          <Button
            key="lov_clear_button"
            size={Size.small}
            funcType={FuncType.flat}
            icon="close"
            onClick={this.handleClearButtonClick}
          />,
        );
      }
      return elements;
    }
    return super.renderWrapper();
  }
}
