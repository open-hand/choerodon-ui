const autoAdjustOverflow = {
  adjustX: 1,
  adjustY: 1,
};

const targetOffset = [0, 0];

export const placements = {
  topLeft: {
    points: ['bl', 'bl'],
    overflow: autoAdjustOverflow,
    offset: [0, -4],
    targetOffset,
  },
  topCenter: {
    points: ['bc', 'bc'],
    overflow: autoAdjustOverflow,
    offset: [0, -4],
    targetOffset,
  },
  topRight: {
    points: ['br', 'br'],
    overflow: autoAdjustOverflow,
    offset: [0, -4],
    targetOffset,
  },
  bottomLeft: {
    points: ['tl', 'tl'],
    overflow: autoAdjustOverflow,
    offset: [0, 4],
    targetOffset,
  },
  bottomCenter: {
    points: ['tc', 'tc'],
    overflow: autoAdjustOverflow,
    offset: [0, 4],
    targetOffset,
  },
  bottomRight: {
    points: ['tr', 'tr'],
    overflow: autoAdjustOverflow,
    offset: [0, 4],
    targetOffset,
  },
};

export default placements;
