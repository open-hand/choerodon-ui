const autoAdjustOverflow = {
  adjustX: 1,
  adjustY: 1,
};

const BUILT_IN_PLACEMENTS = {
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 4],
    overflow: autoAdjustOverflow,
  },
  bottomRight: {
    points: ['tr', 'br'],
    offset: [0, 4],
    overflow: autoAdjustOverflow,
  },
  topLeft: {
    points: ['bl', 'tl'],
    offset: [0, -4],
    overflow: autoAdjustOverflow,
  },
  topRight: {
    points: ['br', 'tr'],
    offset: [0, -4],
    overflow: autoAdjustOverflow,
  },
  left: {
    points: ['cr', 'cl'],
    offset: [-4, 0],
    overflow: autoAdjustOverflow,
  },
  right: {
    points: ['cl', 'cr'],
    offset: [4, 0],
    overflow: autoAdjustOverflow,
  },
  top: {
    points: ['bc', 'tc'],
    offset: [0, -4],
    overflow: autoAdjustOverflow,
  },
  bottom: {
    points: ['tc', 'bc'],
    offset: [0, 4],
    overflow: autoAdjustOverflow,
  },
  leftTop: {
    points: ['tr', 'tl'],
    offset: [-4, 0],
    overflow: autoAdjustOverflow,
  },
  rightTop: {
    points: ['tl', 'tr'],
    offset: [4, 0],
    overflow: autoAdjustOverflow,
  },
  rightBottom: {
    points: ['bl', 'br'],
    offset: [4, 0],
    overflow: autoAdjustOverflow,
  },
  leftBottom: {
    points: ['br', 'bl'],
    offset: [-4, 0],
    overflow: autoAdjustOverflow,
  },
};

export default BUILT_IN_PLACEMENTS
