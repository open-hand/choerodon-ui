import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import { action, computed, isArrayLike, runInAction, toJS } from 'mobx';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { Size } from 'choerodon-ui/lib/_util/enum';
import { getConfig } from 'choerodon-ui/lib/configure';
import Icon from '../icon';
import { open } from '../modal-container/ModalContainer';
import LovView, { LovViewProps } from './LovView';
import { ModalProps } from '../modal/Modal';
import DataSet, { DataSetProps } from '../data-set/DataSet';
import Record from '../data-set/Record';
import Spin from '../spin';
import lovStore from '../stores/LovCodeStore';
import autobind from '../_util/autobind';
import { stopEvent } from '../_util/EventManager';
import { isSearchTextEmpty, SearchMatcher, Select, SelectProps } from '../select/Select';
import { ColumnAlign, TableQueryBarType } from '../table/enum';
import { CheckedStrategy, DataSetStatus, FieldType, RecordStatus } from '../data-set/enum';
import { LovFieldType, SearchAction, ViewMode } from './enum';
import Button, { ButtonProps } from '../button/Button';
import { ButtonColor, FuncType } from '../button/enum';
import { $l } from '../locale-context';
import { getLovPara } from '../stores/utils';
import { TableProps, TableQueryBarHook } from '../table/Table';
import { FieldProps } from '../data-set/Field';
import isIE from '../_util/isIE';
import { TextFieldProps } from '../text-field/TextField';

export type Events = { [key: string]: Function };

export type LovConfigItem = {
  display?: string;
  conditionField?: string;
  conditionFieldLovCode?: string;
  conditionFieldType?: FieldType | LovFieldType;
  conditionFieldName?: string;
  conditionFieldSelectCode?: string;
  conditionFieldSelectUrl?: string;
  conditionFieldSelectTf?: string;
  conditionFieldSelectVf?: string;
  conditionFieldSequence: number;
  conditionFieldRequired?: boolean;
  gridField?: string;
  gridFieldName?: string;
  gridFieldWidth?: number;
  gridFieldAlign?: ColumnAlign;
  gridFieldSequence: number;
  fieldProps?: Partial<FieldProps>;
};

export type LovConfig = {
  title?: string;
  width?: number;
  height?: number;
  customUrl?: string;
  lovPageSize?: string;
  lovItems: LovConfigItem[] | null;
  treeFlag?: 'Y' | 'N';
  parentIdField?: string;
  idField?: string;
  textField?: string;
  valueField?: string;
  placeholder?: string;
  editableFlag?: 'Y' | 'N';
  queryColumns?: number;
  queryBar?: TableQueryBarType | TableQueryBarHook;
  dataSetProps?: Partial<DataSetProps>;
  tableProps?: Partial<TableProps>;
};

export interface LovProps extends SelectProps, ButtonProps {
  modalProps?: ModalProps;
  tableProps?: Partial<TableProps>;
  noCache?: boolean;
  mode?: ViewMode;
  // TODO：lovEvents deprecated
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
  onBeforeSelect?: (records: Record | Record[]) => boolean | undefined;
}

@observer
export default class Lov extends Select<LovProps> {
  static displayName = 'Lov';

  static propTypes = {
    ...Select.propTypes,
    ...Button.propTypes,
    modalProps: PropTypes.object,
    tableProps: PropTypes.object,
    noCache: PropTypes.bool,
    fetchSingle: PropTypes.bool,
    autoSelectSingle: PropTypes.bool,
    /**
     * 触发查询变更的动作， default: input
     */
    searchAction: PropTypes.oneOf([SearchAction.blur, SearchAction.input]),
    showCheckedStrategy: PropTypes.string,
  };

  static defaultProps = {
    ...Select.defaultProps,
    clearButton: true,
    checkValueOnOptionsChange: false,
    dropdownMatchSelectWidth: false,
    searchAction: SearchAction.input,
    fetchSingle: false,
    viewMode: 'modal',
  };

  modal;

  fetched?: boolean;

  @computed
  get searchMatcher(): SearchMatcher {
    const { searchMatcher } = this.observableProps;
    if (isString(searchMatcher)) {
      return searchMatcher;
    }
    return this.textField;
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
      return field.get('lovCode');
    }
    return undefined;
  }

  get popup(): boolean {
    return this.modal || (!this.isSearchFieldInPopup() && !this.searchText) ? false : this.statePopup;
  }

  /**
   * 点击查询仅存在一条数据时自动选中
   */
  get autoSelectSingle(): boolean | undefined {
    if ('autoSelectSingle' in this.props) {
      return this.props.autoSelectSingle;
    }
    const autoSelectSingle = getConfig('lovAutoSelectSingle');
    if (typeof autoSelectSingle !== 'undefined') {
      return autoSelectSingle;
    }
    return false;
  }

  @computed
  get options(): DataSet {
    const { field, lovCode } = this;
    if (field) {
      const { options } = field;
      if (options) {
        return options;
      }
    }
    if (lovCode) {
      const lovDataSet = lovStore.getLovDataSet(lovCode, field, field && field.get('optionsProps'));
      if (lovDataSet) {
        return lovDataSet;
      }
    }
    return new DataSet();
  }

  getSearchFieldProps(): TextFieldProps {
    const searchFieldProps = super.getSearchFieldProps();
    const { viewMode } = this.props;
    if (viewMode === 'popup') {
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
      const { viewMode } = this.props;
      return viewMode === 'popup';
    }
    return searchFieldInPopup;
  }

  isEditable(): boolean {
    const { viewMode } = this.props;
    return viewMode !== 'popup' && super.isEditable();
  }

  getPopupLovView() {
    const config = this.getConfig();
    this.autoCreate();
    const { options } = this;
    if (config && options) {
      let lovViewProps;
      if (this.popup && !this.fetched) {
        runInAction(() => {
          lovViewProps = this.beforeOpen(options);
          this.afterOpen(options);
          this.fetched = true;
        });
      }
      const tableProps = this.getTableProps();
      const mergedTableProps: TableProps = {
        ...(lovViewProps && lovViewProps.tableProps),
        ...tableProps,
        style: {
          ...tableProps.style,
          maxHeight: 250,
        },
        pagination: { showSizeChanger: false },
        queryBar: this.renderSearchField,
        border: false,
        size: Size.small,
      };
      const { onBeforeSelect } = this.props;
      return (
        <LovView
          {...lovViewProps}
          popup
          dataSet={options}
          config={config}
          tableProps={mergedTableProps}
          onSelect={this.handleLovViewSelect}
          onBeforeSelect={onBeforeSelect}
          multiple={this.multiple}
          values={this.getValues()}
        />
      );
    }
  }

  @autobind
  getPopupContent(): ReactNode {
    const { searchAction, viewMode } = this.props;
    if (viewMode === 'popup') {
      return this.getPopupLovView();
    }
    if (searchAction === SearchAction.input) {
      return super.getPopupContent();
    }
    return null;
  }

  @action
  beforeOpen(options: DataSet): Partial<LovViewProps> | undefined {
    const { multiple, primitive, valueField } = this;
    if (multiple) {
      options.selectionStrategy = this.getProp('showCheckedStrategy') || CheckedStrategy.SHOW_ALL;
    }
    const { viewMode } = this.props;
    const { selected } = options;
    if (viewMode === 'modal') {
      options.unSelectAll();
      // TODO：lovEvents deprecated
      const { lovEvents } = this.props;
      if (lovEvents) {
        Object.keys(lovEvents).forEach(event => options.addEventListener(event, lovEvents[event]));
      }
    }
    if (multiple) {
      const needToFetch = new Map();
      options.clearCachedSelected();
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
        const lovQueryCachedSelected = getConfig('lovQueryCachedSelected');
        if (lovQueryCachedSelected) {
          const fetchCachedSelected = () => {
            if (needToFetch.size) {
              lovQueryCachedSelected(lovCode, needToFetch).then(action((results) => {
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
          if (viewMode === 'popup') {
            fetchCachedSelected();
          } else {
            return {
              tableProps: {
                onShowCachedSelectionChange: (visible: boolean) => {
                  if (visible) {
                    fetchCachedSelected();
                  }
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
    const noCache = this.getProp('noCache');
    if (this.resetOptions(noCache) && fetchSingle !== true) {
      options.query();
    } else if (this.multiple) {
      options.releaseCachedSelected();
    }
  }

  private openModal = action((fetchSingle?: boolean) => {
    const { viewMode, onBeforeSelect } = this.props;
    if (viewMode === 'modal') {
      const config = this.getConfig();
      this.autoCreate();
      const { options } = this;
      if (!this.modal && config && options) {
        const modalProps = this.getModalProps();
        const tableProps = this.getTableProps();
        const { width, title } = config;
        const lovViewProps = this.beforeOpen(options);
        this.modal = open({
          title,
          children: (
            <LovView
              {...lovViewProps}
              dataSet={options}
              config={config}
              tableProps={{ ...(lovViewProps && lovViewProps.tableProps), ...tableProps }}
              onSelect={this.handleLovViewSelect}
              onBeforeSelect={onBeforeSelect}
              multiple={this.multiple}
              values={this.getValues()}
            />
          ),
          onClose: this.handleLovViewClose,
          destroyOnClose: true,
          closable: true,
          autoFocus: false,
          bodyStyle: {
            minHeight: isIE() ? pxToRem(Math.min(350, window.innerHeight)) : 'min(3.5rem, 100vh)',
          },
          ...modalProps,
          style: {
            width: pxToRem(width),
            ...(modalProps && modalProps.style),
          },
          afterClose: this.handleLovViewAfterClose,
        } as ModalProps & { children; });
        this.afterOpen(options, fetchSingle);
      }
    }
  });

  /**
   * 处理 Lov input 查询参数
   * @param text
   */
  @action
  searchRemote(text?: string | string[] | undefined) {
    const { options, searchMatcher } = this;
    if (isString(searchMatcher) && !isSearchTextEmpty(text)) {
      this.resetOptions(true);
      const searchPara = this.getSearchPara(searchMatcher, text);
      Object.keys(searchPara).forEach(key => {
        const value = searchPara[key];
        options.setQueryParameter(key, value === '' ? undefined : value);
      });
      if (this.isSearchFieldInPopup() || this.props.searchAction === SearchAction.input) {
        options.query();
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

  handleLovViewClose = async () => {
    delete this.modal;
    this.focus();
  };

  /**
   * 关闭弹窗移除时间监听 后续废弃
   */
  handleLovViewAfterClose = () => {
    // TODO：lovEvents deprecated
    const { options, props: { lovEvents } } = this;
    const { afterClose = noop } = this.getModalProps();
    afterClose();
    if (lovEvents) {
      Object.keys(lovEvents).forEach(event => options.removeEventListener(event, lovEvents[event]));
    }
  };

  handleLovViewSelect = (records: Record | Record[]) => {
    const { viewMode } = this.props;
    if (viewMode === 'popup' && !this.multiple) {
      this.collapse();
    }
    if (isArrayLike(records)) {
      this.setValue(records.map(record => this.processRecordToObject(record)));
    } else {
      this.setValue(records && this.processRecordToObject(records) || this.emptyValue);
    }
  };

  resetOptions(noCache: boolean = false): boolean {
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
      this.openModal();
    }
    if (e.keyCode === KeyCode.ENTER && this.props.searchAction === SearchAction.blur) {
      stopEvent(e);
      this.blur();
    }
    super.handleKeyDown(e);
  }

  @autobind
  handleBlur(e) {
    if (this.modal) {
      e.preventDefault();
    }
    super.handleBlur(e);
  }

  getWrapperProps() {
    return super.getWrapperProps({
      onDoubleClick: (this.disabled || this.readOnly) ? undefined : this.handleOpenModal,
      // Support ued to distinguish between select and lov
      className: this.getWrapperClassNames(`${this.prefixCls}-lov`),
    });
  }

  getPopupClassName(defaultClassName: string | undefined): string | undefined {
    const { viewMode } = this.props;
    return classNames(defaultClassName, { [`${this.prefixCls}-lov-popup`]: viewMode === 'popup' });
  }

  syncValueOnBlur(value) {
    const { textField } = this;
    const { mode, searchAction, fetchSingle } = this.props;
    if (mode !== ViewMode.button) {
      let hasRecord: boolean = false;
      if (this.getValue()) {
        hasRecord = this.getValue()[textField] === value;
      }
      if (searchAction === SearchAction.blur && value && !hasRecord) {
        this.options.query().then(() => {
          const length = this.options.length;
          if ((length > 1 && !fetchSingle) || length === 1) {
            this.choose(this.options.get(0));
          } else if (this.options.length && fetchSingle) {
            this.openModal(fetchSingle);
          }
        });
      } else {
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

  getModalProps(): Partial<ModalProps> {
    const { modalProps } = this.props;
    return { ...getConfig('lovModalProps'), ...modalProps };
  }

  getTableProps(): Partial<TableProps> {
    const { tableProps } = this.props;
    return { ...getConfig('lovTableProps'), ...tableProps };
  }

  @autobind
  @action
  selectSingle() {
    const { options } = this;
    this.resetOptions(options.length === 1);
    options.query().then(() => {
      if (options.length === 1) {
        this.choose(this.options.get(0));
      } else {
        this.openModal();
      }
    });
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
    if (!this.isValid) {
      props.color = ButtonColor.red;
    }

    return props;
  }

  @computed
  get loading(): boolean {
    const { options, props: { searchAction } } = this;
    return (searchAction === SearchAction.blur || Boolean(this.autoSelectSingle)) && options.status === DataSetStatus.loading && !this.popup;
  }

  getSuffix(): ReactNode {
    const { suffix, viewMode } = this.props;
    if (viewMode === 'popup') {
      return super.getSuffix();
    }
    const icon = this.loading ? <Spin className={`${this.prefixCls}-lov-spin`} /> : <Icon type="search" />;
    return this.wrapperSuffix(suffix || icon, {
      onClick: (this.disabled || this.readOnly) ? undefined : this.handleOpenModal,
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
    this.handleOpenModal();
    const { onClick = noop } = this.props;
    onClick(e);
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
