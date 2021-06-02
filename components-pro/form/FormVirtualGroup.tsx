import { Children, cloneElement, isValidElement, PureComponent } from 'react';

export default class FormVirtualGroup extends PureComponent {

  static displayName = 'FormVirtualGroup';

  static __PRO_FORM_VIRTUAL_GROUP = true;

  render() {
    const { children, ...otherProps } = this.props;
    if (children) {
      return Children.map(children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child, otherProps);
        }
        return child;
      });
    }
    return null;
  }
}
