import React, { cloneElement, CSSProperties, isValidElement, Key, MouseEvent as ReactMouseEvent, ReactElement, ReactNode } from 'react';
import isEqual from 'lodash/isEqual';
import defer from 'lodash/defer';
import noop from 'lodash/noop';
import isNil from 'lodash/isNil';
import isNumber from 'lodash/isNumber';
import classNames from 'classnames';
import classes from 'component-classes';
import { pxToRem, toPx } from 'choerodon-ui/lib/_util/UnitConvertor';
import { observable, runInAction } from 'mobx';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { getCustomizable } from 'choerodon-ui/lib/configure/utils';
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
import { modalChildrenProps, ModalCustomized } from './interface';
import { getDocument, MousePosition } from '../_util/DocumentUtils';

export type DrawerTransitionName = 'slide-up' | 'slide-right' | 'slide-down' | 'slide-left';

function getMath(value, min, max) {
  return Math.min(
    Math.max(
      value,
      min,
    ),
    max,
  )
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
  children?: any;
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
  onClose?: () => Promise<boolean | undefined> | boolean | undefined;
  onOk?: () => Promise<boolean | undefined> | boolean | undefined;
  onCancel?: () => Promise<boolean | undefined> | boolean | undefined;
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
}

export default class Modal extends ViewComponent<ModalProps> {
  static displayName = 'Modal';

  static defaultProps = {
    suffixCls,
    closable: false,
    movable: true,
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

  @observable tempCustomized: ModalCustomized | null | undefined;

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

  get doc(): Document {
    return getDocument(window);
  }

  contentNode: HTMLElement;

  childrenProps: modalChildrenProps;

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
    const { contentStyle, resizable = this.getContextConfig('modalResizable'), style } = this.props;
    if (resizable) {
      runInAction(() => {
        this.minWidth = style && toPx(style.minWidth) || contentStyle && toPx(contentStyle.minWidth) || (this.element as HTMLDivElement).getBoundingClientRect().width;
        this.minHeight = style && toPx(style.minHeight) || contentStyle && toPx(contentStyle.minHeight) || this.contentNode.offsetHeight;
      });
    }
  }

  componentWillReceiveProps(nextProps: ModalProps, nextContext) {
    super.componentWillReceiveProps(nextProps, nextContext);
    if (!isEqual(this.props, nextProps)) {
      const { close = noop, update = noop } = nextProps;
      Object.assign(this.childrenProps, {
        close,
        update,
        props: nextProps,
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
      const { cancelButton } = this;
      if (cancelButton && !cancelButton.disabled) {
        cancelButton.handleClickWait(e);
      } else {
        this.handleCancel();
      }
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
    ]);
  }

  async loadCustomized() {
    const { customizable = getCustomizable('Modal'), customizedCode, resizable = this.getContextConfig('modalResizable') } = this.props;
    if (resizable && customizable && customizedCode) {
      const temp = await this.getContextConfig('customizedLoad')(customizedCode, 'Modal');
      if (temp) {
        const { contentNode, element, prefixCls } = this;
        runInAction(() => {
          this.tempCustomized = temp;
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
    const { customizable = getCustomizable('Modal'), customizedCode, resizable = this.getContextConfig('modalResizable') } = this.props;
    if (resizable && customizable && customizedCode) {
      const customizedSave = this.getContextConfig('customizedSave');
      customizedSave(customizedCode, this.tempCustomized || {}, 'Modal');
    }
  }

  getOtherProps() {
    const otherProps = super.getOtherProps();
    const { hidden, mousePosition, keyboardClosable = this.getContextConfig('modalKeyboard'), style = {}, drawer, onTop } = this.props;
    const currentStyle = { ...style, ...this.tempCustomized };
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

  getClassName(): string | undefined {
    const {
      prefixCls,
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
    });
  }

  @autobind
  handleResize(e) {
    e.persist();
    const { drawer, fullScreen } = this.props;
    if (e.target && !fullScreen && this.contentNode) {
      const mousemove = !drawer ? this.handleModalMouseResize(e) : this.handleDrawerMouseResize(e);
      if (mousemove) {
        const handleMouseUp = () => {
          const { width, height } = (this.element as HTMLDivElement).getBoundingClientRect();
          runInAction(() => {
            this.tempCustomized = { width, height };
          });
          this.saveCustomized();
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
    const { contentNode, element, element: { offsetParent }, minHeight, minWidth, prefixCls, props: { drawer, autoCenter = this.getContextConfig('modalAutoCenter') } } = this;
    const { clientWidth: docClientWidth, clientHeight: docClientHeight } = this.doc.documentElement || this.doc.body;
    const { clientX, clientY } = e;
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
      const width = me.clientX - startX;
      const height = me.clientY - startY;
      Object.assign(element.style, {
        width: pxToRem(getMath(width, minWidth, embeddedOffsetWidth || docClientWidth)),
        height: pxToRem(getMath(height, minHeight, embeddedOffsetHeight || docClientHeight)),
      });
    };
  }

  handleDrawerMouseResize(e) {
    const { contentNode, drawerTransitionName, element, element: { offsetParent, offsetLeft: elementOffsetTop, offsetTop: elementOffsetLeft }, minWidth, minHeight } = this;
    const { clientWidth: docClientWidth, clientHeight: docClientHeight } = this.doc.documentElement || this.doc.body;
    const { offsetWidth: embeddedOffsetWidth, offsetHeight: embeddedOffsetHeight } = offsetParent || {};
    const maxWidth = embeddedOffsetWidth || docClientWidth;
    const maxHeight = embeddedOffsetHeight || docClientHeight;
    let { offsetHeight: height, offsetWidth: width } = contentNode;
    return (me) => {
      let { clientX, clientY } = me;
      if (offsetParent) {
        clientX = elementOffsetTop + me.clientX - e.clientX;
        clientY = elementOffsetLeft + me.clientY - e.clientY;
      }
      switch (drawerTransitionName) {
        case 'slide-right':
          width = getMath(maxWidth - clientX, minWidth, maxWidth);
          break;
        case 'slide-left':
          width = getMath(clientX, minWidth, maxWidth);
          break;
        case 'slide-up':
          height = getMath(clientY, minHeight, maxHeight);
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
    const { prefixCls, drawerTransitionName, props: { contentStyle, drawer, resizable = this.getContextConfig('modalResizable'), fullScreen } } = this;
    const header = this.getHeader();
    const body = this.getBody();
    const footer = this.getFooter();
    const resizerPrefixCls = `${prefixCls}-resizer`;
    const resizerCursorCls = `${resizerPrefixCls}-cursor`;
    return (
      <div {...this.getMergedProps()}>
        <div
          ref={this.contentReference}
          className={classNames(`${prefixCls}-content`, { [`${prefixCls}-drawer-content`]: drawer, [`${resizerPrefixCls}-content`]: resizable })}
          style={contentStyle}
        >
          {header}
          {body}
          {footer}
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
              {drawer ? <div className={`${resizerCursorCls}-line`} /> : <span className={`${resizerCursorCls}-icon`} />}
            </div>
          }
        </div>
      </div>
    );
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
      const { clientWidth: docClientWidth, clientHeight: docClientHeight } = this.doc.documentElement || this.doc.body;
      const { clientX, clientY, currentTarget } = downEvent;
      const clzz = classes(element);
      const { offsetLeft, offsetParent } = element;
      const {
        scrollTop = 0, scrollLeft = 0,
      } = offsetParent || {};
      const offsetTop = autoCenter && clzz.has(`${prefixCls}-auto-center`) ? scrollTop + contentNode.offsetTop : element.offsetTop;
      const { offsetWidth: headerWidth, offsetHeight: headerHeight } = currentTarget;
      this.moveEvent
        .setTarget(this.doc)
        .addEventListener('mousemove', (moveEvent: MouseEvent) => {
          const { clientX: moveX, clientY: moveY } = moveEvent;
          clzz.remove(`${prefixCls}-center`).remove(`${prefixCls}-auto-center`);
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
      prefixCls,
      props: { title, closable, movable, fullScreen, drawer },
    } = this;
    if (title || closable || movable || header) {
      const headerProps: any = {
        className: classNames(`${prefixCls}-header`, {
          [`${prefixCls}-movable`]: movable && !fullScreen && !drawer,
          [`${prefixCls}-title-none`]: !title,
          [`${prefixCls}-drawer-header`]: drawer,
        }),
      };
      if (movable && !fullScreen && !drawer) {
        headerProps.onMouseDown = this.handleHeaderMouseDown;
      }
      return (
        <div {...headerProps}>
          {header}
        </div>
      );
    }
  }

  getCloseButton(): ReactNode {
    const {
      prefixCls,
      props: { closable },
    } = this;
    if (closable) {
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
    const { prefixCls } = this;

    const { drawer } = this.props;

    const className = classNames(`${prefixCls}-footer`, {
      [`${prefixCls}-footer-drawer`]: drawer, // deprecate
      [`${prefixCls}-drawer-footer`]: drawer,
    });
    return <div className={className}>{footer}</div>;
  }

  getDefaultHeader = (title, closeButton: ReactNode, _okBtn: ReactElement<ButtonProps>, _cancelBtn: ReactElement<ButtonProps>) => {
    const { prefixCls } = this;
    if (title || closeButton) {
      return (
        <>
          <div className={`${prefixCls}-title`}>{title}</div>
          <div className={`${prefixCls}-header-buttons`}>
            {closeButton}
          </div>
        </>
      );
    }
  };

  getDefaultFooter = (okBtn: ReactElement<ButtonProps>, cancelBtn: ReactElement<ButtonProps>, _modalChildrenProps: modalChildrenProps) => {
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
