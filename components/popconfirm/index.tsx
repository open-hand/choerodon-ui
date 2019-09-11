import React, { Component, ReactNode, MouseEventHandler } from 'react';
import Tooltip, { AbstractTooltipProps } from '../tooltip';
import Icon from '../icon';
import Button from '../button';
import { ButtonType } from '../button/Button';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import defaultLocale from '../locale-provider/default';
import { Size } from '../_util/enum';
import { getPrefixCls } from '../configure';

export interface PopconfirmProps extends AbstractTooltipProps {
  title: ReactNode;
  onConfirm?: MouseEventHandler<any>;
  onCancel?: MouseEventHandler<any>;
  okText?: ReactNode;
  okType?: ButtonType;
  cancelText?: ReactNode;
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

  static defaultProps = {
    transitionName: 'zoom-big',
    placement: 'top',
    trigger: 'click',
    okType: 'primary',
  };

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

  renderOverlay = (popconfirmLocale: PopconfirmLocale) => {
    const { title, cancelText, okText, okType } = this.props;
    const prefixCls = this.getPrefixCls();
    return (
      <div>
        <div className={`${prefixCls}-inner-content`}>
          <div className={`${prefixCls}-message`}>
            <Icon type="warning" />
            <div className={`${prefixCls}-message-title`}>{title}</div>
          </div>
          <div className={`${prefixCls}-buttons`}>
            <Button onClick={this.onCancel} size={Size.small}>
              {cancelText || popconfirmLocale.cancelText}
            </Button>
            <Button onClick={this.onConfirm} type={okType} size={Size.small}>
              {okText || popconfirmLocale.okText}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  getPrefixCls() {
    const { prefixCls } = this.props;
    return getPrefixCls('popover', prefixCls);
  }

  render() {
    const { placement, ...restProps } = this.props;
    const { visible } = this.state;
    const overlay = (
      <LocaleReceiver componentName="Popconfirm" defaultLocale={defaultLocale.Popconfirm}>
        {this.renderOverlay}
      </LocaleReceiver>
    );

    return (
      <Tooltip
        {...restProps}
        prefixCls={this.getPrefixCls()}
        placement={placement}
        onVisibleChange={this.onVisibleChange}
        visible={visible}
        overlay={overlay}
        ref={this.saveTooltip}
      />
    );
  }
}
