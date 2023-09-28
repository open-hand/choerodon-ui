import React, {
  cloneElement,
  CSSProperties,
  isValidElement,
  Key,
  MouseEvent as ReactMouseEvent,
  ReactElement,
  ReactNode,
} from 'react';
import isEqual from 'lodash/isEqual';
import defer from 'lodash/defer';
import noop from 'lodash/noop';
import isNil from 'lodash/isNil';
import isNumber from 'lodash/isNumber';
import classNames from 'classnames';
import classes from 'component-classes';
import { pxToPercent, pxToRem, toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import { observable, runInAction } from 'mobx';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import math from 'choerodon-ui/dataset/math';
import ViewComponent, { ViewComponentProps } from '../core/ViewComponent';
import Icon from '../icon';
import autobind from '../_util/autobind';
import Button, { ButtonProps } from '../button/Button';
import EventManager from '../_util/EventManager';
import { ButtonColor, FuncType } from '../button/enum';
import asyncComponent, { AsyncCmpLoadingFunction } from '../_util/AsyncComponent';
import message from '../message';
import exception from '../_util/exception';
import { $l } from '../locale-context';
import DataSetRequestError from '../data-set/DataSetRequestError';
import { suffixCls, toUsefulDrawerTransitionName } from './utils';
import { ModalChildrenProps, ModalCustomized } from './interface';
import { getDocument, MousePosition, transformZoomData } from '../_util/DocumentUtils';

export type DrawerTransitionName = 'slide-up' | 'slide-right' | 'slide-down' | 'slide-left';

function getMath(value, min, max) {
  return Math.min(
    Math.max(
      value,
      min,
    ),
    max,
  );
}

function fixUnit(n) {
  if (isNumber(n)) {
    return `${n}px`;
  }
  return n;
}

function getTransformOrigin(position: MousePosition, style: CSSProperties) {
  const { offsetWidth = 0, scrollTop = 0, scrollLeft = 0 } =
    typeof window === 'undefined' ? {} : getDocument(window).documentElement;
  const { width = 520, left, top = 100 } = style;
  const { x, y } = position;
  const originX = `calc(${x}px - ${
    isNil(left) ? `(${offsetWidth}px - ${fixUnit(width)}) / 2` : `${fixUnit(left)}`
  } - ${scrollLeft}px)`;
  // const originX = isNil(left) ? `calc(${x}px - (${offsetWidth}px - ${width}px) / 2)` : `${x - (toPx(left) || 0)}px`;
  const originY = `calc(${y}px - ${fixUnit(top)} - ${scrollTop}px)`;
  // const originY = `${y - (toPx(top) || 0) - scrollTop}px`;
  return `${originX} ${originY}`;
}

const HANDLE_MIN_SIZE = 50;

export interface ModalProps extends ViewComponentProps {
  __deprecate__?: boolean;
  eventKey?: Key;
  children?: AsyncCmpLoadingFunction | ReactNode;
  closable?: boolean;
  movable?: boolean;
  fullScreen?: boolean;
  maskClosable?: boolean | 'click' | 'dblclick';
  maskStyle?: CSSProperties;
  autoCenter?: boolean;
  mask?: boolean;
  maskClassName?: string;
  keyboardClosable?: boolean;
  modalTitle?: ReactNode;
  header?: ((title: ReactNode, closeBtn: ReactNode, okBtn: ReactElement<ButtonProps>, cancelBtn: ReactElement<ButtonProps>) => ReactNode) | ReactNode | boolean;
  footer?: ((okBtn: ReactElement<ButtonProps>, cancelBtn: ReactElement<ButtonProps>, modalChildrenProps) => ReactNode) | ReactNode | boolean;
  destroyOnClose?: boolean;
  okText?: ReactNode;
  cancelText?: ReactNode;
  okProps?: ButtonProps;
  cancelProps?: ButtonProps;
  onClose?: () => Promise<boolean | undefined> | boolean | undefined | void;
  onOk?: () => Promise<boolean | undefined> | boolean | undefined | void;
  onCancel?: () => Promise<boolean | undefined> | boolean | undefined | void;
  afterClose?: () => void;
  close?: () => void;
  update?: (props?: ModalProps) => void;
  okButton?: boolean;
  cancelButton?: boolean;
  /**
   * @deprecated
   */
  okCancel?: boolean;
  drawer?: boolean;
  drawerOffset?: number;
  drawerTransitionName?: DrawerTransitionName;
  transitionAppear?: boolean;
  key?: Key;
  border?: boolean;
  drawerBorder?: boolean;
  okFirst?: boolean;
  active?: boolean;
  onTop?: (key?: Key) => void;
  mousePosition?: MousePosition | null;
  contentStyle?: CSSProperties;
  bodyStyle?: CSSProperties;
  closeOnLocationChange?: boolean;
  resizable?: boolean;
  customizable?: boolean;
  customizedCode?: string;
  beforeOpen?: () => void;
}

export default class Modal extends ViewComponent<ModalProps> {
  static displayName = 'Modal';

  static defaultProps = {
    suffixCls,
    mask: true,
    okButton: true,
    okCancel: true,
    destroyOnClose: true,
    fullScreen: false,
    drawer: false,
    drawerOffset: 150,
    autoFocus: true,
    closeOnLocationChange: true,
  };

  static key;

  static open;

  static preview;

  static confirm;

  static info;

  static success;

  static error;

  static warning;

  static destroyAll: () => void;

  mousePosition?: MousePosition | null;

  moveEvent: EventManager = new EventManager();

  okCancelEvent: EventManager = new EventManager();

  resizeEvent: EventManager = new EventManager();

  offset?: [number | string | undefined, number | string | undefined];

  cancelButton: Button | null;

  minWidth: number;

  minHeight: number;

  @observable tempCustomized: ModalCustomized;

  get okBtn(): ReactElement<ButtonProps> {
    const {
      okProps,
      okText = $l('Modal', 'ok'),
      drawer,
    } = this.props;
    const modalButtonProps = this.getContextConfig('modalButtonProps');
    const funcType: FuncType | undefined = drawer
      ? FuncType.raised
      : (this.getContextConfig('buttonFuncType') as FuncType);
    return (
      <Button
        key="ok"
        funcType={funcType}
        color={ButtonColor.primary}
        onClick={this.handleOk}
        {...modalButtonProps}
        {...okProps}
      >
        {okText}
      </Button>
    );
  }

  get cancelBtn(): ReactElement<ButtonProps> {
    const {
      cancelProps,
      cancelText = $l('Modal', 'cancel'),
      drawer,
    } = this.props;
    const modalButtonProps = this.getContextConfig('modalButtonProps');
    const funcType: FuncType | undefined = drawer
      ? FuncType.raised
      : (this.getContextConfig('buttonFuncType') as FuncType);

    return (
      <Button
        key="cancel"
        ref={this.saveCancelRef}
        funcType={funcType}
        onClick={this.handleCancel}
        {...modalButtonProps}
        {...cancelProps}
      >
        {cancelText}
      </Button>
    );
  }

  get drawerTransitionName(): DrawerTransitionName {
    const { drawerTransitionName = this.getContextConfig('drawerTransitionName') } = this.props;
    return toUsefulDrawerTransitionName(drawerTransitionName);
  }

  get drawerHeaderFooterCombined(): boolean {
    const { drawer } = this.props;
    return this.getContextConfig('drawerHeaderFooterCombined') && !!drawer;
  }

  get modalClosable(): boolean {
    if ('closable' in this.props) {
      return this.props.closable!;
    }
    return this.getContextConfig('modalClosable');
  }

  get doc(): Document {
    return getDocument(window);
  }

  get autoWidth(): boolean {
    const { contentStyle } = this.props;
    if (contentStyle && contentStyle.width) {
      return true;
    }
    return false;
  }

  contentNode: HTMLElement;

  sentinelStartRef: HTMLDivElement;

  sentinelEndRef: HTMLDivElement;

  childrenProps: ModalChildrenProps;

  constructor(props, context) {
    super(props, context);
    const { close = noop, update = noop } = props;
    this.childrenProps = {
      close,
      update,
      props,
      handleOk: this.registerOk,
      handleCancel: this.registerCancel,
    };
    this.loadCustomized();
  }

  componentDidMount() {
    super.componentDidMount();
    this.initResizableRange(this.props);
  }

  componentWillReceiveProps(nextProps: ModalProps, nextContext) {
    super.componentWillReceiveProps(nextProps, nextContext);
    if (!isEqual(this.props, nextProps)) {
      const { close = noop, update = noop, resizable: nextResizable = false } = nextProps;
      Object.assign(this.childrenProps, {
        close,
        update,
        props: nextProps,
      });

      if (nextResizable !== this.props.resizable) {
        this.initResizableRange(nextProps);
      }
    }
  }

  initResizableRange(props: ModalProps) {
    const { resizable, contentStyle, style } = props;
    if (resizable) {
      runInAction(() => {
        this.minWidth = style && toPx(style.minWidth) || contentStyle && toPx(contentStyle.minWidth) || (this.element as HTMLDivElement).getBoundingClientRect().width;
        this.minHeight = style && toPx(style.minHeight) || contentStyle && toPx(contentStyle.minHeight) || this.contentNode.offsetHeight;
      });
    }
  }

  @autobind
  saveCancelRef(node) {
    this.cancelButton = node;
  }

  @autobind
  handleKeyDown(e) {
    if (e.keyCode === KeyCode.ESC) {
      e.stopPropagation();
      const { cancelButton } = this;
      if (cancelButton && !cancelButton.disabled) {
        cancelButton.handleClickWait(e);
      } else {
        this.handleCancel();
      }
    }
    if (e.keyCode === KeyCode.TAB && !this.props.hidden) {
      this.changeActive(!e.shiftKey);
    }
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      '__deprecate__',
      'closable',
      'movable',
      'maskClosable',
      'maskStyle',
      'mask',
      'maskClassName',
      'keyboardClosable',
      'fullScreen',
      'title',
      'header',
      'footer',
      'close',
      'update',
      'okText',
      'cancelText',
      'okButton',
      'cancelButton',
      'okCancel',
      'onClose',
      'onOk',
      'onCancel',
      'destroyOnClose',
      'drawer',
      'drawerOffset',
      'drawerTransitionName',
      'transitionAppear',
      'afterClose',
      'okProps',
      'cancelProps',
      'border',
      'drawerBorder',
      'okFirst',
      'autoCenter',
      'mousePosition',
      'active',
      'onTop',
      'contentStyle',
      'bodyStyle',
      'closeOnLocationChange',
      'eventKey',
      'resizable',
      'customizable',
      'customizedCode',
      'beforeOpen',
    ]);
  }

  async loadCustomized() {
    const { getCustomizable } = this.context;
    const { customizable = getCustomizable('Modal'), customizedCode, drawer } = this.props;
    if (customizable && customizedCode) {
      const temp = await this.getContextConfig('customizedLoad')(customizedCode, 'Modal');
      if (temp) {
        const { contentNode, element, prefixCls } = this;
        runInAction(() => {
          if (drawer) {
            switch (this.drawerTransitionName) {
              case 'slide-right':
              case 'slide-left':
                delete temp.height;
                break;
              case 'slide-up':
              case 'slide-down':
                delete temp.width;
                break;
              default:
                break;
            }
          }
          this.tempCustomized = this.getTempCustomized(temp);
        });
        if (classes(element).has(`${prefixCls}-auto-center`)) {
          Object.assign(element.style, {
            bottom: 0,
            margin: 'auto',
          });
          if (contentNode) {
            Object.assign(contentNode.style, {
              height: 'inherit',
            });
          }
        }
        this.forceUpdate();
      }
    }
  }

  saveCustomized() {
    const { getCustomizable } = this.context;
    const { customizable = getCustomizable('Modal'), customizedCode } = this.props;
    if (customizable && customizedCode) {
      const customizedSave = this.getContextConfig('customizedSave');
      customizedSave(customizedCode, this.tempCustomized || {}, 'Modal');
    }
  }

  getTempCustomized(tempCustomized = this.tempCustomized) {
    const temp = {};
    if (tempCustomized) {
      const { element } = this;
      const isEmbedded = !!(element && element.offsetParent);
      Object.keys(tempCustomized).forEach(item => {
        temp[item] = isEmbedded ? tempCustomized[item] : math.floor(tempCustomized[item]);
      });
    }
    return temp;
  }

  getOtherProps() {
    const otherProps = super.getOtherProps();
    const { hidden, mousePosition, keyboardClosable = this.getContextConfig('modalKeyboard'), style = {}, drawer, onTop } = this.props;
    const currentStyle = { ...style, ...this.getTempCustomized() };
    if (keyboardClosable) {
      otherProps.autoFocus = true;
      otherProps.tabIndex = -1;
      otherProps.onKeyDown = this.handleKeyDown;
    }

    if (drawer) {
      otherProps.style = {
        ...currentStyle,
      };
    } else {
      const position = this.mousePosition || mousePosition;
      if (position) {
        this.mousePosition = position;
        otherProps.style = {
          ...currentStyle,
          transformOrigin: getTransformOrigin(position, currentStyle),
        };
      }
      if (hidden) {
        this.mousePosition = null;
      }
    }

    if (onTop) {
      otherProps.onMouseDown = this.handleMouseDown;
    }

    return otherProps;
  }

  @autobind
  contentReference(node) {
    this.contentNode = node;
  }

  @autobind
  sentinelStartReference(node) {
    this.sentinelStartRef = node;
  }

  @autobind
  sentinelEndReference(node) {
    this.sentinelEndRef = node;
  }

  getClassName(): string | undefined {
    const {
      prefixCls,
      autoWidth,
      props: {
        style = this.tempCustomized || {},
        fullScreen,
        drawer,
        size,
        active,
        border = this.getContextConfig('modalSectionBorder'),
        drawerBorder = this.getContextConfig('drawerSectionBorder'),
        autoCenter = this.getContextConfig('modalAutoCenter'),
      },
    } = this;

    const center = !drawer && !this.offset;

    return super.getClassName({
      [`${prefixCls}-center`]: center && !('left' in style || 'right' in style),
      [`${prefixCls}-fullscreen`]: fullScreen,
      [`${prefixCls}-drawer`]: drawer,
      [`${prefixCls}-border`]: drawer ? drawerBorder : border,
      [`${prefixCls}-drawer-${toUsefulDrawerTransitionName(this.drawerTransitionName)}`]: drawer,
      [`${prefixCls}-auto-center`]: autoCenter && center && !fullScreen,
      [`${prefixCls}-${size}`]: size,
      [`${prefixCls}-active`]: active,
      [`${prefixCls}-auto-width`]: autoWidth,
    });
  }

  getDrawerOffset(drawerTransitionName): number {
    const { style } = this.props;
    if (style) {
      switch (drawerTransitionName) {
        case 'slide-right':
          return toPx(style.marginRight) || 0;
        case 'slide-left':
          return toPx(style.marginLeft) || 0;
        case 'slide-up':
          return toPx(style.marginTop) || 0;
        case 'slide-down':
          return toPx(style.marginBottom) || 0;
        default:
          return toPx(style.marginRight) || 0;
      }
    }
    return 0;
  }

  @autobind
  handleResize(e) {
    e.persist();
    const { drawer, fullScreen } = this.props;
    if (e.target && !fullScreen && this.contentNode) {
      const mousemove = !drawer ? this.handleModalMouseResize(e) : this.handleDrawerMouseResize(e);
      if (mousemove) {
        const maskDiv: HTMLDivElement = document.createElement('div');
        maskDiv.className = `${this.prefixCls}-resizer-mask`;
        this.element.appendChild(maskDiv);
        const handleMouseUp = () => {
          const { width, height } = (this.element as HTMLDivElement).getBoundingClientRect();
          const { offsetWidth: embeddedOffsetWidth, offsetHeight: embeddedOffsetHeight } = this.element.offsetParent || {};
          runInAction(() => {
            const temp: ModalCustomized = {
              width: pxToPercent(width, embeddedOffsetWidth),
              height: pxToPercent(height, embeddedOffsetHeight),
            };
            if (drawer) {
              switch (this.drawerTransitionName) {
                case 'slide-left':
                case 'slide-right':
                  delete temp.height;
                  break;
                case 'slide-up':
                case 'slide-down':
                  delete temp.width;
                  break;
                default:
                  break;
              }
            }
            this.tempCustomized = temp;
          });
          this.saveCustomized();
          this.element.removeChild(maskDiv);
          this.resizeEvent
            .removeEventListener('mousemove', mousemove)
            .removeEventListener('mouseup', handleMouseUp);
        };
        this.resizeEvent.setTarget(this.doc)
          .addEventListener('mousemove', mousemove)
          .addEventListener('mouseup', handleMouseUp);
      }
    }
  }

  handleModalMouseResize(e) {
    const {
      contentNode,
      element,
      element: { offsetParent },
      minHeight,
      minWidth,
      prefixCls,
      props: { drawer, autoCenter = this.getContextConfig('modalAutoCenter') },
    } = this;
    const { clientWidth: docClientWidth, clientHeight: docClientHeight } = this.doc.documentElement || this.doc.body;
    const clientX = transformZoomData(e.clientX);
    const clientY = transformZoomData(e.clientY);
    const { offsetHeight: contentHeight, offsetWidth: contentWidth, offsetTop: contentTop } = contentNode;
    const { offsetWidth: embeddedOffsetWidth, offsetHeight: embeddedOffsetHeight } = offsetParent || {};
    const clzz = classes(element);
    const startX = clientX - contentWidth;
    const startY = clientY - contentHeight;
    let { left: elementLeft, top: elementTop } = (element as HTMLDivElement).getBoundingClientRect();
    // modal模式需存在坐标
    if (!drawer && !this.offset && clzz.has(`${prefixCls}-center`)) {
      if (offsetParent) {
        elementTop = element.offsetTop;
        elementLeft = element.offsetLeft;
      }
      this.offset = [pxToRem(elementLeft), pxToRem(autoCenter && contentTop ? contentTop : elementTop)];
      clzz.remove(`${prefixCls}-center`).remove(`${prefixCls}-auto-center`);
      Object.assign(element.style, {
        left: this.offset[0],
        top: this.offset[1],
        margin: 'initial',
      });
    }
    return (me) => {
      const width = transformZoomData(me.clientX) - startX;
      const height = transformZoomData(me.clientY) - startY;
      Object.assign(element.style, {
        width: pxToRem(getMath(width, minWidth, embeddedOffsetWidth || docClientWidth)),
        height: pxToRem(getMath(height, minHeight, embeddedOffsetHeight || docClientHeight)),
      });
    };
  }

  handleDrawerMouseResize(e) {
    const {
      contentNode,
      drawerTransitionName,
      element,
      element: { offsetParent, offsetLeft: elementOffsetTop, offsetTop: elementOffsetLeft },
      minWidth,
      minHeight,
    } = this;
    const { clientWidth: docClientWidth, clientHeight: docClientHeight } = this.doc.documentElement || this.doc.body;
    const { offsetWidth: embeddedOffsetWidth, offsetHeight: embeddedOffsetHeight } = offsetParent || {};
    const drawerOffset = this.getDrawerOffset(drawerTransitionName);
    const maxWidth = (embeddedOffsetWidth || docClientWidth) - drawerOffset;
    const maxHeight = (embeddedOffsetHeight || docClientHeight) - drawerOffset;
    let { offsetHeight: height, offsetWidth: width } = contentNode;
    return (me) => {
      let clientX = transformZoomData(me.clientX);
      let clientY = transformZoomData(me.clientY);
      if (offsetParent) {
        clientX = elementOffsetTop + clientX - transformZoomData(e.clientX);
        clientY = elementOffsetLeft + clientY - transformZoomData(e.clientY);
      }
      switch (drawerTransitionName) {
        case 'slide-right':
          width = getMath(maxWidth - clientX, minWidth, maxWidth);
          break;
        case 'slide-left':
          width = getMath(clientX - drawerOffset, minWidth, maxWidth);
          break;
        case 'slide-up':
          height = getMath(clientY - drawerOffset, minHeight, maxHeight);
          break;
        case 'slide-down':
          height = getMath(maxHeight - clientY, minHeight, maxHeight);
          break;
        default:
          break;
      }
      Object.assign(element.style, {
        width: pxToRem(width),
        height: pxToRem(height),
      });
    };
  }

  render() {
    const {
      prefixCls,
      drawerHeaderFooterCombined,
      drawerTransitionName,
      props: { contentStyle, drawer, resizable = this.getContextConfig('modalResizable'), fullScreen },
    } = this;
    const header = this.getHeader();
    const body = this.getBody();
    const footer = this.getFooter();
    const resizerPrefixCls = `${prefixCls}-resizer`;
    const resizerCursorCls = `${resizerPrefixCls}-cursor`;
    const sentinelStyle = { width: 0, height: 0, overflow: 'hidden', outline: 'none' };
    return (
      <div {...this.getMergedProps()}>
        <div tabIndex={0} ref={this.sentinelStartReference} style={sentinelStyle} aria-hidden="true" />
        <div
          ref={this.contentReference}
          className={classNames(`${prefixCls}-content`, {
            [`${prefixCls}-drawer-content`]: drawer,
            [`${resizerPrefixCls}-content`]: resizable,
          })}
          style={contentStyle}
        >
          {header}
          {body}
          {drawerHeaderFooterCombined ? null : footer}
          {
            resizable && <div
              className={classNames(resizerCursorCls, {
                [`${resizerCursorCls}-modal`]: !drawer && !fullScreen,
                [`${resizerCursorCls}-drawer-right`]: drawer && drawerTransitionName === 'slide-right',
                [`${resizerCursorCls}-drawer-left`]: drawer && drawerTransitionName === 'slide-left',
                [`${resizerCursorCls}-drawer-up`]: drawer && drawerTransitionName === 'slide-up',
                [`${resizerCursorCls}-drawer-down`]: drawer && drawerTransitionName === 'slide-down',
              })}
              onMouseDown={this.handleResize}
            >
              {drawer ? <div className={`${resizerCursorCls}-line`} /> :
                <span className={`${resizerCursorCls}-icon`} />}
            </div>
          }
        </div>
        <div tabIndex={0} ref={this.sentinelEndReference} style={sentinelStyle} aria-hidden="true" />
      </div>
    );
  }

  focus(): void {
    this.sentinelStartRef.focus();
  }

  changeActive(next) {
    const { activeElement } = this.doc;
    if (next && activeElement === this.sentinelEndRef) {
      this.sentinelStartRef.focus();
    } else if (!next && activeElement === this.sentinelStartRef) {
      this.sentinelEndRef.focus();
    }
  }
  

  componentWillUpdate({ hidden }) {
    if (hidden === false && hidden !== this.props.hidden) {
      defer(() => this.focus());
    }
  }

  componentWillUnmount() {
    this.moveEvent.clear();
    this.okCancelEvent.clear();
    this.resizeEvent.clear();
  }

  @autobind
  handleMouseDown(e) {
    const { onMouseDown = noop, onTop = noop, eventKey } = this.props;
    onMouseDown(e);
    if (!e.isDefaultPrevented()) {
      onTop(eventKey);
    }
  }

  @autobind
  handleHeaderMouseDown(downEvent: ReactMouseEvent<HTMLDivElement, MouseEvent>) {
    const { element, contentNode, props: { autoCenter = this.getContextConfig('modalAutoCenter') } } = this;
    if (element && contentNode) {
      const { prefixCls } = this;
      const {
        clientWidth: docClientWidth,
        clientHeight: docClientHeight,
      } = this.doc.documentElement || this.doc.body;
      const { currentTarget } = downEvent;
      const clientX = transformZoomData(downEvent.clientX);
      const clientY = transformZoomData(downEvent.clientY);
      const clzz = classes(element);
      const { offsetParent } = element;
      const {
        scrollTop = 0,
        scrollLeft = 0,
        clientWidth = 0,
        clientHeight = 0,
      } = offsetParent || {};
      const { offsetWidth: headerWidth, offsetHeight: headerHeight } = currentTarget;
      if (clzz.has(`${prefixCls}-auto-center`)) {
        clzz.remove(`${prefixCls}-auto-center`).remove(`${prefixCls}-center`);
        const {
          offsetWidth,
          offsetHeight,
        } = element;
        const isEmbedded = !!(element && element.offsetParent);
        const top = pxToRem(
          isEmbedded ? (clientHeight - offsetHeight) / 2 + scrollTop : (docClientHeight - offsetHeight) / 2,
          true,
        );
        const left = pxToRem(
          isEmbedded ? (clientWidth - offsetWidth) / 2 + scrollLeft : (docClientWidth - offsetWidth) / 2,
          true,
        );
        this.offset = [left, top];
        Object.assign(element.style, { top, left });
      }
      const  { offsetLeft } = element;
      const  offsetTop = autoCenter && clzz.has(`${prefixCls}-auto-center`) ? scrollTop + contentNode.offsetTop : element.offsetTop;
      this.moveEvent
        .setTarget(this.doc)
        .addEventListener('mousemove', (moveEvent: MouseEvent) => {
          const moveX = transformZoomData(moveEvent.clientX);
          const moveY = transformZoomData(moveEvent.clientY);
          clzz.remove(`${prefixCls}-center`);
          const left = pxToRem(
            Math.min(
              Math.max(
                offsetLeft + moveX - clientX,
                scrollLeft - headerWidth + HANDLE_MIN_SIZE,
              ),
              scrollLeft + docClientWidth - HANDLE_MIN_SIZE,
            ),
            true,
          );
          const top = pxToRem(
            Math.min(
              Math.max(
                offsetTop + moveY - clientY,
                scrollTop - headerHeight + HANDLE_MIN_SIZE,
              ),
              scrollTop + docClientHeight - HANDLE_MIN_SIZE,
            ),
            true,
          );
          this.offset = [left, top];
          Object.assign(element.style, {
            left,
            top,
          });
        })
        .addEventListener('mouseup', () => {
          this.moveEvent.clear();
        });
    }
  }

  @autobind
  async handleOk() {
    const { onOk = noop } = this.props;
    const promise = Promise.all([onOk(), this.okCancelEvent.fireEvent('ok')]);
    try {
      const [ret1, ret2] = await promise;
      if (ret1 !== false && ret2) {
        this.close();
      }
    } catch (e) {
      if (!(e instanceof DataSetRequestError)) {
        message.error(exception(e));
      }
      throw e;
    }
  }

  @autobind
  async handleCancel() {
    const { onCancel = noop } = this.props;
    const promise = Promise.all([onCancel(), this.okCancelEvent.fireEvent('cancel')]);
    try {
      const [ret1, ret2] = await promise;
      if (ret1 !== false && ret2) {
        this.close();
      }
    } catch (e) {
      if (!(e instanceof DataSetRequestError)) {
        message.error(exception(e));
      }
      throw e;
    }
  }

  getHeader(): ReactNode {
    const {
      header = this.getDefaultHeader,
      title,
    } = this.props;

    if (typeof header === 'function') {
      const closeButton = this.getCloseButton();
      return this.getWrappedHeader(header(title, closeButton, this.okBtn, this.cancelBtn));
    }

    if (!isNil(header)) {
      return this.getWrappedHeader(header);
    }
  }

  getWrappedHeader(header: ReactNode): ReactNode {
    const {
      drawerHeaderFooterCombined,
      prefixCls,
      props: { title, movable = this.getContextConfig('modalMovable'), fullScreen, drawer },
      modalClosable,
    } = this;
    const footer = this.getFooter();

    if (title || modalClosable || movable || header) {
      const headerProps: any = {
        className: classNames(`${prefixCls}-header`, {
          [`${prefixCls}-movable`]: movable && !fullScreen && !drawer,
          [`${prefixCls}-title-none`]: !title,
          [`${prefixCls}-drawer-header`]: drawer,
          [`${prefixCls}-drawer-header-combined`]: drawerHeaderFooterCombined,
        }),
      };
      if (movable && !fullScreen && !drawer) {
        headerProps.onMouseDown = this.handleHeaderMouseDown;
      }
      return (
        <div {...headerProps}>
          {header}
          {drawerHeaderFooterCombined ? footer : null}
        </div>
      );
    }
  }

  getCloseButton(): ReactNode {
    const {
      prefixCls,
      modalClosable,
    } = this;
    if (modalClosable) {
      return (
        <button type="button" className={`${prefixCls}-header-button`} onClick={this.handleCancel}>
          <Icon type="close" />
        </button>
      );
    }
  }

  getBody(): ReactNode {
    const { children } = this.props;
    return this.renderChildren(
      typeof children === 'function'
        ? asyncComponent(children as AsyncCmpLoadingFunction)
        : children,
    );
  }

  getFooter(): ReactNode {
    const {
      footer = this.getDefaultFooter,
    } = this.props;

    if (typeof footer === 'function') {
      return this.getWrappedFooter(footer(this.okBtn, this.cancelBtn, this.childrenProps));
    }

    if (!isNil(footer)) {
      return this.getWrappedFooter(footer);
    }
  }

  getWrappedFooter(footer: ReactNode) {
    const { prefixCls, drawerHeaderFooterCombined } = this;

    const { drawer } = this.props;

    const className = classNames({
      [`${prefixCls}-footer`]: !drawerHeaderFooterCombined,
      [`${prefixCls}-footer-drawer`]: drawer && !drawerHeaderFooterCombined, // deprecate
      [`${prefixCls}-drawer-footer`]: drawer && !drawerHeaderFooterCombined,
      [`${prefixCls}-drawer-header-buttons-footer`]: drawerHeaderFooterCombined,
    });
    return <div className={className}>{footer}</div>;
  }

  getDefaultHeader = (title, closeButton: ReactNode, _okBtn: ReactElement<ButtonProps>, _cancelBtn: ReactElement<ButtonProps>) => {
    const {
      prefixCls,
      drawerHeaderFooterCombined,
      modalClosable,
    } = this;
    if (title || closeButton) {
      return drawerHeaderFooterCombined ? (
        <div className={`${prefixCls}-drawer-header-combined`}>
          {modalClosable ? (
            <button type="button" className={`${prefixCls}-header-button ${prefixCls}-header-button-navigate`} onClick={this.handleCancel}>
              <Icon type="navigate_next" />
            </button>
          ) : null}
          <div className={`${prefixCls}-title`}>{title}</div>
        </div>
      ) : (
        <>
          <div className={`${prefixCls}-title`}>{title}</div>
          <div className={`${prefixCls}-header-buttons`}>
            {closeButton}
          </div>
        </>
      );
    }
  };

  getDefaultFooter = (okBtn: ReactElement<ButtonProps>, cancelBtn: ReactElement<ButtonProps>, _modalChildrenProps: ModalChildrenProps) => {
    const { okCancel, okButton, cancelButton = okCancel !== false, okFirst = this.getContextConfig('modalOkFirst'), drawer } = this.props;
    const buttons: ReactNode[] = [];
    if (okButton !== false) {
      buttons.push(okBtn);
    }
    if (cancelButton !== false) {
      const drawerOkFirst = this.getContextConfig('drawerOkFirst');
      if (drawer && !isNil(drawerOkFirst)) {
        if (drawerOkFirst) {
          buttons.push(cancelBtn);
        } else {
          buttons.unshift(cancelBtn);
        }
      } else if (okFirst) {
        buttons.push(cancelBtn);
      } else {
        buttons.unshift(cancelBtn);
      }
    }
    return <div>{buttons}</div>;
  };

  registerOk = ok => {
    this.okCancelEvent.removeEventListener('ok');
    this.okCancelEvent.addEventListener('ok', ok);
  };

  registerCancel = cancel => {
    this.okCancelEvent.removeEventListener('cancel');
    this.okCancelEvent.addEventListener('cancel', cancel);
  };

  renderChildren(children: ReactNode): ReactNode {
    if (children) {
      const { prefixCls, props } = this;
      const { bodyStyle, drawer } = props;
      return (
        <div className={classNames(`${prefixCls}-body`, { [`${prefixCls}-drawer-body`]: drawer })} style={bodyStyle}>
          {isValidElement(children) ? cloneElement<any>(children, { modal: this.childrenProps }) : children}
        </div>
      );
    }
  }

  @autobind
  close() {
    const { close = noop } = this.props;
    close();
  }
}
