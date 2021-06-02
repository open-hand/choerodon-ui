import React, { PureComponent } from 'react';

export default class FormVirtualGroup extends PureComponent {

  static displayName = 'FormVirtualGroup';

  static __PRO_FORM_VIRTUAL_GROUP = true;

  render() {
    const { children } = this.props;
    return <div>{children}</div>;
  }
}
