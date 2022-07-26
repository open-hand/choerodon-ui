import React, { Component, ReactNode } from 'react';
import { findDOMNode } from 'react-dom';
import Button from '../button';
import { ButtonType, ButtonProps } from '../button/Button';

export interface CommonButtonProps {
  type?: ButtonType;
  actionFn?: (...args: any[]) => any | PromiseLike<any>;
  closeModal: Function;
  text?: ReactNode;
  buttonProps?: ButtonProps;
}

export interface ActionButtonProps {
  okProps: CommonButtonProps;
  cancelProps?: CommonButtonProps;
  autoFocus?: boolean;
}

export interface ActionButtonState {
  loading: boolean;
}

export default class ActionButton extends Component<ActionButtonProps, ActionButtonState> {
  timeoutId: number;

  constructor(props: ActionButtonProps) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
    const { autoFocus } = this.props;
    if (autoFocus) {
      const $this = findDOMNode(this) as HTMLInputElement;
      this.timeoutId = window.setTimeout(() => $this.focus());
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutId);
  }

  onClick = (props: CommonButtonProps) => {
    const { actionFn, closeModal } = props;
    if (actionFn) {
      let ret;
      if (actionFn.length) {
        ret = actionFn(closeModal);
      } else {
        ret = actionFn();
        if (!ret) {
          closeModal();
        }
      }
      if (ret && ret.then) {
        this.setState({ loading: true });
        ret.then(
          (...args: any[]) => {
            // It's unnecessary to set loading=false, for the Modal will be unmounted after close.
            // this.setState({ loading: false });
            closeModal(...args);
          },
          () => {
            this.setState({ loading: false });
          },
        );
      }
    } else {
      closeModal();
    }
  };

  render() {
    const { okProps, cancelProps } = this.props;
    const { loading } = this.state;
    const cancelButton = cancelProps && (
      <Button
        {...cancelProps.buttonProps}
        type={cancelProps.type}
        disabled={loading}
        onClick={() => {
          this.onClick(cancelProps);
        }}
      >
        {cancelProps.text}
      </Button>
    );
    return (
      <>
        {cancelButton}
        <Button
          {...okProps.buttonProps}
          loading={loading}
          type={okProps.type}
          onClick={() => {
            this.onClick(okProps);
          }}
        >
          {okProps.text}
        </Button>
      </>
    );
  }
}
