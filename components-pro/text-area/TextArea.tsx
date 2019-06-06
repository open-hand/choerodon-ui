import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import { TextField, TextFieldProps } from '../text-field/TextField';
import PropTypes from 'prop-types';
import { ResizeType } from './enum';

export interface TextAreaProps extends TextFieldProps {
  cols?: number;
  rows?: number;
  resize?: ResizeType;
}

@observer
export default class TextArea<T extends TextAreaProps> extends TextField<T> {
  static displayName = 'TextArea';

  static propTypes = {
    cols: PropTypes.number,
    rows: PropTypes.number,
    resize: PropTypes.oneOf([ResizeType.vertical, ResizeType.horizontal, ResizeType.none, ResizeType.both]),
    ...TextField.propTypes,
  };

  static defaultProps = {
    ...TextField.defaultProps,
    suffixCls: 'textarea',
    resize: ResizeType.none,
    rows: 4,
  };

  getOtherProps() {
    const { resize } = this.props;
    const otherProps = omit(super.getOtherProps(), [
      'resize',
    ]);
    const { style = {} } = otherProps;
    style.resize = resize;
    if (resize !== ResizeType.none) {
      style.transition = 'none';
    }
    otherProps.style = style;
    return otherProps;
  }

  renderWrapper(): ReactNode {
    return (
      <div {...this.getWrapperProps()}>
        <label>
          <textarea {...this.getOtherProps()} readOnly={!this.editable} value={this.getText()} />
          {this.renderFloatLabel()}
        </label>
      </div>
    );
  }

  handleEnterDown() {
  }
}
