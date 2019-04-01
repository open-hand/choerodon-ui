import React, { Component, CSSProperties } from 'react';
import classNames from 'classnames';

export interface ILazyRenderBoxPropTypes {
  className?: string;
  hidden?: boolean;
  hiddenClassName?: string;
  role?: string;
  style?: CSSProperties;
}

export default class LazyRenderBox extends Component<ILazyRenderBoxPropTypes, any> {
  shouldComponentUpdate(nextProps: ILazyRenderBoxPropTypes) {
    return !!nextProps.hiddenClassName || !nextProps.hidden;
  }

  render() {
    const { hiddenClassName, hidden, className, ...otherProps } = this.props;
    const classString = classNames(className, {
      [hiddenClassName!]: hiddenClassName && hidden,
    });
    return <div className={classString} {...otherProps} />;
  }
}
