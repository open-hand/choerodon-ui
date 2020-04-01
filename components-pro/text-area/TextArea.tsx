import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import isString from 'lodash/isString';
import omit from 'lodash/omit';
import PropTypes from 'prop-types';
import { TextField, TextFieldProps } from '../text-field/TextField';
import { ResizeType, AutoSizeType } from './enum';
import calculateNodeHeight from './calculateNodeHeight';

export interface TextAreaProps extends TextFieldProps {
  cols?: number;
  rows?: number;
  resize?: ResizeType;
  autoSize?: boolean | AutoSizeType;
  placeholder?: string;
}

@observer
export default class TextArea<T extends TextAreaProps> extends TextField<T> {
  static displayName = 'TextArea';

  static propTypes = {
    cols: PropTypes.number,
    rows: PropTypes.number,
    resize: PropTypes.oneOf([
      ResizeType.vertical,
      ResizeType.horizontal,
      ResizeType.none,
      ResizeType.both,
    ]),
    autoSize: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    ...TextField.propTypes,
  };

  static defaultProps = {
    ...TextField.defaultProps,
    suffixCls: 'textarea',
    resize: ResizeType.none,
    rows: 4,
    autoSize: false,
    placeholder: '',
  };

  textAreaRef: HTMLTextAreaElement;

  saveTextArea = (textArea: HTMLTextAreaElement) => {
    this.textAreaRef = textArea;
  };

  getOtherProps() {
    const { resize } = this.props;
    const otherProps = omit(super.getOtherProps(), ['resize', 'autoSize']);
    const { style = {} } = otherProps;
    style.resize = resize;
    if (resize !== ResizeType.none) {
      style.transition = 'none';
    }
    const { autoSize } = this.props;
    let textAreaStyles = {};
    if (autoSize) {
      const { minRows, maxRows } = autoSize as AutoSizeType;
      otherProps.rows = minRows;
      if (this.textAreaRef) {
        textAreaStyles = calculateNodeHeight(this.textAreaRef, true, minRows, maxRows);
      }
    }
    otherProps.style = { ...style, ...textAreaStyles };
    return otherProps;
  }

  renderWrapper(): ReactNode {
    const text = this.getTextNode();
    return (
      <div key="wrapper" {...this.getWrapperProps()}>
        {this.renderPlaceHolder()}
        <label>
          <textarea
            {...this.getOtherProps()}
            placeholder={this.hasFloatLabel ? undefined : this.getPlaceholders()[0]}
            readOnly={!this.editable}
            ref={this.saveTextArea}
            value={isString(text) ? text : this.getText(this.getValue())}
          />
          {this.renderFloatLabel()}
        </label>
      </div>
    );
  }

  handleEnterDown() {}
}
