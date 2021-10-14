import message from '../message';
import exception from '../_util/exception';
import { $l } from '../locale-context';

export interface FeedBack {
  loadSuccess?(result: any);

  loadFailed?(error: Error);

  submitSuccess?(result: any);

  submitFailed?(error: Error);
}

const defaultFeedback = {
  loadSuccess(_result: any) {/* noop */},
  loadFailed(error) {
    message.error(exception(error, $l('DataSet', 'query_failure')));
  },
  submitSuccess(_result: any) {
    message.success($l('DataSet', 'submit_success'));
  },
  submitFailed(error) {
    message.error(exception(error, $l('DataSet', 'submit_failure')));
  },
};

export default defaultFeedback;
