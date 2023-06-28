import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import defer from 'lodash/defer';
import { TextField, TextFieldProps } from '../text-field/TextField';
import autobind from '../_util/autobind';
import Icon from '../icon';

export interface PasswordProps extends TextFieldProps {
  /**
   * 是否可揭示
   * @default true
   */
  reveal?: boolean;
}

// let selectionStart;
// let selectionEnd;

@observer
export default class Password extends TextField<PasswordProps> {
  static displayName = 'Password';

  static defaultProps = {
    ...TextField.defaultProps,
    suffixCls: 'password',
    reveal: true,
  };

  type = 'password';

  revealIconFocus: boolean;

  @observable reveal?: boolean;

  get multiple(): boolean {
    return false;
  }

  get range(): boolean {
    return false;
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'reveal',
    ]);
  }

  getOtherPrevNode(): ReactNode {
    return <input tabIndex={-1} className={`${this.prefixCls}-fix-autofill`} />;
  }

  getInnerSpanButton(): ReactNode {
    const { reveal } = this.props;
    if (reveal && !this.disabled) {
      return this.wrapperInnerSpanButton(
        <Icon
          type={this.reveal ? 'visibility' : 'visibility_off'}
          onClick={this.handleToggleReveal}
        />, {
          style: { right: this.lengthInfoWidth },
        },
      );
    }
  }

  select() {
    if (!this.revealIconFocus) {
      super.select();
    }
  }

  @autobind
  handleFocus(e) {
    super.handleFocus(e);
    defer(() => {
      if (this.revealIconFocus) {
        this.revealIconFocus = false;
      }
    });
  }

  @autobind
  handleToggleReveal(e) {
    e.preventDefault();
    const target = this.element;
    if (target) {
      if (target.type === 'password') {
        this.doReveal(target);
      } else {
        this.resetReveal(target);
      }
    }
    if (!this.isFocused) {
      this.revealIconFocus = true;
      target.focus();
    }
    defer(() => target.setSelectionRange(-1, -1));
  }

  @action
  doReveal(target) {
    target.type = 'text';
    this.type = target.type;
    this.reveal = true;
  }

  @action
  resetReveal(target) {
    target.type = 'password';
    this.type = target.type;
    this.reveal = false;
  }
}
