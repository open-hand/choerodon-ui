import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import noop from 'lodash/noop';
import { action, computed, observable, toJS } from 'mobx';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { Size } from 'choerodon-ui/lib/_util/enum';
import { getConfig } from 'choerodon-ui/lib/configure';
import Icon from '../icon';
import { open } from '../modal-container/ModalContainer';
import LovView from './LovView';
import { ModalProps } from '../modal/Modal';
import DataSet, { DataSetProps } from '../data-set/DataSet';
import Record from '../data-set/Record';
import Spin from '../spin';
import lovStore from '../stores/LovCodeStore';
import autobind from '../_util/autobind';
import { stopEvent } from '../_util/EventManager';
import { ParamMatcher, SearchMatcher, Select, SelectProps } from '../select/Select';
import { ColumnAlign, SelectionMode, TableQueryBarType } from '../table/enum';
import { DataSetStatus, FieldType, RecordStatus } from '../data-set/enum';
import { LovFieldType, ViewMode, SearchAction } from './enum';
import Button, { ButtonProps } from '../button/Button';
import { ButtonColor, FuncType } from '../button/enum';
import { $l } from '../locale-context';
import { getLovPara } from '../stores/utils';
import { TableQueryBarHook, TableProps } from '../table/Table';
import { FieldProps } from '../data-set/Field';

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
  tableProps?: TableProps;
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
    /**
     * 触发查询变更的动作， default: input
     */
    searchAction: PropTypes.oneOf([SearchAction.blur, SearchAction.input]),
  };

  static defaultProps = {
    ...Select.defaultProps,
    clearButton: true,
    checkValueOnOptionsChange: false,
    searchAction: SearchAction.input,
    fetchSingle: false,
  };

  modal;

  @observable filterText?: string;

  @computed
  get searchMatcher(): SearchMatcher {
    const { searchMatcher } = this.observableProps;
    if (isString(searchMatcher)) {
      return searchMatcher;
    }
    return this.textField;
  }

  @computed
  get paramMatcher(): ParamMatcher {
    const { paramMatcher } = this.observableProps;
    return paramMatcher;
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

  @computed
  get popup(): boolean {
    return !this.filterText || this.modal ? false : this.statePopup;
  }

  /**
   * 增加lov popupContent 回调参数 用于控制对应交互
   */
  @autobind
  getPopupProps() {
    const { options, textField, field, valueField } = this;
    return {
      dataSet: options,
      textField,
      valueField,
      field,
      setValue: (value) => this.setValue(value),
      setPopup: (hidden) => this.setPopup(hidden),
    };
  }

  @autobind
  getPopupContent(): ReactNode {
    if (this.props.searchAction === SearchAction.input) {
      return super.getPopupContent();
    }
    return null;
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
      const lovDataSet = lovStore.getLovDataSet(lovCode, field);
      if (lovDataSet) {
        return lovDataSet;
      }
    }
    return new DataSet();
  }

  private openModal = action((fetchSingle?: boolean) => {
    const config = this.getConfig();
    const { options, multiple, primitive, valueField } = this;
    // TODO：lovEvents deprecated
    const { lovEvents } = this.props;
    const modalProps = this.getModalProps();
    const tableProps = this.getTableProps();
    const noCache = this.getProp('noCache');
    if (!this.modal && config && options) {
      const { width, title } = config;
      options.unSelectAll();
      options.clearCachedSelected();
      if (multiple) {
        options.setCachedSelected(
          this.getValues().map(value => {
            const selected = new Record(primitive ? { [valueField]: value } : toJS(value), options);
            selected.isSelected = true;
            selected.isCached = true;
            selected.status = RecordStatus.sync;
            return selected;
          }),
        );
      }
      if (lovEvents) {
        Object.keys(lovEvents).forEach(event => options.addEventListener(event, lovEvents[event]));
      }
      this.modal = open({
        title,
        children: (
          <LovView
            dataSet={options}
            config={config}
            tableProps={tableProps}
            onDoubleClick={this.handleLovViewSelect}
            onEnterDown={this.handleLovViewSelect}
            multiple={this.multiple}
            values={this.getValues()}
          />
        ),
        onClose: this.handleLovViewClose,
        onOk: this.handleLovViewOk,
        destroyOnClose: true,
        closable: true,
        ...modalProps,
        style: {
          width: pxToRem(width),
          minHeight: pxToRem(Math.min(350, window.innerHeight)),
          ...(modalProps && modalProps.style),
        },
        afterClose: this.handleLovViewAfterClose,
      } as ModalProps & { children; });
      if (this.resetOptions(noCache) && fetchSingle !== true) {
        options.query();
      } else if (multiple) {
        options.releaseCachedSelected();
      }
    }
  });

  /**
   * 处理 Lov input 查询参数
   * @param text
   */
  @action
  searchRemote(text) {
    if (this.filterText !== text) {
      const { options, searchMatcher, paramMatcher, record, textField, valueField } = this;
      this.filterText = text;
      if (text && isString(searchMatcher)) {
        this.resetOptions(true);
        let textMatcher = text;
        if (isString(paramMatcher)) {
          textMatcher = text + paramMatcher;
        } else if (isFunction(paramMatcher)) {
          textMatcher = paramMatcher({ record, text, textField, valueField }) || text;
        }
        options.setQueryParameter(searchMatcher, textMatcher);
        if (this.props.searchAction === SearchAction.input) {
          options.query();
        }
      }
    }
  }

  handleLovViewSelect = () => {
    this.modal.close();
    this.handleLovViewOk();
  };

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

  handleLovViewOk = async () => {
    const { options, multiple } = this;
    const tableProps = this.getTableProps();

    // 根据 mode 进行区分 假如 存在 rowbox 这些 不应该以 current 作为基准
    let selectionMode = {
      selectionMode: multiple ? SelectionMode.rowbox : SelectionMode.none,
      ...tableProps,
    }.selectionMode;

    if (tableProps.alwaysShowRowBox) {
      selectionMode = SelectionMode.rowbox;
    }

    const result: Record[] = [];
    const records = selectionMode === SelectionMode.rowbox ? options.selected : result.concat(options.current || []);
    const values = records.map(record => this.processRecordToObject(record));

    if (values[0] || multiple) {
      this.setValue(multiple ? values : values[0] || this.emptyValue);
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
      onDoubleClick: this.handleOpenModal(),
    });
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

  getModalProps() {
    const { modalProps } = this.props;
    return { ...getConfig('lovModalProps'), ...modalProps };
  }

  getTableProps() {
    const { tableProps } = this.props;
    return { ...getConfig('lovTableProps'), ...tableProps };
  }

  @autobind
  handleOpenModal() {
    return this.isDisabled() || this.isReadOnly() ? undefined : this.openModal;
  }

  getOtherProps() {
    return omit(super.getOtherProps(), ['modalProps', 'noCache', 'tableProps', 'lovEvents', 'searchAction', 'fetchSingle']);
  }

  getButtonProps() {
    const { className, type } = this.props;
    const { options } = this;
    const props: ButtonProps = {
      ...Button.defaultProps,
      ...omit(this.getOtherProps(), ['name']),
      dataSet: options,
      className,
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
    return searchAction === SearchAction.blur && options.status === DataSetStatus.loading && !this.popup;
  }

  getSuffix(): ReactNode {
    const { suffix } = this.props;
    const icon = this.loading ? <Spin className={`${this.prefixCls}-lov-spin`} /> : <Icon type="search" />;
    return this.wrapperSuffix(suffix || icon, {
      onClick: this.handleOpenModal(),
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

  renderWrapper(): ReactNode {
    const { mode, children, clearButton } = this.props;
    if (mode === ViewMode.button) {
      const elements = [
        <Button
          key="lov_button"
          {...this.getButtonProps()}
          disabled={this.isDisabled()}
          onClick={() => this.openModal()}
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
