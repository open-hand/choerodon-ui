import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import ReactResizeObserver from 'choerodon-ui/lib/_util/resizeObserver';
import { TextField, TextFieldProps } from '../text-field/TextField';
import { AutoSizeType, ResizeType } from './enum';
import calculateNodeHeight from './calculateNodeHeight';
import autobind from '../_util/autobind';

function getResizeProp(resize: ResizeType) {
  switch (resize) {
    case ResizeType.both:
      return 'both';
    case ResizeType.vertical:
      return 'height';
    case ResizeType.horizontal:
      return 'width';
    default:
      return undefined;
  }
}

export interface TextAreaProps extends TextFieldProps {
  cols?: number;
  rows?: number;
  wrap?: string;
  resize?: ResizeType;
  autoSize?: boolean | AutoSizeType;
  onResize?: (width: number, height: number, target: Element | null) => void;
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
    rows: 4,
    autoSize: false,
  };

  // eslint-disable-next-line camelcase
  static __PRO_TEXTAREA = true;

  @observable resized?: boolean;

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'resize',
      'autoSize',
      'onResize',
    ]);
  }

  getOtherProps() {
    const { resize = ResizeType.none, autoSize } = this.props;
    const otherProps = super.getOtherProps();
    const { style = {} } = otherProps;
    style.resize = resize;
    if (resize !== ResizeType.none) {
      style.transition = 'none';
    }
    if (autoSize) {
      const { minRows, maxRows } = autoSize as AutoSizeType;
      otherProps.rows = minRows;
      const { element } = this;
      if (element) {
        Object.assign(style, calculateNodeHeight(element, true, minRows, maxRows));
      }
    }
    otherProps.style = style;
    return otherProps;
  }

  @autobind
  @action
  handleResize(width: number, height: number, target: Element | null) {
    const { onResize } = this.props;
    if (!this.resized) {
      const { element } = this;
      if (element && element.style.width) {
        this.resized = true;
      }
    }
    if (onResize) {
      onResize(width, height, target);
    }
  }

  getSuffix(): ReactNode {
    return null;
  }

  renderWrapper(): ReactNode {
    const { resize = ResizeType.none } = this.props;
    const text = this.getTextNode();
    const resizable = resize !== ResizeType.none;
    const wrapperProps = this.getWrapperProps() || {};
    const elementProps = this.getOtherProps() || {};
    const lengthElement = this.renderLengthInfo();
    const suffix = this.getSuffix();
    if (this.resized) {
      const { style: wrapperStyle } = wrapperProps;
      wrapperProps.style = {
        ...wrapperStyle,
        width: 'auto',
      };
    }
    const element = (
      <textarea
        {...elementProps}
        placeholder={this.hasFloatLabel ? undefined : this.getPlaceholders()[0]}
        readOnly={!this.editable}
        value={isString(text) ? text : this.processValue(this.getValue()) as string}
      />
    );
    return (
      <div key="wrapper" {...wrapperProps}>
        {this.renderPlaceHolder()}
        <label>
          {
            resizable ? (
              <ReactResizeObserver onResize={this.handleResize} resizeProp={getResizeProp(resize)}>
                {element}
                {suffix}
                {lengthElement}
              </ReactResizeObserver>
            ) : <>{element}{suffix}{lengthElement}</>
          }
          {this.renderFloatLabel()}
        </label>
      </div>
    );
  }

  handleEnterDown(_) {
    // noop
  }
}
