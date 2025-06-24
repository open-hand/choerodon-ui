import React, { Component, MouseEventHandler, ReactNode } from 'react';
import Tooltip, { AbstractTooltipProps, RenderFunction } from '../tooltip';
import Icon from '../icon';
import Button, { ButtonProps } from '../button';
import { ButtonType } from '../button/Button';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import { getRuntimeLocale } from '../locale-provider/utils';
import { Size } from '../_util/enum';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export interface PopconfirmProps extends AbstractTooltipProps {
  title: ReactNode | RenderFunction;
  onConfirm?: MouseEventHandler<any>;
  onCancel?: MouseEventHandler<any>;
  okText?: ReactNode;
  okType?: ButtonType;
  cancelText?: ReactNode;
  iconType?: string;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
}

export interface PopconfirmState {
  visible?: boolean;
}

export interface PopconfirmLocale {
  okText: string;
  cancelText: string;
}

export default class Popconfirm extends Component<PopconfirmProps, PopconfirmState> {
  static displayName = 'Popconfirm';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static defaultProps = {
    transitionName: 'zoom-big',
    placement: 'top',
    trigger: 'click',
    okType: 'primary',
    iconType: 'warning',
  };

  context: ConfigContextValue;

  private tooltip: any;

  constructor(props: PopconfirmProps) {
    super(props);

    this.state = {
      visible: props.visible,
    };
  }

  componentWillReceiveProps(nextProps: PopconfirmProps) {
    if ('visible' in nextProps) {
      this.setState({ visible: nextProps.visible });
    }
  }

  getPopupDomNode() {
    return this.tooltip.getPopupDomNode();
  }

  onConfirm: MouseEventHandler<HTMLButtonElement> = e => {
    this.setVisible(false);

    const { onConfirm } = this.props;
    if (onConfirm) {
      onConfirm.call(this, e);
    }
  };

  onCancel: MouseEventHandler<HTMLButtonElement> = e => {
    this.setVisible(false);

    const { onCancel } = this.props;
    if (onCancel) {
      onCancel.call(this, e);
    }
  };

  onVisibleChange = (visible: boolean) => {
    this.setVisible(visible);
  };

  setVisible(visible: boolean) {
    const props = this.props;
    if (!('visible' in props)) {
      this.setState({ visible });
    }

    const { onVisibleChange } = props;
    if (onVisibleChange) {
      onVisibleChange(visible);
    }
  }

  saveTooltip = (node: any) => {
    this.tooltip = node;
  };

  renderOverlayWithLocale = (popconfirmLocale: PopconfirmLocale) => {
    const { title, cancelText, okText, okType, iconType, okButtonProps, cancelButtonProps } = this.props;
    const prefixCls = this.getPrefixCls();
    return (
      <div className={`${prefixCls}-inner-content`}>
        <div className={`${prefixCls}-message`}>
          <Icon type={iconType!} />
          <div className={`${prefixCls}-message-title`}>{typeof title === 'function' ? title() : title}</div>
        </div>
        <div className={`${prefixCls}-buttons`}>
          <Button {...okButtonProps} onClick={this.onCancel} size={Size.small}>
            {cancelText || popconfirmLocale.cancelText}
          </Button>
          <Button {...cancelButtonProps} onClick={this.onConfirm} type={okType} size={Size.small}>
            {okText || popconfirmLocale.okText}
          </Button>
        </div>
      </div>
    );
  };

  renderLocale = () => {
    return (
      <LocaleReceiver componentName="Popconfirm" defaultLocale={getRuntimeLocale().Popconfirm || {}}>
        {this.renderOverlayWithLocale}
      </LocaleReceiver>
    );
  };

  getPrefixCls() {
    const { prefixCls } = this.props;
    const { getPrefixCls } = this.context;
    return getPrefixCls('popover', prefixCls);
  }

  render() {
    const { placement, ...restProps } = this.props;
    const { visible } = this.state;

    return (
      <Tooltip
        {...restProps}
        prefixCls={this.getPrefixCls()}
        placement={placement}
        onVisibleChange={this.onVisibleChange}
        visible={visible}
        overlay={this.renderLocale}
        ref={this.saveTooltip}
      />
    );
  }
}
