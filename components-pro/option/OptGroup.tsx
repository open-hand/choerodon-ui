import { Component } from 'react';
import PropTypes from 'prop-types';

export interface OptGroupProps {
  /**
   * 选项组标题
   */
  label?: string;
}

export default class OptGroup extends Component<OptGroupProps> {
  static propTypes = {
    label: PropTypes.string,
  };
}
