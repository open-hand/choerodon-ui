import React from 'react';

const SIZE = 50;

export default function Loading() {
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2 - 5} />
    </svg>
  );
}

Loading.displayName = 'Loading';
