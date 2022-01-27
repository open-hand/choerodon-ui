import React, { Component, ReactElement } from 'react';
import Dialog from './Dialog';
import IDialogPropTypes from './IDialogPropTypes';
import Portal from '../util/Portal';

class DialogWrap extends Component<IDialogPropTypes, any> {
  static defaultProps = {
    visible: false,
  };

  _component: ReactElement<any>;

  renderComponent: (props: any) => void;

  removeContainer: () => void;

  shouldComponentUpdate({ visible }: { visible: boolean }) {
    const { props } = this;
    return !!(props.visible || visible);
  }

  saveDialog = (node: any) => {
    this._component = node;
  };

  getComponent = (extra = {}) => {
    return <Dialog ref={this.saveDialog} {...this.props} {...extra} key="dialog" />;
  };

  getContainer = () => {
    const { getContainer } = this.props;
    if (getContainer) {
      return getContainer(this);
    }
    const container = document.createElement('div');
    document.body.appendChild(container);
    return container;
  };

  render() {
    const { visible } = this.props;

    if (visible || this._component) {
      return <Portal getContainer={this.getContainer}>{this.getComponent()}</Portal>;
    }

    return null;
  }
}

export default DialogWrap;
