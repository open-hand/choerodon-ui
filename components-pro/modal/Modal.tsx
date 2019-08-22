import React, { cloneElement, isValidElement, Key, ReactNode } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import defer from 'lodash/defer';
import noop from 'lodash/noop';
import classNames from 'classnames';
import classes from 'component-classes';
import ViewComponent, { ViewComponentProps } from '../core/ViewComponent';
import Icon from '../icon';
import autobind from '../_util/autobind';
import Button, { ButtonProps } from '../button/Button';
import EventManager from '../_util/EventManager';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import isEmpty from '../_util/isEmpty';
import { ButtonColor, FuncType } from '../button/enum';
import asyncComponent, { AsyncCmpLoadingFunction } from '../_util/AsyncComponent';
import KeyCode from 'choerodon-ui/lib/_util/KeyCode';
import message from '../message';
import exception from '../_util/exception';
import { $l } from '../locale-context';
import { getConfig } from 'choerodon-ui/lib/configure';

export interface ModalProps extends ViewComponentProps {
  closable?: boolean;
  movable?: boolean;
  fullScreen?: boolean;
  maskClosable?: boolean;
  keyboardClosable?: boolean;
  header?: boolean;
  footer?: ((okBtn: ReactNode, cancelBtn: ReactNode) => ReactNode) | ReactNode | boolean;
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
  okCancel?: boolean;
  drawer?: boolean;
  key?: Key;
  border?: boolean;
  okFirst?: boolean;
}

export default class Modal extends ViewComponent<ModalProps> {
  static displayName = 'Modal';

  static propTypes = {
    ...ViewComponent.propTypes,
    closable: PropTypes.bool,
    movable: PropTypes.bool,
    fullScreen: PropTypes.bool,
    maskClosable: PropTypes.bool,
    keyboardClosable: PropTypes.bool,
    header: PropTypes.bool,
    footer: PropTypes.oneOfType([PropTypes.func, PropTypes.node, PropTypes.bool]),
    destroyOnClose: PropTypes.bool,
    okText: PropTypes.node,
    cancelText: PropTypes.node,
    okProps: PropTypes.object,
    cancelProps: PropTypes.object,
    onClose: PropTypes.func,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    afterClose: PropTypes.func,
    okCancel: PropTypes.bool,
    drawer: PropTypes.bool,
    // title: PropTypes.node,
    // 此处原本允许title传入node，但是类型为PropTypes.node时无法正确继承ViewComponent
    // 父类中的title指的是HTML元素的title属性，此处title指modal标题，产生歧义，暂时设置为string
    // TODO: 添加modalTitle属性替代此处的title
    title: PropTypes.string,
    okFirst: PropTypes.bool,
  };

  static defaultProps = {
    suffixCls: 'modal',
    header: true,
    closable: false,
    movable: true,
    maskClosable: false,
    keyboardClosable: true,
    okCancel: true,
    destroyOnClose: true,
    fullScreen: false,
    drawer: false,
    autoFocus: true,
  };

  static key;
  static open;
  static confirm;
  static info;
  static success;
  static error;
  static warning;

  moveEvent: EventManager = new EventManager(typeof window === 'undefined' ? void 0 : document);
  okCancelEvent: EventManager = new EventManager();

  offset?: [number | string | undefined, number | string | undefined];

  cancelButton: Button | null;

  saveCancelRef = node => this.cancelButton = node;

  handleKeyDown = (e) => {
    const { cancelButton } = this;
    if (cancelButton && !cancelButton.isDisabled() && e.keyCode === KeyCode.ESC) {
      cancelButton.handleClickWait(e);
    }
  };

  getOtherProps() {
    const otherProps = omit(super.getOtherProps(), [
      'closable',
      'movable',
      'maskClosable',
      'keyboardClosable',
      'fullScreen',
      'title',
      'header',
      'footer',
      'close',
      'update',
      'okText',
      'cancelText',
      'okCancel',
      'onClose',
      'onOk',
      'onCancel',
      'destroyOnClose',
      'drawer',
      'afterClose',
      'okProps',
      'cancelProps',
      'border',
      'okFirst',
    ]);
    if (this.props.keyboardClosable) {
      otherProps.autoFocus = true;
      otherProps.tabIndex = -1;
      otherProps.onKeyDown = this.handleKeyDown;
    }

    return otherProps;
  }

  getClassName(): string | undefined {
    const { prefixCls, props: { style = {}, fullScreen, drawer, border = getConfig('modalSectionBorder') } } = this;

    return super.getClassName({
      [`${prefixCls}-center`]: !drawer && !('left' in style || 'right' in style) && !this.offset,
      [`${prefixCls}-fullscreen`]: fullScreen,
      [`${prefixCls}-drawer`]: drawer,
      [`${prefixCls}-border`]: border,
    });
  }

  render() {
    const { prefixCls } = this;
    const header = this.getHeader();
    const body = this.getBody();
    const footer = this.getFooter();
    return (
      <div {...this.getMergedProps()}>
        <div className={`${prefixCls}-content`}>
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
    const { element } = this;
    if (element) {
      const { prefixCls } = this;
      const { clientX, clientY } = downEvent;
      const { offsetLeft, offsetTop } = element;
      this.moveEvent.addEventListener('mousemove', (moveEvent: MouseEvent) => {
        const { clientX: moveX, clientY: moveY } = moveEvent;
        classes(element).remove(`${prefixCls}-center`);
        const left = pxToRem(Math.max(offsetLeft + moveX - clientX, 0));
        const top = pxToRem(Math.max(offsetTop + moveY - clientY, 0));
        this.offset = [left, top];
        Object.assign(element.style, {
          left,
          top,
        });
      }).addEventListener('mouseup', () => {
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
      message.error(exception(e));
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
      message.error(exception(e));
    }
  }

  getTitle(): ReactNode {
    const { props: { title }, prefixCls } = this;
    if (title) {
      return (
        <div className={`${prefixCls}-title`}>
          {title}
        </div>
      );
    }
  }

  getHeader(): ReactNode {
    const { prefixCls, props: { closable, movable, fullScreen, drawer, header } } = this;
    if (!!header) {
      const title = this.getTitle();
      const buttons = this.getHeaderButtons();
      if (title || closable || movable) {
        const headerProps: any = {
          className: classNames(`${prefixCls}-header`, {
            [`${prefixCls}-movable`]: movable && !fullScreen && !drawer,
          }),
        };
        if (movable && !fullScreen && !drawer) {
          headerProps.onMouseDown = this.handleHeaderMouseDown;
        }
        return (
          <div {...headerProps}>
            {title}
            {buttons}
          </div>
        );
      }
    }
  }

  getHeaderButtons(): ReactNode {
    const { prefixCls } = this;
    const closeButton = this.getCloseButton();
    if (closeButton) {
      return (
        <div className={`${prefixCls}-header-buttons`}>
          {closeButton}
        </div>
      );
    }
  }

  getCloseButton(): ReactNode {
    const { prefixCls, props: { closable } } = this;
    if (closable) {
      return (
        <button className={`${prefixCls}-header-button`} onClick={this.close}>
          <Icon type="close" />
        </button>
      );
    }
  }

  registerOk = (ok) => {
    this.okCancelEvent.removeEventListener('ok');
    this.okCancelEvent.addEventListener('ok', ok);
  };

  registerCancel = (cancel) => {
    this.okCancelEvent.removeEventListener('cancel');
    this.okCancelEvent.addEventListener('cancel', cancel);
  };

  renderChildren(children: ReactNode): ReactNode {
    if (children) {
      const { prefixCls, props } = this;
      const { close = noop, update = noop } = props;
      const modal = {
        close,
        update,
        props,
        handleOk: this.registerOk,
        handleCancel: this.registerCancel,
      };
      return (
        <div className={`${prefixCls}-body`}>
          {isValidElement(children) ? cloneElement<any>(children, { modal }) : children}
        </div>
      );
    }
  }

  getBody(): ReactNode {
    const { children } = this.props;
    return this.renderChildren(typeof children === 'function' ? asyncComponent(children as AsyncCmpLoadingFunction) : children);
  }

  getFooter(): ReactNode {
    const {
      okProps,
      cancelProps,
      drawer,
      okText = $l('Modal', 'ok'),
      cancelText = $l('Modal', 'cancel'),
      footer = this.getDefaultFooter,
    } = this.props;
    const funcType: FuncType | undefined = drawer ? FuncType.raised : getConfig('buttonFuncType') as FuncType;

    const okBtn = (
      <Button key="ok" funcType={funcType} color={ButtonColor.primary} onClick={this.handleOk} children={okText} {...okProps} />
    );
    const cancelBtn = (
      <Button key="cancel" ref={this.saveCancelRef} funcType={funcType} onClick={this.handleCancel} children={cancelText} {...cancelProps} />
    );

    if (typeof footer === 'function') {
      return this.getWrappedFooter(footer(okBtn, cancelBtn));
    }

    if (!isEmpty(footer, true)) {
      return this.getWrappedFooter(footer);
    }
  }

  getWrappedFooter(footer: ReactNode) {
    const { prefixCls } = this;

    const {
      drawer,
    } = this.props;

    const className = classNames(`${prefixCls}-footer`, {
      [`${prefixCls}-footer-drawer`]: !!drawer,
    });
    return (
      <div className={className}>
        {footer}
      </div>
    );
  }

  getDefaultFooter = (okBtn: ReactNode, cancelBtn: ReactNode) => {
    const {
      okCancel,
      okFirst = getConfig('modalOkFirst'),
      drawer,
    } = this.props;
    const buttons = [
      okBtn,
    ];
    if (okCancel) {
      if (okFirst || drawer) {
        buttons.push(cancelBtn);
      } else {
        buttons.unshift(cancelBtn);
      }
    }
    return (
      <div>
        {buttons}
      </div>
    );
  }

  @autobind
  close() {
    const { close = noop } = this.props;
    close();
  }
}
