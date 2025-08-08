import React, { useCallback, useContext } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import Icon from '../icon';
import Dialog, { ModalFuncProps } from './Modal';
import ActionButton, { ActionButtonProps } from './ActionButton';
import { getRuntimeLocale } from '../locale-provider/utils';
import ConfigContext from '../config-provider/ConfigContext';

export interface ConfirmProps extends ModalFuncProps {
  modalPrefixCls?: string;
}

interface ConfirmDialogProps extends ConfirmProps {
  afterClose?: () => void;
  close: (...args: any[]) => void;
}

const IS_REACT_16 = !!ReactDOM.createPortal;

const ConfirmDialog = (props: ConfirmDialogProps) => {
  const {
    prefixCls: customizePrefixCls,
    modalPrefixCls,
    onCancel,
    onOk,
    close,
    zIndex,
    width,
    style,
    type,
    className,
    afterClose,
    visible,
    keyboard,
    okText,
    cancelText,
    okCancel = true,
    iconType,
    okType,
    maskClosable = false,
    title,
    content,
    okButtonProps,
    cancelButtonProps,
  } = props;
  const { getPrefixCls } = useContext(ConfigContext);
  const propOkType = okType || 'primary';
  const prefixCls = getPrefixCls('confirm', customizePrefixCls);
  const propWidth = width || 416;
  const propStyle = style || {};
  const runtimeLocale = getRuntimeLocale().Modal!;
  const propOkText = okText || (okCancel ? runtimeLocale.okText : runtimeLocale.justOkText);
  const propCancelText = cancelText || runtimeLocale.cancelText;
  const classString = classNames(prefixCls, `${prefixCls}-${type}`, className);
  const actionButtonProps: ActionButtonProps = {
    okProps: {
      buttonProps: okButtonProps,
      text: propOkText,
      type: propOkType,
      actionFn: onOk,
      closeModal: close,
    },
  };
  if (okCancel) {
    actionButtonProps.cancelProps = {
      buttonProps: cancelButtonProps,
      text: propCancelText,
      actionFn: onCancel,
      closeModal: close,
    };
  }

  const handleCancel = useCallback(() => {
    close({ triggerCancel: true });
  }, [close]);

  return (
    <Dialog
      prefixCls={modalPrefixCls}
      className={classString}
      onCancel={handleCancel}
      visible={visible}
      title=""
      transitionName="zoom"
      footer=""
      maskTransitionName="fade"
      maskClosable={maskClosable}
      style={propStyle}
      width={propWidth}
      zIndex={zIndex}
      afterClose={afterClose}
      keyboard={keyboard}
    >
      <div className={`${prefixCls}-body-wrapper`}>
        <div className={`${prefixCls}-body`}>
          {iconType ? <Icon type={iconType} /> : null}
          <span className={`${prefixCls}-title`}>{title}</span>
          <div className={`${prefixCls}-content`}>{content}</div>
        </div>
        <div className={`${prefixCls}-btns`}>
          <ActionButton {...actionButtonProps} />
        </div>
      </div>
    </Dialog>
  );
};

export default function confirm(config: ConfirmProps) {
  const div = document.createElement('div');
  document.body.appendChild(div);

  function destroy(...args: any[]) {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult && div.parentNode) {
      div.parentNode.removeChild(div);
    }
    const triggerCancel = args && args.length && args.some(param => param && param.triggerCancel);
    if (config.onCancel && triggerCancel) {
      config.onCancel(...args);
    }
  }

  function render(props: any) {
    ReactDOM.render(<ConfirmDialog {...props} />, div);
  }

  function close(...args: any[]) {
    if (IS_REACT_16) {
      render({ ...config, close, visible: false, afterClose: destroy.bind(this, ...args) });
    } else {
      destroy(...args);
    }
  }

  render({ ...config, visible: true, close });

  return {
    destroy: close,
  };
}
