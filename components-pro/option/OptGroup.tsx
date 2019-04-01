import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';

export interface OptGroupProps {
  /**
   * 选项组标题
   */
  label?: string;
  level: number;
}

export default class OptGroup extends Component<OptGroupProps> {
  static propTypes = {
    label: PropTypes.string,
    level: PropTypes.number,
  };

  render() {
    const { label, children, level } = this.props;

    return (
      <dl>
        <dt style={{ paddingLeft: pxToRem(level * 8) }}>{label}</dt>
        <dd>
          <ul>{children}</ul>
        </dd>
      </dl>
    );
  }
}
