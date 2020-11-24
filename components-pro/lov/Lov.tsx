import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import { action, computed, observable, toJS } from 'mobx';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { Size } from 'choerodon-ui/lib/_util/enum';
import { getConfig } from 'choerodon-ui/lib/configure';
import Icon from '../icon';
import { open } from '../modal-container/ModalContainer';
import LovView from './LovView';
import { ModalProps } from '../modal/Modal';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import lovStore from '../stores/LovCodeStore';
import autobind from '../_util/autobind';
import { stopEvent } from '../_util/EventManager';
import { ParamMatcher, SearchMatcher, Select, SelectProps } from '../select/Select';
import { ColumnAlign, TableQueryBarType, SelectionMode } from '../table/enum';
import { FieldType } from '../data-set/enum';
import { LovFieldType, ViewMode, TriggerMode } from './enum';
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
  fieldProps?: FieldProps;
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
};

export interface LovProps extends SelectProps, ButtonProps {
  modalProps?: ModalProps;
  tableProps?: TableProps;
  noCache?: boolean;
  mode?: ViewMode;
  triggerMode?: TriggerMode;
  lovEvents?: Events;
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
    triggerMode: PropTypes.string,
  };

  static defaultProps = {
    ...Select.defaultProps,
    clearButton: true,
    checkValueOnOptionsChange: false,
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
    const config = this.getConfig();
    const triggerMode = this.getTriggerMode();
    if (config) {
      return config.editableFlag === 'Y' && triggerMode !== TriggerMode.input;
    }
    return !!this.props.searchable;
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

  private openModal = action(() => {
    const config = this.getConfig();
    const { options, multiple, primitive, valueField } = this;
    const { tableProps, lovEvents } = this.props;
    const modalProps = this.getModalProps();
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
      } as ModalProps & { children; });
      if (this.resetOptions(noCache)) {
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
        } else if (isFunction(paramMatcher)){
          textMatcher = paramMatcher({ record, text, textField, valueField }) || text;
        }
        options.setQueryParameter(searchMatcher, textMatcher);
        options.query();
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

  handleLovViewOk = async () => {
    const { options, multiple, props: { tableProps } } = this;

    // 根据 mode 进行区分 假如 存在 rowbox 这些 不应该以 current 作为基准
    let selectionMode = {
      selectionMode: multiple ? SelectionMode.rowbox : SelectionMode.none,
      ...getConfig('lovTableProps'),
      ...tableProps,
    }.selectionMode;

    if ({
      ...getConfig('lovTableProps'),
      ...this.props.tableProps,
    }.alwaysShowRowBox) {
      selectionMode = SelectionMode.rowbox;
    }

    const result: Record[] = [];
    const records = selectionMode === SelectionMode.rowbox ? options.selected : result.concat(options.current || []);
    const values = records.map(record => this.processRecordToObject(record));

    if (values[0]) {
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
    super.handleKeyDown(e);
  }

  @autobind
  handleBlur(e) {
    if (this.modal) {
      e.preventDefault();
    }
    super.handleBlur(e);
  }

  syncValueOnBlur(value) {
    const { mode } = this.props;
    if (mode !== ViewMode.button) {
      super.syncValueOnBlur(value);
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

  onClick = () => {
    return this.isDisabled() || this.isReadOnly() ? undefined : this.openModal();
  };

  getTriggerMode() {
    const { triggerMode } = this.props;
    if (triggerMode !== undefined) {
      return triggerMode;
    }
    return getConfig('lovTriggerMode');
  }

  getModalProps() {
    const { modalProps } = this.props;
    if (modalProps !== undefined) {
      return modalProps;
    }
    return getConfig('lovModalProps');
  }

  getOtherProps() {
    const otherProps = omit(super.getOtherProps(), ['modalProps', 'noCache', 'tableProps', 'triggerMode', 'lovEvents']);
    const triggerMode = this.getTriggerMode();
    if (triggerMode === TriggerMode.input) otherProps.onClick = this.onClick;
    return otherProps;
  }

  getButtonProps() {
    const { className, type } = this.props;
    const props: ButtonProps = {
      ...Button.defaultProps,
      ...omit(this.getOtherProps(), ['name']),
      className,
      type,
    };
    if (!this.isValid) {
      props.color = ButtonColor.red;
    }

    return props;
  }

  getSuffix(): ReactNode {
    const { suffix } = this.props;
    return this.wrapperSuffix(suffix || <Icon type="search" />, {
      onClick: this.isDisabled() || this.isReadOnly() ? undefined : this.openModal,
    });
  }

  getInnerSpanButton(): ReactNode {
    const {
      props: { clearButton },
      prefixCls,
    } = this;
    if (clearButton && !this.isReadOnly()) {
      return this.wrapperInnerSpanButton(
        <Icon
          type="close"
          onClick={(e) => {
            const triggerMode = this.getTriggerMode();
            if (triggerMode === TriggerMode.input) e.preventDefault();
            this.handleClearButtonClick();
          }}
        />,
        {
          className: `${prefixCls}-clear-button`,
        },
      );
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    if (this.modal) {
      this.modal.close();
    }
  }

  select() {
    const { mode } = this.props;
    const triggerMode = this.getTriggerMode();
    if (mode !== ViewMode.button && triggerMode !== TriggerMode.input) {
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
          onClick={this.openModal}
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
