import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';
import { action, computed, observable, toJS } from 'mobx';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { ProgressType } from 'choerodon-ui/lib/progress/enum';
import Icon from '../icon';
import { open } from '../modal-container/ModalContainer';
import LovView from './LovView';
import { ModalProps } from '../modal/Modal';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Progress from '../progress';
import { Size } from '../core/enum';
import lovStore from '../stores/LovCodeStore';
import autobind from '../_util/autobind';
import { stopEvent } from '../_util/EventManager';
import lookupStore from '../stores/LookupCodeStore';
import { Select, SelectProps } from '../select/Select';
import { ColumnAlign } from '../table/enum';
import { FieldType } from '../data-set/enum';
import { LovFieldType } from './enum';

export type LovConfigItem = {
  display?: string,
  conditionField?: string,
  conditionFieldLovCode?: string,
  conditionFieldType?: FieldType | LovFieldType,
  conditionFieldName?: string,
  conditionFieldSelectCode?: string,
  conditionFieldSelectUrl?: string,
  conditionFieldSelectTf?: string,
  conditionFieldSelectVf?: string,
  conditionFieldSequence: number,
  gridField?: string,
  gridFieldName?: string,
  gridFieldWidth?: number,
  gridFieldAlign?: ColumnAlign,
  gridFieldSequence: number,
};

export type LovConfig = {
  title?: string,
  width?: number,
  height?: number,
  customUrl?: string,
  lovPageSize?: string,
  lovItems: LovConfigItem[] | null,
  treeFlag?: 'Y' | 'N',
  parentIdField?: string,
  idField?: string,
  textField?: string,
  valueField?: string,
  placeholder?: string,
  editableFlag?: 'Y' | 'N',
  queryColumns?: number,
}

export interface LovProps extends SelectProps {
  modalProps?: ModalProps;
  noCache?: boolean;
}

@observer
export default class Lov extends Select<LovProps> {
  static displayName = 'Lov';

  static propTypes = {
    ...Select.propTypes,
    modalProps: PropTypes.object,
    noCache: PropTypes.bool,
  };

  static defaultProps = {
    ...Select.defaultProps,
    clearButton: true,
    checkValueOnOptionsChange: false,
  };

  modal;

  @observable loading?: boolean;

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
  }

  @computed
  get popup(): boolean {
    return !this.filterText || this.modal ? false : this.statePopup;
  }

  @computed
  get options(): DataSet {
    const { lovCode } = this;
    if (lovCode) {
      const ds = lovStore.getLovDataSet(lovCode);
      if (ds) {
        return ds;
      }
    }
    return new DataSet();
  }

  private openModal = action(() => {
    const config = this.getConfig();
    const { options } = this;
    const { modalProps, noCache } = this.props;
    if (!this.modal && config && options) {
      const { width, title } = config;
      options.unSelectAll();
      options.clearCachedSelected();
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
          ...modalProps && modalProps.style,
        },
        ...omit(modalProps, ['style']),
      } as ModalProps & { children });
      if (this.resetOptions() || noCache) {
        options.query();
      }
    }
  });

  private setFilterText = debounce(action((text?: string) => {
    const { options, textField } = this;
    this.filterText = text;
    this.resetOptions();
    options.setQueryParameter(textField, text);
    if (text) {
      options.query();
    }
  }), 500);

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
    const records = multiple ? options.selected : new Array().concat(options.current || []);
    const values = records.map(record => this.processRecordToObject(record));
    this.setValue(multiple ? values : (values[0] || null));
  };

  @autobind
  handleOptionSelect(record) {
    this.addValue(this.processRecordToObject(record));
  }

  processRecordToObject(record: Record) {
    const { field, valueField } = this;
    const lookupKey = field && lookupStore.getKey(field);
    return lookupKey ? this.generateLookupValue(lookupKey, record, valueField) : toJS(record.data);
  }

  resetOptions(): boolean {
    const { field, record, options } = this;
    const { queryDataSet } = options;
    if (queryDataSet) {
      queryDataSet.reset();
    }
    if (field) {
      const lovPara = toJS(field.get('lovPara')) || {};
      const cascadeMap = field.get('cascadeMap');
      if (cascadeMap && record) {
        Object.keys(cascadeMap).forEach(cascade => lovPara[cascade] = record.get(cascadeMap[cascade]));
      }
      if (!isEqual(lovPara, options.queryParameter)) {
        options.queryParameter = lovPara;
        return true;
      } else {
        options.first();
      }
      if (!options.length || options.isFilteredByQueryFields) {
        return true;
      }
    }
    return false;
  }

  generateLookupValue(lookupKey: string, record: Record, valueField: string) {
    const data = lookupStore.get(lookupKey);
    const value = toJS(record.get(valueField));
    if (data && data.every(item => item[valueField] !== value)) {
      data.push(toJS(record.data));
    }
    return value;
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

  getOtherProps() {
    const otherProps = omit(super.getOtherProps(),
      [
        'modalProps',
        'noCache',
      ],
    );
    const config = this.getConfig();
    if (config && config.placeholder) {
      otherProps.placeholder = config.placeholder;
    }

    return otherProps;
  }

  getSuffix(): ReactNode {
    const { suffix } = this.props;
    return this.wrapperSuffix(
      this.loading ? <Progress size={Size.small} type={ProgressType.loading} /> : (suffix || <Icon type="search" />),
      {
        onClick: this.isDisabled() || this.isReadOnly() ? void 0 : this.openModal,
      },
    );
  }

  componentWillUnmount() {
    if (this.modal) {
      this.modal.close();
    }
  }
}
