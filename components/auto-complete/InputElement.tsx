import { cloneElement, Component, ReactElement } from 'react';
import { findDOMNode } from 'react-dom';

export interface InputElementProps {
  children: ReactElement<any>;
}

export default class InputElement extends Component<InputElementProps, any> {
  private ele: HTMLInputElement;

  focus = () => {
    const { ele } = this;
    if (typeof ele.focus === 'function') {
      ele.focus();
    } else {
      (findDOMNode(ele) as HTMLInputElement).focus();
    }
  };

  blur = () => {
    const { ele } = this;
    if (typeof ele.blur === 'function') {
      ele.blur();
    } else {
      (findDOMNode(ele) as HTMLInputElement).blur();
    }
  };

  saveRef = (ele: HTMLInputElement) => {
    this.ele = ele;
    const {
      children: { ref },
    } = this.props as any;
    if (typeof ref === 'function') {
      ref(ele);
    }
  };

  render() {
    const {
      props,
      props: { children },
    } = this;
    return cloneElement(
      children,
      {
        ...props,
        ref: this.saveRef,
      },
      null,
    );
  }
}
