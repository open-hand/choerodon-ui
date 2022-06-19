import React, { CSSProperties, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, observable, runInAction } from 'mobx';
import isString from 'lodash/isString';
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

  static defaultProps = {
    ...TextField.defaultProps,
    suffixCls: 'textarea',
    rows: 4,
    autoSize: false,
  };

  // eslint-disable-next-line camelcase
  static __PRO_TEXTAREA = true;

  @observable resized?: boolean;

  @observable autoSizeCalcHeight?: CSSProperties;

  get multiple(): boolean {
    return false;
  }

  get resize(): ResizeType | undefined {
    return this.props.resize;
  }

  get autoSize(): boolean | AutoSizeType | undefined {
    return this.props.autoSize;
  }

  componentDidMount() {
    super.componentDidMount();
    if (this.element && this.autoSize) {
      // 自适应高度，挂载时渲染样式
      this.forceUpdate();
    }
  }

  componentDidUpdate() {
    const { element, autoSize } = this;
    if (autoSize && element) {
      const { minRows, maxRows } = autoSize as AutoSizeType;
      const calculateStyle = calculateNodeHeight(element, true, minRows, maxRows);
      const { autoSizeCalcHeight } = this;
      if (!autoSizeCalcHeight || calculateStyle.height !== autoSizeCalcHeight.height) {
        runInAction(() => {
          this.autoSizeCalcHeight = calculateStyle;
        });
      }
    }
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'resize',
      'autoSize',
      'onResize',
    ]);
  }

  getOtherProps() {
    const { resize = ResizeType.none, autoSize } = this;
    const otherProps = super.getOtherProps();
    const { style = {} } = otherProps;
    style.resize = resize;
    if (resize !== ResizeType.none) {
      style.transition = 'none';
    }
    if (autoSize) {
      const { minRows } = autoSize as AutoSizeType;
      otherProps.rows = minRows;

      const { autoSizeCalcHeight } = this;
      if (autoSizeCalcHeight) {
        Object.assign(style, autoSizeCalcHeight);
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

  renderLengthInfoWrapper(): ReactNode {
    if (!this.showLengthInfo) {
      return null;
    }
    const editorTextInfo = this.getEditorTextInfo();
    const inputLength = editorTextInfo.text.length;
    const maxLength = this.getProp('maxLength');
    const lengthElement = this.renderLengthInfo(maxLength, inputLength);
    return lengthElement;
  }

  @autobind
  handleClearButtonClick(e) {
    e.preventDefault();
    this.clear();
  }

  handleInnerButtonMouseDown(e) {
    e.preventDefault();
  }

  renderWrapper(): ReactNode {
    const { resize = ResizeType.none } = this;
    const resizable = resize !== ResizeType.none;
    const wrapperProps = this.getWrapperProps() || {};
    const lengthElement = this.renderLengthInfoWrapper();
    // 先计算suffix，然后再计算clearButton，设置right，避免重叠
    const suffix = this.getSuffix();
    const button = this.getInnerSpanButton();
    if (this.resized) {
      const { style: wrapperStyle } = wrapperProps;
      wrapperProps.style = {
        ...wrapperStyle,
        width: 'auto',
      };
    }
    if (lengthElement) {
      const { style: wrapperStyle } = wrapperProps;
      wrapperProps.style = {
        ...wrapperStyle,
        marginBottom: '0.2rem',
      };
    }
    const element = this.wrapperInputNode();
    const children = (
      <>
        {element}
        {lengthElement}
        {suffix}
        {button}
      </>
    );
    return (
      <div key="wrapper" {...wrapperProps}>
        {this.renderPlaceHolder()}
        <label>
          {
            resizable ? (
              <ReactResizeObserver onResize={this.handleResize} resizeProp={getResizeProp(resize)}>
                {children}
              </ReactResizeObserver>
            ) : children
          }
          {this.renderFloatLabel()}
        </label>
      </div>
    );
  }

  wrapperInputNode(): ReactNode {
    const text = this.getTextNode();
    const elementProps = this.getOtherProps() || {};
    return (
      <textarea
        {...elementProps}
        placeholder={this.hasFloatLabel && !this.isFocused ? undefined : this.getPlaceholders()[0]}
        readOnly={!this.editable}
        value={isString(text) ? text : this.processValue(this.getValue()) as string}
      />
    );
  }

  handleEnterDown(_) {
    // noop
  }
}
