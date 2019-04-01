import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import omit from 'lodash/omit';
import { FormField, FormFieldProps } from '../field/FormField';
import PropTypes from 'prop-types';
import autobind from '../_util/autobind';
import { ResizeType } from './enum';

export interface TextAreaProps extends FormFieldProps {
  cols?: number;
  rows?: number;
  resize?: ResizeType;
}

@observer
export default class TextArea<T extends TextAreaProps> extends FormField<T> {
  static displayName = 'TextArea';

  static propTypes = {
    cols: PropTypes.number,
    rows: PropTypes.number,
    resize: PropTypes.oneOf([ResizeType.vertical, ResizeType.horizontal, ResizeType.none, ResizeType.both]),
    ...FormField.propTypes,
  };

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'pro-textarea',
    resize: ResizeType.none,
    rows: 4,
  };

  @observable text?: string;

  getOtherProps() {
    const { resize, cols } = this.props;
    const otherProps = omit(super.getOtherProps(), [
      'resize',
    ]);
    const { style = {} } = otherProps;
    style.resize = resize;
    if (resize !== ResizeType.none) {
      style.transition = 'none';
    }
    if (cols !== void 0 && style.width === void 0) {
      style.width = 'auto';
    }
    otherProps.style = style;
    return otherProps;
  }

  renderWrapper(): ReactNode {
    return (
      <textarea {...this.getMergedProps()} readOnly={!this.editable} value={this.getText()} />
    );
  }

  handleEnterDown() {
  }

  @autobind
  handleFocus(e) {
    this.select();
    super.handleFocus(e);
  }

  @autobind
  handleBlur(e) {
    if (this.editable) {
      this.syncValueOnBlur(e.target.value);
    }
    super.handleBlur(e);
  }

  syncValueOnBlur(value) {
    this.setValue(value);
  }

  async setValue(value: any): Promise<void> {
    super.setValue(value);
    this.setText(void 0);
  }

  @action
  setText(text?: string): void {
    this.text = text;
  }

  getText() {
    return this.text === void 0 ? super.getText() : this.text;
  }

  select() {
    const { element } = this;
    if (element && this.editable) {
      element.select();
    }
  }

  @autobind
  handleChange(e) {
    const { target } = e;
    const value = target.value;
    const restricted = this.restrictInput(value);
    if (restricted !== value) {
      const selectionEnd = target.selectionEnd + restricted.length - value.length;
      target.value = restricted;
      target.setSelectionRange(selectionEnd, selectionEnd);
    }
    this.setText(value);
  }

  restrictInput(value: string): string {
    return value;
  }
}
