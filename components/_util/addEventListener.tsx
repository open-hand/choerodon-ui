/* eslint-disable camelcase */
import addDOMEventListener from 'add-dom-event-listener';
import { unstable_batchedUpdates } from 'react-dom';

export default function addEventListenerWrap(target, eventType, cb, option) {
  const callback = unstable_batchedUpdates
    ? function run(e) {
      unstable_batchedUpdates(cb, e);
    }
    : cb;
  return addDOMEventListener(target, eventType, callback, option);
}
