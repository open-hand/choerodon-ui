import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import { computed, observable, runInAction, toJS } from 'mobx';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { ProgressType } from 'choerodon-ui/lib/progress/enum';
import { TextField, TextFieldProps } from '../text-field/TextField';
import Icon from '../icon';
import { open } from '../modal-container/ModalContainer';
import LovView from './LovView';
import { ModalProps } from '../modal/Modal';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Progress from '../progress';
import { Size } from '../core/enum';
import lovStore, { LovConfig } from '../stores/LovCodeStore';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import autobind from '../_util/autobind';
import { stopEvent } from '../_util/EventManager';
import lookupStore from '../stores/LookupCodeStore';

export interface LovProps extends TextFieldProps {
  modalProps?: ModalProps;
  noCache?: boolean;
}

@observer
export default class Lov extends TextField<LovProps> {
  static displayName = 'Lov';

  static propTypes = {
    ...TextField.propTypes,
    modalProps: PropTypes.object,
    noCache: PropTypes.bool,
  };

  static defaultProps = {
    ...TextField.defaultProps,
    clearButton: true,
  };

  modal;

  options?: DataSet;

  @observable loading?: boolean;

  @computed
  get editable(): boolean {
    return false;
  }

  @computed
  get textField(): string {
    return this.getProp('textField') || 'meaning';
  }

  @computed
  get valueField(): string {
    return this.getProp('valueField') || 'value';
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
    const { options, multiple, field, valueField } = this;
    if (options) {
      const records = multiple ? options.selected : new Array().concat(options.current || []);
      const lookupKey = field && lookupStore.getKey(field);
      const values = lookupKey ? this.generateLookupValue(lookupKey, records, valueField)
        : records.map(record => toJS(record.data));
      this.setValue(multiple ? values : (values[0] || null));
    }
  };

  generateLookupValue(lookupKey: string, records: Record[], valueField: string) {
    const data = lookupStore.get(lookupKey);
    return records.map((record) => {
      const value = toJS(record.get(valueField));
      if (data && data.every(item => item[valueField] !== value)) {
        data.push(toJS(record.data));
      }
      return value;
    });
  }

  @autobind
  handleKeyDown(e) {
    if (e.keyCode === KeyCode.DOWN) {
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

  async getOptions(): Promise<DataSet | undefined> {
    const { field } = this;
    if (field) {
      const code = field.get('lovCode');
      if (code) {
        return await lovStore.getLovDataSet(code);
      }
    }
  }

  async getConfig(): Promise<LovConfig | undefined> {
    const { field } = this;
    if (field) {
      const code = field.get('lovCode');
      if (code) {
        return await lovStore.fetchConfig(code);
      }
    }
  }

  getOtherProps() {
    return omit(super.getOtherProps(),
      [
        'modalProps',
        'queryUrl',
        'configUrl',
      ],
    );
  }

  openModal = async () => {
    try {
      runInAction(() => {
        this.loading = true;
      });
      const config = await this.getConfig();
      const options = this.options = await this.getOptions();
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
        const { field, record } = this;
        if (field) {
          let needQuery = !options.length;
          const { queryDataSet } = options;
          if (queryDataSet) {
            queryDataSet.reset();
          }
          if (options.isFilteredByQueryFields) {
            needQuery = true;
          }
          const lovPara = toJS(field.get('lovPara')) || {};
          const cascadeMap = field.get('cascadeMap');
          if (cascadeMap && record) {
            Object.keys(cascadeMap).forEach(cascade => lovPara[cascade] = record.get(cascadeMap[cascade]));
          }
          if (!isEqual(lovPara, options.queryParameter)) {
            options.queryParameter = lovPara;
            needQuery = true;
          } else {
            options.first();
          }
          if (noCache || needQuery) {
            options.query();
          }
        }
      }
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  getSuffix(): ReactNode {
    const { suffix } = this.props;
    return this.wrapperSuffix(
      this.loading ? <Progress size={Size.small} type={ProgressType.loading} /> : (suffix || <Icon type="search" />),
      {
        onClick: this.isDisabled() || this.isReadOnly() ? void 0 : this.openModal,
      },
    );
  }

  processValue(value) {
    const { field, textField, valueField } = this;
    if (field) {
      const lookupKey = lookupStore.getKey(field);
      if (lookupKey) {
        return super.processValue(lookupStore.getText(lookupKey, value, valueField, textField));
      }
    }
    return super.processValue(value && textField ? ObjectChainValue.get(value, textField) : value);
  }

  componentWillUnmount() {
    if (this.modal) {
      this.modal.close();
    }
  }
}
