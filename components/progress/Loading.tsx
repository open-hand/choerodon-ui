import React, { Component } from 'react';

const SIZE = 50;

export default class Loading extends Component<any, any> {
  static displayName = 'Loading';

  render() {
    return (
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={SIZE / 2 - 5}
        />
      </svg>
    );
  }
}
