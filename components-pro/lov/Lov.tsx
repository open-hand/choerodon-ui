import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';
import { action, computed, observable, toJS } from 'mobx';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { Size } from 'choerodon-ui/lib/_util/enum';
import Icon from '../icon';
import { open } from '../modal-container/ModalContainer';
import LovView from './LovView';
import { ModalProps } from '../modal/Modal';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import lovStore from '../stores/LovCodeStore';
import autobind from '../_util/autobind';
import { stopEvent } from '../_util/EventManager';
import { Select, SelectProps } from '../select/Select';
import { ColumnAlign } from '../table/enum';
import { FieldType } from '../data-set/enum';
import { LovFieldType, ViewMode } from './enum';
import Button, { ButtonProps } from '../button/Button';
import { ButtonColor, FuncType } from '../button/enum';
import { $l } from '../locale-context';

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
};

export interface LovProps extends SelectProps, ButtonProps {
  modalProps?: ModalProps;
  noCache?: boolean;
  mode?: ViewMode;
}

@observer
export default class Lov extends Select<LovProps> {
  static displayName = 'Lov';

  static propTypes = {
    ...Select.propTypes,
    ...Button.propTypes,
    modalProps: PropTypes.object,
    noCache: PropTypes.bool,
  };

  static defaultProps = {
    ...Select.defaultProps,
    clearButton: true,
    checkValueOnOptionsChange: false,
  };

  modal;

  @observable filterText?: string;

  @computed
  get searchable(): boolean {
    const config = this.getConfig();
    if (config) {
      return config.editableFlag === 'Y';
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
    if (lovCode) {
      const ds = lovStore.getLovDataSet(lovCode, field);
      if (ds) {
        return ds;
      }
    }
    return new DataSet();
  }

  private openModal = action(() => {
    const config = this.getConfig();
    const { options, multiple, primitive, valueField } = this;
    const { modalProps, noCache } = this.props;
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
      this.modal = open({
        title,
        children: (
          <LovView
            dataSet={options}
            config={config}
            onDoubleClick={this.handleLovViewSelect}
            onEnterDown={this.handleLovViewSelect}
            multiple={this.multiple}
            values={this.getValues()}
          />
        ),
        onClose: this.handleLovViewClose,
        onOk: this.handleLovViewOk,
        destroyOnClose: true,
        style: {
          width: pxToRem(width),
          minHeight: pxToRem(400),
          ...(modalProps && modalProps.style),
        },
        ...omit(modalProps, ['style']),
      } as ModalProps & { children });
      if (this.resetOptions() || noCache) {
        options.query();
      } else if (multiple) {
        options.releaseCachedSelected();
      }
    }
  });

  private setFilterText = debounce(
    action((text?: string) => {
      const { options, textField } = this;
      this.filterText = text;
      this.resetOptions();
      options.setQueryParameter(textField, text);
      if (text) {
        options.query();
      }
    }),
    500,
  );

  handleLovViewSelect = () => {
    this.modal.close();
    this.handleLovViewOk();
  };

  handleLovViewClose = async () => {
    delete this.modal;
    this.focus();
  };

  handleLovViewOk = async () => {
    const { options, multiple } = this;
    const result: Record[] = [];
    const records = multiple ? options.selected : result.concat(options.current || []);
    const values = records.map(record => this.processRecordToObject(record));
    this.setValue(multiple ? values : values[0] || null);
  };

  resetOptions(): boolean {
    const { field, record, options } = this;
    const { queryDataSet } = options;
    let dirty = false;
    if (queryDataSet) {
      const { current } = queryDataSet;
      if (current && current.dirty) {
        dirty = true;
        current.reset();
      }
    }
    if (field) {
      const lovPara = toJS(field.get('lovPara')) || {};
      const cascadeMap = field.get('cascadeMap');
      if (cascadeMap && record) {
        Object.keys(cascadeMap).forEach(
          cascade => (lovPara[cascade] = record.get(cascadeMap[cascade])),
        );
      }
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

  setText(text) {
    super.setText(text);
    if (this.editable) {
      this.setFilterText(text);
    }
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

  getOtherProps() {
    return omit(super.getOtherProps(), ['modalProps', 'noCache']);
  }

  getButtonProps() {
    const { className, type } = this.props;
    const props = {
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

  componentWillUnmount() {
    this.setFilterText.cancel();
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
