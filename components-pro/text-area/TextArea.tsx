import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action as mobxAction, observable, runInAction } from 'mobx';
import isString from 'lodash/isString';
import omit from 'lodash/omit';
import PropTypes from 'prop-types';
import { TextField, TextFieldProps } from '../text-field/TextField';
import { ResizeType, AutoSizeType } from './enum';
import calculateNodeHeight from './calculateNodeHeight';

function onNextFrame(cb: () => void) {
  if (window.requestAnimationFrame) {
    return window.requestAnimationFrame(cb);
  }
  return window.setTimeout(cb, 1);
}

function clearNextFrameAction(nextFrameId: number) {
  if (window.cancelAnimationFrame) {
    window.cancelAnimationFrame(nextFrameId);
  } else {
    window.clearTimeout(nextFrameId);
  }
}

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

  nextFrameActionId: number;

  textArea: HTMLTextAreaElement;

  saveTextArea = (textArea: HTMLTextAreaElement) => {
    this.textArea = textArea;
  };

  @observable textareaStyles: {};

  textStatus: boolean;

  constructor(props, context) {
    super(props, context);
    this.textStatus = false;
    runInAction(() => {
      this.textareaStyles = props.autoSize || {};
    });
  }

  componentDidMount() {
    this.resizeTextarea();
  }

  componentWillReceiveProps(nextProps: TextAreaProps) {
    const { value } = this.props;
    if (value !== nextProps.value) {
      if (this.nextFrameActionId) {
        clearNextFrameAction(this.nextFrameActionId);
      }
      this.nextFrameActionId = onNextFrame(this.resizeTextarea);
    }
  }

  getOtherProps() {
    const { resize } = this.props;
    const otherProps = omit(super.getOtherProps(), ['resize', 'autoSize']);
    const { style = {} } = otherProps;
    style.resize = resize;
    if (resize !== ResizeType.none) {
      style.transition = 'none';
    }
    otherProps.style = style;
    return otherProps;
  }

  @mobxAction
  resizeTextarea = () => {
    const { autoSize } = this.props;
    if (!autoSize || !this.textArea) {
      return;
    }
    const minRows = autoSize ? (autoSize as AutoSizeType).minRows : null;
    const maxRows = autoSize ? (autoSize as AutoSizeType).maxRows : null;
    const minCols = autoSize ? (autoSize as AutoSizeType).minCols : null;
    const maxCols = autoSize ? (autoSize as AutoSizeType).maxCols : null;
    const textareaStyles = calculateNodeHeight(this.textArea, false, minRows, maxRows, minCols, maxCols);
    if (minCols || maxCols) {
      this.textStatus = true;
    }
    this.textareaStyles = textareaStyles;
  };

  renderWrapper(): ReactNode {
    const text = this.getTextNode();
    const { style, resize, placeholder, autoSize } = this.props;

    const PropStyle = {
      ...style,
      ...this.textareaStyles,
      resize,
    };

    if (autoSize) {
      PropStyle.resize = ResizeType.vertical;
    }
    
    if ( this.textStatus && resize === 'both') {
      PropStyle.resize = ResizeType.both;
    }

    return (
      <div key="wrapper" {...this.getWrapperProps()}>
        {this.renderPlaceHolder()}
        <label>
          <textarea
            {...this.getOtherProps()}
            style={PropStyle}
            readOnly={!this.editable}
            value={isString(text) ? text : this.getText(this.getValue())}
            placeholder={placeholder}
            ref={this.saveTextArea}
          />
          {this.renderFloatLabel()}
        </label>
      </div>
    );
  }

  handleEnterDown() {}
}
