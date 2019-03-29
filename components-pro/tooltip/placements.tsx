const rcAutoAdjustOverflow = {
  adjustX: 1,
  adjustY: 1,
};
const targetOffset = [0, 0];
const OFFSET_UNIT = 10;

export const rcPlacements = {
  left: {
    points: ['cr', 'cl'],
    overflow: rcAutoAdjustOverflow,
    offset: [-OFFSET_UNIT, 0],
    targetOffset,
  },
  right: {
    points: ['cl', 'cr'],
    overflow: rcAutoAdjustOverflow,
    offset: [OFFSET_UNIT, 0],
    targetOffset,
  },
  top: {
    points: ['bc', 'tc'],
    overflow: rcAutoAdjustOverflow,
    offset: [0, -OFFSET_UNIT],
    targetOffset,
  },
  bottom: {
    points: ['tc', 'bc'],
    overflow: rcAutoAdjustOverflow,
    offset: [0, OFFSET_UNIT],
    targetOffset,
  },
  topLeft: {
    points: ['bl', 'tl'],
    overflow: rcAutoAdjustOverflow,
    offset: [0, -OFFSET_UNIT],
    targetOffset,
  },
  leftTop: {
    points: ['tr', 'tl'],
    overflow: rcAutoAdjustOverflow,
    offset: [-OFFSET_UNIT, 0],
    targetOffset,
  },
  topRight: {
    points: ['br', 'tr'],
    overflow: rcAutoAdjustOverflow,
    offset: [0, -OFFSET_UNIT],
    targetOffset,
  },
  rightTop: {
    points: ['tl', 'tr'],
    overflow: rcAutoAdjustOverflow,
    offset: [OFFSET_UNIT, 0],
    targetOffset,
  },
  bottomRight: {
    points: ['tr', 'br'],
    overflow: rcAutoAdjustOverflow,
    offset: [0, OFFSET_UNIT],
    targetOffset,
  },
  rightBottom: {
    points: ['bl', 'br'],
    overflow: rcAutoAdjustOverflow,
    offset: [OFFSET_UNIT, 0],
    targetOffset,
  },
  bottomLeft: {
    points: ['tl', 'bl'],
    overflow: rcAutoAdjustOverflow,
    offset: [0, OFFSET_UNIT],
    targetOffset,
  },
  leftBottom: {
    points: ['br', 'bl'],
    overflow: rcAutoAdjustOverflow,
    offset: [-OFFSET_UNIT, 0],
    targetOffset,
  },
};

const autoAdjustOverflowEnabled = {
  adjustX: 1,
  adjustY: 1,
};

const autoAdjustOverflowDisabled = {
  adjustX: 0,
  adjustY: 0,
};

export interface AdjustOverflow {
  adjustX?: 0 | 1;
  adjustY?: 0 | 1;
}

export interface PlacementsConfig {
  arrowWidth?: number;
  horizontalArrowShift?: number;
  verticalArrowShift?: number;
  arrowPointAtCenter?: boolean;
  autoAdjustOverflow?: any;
}

export function getOverflowOptions(autoAdjustOverflow: any) {
  if (typeof autoAdjustOverflow === 'boolean') {
    return autoAdjustOverflow ? autoAdjustOverflowEnabled : autoAdjustOverflowDisabled;
  }
  return {
    ...autoAdjustOverflowDisabled,
    ...autoAdjustOverflow,
  };
}

export default function getPlacements(config: PlacementsConfig = {}) {
  const { arrowWidth = 5, horizontalArrowShift = 16, verticalArrowShift = 12, autoAdjustOverflow = true } = config;
  const placementMap: any = {
    left: {
      points: ['cr', 'cl'],
      offset: [-4, 0],
    },
    right: {
      points: ['cl', 'cr'],
      offset: [4, 0],
    },
    top: {
      points: ['bc', 'tc'],
      offset: [0, -4],
    },
    bottom: {
      points: ['tc', 'bc'],
      offset: [0, 4],
    },
    topLeft: {
      points: ['bl', 'tc'],
      offset: [-(horizontalArrowShift + arrowWidth), -4],
    },
    leftTop: {
      points: ['tr', 'cl'],
      offset: [-4, -(verticalArrowShift + arrowWidth)],
    },
    topRight: {
      points: ['br', 'tc'],
      offset: [horizontalArrowShift + arrowWidth, -4],
    },
    rightTop: {
      points: ['tl', 'cr'],
      offset: [4, -(verticalArrowShift + arrowWidth)],
    },
    bottomRight: {
      points: ['tr', 'bc'],
      offset: [horizontalArrowShift + arrowWidth, 4],
    },
    rightBottom: {
      points: ['bl', 'cr'],
      offset: [4, verticalArrowShift + arrowWidth],
    },
    bottomLeft: {
      points: ['tl', 'bc'],
      offset: [-(horizontalArrowShift + arrowWidth), 4],
    },
    leftBottom: {
      points: ['br', 'cl'],
      offset: [-4, verticalArrowShift + arrowWidth],
    },
  };
  Object.keys(placementMap).forEach(key => {
    placementMap[key] = config.arrowPointAtCenter ? {
      ...placementMap[key],
      overflow: getOverflowOptions(autoAdjustOverflow),
      targetOffset,
    } : {
      ...rcPlacements[key],
      overflow: getOverflowOptions(autoAdjustOverflow),
    };
  });
  return placementMap;
}
