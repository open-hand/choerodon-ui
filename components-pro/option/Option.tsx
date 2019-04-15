import { Component } from 'react';
import PropTypes from 'prop-types';
import { ViewComponentProps } from '../core/ViewComponent';

export interface OptionProps extends ViewComponentProps {
  /**
   * 选项值
   */
  value?: any;
}

export default class Option extends Component<OptionProps, any> {
  static propTypes = {
    /**
     * 选项值
     */
    value: PropTypes.any,
  };
}
