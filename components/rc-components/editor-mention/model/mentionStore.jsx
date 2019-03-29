import Map from 'core-js/es6/map';

let offset = new Map();
const mentionStore = {
  offset,
  getOffset() {
    return offset;
  },
  getTrigger(offsetKey) {
    const currentOffset = offset.get(offsetKey);
    return currentOffset && currentOffset.trigger;
  },
  activeSuggestion({ offsetKey }) {
    offset.set(offsetKey, {
      offsetKey,
    });
  },
  inActiveSuggestion({ offsetKey }) {
    offset.delete(offsetKey);
  },
  updateSuggestion({ offsetKey, position, trigger }) {
    offset.set(offsetKey, {
      offsetKey,
      position,
      trigger,
    });
  },
};

export default mentionStore;
