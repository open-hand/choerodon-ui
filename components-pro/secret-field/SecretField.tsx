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

  // eslint-disable-next-line camelcase
  // static __IS_IN_CELL_EDITOR = true;

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

  private secretEnable: Boolean = false;

  get isSecretEnable(): Boolean {
    const { record, name } = this;
    if (!record?.get('_token') || !record?.get(name) ) {
      // 新增数据，record没有token或者没有值，显示为textfield
      return false;
    }
    return this.secretEnable;
  }

  @action
  setSecretEnable() {
    const secretFieldEnableConfig = this.getContextConfig('secretFieldEnable');
    if (secretFieldEnableConfig) {
      // 从配置项获取是否开启脱敏组件
      this.secretEnable = secretFieldEnableConfig();
    }
  }

  @action
  private openModal() {
    const label = this.getLabel();
    const { readOnly, name, record } = this;
    if (!record?.getState(`_secretField_countDown_${name}`)) {
      record?.setState({ [`_secretField_countDown_${name}`]: new CountDown() });
    }
    const pattern = this.getProp('pattern');
    const restrict = this.getProp('restrict');
    const required = this.getProp('required');
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
            required={required}
            token={record?.get('_token')}
            onChange={this.handleSecretChange}
            onQueryFlag={this.setQueryFlag}
            countDown={record?.getState(`_secretField_countDown_${name}`)}
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
    const { readOnly, queryFlag, isSecretEnable, props } = this;
    const disabled = this.getProp('disabled') || props.disabled;
    // 未开启脱敏组件或者脱敏组件值为空时,不显示编辑/查看按钮
    if (!isSecretEnable) {
      const { suffix } = props;
      return suffix ? this.wrapperSuffix(suffix) : null;
    }
    // 开启脱敏组件
    // 编辑
    if (!readOnly) {
      return this.wrapperSuffix(
        <Icon type='edit-o' />,
        {
          onClick: disabled ? null : this.handleOpenModal,
        },
      )
    }
    // 只读：已读不显示查看按钮
    if (queryFlag && readOnly) {
      return this.wrapperSuffix(
        <Icon type='visibility-o' />,
        {
          onClick: disabled ? null : this.handleOpenModal,
        },
      )
    }
    return null;
  }

  isEditable(): boolean {
    return !this.isSecretEnable && super.isEditable();
  }

  getWrapperClassNames(...args): string {
    const { prefixCls } = this;
    return super.getWrapperClassNames(...args, {
      [`${prefixCls}-secret`]: true,
    });
  }
}
