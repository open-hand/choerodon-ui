import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
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

  static propTypes = {
    /**
     * 是否可揭示
     * @default true
     */
    reveal: PropTypes.bool,
    ...TextField.propTypes,
  };

  static defaultProps = {
    ...TextField.defaultProps,
    suffixCls: 'password',
    reveal: true,
  };

  type: string = 'password';

  @observable reveal?: boolean;

  selectionEnd?: number;

  selectionStart?: number;

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

  @autobind
  handleToggleReveal(e) {
    e.preventDefault();
    if (!this.isFocused) {
      this.focus();
    }
    const target = this.element;
    if (target) {
      if (target.type === 'password') {
        this.doReveal(target);
      } else {
        this.resetReveal(target);
      }
    }
  }

  @action
  doReveal(target) {
    this.selectionEnd = target.selectionEnd;
    this.selectionStart = target.selectionStart;
    target.type = 'text';
    this.type = target.type;
    this.reveal = true;
  }

  @action
  resetReveal(target) {
    const { selectionStart, selectionEnd } = this;
    target.type = 'password';
    this.type = target.type;
    if (typeof selectionStart !== 'undefined' && typeof selectionEnd !== 'undefined') {
      target.setSelectionRange(selectionStart, selectionEnd);
      this.selectionStart = undefined;
      this.selectionEnd = undefined;
    }
    this.reveal = false;
  }
}
