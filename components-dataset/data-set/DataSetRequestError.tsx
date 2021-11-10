/* istanbul ignore next */
export default class DataSetRequestError extends Error {
  constructor(error: Error) {
    super(error.message);
    this.name = error.name;
    this.stack = error.stack;
  }
}
