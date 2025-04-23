import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, runInAction, isArrayLike } from 'mobx';

import { TextField, TextFieldProps } from '../text-field/TextField';
import Icon from '../icon';
import { open } from '../modal-container/ModalContainer';
import { ModalProps } from '../modal/Modal';
import SecretFieldView from './SecretFieldView';
import autobind from '../_util/autobind';
import isEmpty from '../_util/isEmpty';
import CountDown from './CountDown';

export interface SecretFieldProps extends TextFieldProps {
  modalProps?: ModalProps;
  renderEmpty?: () => ReactNode;
}

@observer
export default class SecretField extends TextField<SecretFieldProps> {
  static displayName = 'SecretField';

  static defaultProps = {
    ...TextField.defaultProps,
  };

  // eslint-disable-next-line camelcase
  // static __IS_IN_CELL_EDITOR = true;

  modal;

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.setSecretEnable();
    });
  }

  private secretEnable: Boolean = false;

  get multiple(): boolean {
    return false;
  }

  get range(): boolean {
    return false;
  }

  get isSecretEnable(): Boolean {
    const { record, name } = this;
    if (!record || !record.get('_token') || !record.getPristineValue(name)) {
      // 新增数据，record没有token或者查询没有返回值，显示为textfield
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
    if (!this.modal) {
      const label = this.getLabel();
      const { readOnly, name, record } = this;
      const key = `_secretField_countDown_${name}`;
      if (record && !record.getState(key)) {
        record.setState(key, new CountDown());
      }
      const pattern = this.getProp('pattern');
      const restrict = this.getProp('restrict');
      const required = this.getProp('required');
      const { modalProps } = this.props;
      this.modal = open({
        title: label,
        ...modalProps,
        children: (
          <SecretFieldView
            readOnly={readOnly}
            name={name || ''}
            record={record}
            label={label}
            pattern={pattern}
            restrict={restrict}
            required={required}
            token={record && record.get('_token')}
            onChange={this.handleSecretChange}
            countDown={record && record.getState(key)}
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
    const { record } = this;
    if (record) {
      record.init(this.name || '', data);
    }
  }

  @autobind
  handleOpenModal() {
    return this.openModal();
  }

  getSuffix(): ReactNode {
    const { readOnly, record, name, isSecretEnable, props, disabled, showSuffix } = this;
    if (!showSuffix) {
      return undefined;
    }
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
      );
    }
    // 只读：已读不显示查看按钮
    // readFlag: true已查看 undefined未查看
    const readFlag = record && record.getState(`_secretField_queryFlag_${name}`);
    if (!readFlag && readOnly) {
      return this.wrapperSuffix(
        <Icon type='visibility-o' />,
        {
          onClick: disabled ? null : this.handleOpenModal,
        },
      );
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

  getInnerSpanButton(): ReactNode {
    const { isSecretEnable } = this;
    // 显示为脱敏组件时，禁用clearButton
    if (isSecretEnable) {
      return null;
    }
    // 显示为textField时，正常显示clearButton
    return super.getInnerSpanButton();
  }

  get clearButton(): boolean {
    const { isSecretEnable } = this;
    // 显示为脱敏组件时，clearButton为false
    if (isSecretEnable) {
      return false;
    }
    // 显示为textField时，正常显示clearButton
    return super.clearButton;
  }

  @action
  clear() {
    const { isSecretEnable } = this;
    // 只有显示为textField时，退格键正常删除内容
    if (!isSecretEnable) {
      super.clear();
    }
  }

  renderWrapper(): ReactNode {
    const { readOnly, prefixCls } = this;
    const result = this.getRenderedValue();
    const { renderEmpty } = this.props;
    // 脱敏组件只读且值为空时，renderEmpty
    return readOnly && (isEmpty(result) || (isArrayLike(result) && !result.length)) ? (
      <span {...this.getMergedProps()}>
        <span className={`${prefixCls}-secret-empty`}>
          {renderEmpty ? renderEmpty() : this.getContextConfig('renderEmpty')('SecretField') || '-'}
        </span>
      </span>
    ) : super.renderWrapper();
  }
}
