import React, { ClassicComponentClass, Component } from 'react';
import { Size } from '../_util/enum';
import Select, { OptionProps } from '../select';

export default class MiniSelect extends Component<any, any> {
  static Option = Select.Option as ClassicComponentClass<OptionProps>;

  render() {
    return <Select size={Size.small} {...this.props} />;
  }
}
