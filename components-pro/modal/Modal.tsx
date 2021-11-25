import React, { cloneElement, CSSProperties, isValidElement, Key, MouseEvent as ReactMouseEvent, ReactElement, ReactNode } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import defer from 'lodash/defer';
import noop from 'lodash/noop';
import isNil from 'lodash/isNil';
import isNumber from 'lodash/isNumber';
import classNames from 'classnames';
import classes from 'component-classes';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import ViewComponent, { ViewComponentProps } from '../core/ViewComponent';
import Icon from '../icon';
import autobind from '../_util/autobind';
import Button, { ButtonProps } from '../button/Button';
import EventManager from '../_util/EventManager';
import isEmpty from '../_util/isEmpty';
import { ButtonColor, FuncType } from '../button/enum';
import asyncComponent, { AsyncCmpLoadingFunction } from '../_util/AsyncComponent';
import message from '../message';
import exception from '../_util/exception';
import { $l } from '../locale-context';
import DataSetRequestError from '../data-set/DataSetRequestError';
import { suffixCls, toUsefulDrawerTransitionName } from './utils';
import { modalChildrenProps } from './interface';
import { getDocument, MousePosition } from '../_util/DocumentUtils';

export type DrawerTransitionName = 'slide-up' | 'slide-right' | 'slide-down' | 'slide-left';

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
}

export default class Modal extends ViewComponent<ModalProps> {
  static displayName = 'Modal';

  static propTypes = {
    ...ViewComponent.propTypes,
    closable: PropTypes.bool,
    movable: PropTypes.bool,
    fullScreen: PropTypes.bool,
    maskClosable: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    maskStyle: PropTypes.object,
    mask: PropTypes.bool,
    maskClassName: PropTypes.string,
    keyboardClosable: PropTypes.bool,
    footer: PropTypes.oneOfType([PropTypes.func, PropTypes.node, PropTypes.bool]),
    destroyOnClose: PropTypes.bool,
    okText: PropTypes.node,
    cancelText: PropTypes.node,
    okProps: PropTypes.object,
    autoCenter: PropTypes.bool,
    cancelProps: PropTypes.object,
    onClose: PropTypes.func,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    afterClose: PropTypes.func,
    okButton: PropTypes.bool,
    cancelButton: PropTypes.bool,
    okCancel: PropTypes.bool,
    drawer: PropTypes.bool,
    drawerOffset: PropTypes.number,
    drawerTransitionName: PropTypes.oneOf(['slide-up', 'slide-right', 'slide-down', 'slide-up', 'slide-left']),
    okFirst: PropTypes.bool,
    mousePosition: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
    contentStyle: PropTypes.object,
    bodyStyle: PropTypes.object,
    closeOnLocationChange: PropTypes.bool,
  };

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

  offset?: [number | string | undefined, number | string | undefined];

  cancelButton: Button | null;

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
  }

  shouldComponentUpdate(nextProps: Readonly<ModalProps>): boolean {
    const { props } = this;
    return Object.keys(props).some(key => props[key] !== nextProps[key] && (key !== 'mousePosition' || !this.mousePosition || !nextProps.drawer));
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
    ]);
  }

  getOtherProps() {
    const otherProps = super.getOtherProps();
    const { hidden, mousePosition, keyboardClosable = this.getContextConfig('modalKeyboard'), style = {}, drawer, onTop } = this.props;
    if (keyboardClosable) {
      otherProps.autoFocus = true;
      otherProps.tabIndex = -1;
      otherProps.onKeyDown = this.handleKeyDown;
    }
    if (!drawer) {
      const position = this.mousePosition || mousePosition;
      if (position) {
        this.mousePosition = position;
        otherProps.style = {
          ...style,
          transformOrigin: getTransformOrigin(position, style),
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
        style = {},
        fullScreen,
        drawer,
        drawerTransitionName = this.getContextConfig('drawerTransitionName'),
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
      [`${prefixCls}-drawer-${toUsefulDrawerTransitionName(drawerTransitionName)}`]: drawer,
      [`${prefixCls}-auto-center`]: autoCenter && center && !fullScreen,
      [`${prefixCls}-${size}`]: size,
      [`${prefixCls}-active`]: active,
    });
  }

  render() {
    const { prefixCls, props: { contentStyle, drawer } } = this;
    const header = this.getHeader();
    const body = this.getBody();
    const footer = this.getFooter();
    return (
      <div {...this.getMergedProps()}>
        <div
          ref={this.contentReference}
          className={classNames(`${prefixCls}-content`, { [`${prefixCls}-drawer-content`]: drawer })}
          style={contentStyle}
        >
          {header}
          {body}
          {footer}
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
      const { clientX, clientY, currentTarget } = downEvent;
      const clzz = classes(element);
      const { offsetLeft, offsetParent } = element;
      const {
        scrollTop = 0, scrollLeft = 0,
        offsetHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
        offsetWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
      } = offsetParent || {};
      const offsetTop = autoCenter && clzz.has(`${prefixCls}-auto-center`) ? scrollTop + contentNode.offsetTop : element.offsetTop;
      const { offsetWidth: headerWidth, offsetHeight: headerHeight } = currentTarget;
      this.moveEvent
        .setTarget(getDocument(window))
        .addEventListener('mousemove', (moveEvent: MouseEvent) => {
          const { clientX: moveX, clientY: moveY } = moveEvent;
          clzz.remove(`${prefixCls}-center`).remove(`${prefixCls}-auto-center`);
          const left = pxToRem(
            Math.min(
              Math.max(
                offsetLeft + moveX - clientX,
                scrollLeft - headerWidth + HANDLE_MIN_SIZE,
              ),
              scrollLeft + offsetWidth - HANDLE_MIN_SIZE,
            ),
          );
          const top = pxToRem(
            Math.min(
              Math.max(
                offsetTop + moveY - clientY,
                scrollTop - headerHeight + HANDLE_MIN_SIZE,
              ),
              scrollTop + offsetHeight - HANDLE_MIN_SIZE,
            ),
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

    if (!isEmpty(header, true)) {
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

    if (!isEmpty(footer, true)) {
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
