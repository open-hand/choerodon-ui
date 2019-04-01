import React, { ClassicComponentClass, Component } from 'react';
import Select, { OptionProps } from '../select';
import { Size } from '../_util/enum';

export default class LargeSelect extends Component<any, any> {
  static Option = Select.Option as ClassicComponentClass<OptionProps>;

  render() {
    return <Select size={Size.large} {...this.props} />;
  }
}
