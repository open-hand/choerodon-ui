import { cloneElement, Component, ReactElement } from 'react';
import { findDOMNode } from 'react-dom';

export interface InputElementProps {
  children: ReactElement<any>;
}

export default class InputElement extends Component<InputElementProps, any> {
  private ele: HTMLInputElement;

  focus = () => {
    this.ele.focus ? this.ele.focus() : (findDOMNode(this.ele) as HTMLInputElement).focus();
  };
  blur = () => {
    this.ele.blur ? this.ele.blur() : (findDOMNode(this.ele) as HTMLInputElement).blur();
  };
  saveRef = (ele: HTMLInputElement) => {
    this.ele = ele;
    const { ref: childRef } = this.props.children as any;
    if (typeof childRef === 'function') {
      childRef(ele);
    }
  };

  render() {
    return cloneElement(this.props.children, {
      ...this.props,
      ref: this.saveRef,
    }, null);
  }
}
