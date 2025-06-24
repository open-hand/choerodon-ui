import React, { Component } from 'react';
import classNames from 'classnames';
import Dialog, { ModalFuncProps } from './Modal';
import Button from '../button';
import { getRuntimeLocale } from '../locale-provider/utils';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export interface SidebarState {
  open: boolean;
}

export interface SidebarProps extends ModalFuncProps {
  close?: (...args: any[]) => void;
  alwaysCanCancel?: boolean;
}

function isFixedWidth(width: ModalFuncProps['width']) {
  switch (typeof width) {
    case 'undefined':
      return false;
    case 'number':
      return true;
    case 'string':
      // width: 100%不是固定宽度
      return width.indexOf('%') === -1;
    default:
      return false;
  }
}

export default class Sidebar extends Component<SidebarProps, {}> {
  static displayName = 'Sidebar';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static defaultProps = {
    width: '100%',
    transitionName: 'slide-right',
    maskTransitionName: 'fade',
    confirmLoading: false,
    alwaysCanCancel: false,
    visible: false,
    okType: 'primary',
    funcType: 'raised',
  };

  context: ConfigContextValue;

  state: SidebarState;

  constructor(props: any, context: ConfigContextValue) {
    super(props, context);
    this.state = {
      open: false,
    };
  }

  handleCancel = (e: any) => {
    const { onCancel } = this.props;
    if (onCancel) {
      onCancel(e);
    }
  };

  handleOk = (e: any) => {
    const { onOk } = this.props;
    if (onOk) {
      onOk(e);
    }
  };

  renderFooter = () => {
    const props = this.props;
    const { onCancel, onOk, okType, funcType, confirmLoading, alwaysCanCancel } = props;
    const prefixCls = this.getPrefixCls();
    const okCancel = 'okCancel' in props ? props.okCancel! : true;
    const runtimeLocale = getRuntimeLocale().Modal!;
    const okText = props.okText || (okCancel ? runtimeLocale.okText : runtimeLocale.justOkText);
    const cancelText = props.cancelText || runtimeLocale.cancelText;

    const cancalBtn = okCancel ? (
      <Button
        className={`${prefixCls}-btn-cancel`}
        disabled={!alwaysCanCancel && confirmLoading}
        funcType={funcType}
        onClick={onCancel}
      >
        {cancelText}
      </Button>
    ) : null;
    return (
      <div className={`${prefixCls}-btns`}>
        <Button
          className={`${prefixCls}-btn-ok`}
          loading={confirmLoading}
          funcType={funcType}
          type={okType}
          onClick={onOk}
        >
          {okText}
        </Button>
        {cancalBtn}
      </div>
    );
  };

  handleStatus = () => {
    const { open } = this.state;
    this.setState({
      open: !open,
    });
  };

  getPrefixCls() {
    const { prefixCls } = this.props;
    const { getPrefixCls } = this.context;
    return getPrefixCls('modal', prefixCls);
  }

  render() {
    const { props } = this;
    const { footer = this.renderFooter(), width, className } = props;
    const prefixCls = this.getPrefixCls();
    const { open } = this.state;
    const fixedWidth = isFixedWidth(width);
    const classString = classNames(
      prefixCls,
      {
        [`${prefixCls}-sidebar`]: true,
        [`${prefixCls}-sidebar-open`]: open,
        [`${prefixCls}-sidebar-fixed-width`]: fixedWidth,
      },
      className,
    );

    return (
      <Dialog
        {...props}
        prefixCls={prefixCls}
        animationEnd={this.handleStatus}
        className={classString}
        footer={footer}
        closable={'closable' in props ? props.closable : false}
      />
    );
  }
}
