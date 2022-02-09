import { observable } from 'mobx';
import isNil from 'lodash/isNil';
import AttachmentFile from './AttachmentFile';

export default class AttachmentFileChunk {
  file: AttachmentFile;

  total: number;

  start: number;

  end: number;

  index: number;

  @observable percent?: number | undefined;

  status?: 'error' | 'success' | 'uploading';

  constructor(chunk: AttachmentFileChunk) {
    Object.keys(chunk).forEach(key => {
      const value = chunk[key];
      if (!isNil(value)) {
        this[key] = value;
      }
    });
  }
}
