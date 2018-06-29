import cloneDeep from 'lodash/cloneDeep';

const autoAdjustOverflow = {
  adjustX: 1,
  adjustY: 1,
};

const targetOffset = [0, 0];

const placements = {
  bottomLeft: {
    points: ['tl', 'tl'],
    overflow: autoAdjustOverflow,
    offset: [0, -3],
    targetOffset,
  },
  bottomRight: {
    points: ['tr', 'tr'],
    overflow: autoAdjustOverflow,
    offset: [0, -3],
    targetOffset,
  },
  topRight: {
    points: ['br', 'br'],
    overflow: autoAdjustOverflow,
    offset: [0, 3],
    targetOffset,
  },
  topLeft: {
    points: ['bl', 'bl'],
    overflow: autoAdjustOverflow,
    offset: [0, 3],
    targetOffset,
  },
};

export const getPlacements = (placement) => {
  const copyPlacements = cloneDeep(placements);
  if (typeof placement === 'object') {
    for (let offset in placement) {
      if (copyPlacements[offset]) {
        copyPlacements[offset].targetOffset = placement[offset];
      }
    }
  }
  return copyPlacements;
}

export default placements;
