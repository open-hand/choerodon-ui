import * as React from 'react';
import PropTypes from 'prop-types';

const SIZE = 50;

export default class Progress extends React.Component<any, any> {

  static contextTypes = {
    strokeColor: PropTypes.string,
    strokeWidth: PropTypes.string,
  }

  render() {
    const { strokeColor, strokeWidth } = this.props;
    return (
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={SIZE / 2 - 5}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
     </svg>
    );
  }
}
