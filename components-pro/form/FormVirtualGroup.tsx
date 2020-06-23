import React, { PureComponent } from 'react';

export default class FormVirtualGroup extends PureComponent {

  static displayName = 'FormVirtualGroup';

  render() {
    const { children } = this.props;
    return <div>{children}</div>;
  }
}
