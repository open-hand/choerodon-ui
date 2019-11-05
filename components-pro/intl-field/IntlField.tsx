import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { ProgressType } from 'choerodon-ui/lib/progress/enum';
import { getConfig } from 'choerodon-ui/lib/configure';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { TextField, TextFieldProps } from '../text-field/TextField';
import Icon from '../icon';
import { open } from '../modal-container/ModalContainer';
import IntlList from './IntlList';
import { ModalProps } from '../modal/Modal';
import localeContext, { $l } from '../locale-context';
import autobind from '../_util/autobind';
import { stopEvent } from '../_util/EventManager';
import Progress from '../progress';
import { Size } from '../core/enum';
import exception from '../_util/exception';
import message from '../message';
import isSame from '../_util/isSame';

export interface IntlFieldProps extends TextFieldProps {
  modalProps?: ModalProps;
}

@observer
export default class IntlField extends TextField<IntlFieldProps> {
  static displayName = 'IntlField';

  modal;

  locales?: object;

  @observable loading?: boolean;

  openModal = async () => {
    if (!this.modal) {
      const { modalProps } = this.props;
      const { record, lang, name, element } = this;
      if (record) {
        this.setLoading(true);
        try {
          if (element && !isSame(this.getValue(), element.value)) {
            this.syncValueOnBlur(element.value);
          }
          await record.tls(name);
        } catch (err) {
          message.error(exception(err));
          return;
        } finally {
          this.setLoading(false);
        }
      }
      this.storeLocales();

      this.modal = open({
        title: $l('IntlField', 'modal_title'),
        children: <IntlList record={record} name={name} lang={lang} />,
        onClose: this.handleIntlListClose,
        onOk: this.handleIntlListOk,
        onCancel: this.handleIntlListCancel,
        destroyOnClose: true,
        ...modalProps,
      } as ModalProps & { children });
    }
  };

  @action
  setLoading(loading) {
    this.loading = loading;
  }

  handleIntlListClose = async () => {
    delete this.modal;
    this.focus();
  };

  @autobind
  async handleIntlListOk() {
    const { supports } = localeContext;
    const languages = Object.keys(supports);
    const { record, name, field } = this;
    if (record && field) {
      const tlsKey = getConfig('tlsKey');
      return (await Promise.all(
        languages.map(language => {
          const intlField = record.getField(`${tlsKey}.${name}.${language}`);
          return intlField ? intlField.checkValidity() : true;
        }),
      )).every(Boolean);
    }
  }

  @autobind
  async handleIntlListCancel() {
    const { name, record } = this;
    if (record) {
      const tlsKey = getConfig('tlsKey');
      record.set(`${tlsKey}.${name}`, this.locales);
    }
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

  storeLocales() {
    const { name, record } = this;
    if (record) {
      const tlsKey = getConfig('tlsKey');
      this.locales = { ...record.get(`${tlsKey}.${name}`) };
    }
  }

  getSuffix(): ReactNode {
    const { suffix } = this.props;
    return this.wrapperSuffix(
      this.loading ? (
        <Progress size={Size.small} type={ProgressType.loading} />
      ) : (
        suffix || <Icon type="language" />
      ),
      {
        onClick: this.isDisabled() || this.isReadOnly() ? undefined : this.openModal,
      },
    );
  }

  componentWillUnmount() {
    if (this.modal) {
      this.modal.close();
    }
  }
}
