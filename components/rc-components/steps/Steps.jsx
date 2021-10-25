/* eslint react/no-did-mount-set-state: 0 */
import React, {Component } from 'react';
import PropTypes from 'prop-types';
import StepGroup from './StepGroup';

export default class Steps extends Component {
  static propTypes = {
    prefixCls: PropTypes.string,
    className: PropTypes.string,
    iconPrefix: PropTypes.string,
    direction: PropTypes.string,
    labelPlacement: PropTypes.string,
    children: PropTypes.any,
    status: PropTypes.string,
    size: PropTypes.string,
    progressDot: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    style: PropTypes.object,
    current: PropTypes.number,
    GroupIndex: PropTypes.number,
    headerRender: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    headerIcon:PropTypes.string,
    headerText: PropTypes.string,
    type: PropTypes.string,
    onChange:PropTypes.func,
  };

  _stepIndex = 0;

  setNumberChange = (index) => {
    this._stepIndex = index;
  }

  getNumberChange = () => {
    return this._stepIndex
  }

  render() {
    const stepsProps = this.props;
    return (
      <StepGroup {...stepsProps} setNumberChange={this.setNumberChange} getNumberChange={this.getNumberChange} />
    )
  }
}

