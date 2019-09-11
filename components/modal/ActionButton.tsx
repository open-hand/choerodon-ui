import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import Button from '../button';

export interface ActionButtonProps {
  okProps?: any;
  cancelProps?: any;
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
      this.timeoutId = setTimeout(() => $this.focus());
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutId);
  }

  onClick = (props: any) => {
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
        disabled={loading}
        onClick={() => {
          this.onClick(cancelProps);
        }}
      >
        {cancelProps.text}
      </Button>
    );
    return (
      <div>
        {cancelButton}
        <Button
          loading={loading}
          type={okProps.type}
          onClick={() => {
            this.onClick(okProps);
          }}
        >
          {okProps.text}
        </Button>
      </div>
    );
  }
}
