import React, { cloneElement, CSSProperties, isValidElement, Key, ReactElement, ReactNode } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import defer from 'lodash/defer';
import noop from 'lodash/noop';
import isNil from 'lodash/isNil';
import isNumber from 'lodash/isNumber';
import classNames from 'classnames';
import classes from 'component-classes';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import { getConfig } from 'choerodon-ui/lib/configure';
import { MousePosition } from '../modal-manager';
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
import { suffixCls } from './utils';
import { modalChildrenProps } from './interface';

function fixUnit(n) {
  if (isNumber(n)) {
    return `${n}px`;
  }
  return n;
}

function getTransformOrigin(position: MousePosition, style: CSSProperties) {
  const { offsetWidth = 0, scrollTop = 0, scrollLeft = 0 } =
    typeof window === 'undefined' ? {} : document.documentElement;
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

export interface ModalProps extends ViewComponentProps {
  closable?: boolean;
  movable?: boolean;
  fullScreen?: boolean;
  maskClosable?: boolean | 'click' | 'dblclick';
  maskStyle?: CSSProperties;
  autoCenter?: boolean;
  mask?: boolean,
  maskClassName?: string,
  keyboardClosable?: boolean;
  header?: ((title: ReactNode, closeBtn: ReactNode, okBtn: ReactElement<Button>, cancelBtn: ReactElement<Button>) => ReactNode) | ReactNode | boolean;
  footer?: ((okBtn: ReactElement<Button>, cancelBtn: ReactElement<Button>) => ReactNode) | ReactNode | boolean;
  destroyOnClose?: boolean;
  okText?: ReactNode;
  cancelText?: ReactNode;
  okProps?: ButtonProps;
  cancelProps?: ButtonProps;
  onClose?: () => Promise<boolean | undefined>;
  onOk?: () => Promise<boolean | undefined>;
  onCancel?: () => Promise<boolean | undefined>;
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
  drawerTransitionName?: 'slide-up' | 'slide-right' | 'slide-down' | 'slide-left';
  key?: Key;
  border?: boolean;
  drawerBorder?: boolean;
  okFirst?: boolean;
  keyboard?: boolean;
  active?: boolean;
  mousePosition?: MousePosition | null;
  contentStyle?: CSSProperties;
  bodyStyle?: CSSProperties;
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
    // title: PropTypes.node,
    // 此处原本允许title传入node，但是类型为PropTypes.node时无法正确继承ViewComponent
    // 父类中的title指的是HTML元素的title属性，此处title指modal标题，产生歧义，暂时设置为string
    // TODO: 添加modalTitle属性替代此处的title
    title: PropTypes.string,
    okFirst: PropTypes.bool,
    keyboard: PropTypes.bool,
    mousePosition: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
    contentStyle: PropTypes.object,
    bodyStyle: PropTypes.object,
  };

  static defaultProps = {
    suffixCls,
    closable: false,
    movable: true,
    mask: true,
    keyboardClosable: true,
    okButton: true,
    okCancel: true,
    destroyOnClose: true,
    fullScreen: false,
    drawer: false,
    drawerOffset: 150,
    autoFocus: true,
  };

  static key;

  static open;

  static confirm;

  static info;

  static success;

  static error;

  static warning;

  static destroyAll: () => void;

  mousePosition?: MousePosition | null;

  moveEvent: EventManager = new EventManager(typeof window === 'undefined' ? undefined : document);

  okCancelEvent: EventManager = new EventManager();

  offset?: [number | string | undefined, number | string | undefined];

  cancelButton: Button | null;

  get okBtn(): ReactElement<Button> {
    const {
      okProps,
      okText = $l('Modal', 'ok'),
      drawer,
    } = this.props;
    const modalButtonProps = getConfig('modalButtonProps');
    const funcType: FuncType | undefined = drawer
      ? FuncType.raised
      : (getConfig('buttonFuncType') as FuncType);
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

  get cancelBtn(): ReactElement<Button> {
    const {
      cancelProps,
      cancelText = $l('Modal', 'cancel'),
      drawer,
    } = this.props;
    const modalButtonProps = getConfig('modalButtonProps');
    const funcType: FuncType | undefined = drawer
      ? FuncType.raised
      : (getConfig('buttonFuncType') as FuncType);

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
  };

  contentNode: HTMLElement;

  saveCancelRef = node => (this.cancelButton = node);

  handleKeyDown = e => {
    const { cancelButton, props: { keyboard = getConfig('modalKeyboard') } } = this;
    if (cancelButton && !cancelButton.isDisabled() && e.keyCode === KeyCode.ESC && keyboard) {
      cancelButton.handleClickWait(e);
    }
  };

  getOtherProps() {
    const otherProps = omit(super.getOtherProps(), [
      'closable',
      'movable',
      'maskClosable',
      'maskStyle',
      'mask',
      'maskClassName',
      'keyboardClosable',
      'fullScreen',
      'title',
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
      'afterClose',
      'okProps',
      'cancelProps',
      'border',
      'drawerBorder',
      'okFirst',
      'autoCenter',
      'keyboard',
      'mousePosition',
      'active',
    ]);
    const { hidden, mousePosition, keyboardClosable, style = {}, drawer } = this.props;
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
        this.mousePosition = undefined;
      }
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
        drawerTransitionName = getConfig('drawerTransitionName'),
        size,
        active,
        border = getConfig('modalSectionBorder'),
        drawerBorder = getConfig('drawerSectionBorder'),
        autoCenter = getConfig('modalAutoCenter'),
      },
    } = this;

    return super.getClassName({
      [`${prefixCls}-center`]: !drawer && !('left' in style || 'right' in style) && !this.offset,
      [`${prefixCls}-fullscreen`]: fullScreen,
      [`${prefixCls}-drawer`]: drawer,
      [`${prefixCls}-border`]: drawer ? drawerBorder : border,
      [`${prefixCls}-drawer-${drawerTransitionName}`]: drawer,
      [`${prefixCls}-auto-center`]: autoCenter,
      [`${prefixCls}-${size}`]: size,
      [`${prefixCls}-active`]: active,
    });
  }

  render() {
    const { prefixCls, props: { contentStyle } } = this;
    const header = this.getHeader();
    const body = this.getBody();
    const footer = this.getFooter();
    return (
      <div {...this.getMergedProps()}>
        <div ref={this.contentReference} className={`${prefixCls}-content`} style={contentStyle}>
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
  handleHeaderMouseDown(downEvent: MouseEvent) {
    const { element, contentNode, props: { autoCenter = getConfig('modalAutoCenter') } } = this;
    if (element && contentNode) {
      const { prefixCls } = this;
      const { clientX, clientY } = downEvent;
      const { offsetLeft, offsetTop } = element;
      const heightW = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      let autoMove = 0;
      this.moveEvent
        .addEventListener('mousemove', (moveEvent: MouseEvent) => {
          const { clientX: moveX, clientY: moveY } = moveEvent;
          classes(element).remove(`${prefixCls}-center`);
          const left = pxToRem(Math.max(offsetLeft + moveX - clientX, 0));
          const top = pxToRem(Math.max(offsetTop + autoMove + moveY - clientY, 0));
          this.offset = [left, top];
          if (autoCenter && classes(element).has(`${prefixCls}-auto-center`)) {
            classes(element).remove(`${prefixCls}-auto-center`);
            autoMove = Math.max((heightW - contentNode.clientHeight) / 2, 0);
            Object.assign(element.style, {
              left,
              top: pxToRem(autoMove),
            });
          } else {
            Object.assign(element.style, {
              left,
              top,
            });
          }
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
      return this.getWrappedFooter(footer(this.okBtn, this.cancelBtn));
    }

    if (!isEmpty(footer, true)) {
      return this.getWrappedFooter(footer);
    }
  }

  getWrappedFooter(footer: ReactNode) {
    const { prefixCls } = this;

    const { drawer } = this.props;

    const className = classNames(`${prefixCls}-footer`, {
      [`${prefixCls}-footer-drawer`]: !!drawer,
    });
    return <div className={className}>{footer}</div>;
  }

  getDefaultHeader = (title, closeButton: ReactNode, _okBtn: ReactElement<Button>, _cancelBtn: ReactElement<Button>) => {
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

  getDefaultFooter = (okBtn: ReactElement<Button>, cancelBtn: ReactElement<Button>) => {
    const { okCancel, okButton, cancelButton, okFirst = getConfig('modalOkFirst'), drawer } = this.props;
    const buttons: ReactNode[] = [];
    if (okButton !== false) {
      buttons.push(okBtn);
    }
    if (okCancel || cancelButton) {
      const drawerOkFirst = getConfig('drawerOkFirst');
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
      const { close = noop, update = noop, bodyStyle } = props;
      const modal: modalChildrenProps = {
        close,
        update,
        props,
        handleOk: this.registerOk,
        handleCancel: this.registerCancel,
      };
      return (
        <div className={`${prefixCls}-body`} style={bodyStyle}>
          {isValidElement(children) ? cloneElement<any>(children, { modal }) : children}
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
