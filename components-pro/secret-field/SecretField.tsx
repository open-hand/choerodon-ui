import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, observable, runInAction } from 'mobx';

import { TextField, TextFieldProps } from '../text-field/TextField';
import Icon from '../icon';
import { open } from '../modal-container/ModalContainer';
import { ModalProps } from '../modal/Modal';
import SecretFieldView from './SecretFieldView';
import autobind from '../_util/autobind';
import CountDown from './CountDown';

export interface SecretFieldProps extends TextFieldProps {
  modalProps?: ModalProps;
}

@observer
export default class SecretField extends TextField<SecretFieldProps> {
  static displayName = 'SecretField';

  static defaultProps = {
    ...TextField.defaultProps,
  };

  static propTypes = {
    ...TextField.propTypes,
  };

  countDown = new CountDown();

  // eslint-disable-next-line camelcase
  static __IS_IN_CELL_EDITOR = true;

  modal;

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.setQueryFlag(true);
    })
  }

  @observable queryFlag;

  @autobind
  @action
  setQueryFlag(value) {
    this.queryFlag = value;
  }

  @action
  private openModal() {
    const label = this.getLabel();
    const { readOnly, name } = this;
    if (!this.modal) {
      const { modalProps } = this.props;
      this.modal = open({
        title: label,
        ...modalProps,
        children: (
          <SecretFieldView
            readOnly={readOnly}
            name={name || ''}
            label={label}
            token={this.record?.get('_token')}
            onChange={this.handleChange}
            onQueryFlag={this.setQueryFlag}
            countDown={this.countDown}
          />
        ),
        destroyOnClose: true,
        closable: true,
        autoFocus: false,
        footer: null,
        onClose: this.handleSecretFieldViewClose,
      } as ModalProps & { children });
    }
  }

  @autobind
  @action
  handleSecretFieldViewClose() {
    this.modal = undefined;
  }

  @autobind
  handleChange(data?: any) {
    this.record?.init(this.name || '', data);
  }

  @autobind
  handleOpenModal() {
    return this.openModal();
  }

  getSuffix(): ReactNode {
    const { readOnly, queryFlag } = this;
    return queryFlag ? this.wrapperSuffix(
      readOnly ? (
        <Icon type="visibility-o" />
      ) : (
        <Icon type="edit-o" />
      ),
      {
        onClick: this.handleOpenModal,
      },
    ) : null
  }
}
