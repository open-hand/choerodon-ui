import React, { ReactElement, ReactNode } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import isString from 'lodash/isString';
import defaultTo from 'lodash/defaultTo';
import noop from 'lodash/noop';
import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';
import { action, computed, isArrayLike, observable, runInAction, toJS, IReactionDisposer, reaction } from 'mobx';
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
import { SelectionMode, TableMode, TableQueryBarType } from '../table/enum';
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
import { getRecords } from './SelectionList';

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
  tableProps?: Partial<TableProps> | ((lovTablePropsConfig: Partial<TableProps>, modal?: ModalProxy) => Partial<TableProps>);
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
   * 按钮模式默认不支持, 设置 force 支持
   */
  autoSelectSingle?: boolean | 'force';
  showCheckedStrategy?: CheckedStrategy;
  onBeforeSelect?: (records: Record | Record[]) => boolean | Promise<boolean | undefined> | undefined;
  onSearchMatcherChange?: (searchMatcher?: string) => void;
  viewRenderer?: ViewRenderer;
  nodeRenderer?: NodeRenderer;
  showSelectedInView?: boolean;
  selectionProps?: SelectionProps;
  popupSearchMode?: PopupSearchMode;
  showDetailWhenReadonly?: boolean;
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

  initedModalLovViewProps;

  fetched?: boolean;

  searching?: boolean;

  fetchedReaction?: IReactionDisposer;

  @computed
  get searchMatcher(): SearchMatcher {
    const { searchMatcher } = this.observableProps;
    if (isString(searchMatcher)) {
      return searchMatcher;
    }
    const { textField, viewMode } = this;
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
    const { viewMode } = this;
    if (viewMode === TriggerViewMode.popup && popupSearchMode === PopupSearchMode.single) {
      return this.modal || (this.isSearchFieldInPopup() && !this.searchText) ? false : this.statePopup;
    }
    return this.modal || (!this.isSearchFieldInPopup() && !this.searchText) ? false : this.statePopup;
  }

  /**
   * 点击查询仅存在一条数据时自动选中, 树形数据和 Button 模式禁用
   */
  get autoSelectSingle(): boolean | undefined {
    if (this.showDetailWhenReadonly) {
      return false;
    }
    const { treeFlag } = this.getConfig() || {};
    const { mode: tableMode } = this.getTableProps();
    const { viewMode } = this;
    const { mode, autoSelectSingle: autoSelectSingleProp } = this.props;
    if (viewMode === TriggerViewMode.popup ||
      (mode === ViewMode.button && autoSelectSingleProp !== 'force')
      || treeFlag === 'Y' || tableMode === TableMode.tree) {
      return false;
    }
    if ('autoSelectSingle' in this.props) {
      return !!this.props.autoSelectSingle;
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
      return lovShowSelectedInView(this.viewMode as LovViewTarget);
    }
    return lovShowSelectedInView;
  }

  get showDetailWhenReadonly(): boolean {
    const { readOnly, disabled, props: { showDetailWhenReadonly } } = this;
    return !!(showDetailWhenReadonly && (readOnly || disabled) && this.getValues().length);
  }

  @computed
  get viewMode(): TriggerViewMode {
    const { viewMode } = this.observableProps;
    const { showDetailWhenReadonly } = this;
    if (viewMode === TriggerViewMode.popup && showDetailWhenReadonly) {
      return TriggerViewMode.modal;
    }
    return viewMode;
  }

  get doSearchUseDebounce(): boolean {
    const { searchAction } = this.props;
    if (searchAction === SearchAction.blur) {
      return false;
    }
    return super.doSearchUseDebounce;
  }

  getSearchFieldProps(): TextFieldProps {
    const searchFieldProps = super.getSearchFieldProps();
    const { viewMode } = this;
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
      const { viewMode } = this;
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
    const { viewMode } = this;
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
    const { options, viewMode, showDetailWhenReadonly } = this;
    const { popupSearchMode, onBeforeSelect, addNewOptionPrompt } = this.props;
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
      const mergedTableProps: Partial<TableProps> | undefined = mergeProps<Partial<TableProps>>(tableProps, {
        style: {
          maxHeight: 250,
        },
        pagination: { showSizeChanger: false },
        queryBar: popupSearchMode === PopupSearchMode.single ? TableQueryBarType.none : this.renderSearchField,
        border: false,
        size: Size.small,
        autoWidth: false,
      });
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
          showDetailWhenReadonly={showDetailWhenReadonly}
          lang={this.lang}
          renderAddNewOptionPrompt={isFunction(addNewOptionPrompt) || (addNewOptionPrompt && addNewOptionPrompt.path)
            ? this.renderAddNewOptionPrompt : undefined}
        />
      );
    }
  }

  @autobind
  getPopupContent(): ReactNode {
    const { searchAction } = this.props;
    const { viewMode, options } = this;
    if (viewMode === TriggerViewMode.popup) {
      return [
        this.getPopupLovView(),
        (!this.loading && options.length ? this.renderAddNewOptionPrompt('prompt', 'Select') : undefined),
      ];
    }
    if (searchAction === SearchAction.input) {
      return super.getPopupContent();
    }
    return null;
  }

  syncOptionsSelectedAfterValueRemove(values: any[]) {
    const { viewMode } = this;
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
    const { viewMode } = this;
    if (viewMode === TriggerViewMode.popup) {
      const { options } = this;
      if (options) {
        options.unSelectAll();
        options.clearCachedSelected();
      }
    }
  }

  @autobind
  loadEvents() {
    const { options, modal } = this;
    const { addNewOptionPrompt } = this.props;
    if (addNewOptionPrompt && modal) {
      modal.update({
        footerExtra: !this.loading && options.length ? this.renderAddNewOptionPrompt('prompt', 'Lov') : undefined,
      });
    }
  }

  @autobind
  @action
  beforeOpen(options: DataSet): Partial<LovViewProps> | undefined {
    const { multiple, primitive, valueField, viewMode } = this;
    const { selectionMode, alwaysShowRowBox } = this.getTableProps();
    if (multiple) {
      options.selectionStrategy = this.getProp('showCheckedStrategy') || CheckedStrategy.SHOW_ALL;
    }
    const { viewRenderer } = this.props;
    const { selected } = options;
    if (viewMode === TriggerViewMode.modal || viewMode === TriggerViewMode.drawer) {
      options.unSelectAll();
      // TODO：lovEvents deprecated
      const { lovEvents } = this.props;
      if (lovEvents) {
        Object.keys(lovEvents).forEach(event => options.addEventListener(event, lovEvents[event]));
      }
      options.addEventListener('load', this.loadEvents);
    }
    if (viewMode === TriggerViewMode.popup && multiple && selected && this.getValues().length !== selected.length) {
      // record reset 场景
      const values = this.getValues();
      selected.forEach(record => {
        if (!values.find(value => {
          const primitiveValue = primitive ? value : value[valueField];
          return record.get(valueField) === primitiveValue;
        })) {
          record.isSelected = false;
        }
      });
    }
    // 勾选 value 对应的单选框
    const needSingleSelected = !multiple && options.selection && this.getValues().length > 0 
      && (selectionMode === SelectionMode.rowbox || selectionMode === SelectionMode.dblclick || alwaysShowRowBox);
    if (multiple || needSingleSelected) {
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
    const { tableProps } = this.props;
    const { modal, viewMode, showDetailWhenReadonly, primitive, valueField } = this;
    // 模态框模式下， tableProps 支持获取 modal 实例
    if (isFunction(tableProps) && [TriggerViewMode.modal, TriggerViewMode.drawer].includes(viewMode) && modal) {
      const lovViewProps = this.beforeOpen(options);
      const tableProps = this.getTableProps(lovViewProps && lovViewProps.tableProps);
      modal.update({
        children: <LovView {...this.initedModalLovViewProps} tableProps={tableProps} />,
      });
    }
    if (this.autoSelectSingle) {
      if (this.multiple) options.releaseCachedSelected();
    } else {
      const noCache = defaultTo(this.getProp('noCache'), this.getContextConfig('lovNoCache'));
      if (showDetailWhenReadonly) {
        const values = this.getValues();
        if (values.length) {
          const { paging = true } = options.props;
          options.setState('__LOV_QUERY_STATE__', { lovQueryDetail: true });
          options.paging = false;
          const valueFieldValues = values.map(value => (primitive ? value : value[valueField]));
          const lovConfig = this.getConfig();
          const paramKeyValue = lovConfig ? (lovConfig.detailField || valueField) : valueField;
          const lovPara = { [paramKeyValue]: valueFieldValues };
          options.query(1, lovPara, true).finally(() => {
            options.setState('__LOV_QUERY_STATE__', undefined);
            options.paging = paging;
          });
        }
      } else if (!this.multiple) {
        if (this.resetOptions(noCache) && fetchSingle !== true) {
          options.query(1, undefined, true);
        }
        const { selectionMode } = this.getTableProps();
        if (selectionMode === SelectionMode.rowbox || selectionMode === SelectionMode.dblclick) {
          // 存在单选框的情况下，同步 record 的勾选状态
          options.releaseCachedSelected();
        }
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
    const { viewMode, showDetailWhenReadonly } = this;
    const { onBeforeSelect, viewRenderer, addNewOptionPrompt } = this.props;
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
          const { tableProps: originalTableProps } = this.props;
          this.initedModalLovViewProps = {
            ...lovViewProps,
            viewMode,
            dataSet: options,
            config,
            context: this.context,
            tableProps,
            onSelect: this.handleLovViewSelect,
            onBeforeSelect,
            multiple: this.multiple,
            values: this.getValues(),
            valueField,
            textField,
            viewRenderer,
            showSelectedInView: this.showSelectedInView,
            getSelectionProps: this.getSelectionProps,
            showDetailWhenReadonly,
            lang: this.lang,
            renderAddNewOptionPrompt: isFunction(addNewOptionPrompt) || (addNewOptionPrompt && addNewOptionPrompt.path)
              ? this.renderAddNewOptionPrompt : undefined,
          }
          this.modal = Modal.open(mergeProps<ModalProps>({
            title: title || this.getLabel(),
            children: isFunction(originalTableProps) ? null : (
              <LovView
                {...this.initedModalLovViewProps}
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
            footer: showDetailWhenReadonly ? null : undefined,
            footerExtra: !this.loading && options.length ? this.renderAddNewOptionPrompt('prompt', 'Lov') : undefined,
          }, modalProps) || {});
          this.afterOpen(options, fetchSingle);
        }
        this.searchText = undefined;
        this.setText(undefined);
      }
    }
  }

  getModalClassName(): string {
    const { viewMode, props: { modalProps, addNewOptionPrompt } } = this;
    const isModalMode = viewMode === TriggerViewMode.modal && modalProps?.drawer !== true;
    return classNames({
      [`${this.prefixCls}-lov-selection-wrapper`]: isModalMode && this.showSelectedInView,
      [`${this.prefixCls}-lov-custom-drawer`]: viewMode === TriggerViewMode.drawer && this.multiple && this.showSelectedInView,
      [`${this.prefixCls}-lov-modal`]: viewMode === TriggerViewMode.modal,
      [`${this.prefixCls}-lov-modal-drawer`]: viewMode === TriggerViewMode.drawer,
      [`${this.prefixCls}-lov-popup`]: viewMode === TriggerViewMode.popup,
      [`${this.prefixCls}-lov-modal-new-option-prompt`]: isFunction(addNewOptionPrompt) || (addNewOptionPrompt && addNewOptionPrompt.path),
    });
  }

  @action
  setText(text?: string): void {
    if (text === undefined || text === '') {
      delete this.searching;
    } else {
      this.searching = true;
    }
    super.setText(text);
  }

  /**
   * 处理 Lov input 查询参数
   * @param text
   */
  @action
  searchRemote(text?: string | string[] | undefined) {
    const { options, searchMatcher, viewMode } = this;
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
    const { viewMode } = this;
    if (viewMode === TriggerViewMode.popup && !this.multiple && this.searchText) {
      this.searchText = undefined;
    }
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
    options.removeEventListener('load', this.loadEvents);
    this.setPopup(false);
    this.modal = undefined;
    this.focus();
  }

  @autobind
  handleLovViewSelect(records: Record | Record[]) {
    const { viewMode, textField = '' } = this;
    if (isArrayLike(records)) {
      // 全选的情况下，所有记录 selectedTimestamp 都相同
      const isSameSelectedTimestamp = new Set(records.map(record => (record.selectedTimestamp || -1))).size === 1;
      if (isSameSelectedTimestamp) {
        this.setValue(records.map(record => this.processRecordToObject(record)));
      } else {
        this.setValue(getRecords(records, textField).map(record => this.processRecordToObject(record)));
      }
    } else {
      this.setValue(records && this.processRecordToObject(records) || this.emptyValue);
    }
    if (viewMode === TriggerViewMode.popup && !this.multiple) {
      this.collapse();
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
    if (!(e.keyCode === KeyCode.ENTER && this.searching && this.popup)) {
      super.handleKeyDown(e);
    }
    if (e.keyCode === KeyCode.ENTER && this.props.popupSearchMode === PopupSearchMode.single) {
      const record = this.options.current;
      if(record) {
        this.handleLovViewSelect(record);
      }
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
    const { viewMode, showDetailWhenReadonly } = this;
    return super.getWrapperProps({
      onDoubleClick: (this.disabled || this.readOnly || this.loading) ? undefined : this.handleOpenModal,
      // Support ued to distinguish between select and lov
      className: this.getWrapperClassNames(`${this.prefixCls}-lov`, {
        [`${this.prefixCls}-lov-${TriggerViewMode.popup}-mode`]: viewMode === TriggerViewMode.popup,
        [`${this.prefixCls}-lov-readonly-show-detail`]: showDetailWhenReadonly,
      }),
    });
  }

  getPopupClassName(defaultClassName: string | undefined): string | undefined {
    const { viewMode, props: { addNewOptionPrompt } } = this;
    return classNames(defaultClassName, {
      [`${this.prefixCls}-lov-popup`]: viewMode === TriggerViewMode.popup,
      [`${this.prefixCls}-lov-popup-new-option-prompt`]: isFunction(addNewOptionPrompt) || (addNewOptionPrompt && addNewOptionPrompt.path),
    });
  }

  syncValueOnBlur(value, event?: any) {
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
            const record = options.get(0);
            if (!this.optionIsSelected(record as Record, this.getValues())) {
              this.choose(record);
            }
          } else if (length && fetchSingle) {
            this.openModal(fetchSingle);
          }
        });
      } else if (!this.multiple || (this.multiple && this.observableProps.combo && !this.popupShowComboValue)) {
        super.syncValueOnBlur(value, event);
      } else if (this.getProp('required')) {
        const oldValues = this.getValues();
        this.validate(oldValues, false);
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
    const lovTablePropsConfigData = isFunction(lovTablePropsConfig)
      ? lovTablePropsConfig(this.multiple)
      : lovTablePropsConfig;
    let tablePropsData;
    if (isObject(tableProps)) {
      tablePropsData = tableProps;
    }
    if (isFunction(tableProps)) {
      const { modal, viewMode } = this;
      const lovTableProps = {...lovTablePropsConfig, ...localTableProps};
      if (viewMode === TriggerViewMode.popup) {
        tablePropsData = tableProps(lovTableProps);
      } else if ([TriggerViewMode.modal, TriggerViewMode.drawer].includes(viewMode) && modal) {
        tablePropsData = tableProps(lovTableProps, modal);
      }
    }
    return {
      ...lovTablePropsConfigData,
      ...mergeProps<Partial<TableProps>>(localTableProps, tablePropsData),
    };
  }

  @autobind
  @action
  async selectSingle() {
    const { options } = this;
    this.resetOptions(options.length === 1);
    await options.query(1, undefined, true);
    if (options.length === 1) {
      const values = this.getValues();
      const record = options.get(0);
      if (!this.optionIsSelected(record as Record, values)) {
        this.choose(record);
      }
    } else {
      this.openModal();
    }
  }

  @autobind
  handleOpenModal(e?: any) {
    if (e && e.currentTarget && e.target && !e.currentTarget.contains(e.target)) {
      return;
    }
    if (this.showDetailWhenReadonly) {
      this.openModal();
    } else if (!this.disabled && !this.readOnly) {
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
      'showDetailWhenReadonly',
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

  getInnerSpanButton() {
    const hidden = this.loading;
    return super.getInnerSpanButton(hidden);
  }

  @computed
  get loading(): boolean {
    const { options } = this;
    return options.status === DataSetStatus.loading;
  }

  @autobind
  @action
  saveSuffixRef(node) {
    this.suffixRef = node;
  }

  getSuffix(): ReactNode {
    const { viewMode, showDetailWhenReadonly, showSuffix } = this;
    if (!showSuffix && !showDetailWhenReadonly) {
      return undefined;
    }
    const { suffix } = this.props;
    if (viewMode === TriggerViewMode.popup) {
      return super.getSuffix();
    }
    const showIcon = showDetailWhenReadonly ? <Icon type="manage_search" /> : <Icon type="search" />
    const icon = this.loading && !this.modal ? <Spin className={`${this.prefixCls}-lov-spin`} /> : showIcon;
    return this.wrapperSuffix(suffix || icon, {
      onClick: (((this.disabled || this.readOnly) && !this.showDetailWhenReadonly) || this.loading) ? undefined : this.handleOpenModal,
    });
  }

  componentDidMount() {
    super.componentDidMount();
    if (this.viewMode === TriggerViewMode.popup) {
      this.fetchedReaction = reaction(() => this.record, () => {
        if (this.fetched) {
          delete this.fetched;
        }
      });
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    if (this.modal) {
      this.modal.close();
    }
    if (this.fetchedReaction) {
      this.fetchedReaction();
    }
  }

  select() {
    const { mode } = this.props;
    if (mode !== ViewMode.button) {
      super.select();
    }
  }

  @autobind
  async handleButtonClick(e) {
    const { onClick } = this.props;
    if (onClick) {
      await onClick(e);
    }
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
