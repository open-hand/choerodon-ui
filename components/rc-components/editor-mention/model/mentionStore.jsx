/* eslint new-cap: [2, {capIsNewExceptions: ["Map"]}] */
import { Map } from 'immutable';

let offset = Map();
const mentionStore = {
  offset: Map(),
  getOffset() {
    return offset;
  },
  getTrigger(offsetKey) {
    const currentOffset = offset.get(offsetKey);
    return currentOffset && currentOffset.trigger;
  },
  activeSuggestion({ offsetKey }) {
    offset = offset.set(offsetKey, {
      offsetKey,
    });
  },
  inActiveSuggestion({ offsetKey }) {
    offset = offset.delete(offsetKey);
  },
  updateSuggestion({ offsetKey, position, trigger }) {
    offset = offset.set(offsetKey, {
      offsetKey,
      position,
      trigger,
    });
  },
};

export default mentionStore;
