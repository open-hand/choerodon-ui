import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { observable, runInAction } from 'mobx';
import cloneDeep from 'lodash/cloneDeep';
import { ProgressType } from 'choerodon-ui/lib/progress/enum';
import { TextField, TextFieldProps } from '../text-field/TextField';
import Icon from '../icon';
import { open } from '../modal-container/ModalContainer';
import IntlList from './IntlList';
import { ModalProps } from '../modal/Modal';
import DataSet from '../data-set/DataSet';
import { DataSetEvents } from '../data-set/enum';
import autobind from '../_util/autobind';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { stopEvent } from '../_util/EventManager';
import Progress from '../progress';
import { Size } from '../core/enum';
import { $l } from '../locale-context';

export interface IntlFieldProps extends TextFieldProps {
  modalProps?: ModalProps;
}

@observer
export default class IntlField extends TextField<IntlFieldProps> {
  static displayName = 'IntlField';

  modal;

  locales?: object;
  tlsDataSet: DataSet;

  @observable loading?: boolean;

  openModal = async () => {
    if (!this.modal) {
      const { modalProps } = this.props;
      const { record, lang, name } = this;
      if (record) {
        runInAction(() => {
          this.loading = true;
        });
        try {
          await record.tls(name);
        } finally {
          runInAction(() => {
            this.loading = false;
          });
        }
        if (record.tlsDataSet) {
          this.tlsDataSet = record.tlsDataSet;
        }
      }
      if (!this.tlsDataSet) {
        const value = { [lang]: this.getValue() };
        this.tlsDataSet = new DataSet({
          data: [name ? { [name]: value } : value],
        });
      }
      const { current } = this.tlsDataSet;
      if (current) {
        this.storeLocales(current.data);
      } else {
        this.tlsDataSet.addEventListener('load', this.handleTlsLoad);
      }

      this.modal = open({
        title: $l('IntlField', 'modal_title'),
        children: (
          <IntlList
            dataSet={this.tlsDataSet}
            name={name}
            lang={lang}
          />
        ),
        onClose: this.handleIntlListClose,
        onOk: this.handleIntlListOk,
        onCancel: this.handleIntlListCancel,
        destroyOnClose: true,
        ...modalProps,
      } as ModalProps & { children });
    }
  };

  handleIntlListClose = async () => {
    delete this.modal;
    this.focus();
  };

  handleIntlListOk = async () => {
    const { tlsDataSet } = this;
    const { current } = tlsDataSet;
    if (current) {
      if (!await current.validate(true)) {
        return false;
      } else {
        const { lang, name } = this;
        this.setValue(current.get(name ? `${name}.${lang}` : lang));
      }
    }
  };

  handleIntlListCancel = async () => {
    const { locales, name, tlsDataSet: { current } } = this;
    if (current && locales) {
      Object.keys(locales).forEach((key) => (
        current.set(name ? `${name}.${key}` : key, locales[key])
      ));
    }
  };

  handleTlsLoad = () => {
    const { current } = this.tlsDataSet;
    if (current) {
      this.storeLocales(current.data);
    }
  };

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

  storeLocales(data) {
    const { name } = this;
    this.locales = cloneDeep(name ? data[name] : data);
  }

  setValue(value) {
    super.setValue(value);
    if (this.tlsDataSet && !this.record) {
      const { current } = this.tlsDataSet;
      const { lang, name } = this;
      if (current) {
        current.set(name ? `${name}.${lang}` : lang, this.value);
      }
    }
  }

  getSuffix(): ReactNode {
    const { suffix } = this.props;
    return this.wrapperSuffix(
      this.loading ? <Progress size={Size.small} type={ProgressType.loading} /> : (suffix || <Icon type="language" />),
      {
        onClick: this.isDisabled() || this.isReadOnly() ? void 0 : this.openModal,
      },
    );
  }

  componentWillUnmount() {
    if (this.modal) {
      this.modal.close();
    }
    if (this.tlsDataSet) {
      this.tlsDataSet.removeEventListener(DataSetEvents.load, this.handleTlsLoad);
    }
  }
}
