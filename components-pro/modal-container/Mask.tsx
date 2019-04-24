import React from 'react';
import ViewComponent, { ViewComponentProps } from '../core/ViewComponent';

export default class Mask extends ViewComponent<ViewComponentProps> {
  static displayName = 'Mask';

  static defaultProps = {
    suffixCls: 'mask',
  };

  render() {
    return <div {...this.getMergedProps()} />;
  }
}
