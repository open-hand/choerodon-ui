import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import { observer } from 'mobx-react';
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

let selectionStart;
let selectionEnd;

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
    suffixCls: 'pro-password',
    reveal: true,
  };

  type: string = 'password';

  getOtherProps() {
    return omit(super.getOtherProps(), [
      'reveal',
    ]);
  }

  getOtherPrevNode(): ReactNode {
    return <input tabIndex={-1} className={`${this.prefixCls}-fix-autofill`} />;
  }

  getInnerSpanButton(): ReactNode {
    const { reveal } = this.props;
    if (reveal) {
      return this.wrapperInnerSpanButton(
        <Icon
          type="visibility"
          onMouseDown={this.handleReveal}
          onMouseLeave={this.handleResetReveal}
          onMouseUp={this.handleResetReveal}
        />,
      );
    }
  }

  @autobind
  handleReveal(e) {
    e.preventDefault();
    if (!this.isFocused) {
      this.focus();
    }
    const target = this.element;
    if (target) {
      selectionEnd = target.selectionEnd;
      selectionStart = target.selectionStart;
      target.type = 'text';
    }
  }

  @autobind
  handleResetReveal() {
    const target = this.element;
    if (target && typeof selectionStart !== 'undefined' && typeof selectionEnd !== 'undefined') {
      target.type = 'password';
      target.setSelectionRange(selectionStart, selectionEnd);
      selectionStart = void 0;
      selectionEnd = void 0;
    }
  }
}
