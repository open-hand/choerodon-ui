import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, observable, runInAction } from 'mobx';
import { getConfig } from 'choerodon-ui/lib/configure';

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
      this.setSecretEnable();
    })
  }

  // 是否已经查看过，已查看过不显示查看按钮
  @observable queryFlag;

  @autobind
  @action
  setQueryFlag(value) {
    this.queryFlag = value;
  }

  @observable secretEnable;

  @autobind
  @action
  setSecretEnable() {
    const { record } = this;
    const secretFieldEnableConfig = getConfig('secretFieldEnable');
    if (!record?.get('_token')) {
      this.secretEnable = false;
    } else if (secretFieldEnableConfig) {
      // 从配置项获取是否开启脱敏组件
      this.secretEnable = secretFieldEnableConfig();
    }
  }

  @action
  private openModal() {
    const label = this.getLabel();
    const { readOnly, name, record } = this;
    const pattern = this.getProp('pattern');
    const restrict = this.getProp('restrict');
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
            pattern={pattern}
            restrict={restrict}
            token={record?.get('_token')}
            onChange={this.handleSecretChange}
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
  handleSecretChange(data?: any) {
    this.record?.init(this.name || '', data);
  }

  @autobind
  handleOpenModal() {
    return this.openModal();
  }

  getSuffix(): ReactNode {
    const { readOnly, queryFlag } = this;
    // 未开启脱敏组件
    if (!this.secretEnable) {
      const { suffix } = this.props;
      return suffix ? this.wrapperSuffix(suffix) : null;
    }
    // 开启脱敏组件
    return queryFlag ? this.wrapperSuffix(
      <Icon type={readOnly ? 'visibility-o' : 'edit-o'} />,
      {
        onClick: this.handleOpenModal,
      },
    ) : null
  }

  isEditable(): boolean {
    return !this.secretEnable && super.isEditable();
  }

  getWrapperClassNames(...args): string {
    const { prefixCls, secretEnable, readOnly } = this;
    return super.getWrapperClassNames(...args, {
      [`${prefixCls}-secret-table-border`]: secretEnable && this.getProp('_inTable'),
      [`${prefixCls}-secret-form-read-border`]: secretEnable && !this.getProp('_inTable') && readOnly,
    });
  }
}
