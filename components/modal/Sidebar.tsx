import * as React from 'react';
import classNames from 'classnames';
import Dialog, { ModalFuncProps } from './Modal';
import Button from '../button';
import { getConfirmLocale } from './locale';

export interface SidebarState {
  open: boolean;
}

export interface SidebarProps extends ModalFuncProps {
  close?: (...args: any[]) => void;
}

export default class Sidebar extends React.Component<SidebarProps, {}> {

  static defaultProps = {
    prefixCls: 'ant-modal',
    width: '100%',
    transitionName: 'slide-right',
    maskTransitionName: 'fade',
    confirmLoading: false,
    visible: false,
    okType: 'primary',
    funcType: 'raised',
  };

  state: SidebarState;
  constructor(props: any) {
    super(props);
    this.state = {
      open: false,
    }
  }

  handleCancel = (e: any) => {
    const onCancel = this.props.onCancel;
    if (onCancel) {
      onCancel(e);
    }
  };

  handleOk = (e: any) => {
    const onOk = this.props.onOk;
    if (onOk) {
      onOk(e);
    }
  };

  renderFooter = () => {
    const props = this.props;
    const { prefixCls, onCancel, onOk, okType, funcType, confirmLoading } = props;
    const okCancel = ('okCancel' in props) ? props.okCancel! : true;
    const runtimeLocale = getConfirmLocale();
    const okText = props.okText ||
        (okCancel ? runtimeLocale.okText : runtimeLocale.justOkText);
    const cancelText = props.cancelText || runtimeLocale.cancelText;

    const  cancalBtn = okCancel ? (
      <Button disabled={confirmLoading} funcType={funcType} onClick={onCancel}>
        {cancelText}
      </Button>) : null;
    return (
      <div className={`${prefixCls}-btns`}>
        <Button loading={confirmLoading} funcType={funcType} type={okType} onClick={onOk}>
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
    })
  }

  render() {
    const props = this.props;
    const { prefixCls, zIndex, visible, keyboard, footer } = props;
    const { open } = this.state;
    const classString = classNames(prefixCls, {
        [`${prefixCls}-sidebar`]: true,
        [`${prefixCls}-sidebar-open`]: open,
      },
      props.className);

    return (
        <Dialog
          animationEnd={this.handleStatus}
          width={props.width}
          className={classString}
          visible={visible}
          title={props.title}
          transitionName={props.transitionName}
          footer={footer === undefined ? this.renderFooter() : footer}
          zIndex={zIndex}
          keyboard={keyboard}
          closable={false}
        >
          {this.props.children}
        </Dialog>
    );
  }
}
