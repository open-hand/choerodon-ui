import React, { CSSProperties, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, observable, runInAction } from 'mobx';
import isString from 'lodash/isString';
import throttle from 'lodash/throttle';
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
    autoSize: false,
  };

  // eslint-disable-next-line camelcase
  static __PRO_TEXTAREA = true;

  @observable resized?: boolean;

  @observable autoSizeCalcHeight?: CSSProperties;

  throttleHandleAutoSize = throttle(this.handleAutoSize, 80);

  get multiple(): boolean {
    return false;
  }

  get resize(): ResizeType | undefined {
    const { autoSize, resize } = this.props;
    if (autoSize) {
      const { minRows, maxRows } = autoSize as AutoSizeType;
      if (minRows && minRows === maxRows) {
        return undefined;
      }
    }
    return resize;
  }

  get autoSize(): boolean | AutoSizeType | undefined {
    const { autoSize } = this.props;
    if (autoSize) {
      const { minRows, maxRows } = autoSize as AutoSizeType;
      if (minRows && minRows === maxRows) {
        return false;
      }
    }
    return autoSize;
  }

  get rows(): number {
    const { rows = 4, autoSize } = this.props;
    if (autoSize) {
      const { minRows } = autoSize as AutoSizeType;
      return minRows || rows;
    }
    return rows;
  }

  componentDidMount() {
    super.componentDidMount();
    if (this.element && this.autoSize) {
      window.addEventListener('resize', this.handleWindowResize, false);

      // 自适应高度，挂载时渲染样式
      this.forceUpdate();
    }
  }

  componentDidUpdate() {
    this.handleAutoSize(true);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize, false);
    super.componentWillUnmount();
  }

  @autobind
  handleWindowResize() {
    this.throttleHandleAutoSize(false);
  }

  @autobind
  handleAutoSize(useCache: boolean) {
    const { element, autoSize } = this;
    if (autoSize && element) {
      const { minRows, maxRows } = autoSize as AutoSizeType;
      const calculateStyle = calculateNodeHeight(element, useCache, minRows, maxRows);
      const { autoSizeCalcHeight } = this;
      if (!autoSizeCalcHeight || calculateStyle.height !== autoSizeCalcHeight.height ||
        calculateStyle.overflowY !== autoSizeCalcHeight.overflowY
      ) {
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
    const { resize = ResizeType.none, autoSize, rows } = this;
    const otherProps = super.getOtherProps();
    const { style = {} } = otherProps;
    style.resize = resize;
    if (resize !== ResizeType.none) {
      style.transition = 'none';
    }
    if (autoSize) {
      const { autoSizeCalcHeight } = this;
      if (autoSizeCalcHeight) {
        Object.assign(style, autoSizeCalcHeight);
      }
    }
    otherProps.rows = rows;
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
    const renderedValue = this.renderRenderedValue(undefined, { className: `${this.prefixCls}-renderer-wrapper` });
    const element = this.wrapperInputNode(renderedValue);
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
        {renderedValue}
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

  wrapperInputNode(renderedValue?: ReactNode): ReactNode {
    const text = this.getTextNode();
    const elementProps = this.getOtherProps() || {};
    const otherProps: { style?: CSSProperties } = {};
    if (renderedValue) {
      otherProps.style = {
        ...elementProps.style,
        textIndent: -100000,
        color: 'transparent',
      };
    }
    return (
      <textarea
        {...elementProps}
        {...otherProps}
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
