export interface FeedBack {
  loadSuccess?(result: any, defaultMessage?: string);

  loadFailed?(error: Error, defaultMessage?: string);

  submitSuccess?(result: any, defaultMessage?: string);

  submitFailed?(error: Error, defaultMessage?: string);
}

const defaultFeedback: Required<FeedBack> = {
  loadSuccess(_result: any, _defaultMessage?: string) {
  },
  loadFailed(_error: Error, _defaultMessage?: string) {
  },
  submitSuccess(_result: any, _defaultMessage?: string) {
  },
  submitFailed(_error: Error, _defaultMessage?: string) {
  },
};

export default defaultFeedback;
