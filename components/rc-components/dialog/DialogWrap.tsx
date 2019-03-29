import React, { Component, ReactElement } from 'react';
import ReactDOM from 'react-dom';
import Dialog from './Dialog';
import IDialogPropTypes from './IDialogPropTypes';
import ContainerRender from '../util/ContainerRender';
import Portal from '../util/Portal';

const IS_REACT_16 = 'createPortal' in ReactDOM;

class DialogWrap extends Component<IDialogPropTypes, any> {
  static defaultProps = {
    visible: false,
  };

  _component: ReactElement<any>;

  renderComponent: (props: any) => void;

  removeContainer: () => void;

  shouldComponentUpdate({ visible }: { visible: boolean }) {
    return !!(this.props.visible || visible);
  }

  componentWillUnmount() {
    if (IS_REACT_16) {
      return;
    }
    if (this.props.visible) {
      this.renderComponent({
        afterClose: this.removeContainer,
        onClose() {
        },
        visible: false,
      });
    } else {
      this.removeContainer();
    }
  }

  saveDialog = (node: any) => {
    this._component = node;
  };

  getComponent = (extra = {}) => {
    return (
      <Dialog
        ref={this.saveDialog}
        {...this.props}
        {...extra}
        key="dialog"
      />
    );
  };

  getContainer = () => {
    if (this.props.getContainer) {
      return this.props.getContainer(this);
    }
    const container = document.createElement('div');
    document.body.appendChild(container);
    return container;
  };

  render() {
    const { visible } = this.props;

    let portal: any = null;

    if (!IS_REACT_16) {
      const container = ({ renderComponent, removeContainer }: { renderComponent: any, removeContainer: any }) => {
        this.renderComponent = renderComponent;
        this.removeContainer = removeContainer;
        return null;
      };
      return (
        <ContainerRender
          parent={this}
          visible={visible}
          autoDestroy={false}
          getComponent={this.getComponent}
          getContainer={this.getContainer}
        >
          {container}
        </ContainerRender>
      );
    }

    if (visible || this._component) {
      portal = (
        <Portal getContainer={this.getContainer}>
          {this.getComponent()}
        </Portal>
      );
    }

    return portal;
  }
}

export default DialogWrap;
