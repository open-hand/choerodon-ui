import { AxiosError } from 'axios';
/* istanbul ignore next */
export default class UploadError extends Error {
  readonly response: any;

  constructor(error: AxiosError) {
    super(error.message);
    this.name = error.name;
    this.stack = error.stack;
    this.response = error.response;
  }
}
